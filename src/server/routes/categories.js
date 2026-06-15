const express = require('express');
const pool = require('../config/database');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/categories
 *
 * Returns all categories ordered alphabetically by name.
 *
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/', async (req, res) => {
	try {
		const [rows] = await pool.query(
			'SELECT * FROM categories ORDER BY name ASC',
		);
		return res.json(rows);
	} catch (err) {
		console.error('Get categories error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * GET /api/categories/:id
 *
 * Returns a single category by its primary key.
 * Responds with `404` when no matching category exists.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the category ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.get('/:id', async (req, res) => {
	try {
		const [rows] = await pool.query(
			'SELECT * FROM categories WHERE id = ?',
			[req.params.id],
		);

		if (rows.length === 0) {
			return res.status(404).json({ message: 'Category not found' });
		}

		return res.json(rows[0]);
	} catch (err) {
		console.error('Get category error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * POST /api/categories
 *
 * Creates a new category. `name` is required; `color` defaults to `'#e50914'`
 * when omitted.
 * Responds with `409` when a category with the same name already exists.
 *
 * @param {import('express').Request} req - Express request. Expected body: `{ name, color? }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.post('/', async (req, res) => {
	const { name, color } = req.body;

	if (!name) {
		return res.status(400).json({ message: 'Name is required' });
	}

	try {
		const [result] = await pool.query(
			'INSERT INTO categories (name, color) VALUES (?, ?)',
			[name, color || '#e50914'],
		);

		const [rows] = await pool.query(
			'SELECT * FROM categories WHERE id = ?',
			[result.insertId],
		);

		return res.status(201).json(rows[0]);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res
				.status(409)
				.json({ message: 'Category name already exists' });
		}
		console.error('Create category error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * PUT /api/categories/:id
 *
 * Updates an existing category. Only the fields present in the request body
 * are changed; omitted fields retain their current values.
 * Responds with `404` when the category does not exist and `409` on a
 * duplicate-name conflict.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the category ID.
 *   Optional body fields: `{ name?, color? }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.put('/:id', async (req, res) => {
	const { name, color } = req.body;

	try {
		const [existing] = await pool.query(
			'SELECT * FROM categories WHERE id = ?',
			[req.params.id],
		);

		if (existing.length === 0) {
			return res.status(404).json({ message: 'Category not found' });
		}

		const updatedName = name !== undefined ? name : existing[0].name;
		const updatedColor = color !== undefined ? color : existing[0].color;

		await pool.query(
			'UPDATE categories SET name = ?, color = ? WHERE id = ?',
			[updatedName, updatedColor, req.params.id],
		);

		const [rows] = await pool.query(
			'SELECT * FROM categories WHERE id = ?',
			[req.params.id],
		);

		return res.json(rows[0]);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res
				.status(409)
				.json({ message: 'Category name already exists' });
		}
		console.error('Update category error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * DELETE /api/categories/:id
 *
 * Deletes a category by ID. The operation is blocked with a `409` response
 * when one or more content items still reference this category, preventing
 * orphaned foreign-key relationships.
 * Responds with `404` when the category does not exist.
 *
 * @param {import('express').Request} req - Express request. `req.params.id` is the category ID.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Responds with `500` on unexpected database errors.
 */
router.delete('/:id', async (req, res) => {
	try {
		const [existing] = await pool.query(
			'SELECT * FROM categories WHERE id = ?',
			[req.params.id],
		);

		if (existing.length === 0) {
			return res.status(404).json({ message: 'Category not found' });
		}

		const [contents] = await pool.query(
			'SELECT id FROM contents WHERE category_id = ? LIMIT 1',
			[req.params.id],
		);

		if (contents.length > 0) {
			return res.status(409).json({
				message: 'Cannot delete category with associated contents',
			});
		}

		await pool.query('DELETE FROM categories WHERE id = ?', [
			req.params.id,
		]);

		return res.json({ message: 'Deleted' });
	} catch (err) {
		console.error('Delete category error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
