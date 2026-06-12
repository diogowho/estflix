const express = require('express');
const pool = require('../config/database');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

/**
 * Fetches the favorites and watch history content IDs for a given profile.
 *
 * @param {number|string} profileId - The profile's primary key.
 * @returns {Promise<{ favorites: number[], history: number[] }>} An object
 *   containing two arrays of content IDs: `favorites` (ordered by creation
 *   date ascending) and `history` (ordered by watch date descending).
 * @throws {Error} Propagates any database errors to the caller.
 */
async function getProfileExtras(profileId) {
	const [favRows] = await pool.query(
		'SELECT content_id FROM favorites WHERE profile_id = ? ORDER BY created_at ASC',
		[profileId],
	);
	const [histRows] = await pool.query(
		'SELECT content_id FROM history WHERE profile_id = ? ORDER BY watched_at DESC',
		[profileId],
	);

	return {
		favorites: favRows.map((r) => r.content_id),
		history: histRows.map((r) => r.content_id),
	};
}

/**
 * Verifies that a profile exists and belongs to the given user.
 *
 * @param {number|string} profileId - The profile's primary key.
 * @param {number|string} userId - The authenticated user's primary key.
 * @returns {Promise<object|null>} The profile row when ownership is confirmed,
 *   or `null` if the profile does not exist or belongs to a different user.
 * @throws {Error} Propagates any database errors to the caller.
 */
async function getOwnedProfile(profileId, userId) {
	const [rows] = await pool.query(
		'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
		[profileId, userId],
	);
	return rows.length > 0 ? rows[0] : null;
}

/**
 * Base SELECT statement that joins `contents` with `categories` so
 * `category_name` and `category_color` are always included in query results.
 * Append additional `JOIN`, `WHERE`, and `ORDER BY` clauses before executing.
 *
 * @type {string}
 */
const CONTENT_WITH_CATEGORY = `
    SELECT
        c.id,
        c.title,
        c.description,
        c.category_id,
        c.year,
        c.rating,
        c.image_url,
        c.created_at,
        cat.name  AS category_name,
        cat.color AS category_color
    FROM contents c
    JOIN categories cat ON c.category_id = cat.id
`;

/**
 * GET /api/profiles
 *
 * Returns all profiles belonging to the authenticated user, each augmented
 * with `favorites` and `history` content-ID arrays.
 *
 * @param {import('express').Request} req - Express request. `req.user.id` is the authenticated user.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/', async (req, res) => {
	try {
		const [profiles] = await pool.query(
			'SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at ASC',
			[req.user.id],
		);

		const result = await Promise.all(
			profiles.map(async (profile) => {
				const extras = await getProfileExtras(profile.id);
				return { ...profile, ...extras };
			}),
		);

		return res.json(result);
	} catch (err) {
		console.error('Get profiles error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * GET /api/profiles/:id
 *
 * Returns a single profile (with `favorites` and `history` arrays) by ID.
 * Responds with `403` when the profile exists but belongs to another user,
 * and `404` when it does not exist at all.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/:id', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			// Return 403 if profile exists but belongs to someone else, 404 if it doesn't exist
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		const extras = await getProfileExtras(profile.id);
		return res.json({ ...profile, ...extras });
	} catch (err) {
		console.error('Get profile error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * POST /api/profiles
 *
 * Creates a new profile for the authenticated user. `name` is required;
 * `avatar` is optional and defaults to `null`.
 *
 * @param {import('express').Request} req - Express request.
 *   Expected body: `{ name, avatar? }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.post('/', async (req, res) => {
	const { name, avatar } = req.body;

	if (!name) {
		return res.status(400).json({ message: 'Name is required' });
	}

	try {
		const [result] = await pool.query(
			'INSERT INTO profiles (user_id, name, avatar) VALUES (?, ?, ?)',
			[req.user.id, name, avatar || null],
		);

		const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [
			result.insertId,
		]);

		return res.status(201).json(rows[0]);
	} catch (err) {
		console.error('Create profile error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * PUT /api/profiles/:id
 *
 * Updates a profile owned by the authenticated user. Only fields present in
 * the request body are changed; omitted fields retain their current values.
 * Responds with `403` when the profile belongs to another user and `404`
 * when it does not exist.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 *   Optional body fields: `{ name?, avatar? }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.put('/:id', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		const { name, avatar } = req.body;
		const updatedName = name !== undefined ? name : profile.name;
		const updatedAvatar = avatar !== undefined ? avatar : profile.avatar;

		await pool.query(
			'UPDATE profiles SET name = ?, avatar = ? WHERE id = ?',
			[updatedName, updatedAvatar, req.params.id],
		);

		const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [
			req.params.id,
		]);

		return res.json(rows[0]);
	} catch (err) {
		console.error('Update profile error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * DELETE /api/profiles/:id
 *
 * Deletes a profile owned by the authenticated user.
 * Responds with `403` when the profile belongs to another user and `404`
 * when it does not exist.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.delete('/:id', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		await pool.query('DELETE FROM profiles WHERE id = ?', [req.params.id]);

		return res.json({ message: 'Deleted' });
	} catch (err) {
		console.error('Delete profile error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * GET /api/profiles/:id/favorites
 *
 * Returns the full content objects (with joined category fields) that the
 * profile has favorited, ordered by the date they were added ascending.
 * Responds with `403`/`404` when the profile is inaccessible.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/:id/favorites', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		const [rows] = await pool.query(
			`${CONTENT_WITH_CATEGORY}
             JOIN favorites f ON c.id = f.content_id
             WHERE f.profile_id = ?
             ORDER BY f.created_at ASC`,
			[req.params.id],
		);

		return res.json(rows);
	} catch (err) {
		console.error('Get favorites error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * POST /api/profiles/:id/favorites
 *
 * Adds a content item to a profile's favorites. Duplicate entries are
 * silently ignored via `INSERT IGNORE`. `content_id` is required in the body.
 * Responds with `403`/`404` when the profile is inaccessible.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 *   Expected body: `{ content_id }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.post('/:id/favorites', async (req, res) => {
	const { content_id } = req.body;

	if (!content_id) {
		return res.status(400).json({ message: 'content_id is required' });
	}

	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		// Skip if this favorite already exists
		await pool.query(
			'INSERT IGNORE INTO favorites (profile_id, content_id) VALUES (?, ?)',
			[req.params.id, content_id],
		);

		return res.json({ message: 'Added' });
	} catch (err) {
		console.error('Add favorite error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * DELETE /api/profiles/:id/favorites/:contentId
 *
 * Removes a specific content item from a profile's favorites.
 * Responds with `403`/`404` when the profile is inaccessible.
 *
 * @param {import('express').Request} req - Express request.
 *   `req.params.id` is the profile ID; `req.params.contentId` is the content ID to remove.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.delete('/:id/favorites/:contentId', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		await pool.query(
			'DELETE FROM favorites WHERE profile_id = ? AND content_id = ?',
			[req.params.id, req.params.contentId],
		);

		return res.json({ message: 'Removed' });
	} catch (err) {
		console.error('Remove favorite error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * GET /api/profiles/:id/history
 *
 * Returns the full content objects (with joined category fields) that the
 * profile has watched, ordered by most recently watched descending.
 * Responds with `403`/`404` when the profile is inaccessible.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/:id/history', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		const [rows] = await pool.query(
			`${CONTENT_WITH_CATEGORY}
             JOIN history h ON c.id = h.content_id
             WHERE h.profile_id = ?
             ORDER BY h.watched_at DESC`,
			[req.params.id],
		);

		return res.json(rows);
	} catch (err) {
		console.error('Get history error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * POST /api/profiles/:id/history
 *
 * Records or refreshes a content item in the profile's watch history.
 * If the content was previously watched, the existing row is deleted and
 * re-inserted so that `watched_at` reflects the most recent viewing.
 * `content_id` is required in the body.
 * Responds with `403`/`404` when the profile is inaccessible.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 *   Expected body: `{ content_id }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.post('/:id/history', async (req, res) => {
	const { content_id } = req.body;

	if (!content_id) {
		return res.status(400).json({ message: 'content_id is required' });
	}

	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		// Delete old entry and re-insert to update timestamp
		await pool.query(
			'DELETE FROM history WHERE profile_id = ? AND content_id = ?',
			[req.params.id, content_id],
		);
		await pool.query(
			'INSERT INTO history (profile_id, content_id) VALUES (?, ?)',
			[req.params.id, content_id],
		);

		return res.json({ message: 'Added' });
	} catch (err) {
		console.error('Add history error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * DELETE /api/profiles/:id/history/:contentId
 *
 * Removes a content item from the profile's watch history.
 * Responds with `403`/`404` when the profile is inaccessible.
 */
router.delete('/:id/history/:contentId', async (req, res) => {
	const contentId = req.params.contentId;

	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		await pool.query(
			'DELETE FROM history WHERE profile_id = ? AND content_id = ?',
			[req.params.id, contentId],
		);

		return res.json({ message: 'Removed' });
	} catch (err) {
		console.error('Remove history error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * GET /api/profiles/:id/recommendations
 *
 * Generates up to 6 personalised content recommendations for a profile.
 *
 * The algorithm:
 * 1. Identifies the top 3 categories from the combined watch history and
 *    favorites using a `UNION ALL` aggregation.
 * 2. Excludes any content already present in the profile's history or
 *    favorites to avoid re-surfacing seen items.
 * 3. When no activity exists (new profile), falls back to the highest-rated
 *    content overall, still excluding already-seen items.
 *
 * When the category-based query produces no results (for example when the
 * user's top categories only contain items they've already seen), the route
 * will fall back to a random selection of unseen content. If there is no
 * unseen content available, a final random selection from all content is
 * returned as a last resort.
 *
 * Responds with `403`/`404` when the profile is inaccessible.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the profile ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/:id/recommendations', async (req, res) => {
	try {
		const profile = await getOwnedProfile(req.params.id, req.user.id);

		if (!profile) {
			const [any] = await pool.query(
				'SELECT id FROM profiles WHERE id = ?',
				[req.params.id],
			);
			return any.length > 0
				? res.status(403).json({ message: 'Forbidden' })
				: res.status(404).json({ message: 'Profile not found' });
		}

		const profileId = req.params.id;

		// Get the user's top 3 preferred categories
		const [categoryRows] = await pool.query(
			`SELECT cat_id, COUNT(*) AS cnt
             FROM (
                 SELECT c.category_id AS cat_id
                 FROM history h
                 JOIN contents c ON h.content_id = c.id
                 WHERE h.profile_id = ?

                 UNION ALL

                 SELECT c.category_id AS cat_id
                 FROM favorites f
                 JOIN contents c ON f.content_id = c.id
                 WHERE f.profile_id = ?
             ) combined
             GROUP BY cat_id
             ORDER BY cnt DESC
             LIMIT 3`,
			[profileId, profileId],
		);

		// Get all content IDs user has already seen
		const [historyRows] = await pool.query(
			'SELECT content_id FROM history WHERE profile_id = ?',
			[profileId],
		);
		const [favoriteRows] = await pool.query(
			'SELECT content_id FROM favorites WHERE profile_id = ?',
			[profileId],
		);
		const excludeIds = [
			...new Set([
				...historyRows.map((r) => r.content_id),
				...favoriteRows.map((r) => r.content_id),
			]),
		];

		let recommendations;
		let rows;

		if (categoryRows.length === 0) {
			// If user has no activity, just return highest-rated content
			const excludeClause =
				excludeIds.length > 0
					? `WHERE c.id NOT IN (${excludeIds.map(() => '?').join(',')})`
					: '';

			[rows] = await pool.query(
				`${CONTENT_WITH_CATEGORY} ${excludeClause} ORDER BY c.rating DESC LIMIT 6`,
				excludeIds,
			);
			recommendations = rows;
		} else {
			const topCategoryIds = categoryRows.map((r) => r.cat_id);

			const categoryPlaceholders = topCategoryIds
				.map(() => '?')
				.join(',');
			const excludePlaceholders =
				excludeIds.length > 0
					? `AND c.id NOT IN (${excludeIds.map(() => '?').join(',')})`
					: '';

			[rows] = await pool.query(
				`${CONTENT_WITH_CATEGORY}
                  WHERE c.category_id IN (${categoryPlaceholders})
                  ${excludePlaceholders}
                  ORDER BY c.rating DESC
                  LIMIT 6`,
				[...topCategoryIds, ...excludeIds],
			);
			recommendations = rows;
		}

		// If nothing matched (e.g. user has favorited all top-category content),
		// try a random selection of unseen content and then a final random
		// selection from all content as a last resort.
		if (!recommendations || recommendations.length === 0) {
			if (excludeIds.length > 0) {
				const excludeClause = `WHERE c.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
			const [randRows] = await pool.query(
				`${CONTENT_WITH_CATEGORY} ${excludeClause} ORDER BY RAND() LIMIT 6`,
				excludeIds,
			);
				if (randRows && randRows.length > 0) {
					return res.json(randRows);
				}
			}

			const [finalRows] = await pool.query(
				`${CONTENT_WITH_CATEGORY} ORDER BY RAND() LIMIT 6`,
			);
			return res.json(finalRows);
		}

		return res.json(recommendations);
	} catch (err) {
		console.error('Recommendations error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
