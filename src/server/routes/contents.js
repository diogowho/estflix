const express = require('express');
const pool = require('../config/database');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

/**
 * Base SELECT statement that joins `contents` with `categories` so
 * `category_name` and `category_color` are always included in query results.
 *
 * @type {string}
 */
const CONTENT_SELECT = `
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
 * GET /api/contents
 *
 * Returns a list of content items, optionally filtered by `category_id`
 * and/or a full-text `search` term matched against title and description.
 * Results are ordered by rating descending.
 *
 * @param {import('express').Request} req - Express request.
 *   Optional query params: `category_id`, `search`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/', async (req, res) => {
	const { category_id, search } = req.query;

	try {
		const conditions = [];
		const params = [];

		if (category_id) {
			conditions.push('c.category_id = ?');
			params.push(category_id);
		}

		if (search) {
			conditions.push('(c.title LIKE ? OR c.description LIKE ?)');
			const term = `%${search}%`;
			params.push(term, term);
		}

		const where =
			conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
		const sql = `${CONTENT_SELECT} ${where} ORDER BY c.rating DESC`;

		const [rows] = await pool.query(sql, params);
		return res.json(rows);
	} catch (err) {
		console.error('Get contents error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * GET /api/contents/:id
 *
 * Returns a single content item (with joined category fields) by its primary
 * key. Responds with `404` when no match is found.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the content ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/:id', async (req, res) => {
	try {
		const [rows] = await pool.query(`${CONTENT_SELECT} WHERE c.id = ?`, [
			req.params.id,
		]);

		if (rows.length === 0) {
			return res.status(404).json({ message: 'Content not found' });
		}

		return res.json(rows[0]);
	} catch (err) {
		console.error('Get content error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * POST /api/contents
 *
 * Creates a new content item. `title`, `category_id`, `year`, and `rating`
 * are required. `description` and `image_url` are optional.
 * Responds with `409` on duplicate title and `400` for an invalid
 * `category_id` foreign key.
 *
 * @param {import('express').Request} req - Express request.
 *   Expected body: `{ title, category_id, year, rating, description?, image_url? }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
// Validate bounds for year and rating
const YEAR_MIN = 1900;
const YEAR_MAX = new Date().getFullYear() + 1; // allow next-year entries
const RATING_MIN = 0;
const RATING_MAX = 5;

router.post('/', async (req, res) => {
	const { title, description, category_id, year, rating, image_url } =
		req.body;

	if (!title || !category_id || year === undefined || rating === undefined) {
		return res
			.status(400)
			.json({
				message: 'title, category_id, year, and rating are required',
			});
	}

	const yearNum = Number(year);
	const ratingNum = Number(rating);

	if (
		!Number.isInteger(yearNum) ||
		yearNum < YEAR_MIN ||
		yearNum > YEAR_MAX
	) {
		return res
			.status(400)
			.json({
				message: `year must be an integer between ${YEAR_MIN} and ${YEAR_MAX}`,
			});
	}

	if (
		Number.isNaN(ratingNum) ||
		ratingNum < RATING_MIN ||
		ratingNum > RATING_MAX
	) {
		return res
			.status(400)
			.json({
				message: `rating must be a number between ${RATING_MIN} and ${RATING_MAX}`,
			});
	}

	try {
		const [result] = await pool.query(
			'INSERT INTO contents (title, description, category_id, year, rating, image_url) VALUES (?, ?, ?, ?, ?, ?)',
			[
				title,
				description || null,
				category_id,
				yearNum,
				ratingNum,
				image_url || null,
			],
		);

		const [rows] = await pool.query(`${CONTENT_SELECT} WHERE c.id = ?`, [
			result.insertId,
		]);

		return res.status(201).json(rows[0]);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res
				.status(409)
				.json({ message: 'Content title already exists' });
		}
		if (err.code === 'ER_NO_REFERENCED_ROW_2') {
			return res.status(400).json({ message: 'Invalid category_id' });
		}
		console.error('Create content error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * PUT /api/contents/:id
 *
 * Updates an existing content item. Only fields present in the request body
 * are changed; omitted fields retain their current database values.
 * Responds with `404` when the content does not exist, `409` on a duplicate
 * title, and `400` for an invalid `category_id` foreign key.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the content ID.
 *   Optional body fields: `{ title?, description?, category_id?, year?, rating?, image_url? }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.put('/:id', async (req, res) => {
	try {
		const [existing] = await pool.query(
			`${CONTENT_SELECT} WHERE c.id = ?`,
			[req.params.id],
		);

		if (existing.length === 0) {
			return res.status(404).json({ message: 'Content not found' });
		}

		const current = existing[0];
		let { title, description, category_id, year, rating, image_url } =
			req.body;

		// Validate year and rating if provided
		let updatedYear = current.year;
		let updatedRating = current.rating;

		if (year !== undefined) {
			const yearNum = Number(year);
			if (
				!Number.isInteger(yearNum) ||
				yearNum < YEAR_MIN ||
				yearNum > YEAR_MAX
			) {
				return res
					.status(400)
					.json({
						message: `year must be an integer between ${YEAR_MIN} and ${YEAR_MAX}`,
					});
			}
			updatedYear = yearNum;
		}

		if (rating !== undefined) {
			const ratingNum = Number(rating);
			if (
				Number.isNaN(ratingNum) ||
				ratingNum < RATING_MIN ||
				ratingNum > RATING_MAX
			) {
				return res
					.status(400)
					.json({
						message: `rating must be a number between ${RATING_MIN} and ${RATING_MAX}`,
					});
			}
			updatedRating = ratingNum;
		}

		const updatedTitle = title !== undefined ? title : current.title;
		const updatedDescription =
			description !== undefined ? description : current.description;
		const updatedCategoryId =
			category_id !== undefined ? category_id : current.category_id;
		const updatedImageUrl =
			image_url !== undefined ? image_url : current.image_url;

		await pool.query(
			`UPDATE contents
             SET title = ?, description = ?, category_id = ?, year = ?, rating = ?, image_url = ?
             WHERE id = ?`,
			[
				updatedTitle,
				updatedDescription,
				updatedCategoryId,
				updatedYear,
				updatedRating,
				updatedImageUrl,
				req.params.id,
			],
		);

		const [rows] = await pool.query(`${CONTENT_SELECT} WHERE c.id = ?`, [
			req.params.id,
		]);

		return res.json(rows[0]);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res
				.status(409)
				.json({ message: 'Content title already exists' });
		}
		if (err.code === 'ER_NO_REFERENCED_ROW_2') {
			return res.status(400).json({ message: 'Invalid category_id' });
		}
		console.error('Update content error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * DELETE /api/contents/:id
 *
 * Deletes a content item by its primary key.
 * Responds with `404` when no matching content exists.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the content ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.delete('/:id', async (req, res) => {
	try {
		const [existing] = await pool.query(
			'SELECT id FROM contents WHERE id = ?',
			[req.params.id],
		);

		if (existing.length === 0) {
			return res.status(404).json({ message: 'Content not found' });
		}

		await pool.query('DELETE FROM contents WHERE id = ?', [req.params.id]);

		return res.json({ message: 'Deleted' });
	} catch (err) {
		console.error('Delete content error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
