/**
 * Service for category CRUD operations.
 * Translates between the camelCase client model and the snake_case API
 * representation used by the server.
 */
class CategoryService {
	/**
	 * Maps a raw API category object to the client model shape.
	 *
	 * @param {Object} d - Raw category object returned by the API.
	 * @returns {{id: number, name: string, color: string, createdAt: string}} The normalised client-side category shape.
	 */
	_mapFromApi(d) {
		return {
			id: d.id,
			name: d.name,
			color: d.color,
			createdAt: d.created_at,
		};
	}

	/**
	 * Retrieves all categories.
	 *
	 * @returns {Promise<Category[]>} Array of all Category instances.
	 * @throws {Error} When the request fails.
	 */
	async getAll() {
		const data = await ApiService.get('/api/categories');
		return data.map((d) => new Category(this._mapFromApi(d)));
	}

	/**
	 * Retrieves a single category by its identifier.
	 *
	 * @param {number} id - The category identifier.
	 * @returns {Promise<Category>} The matching Category instance.
	 * @throws {Error} When the category is not found or the request fails.
	 */
	async getById(id) {
		const d = await ApiService.get(`/api/categories/${id}`);
		return new Category(this._mapFromApi(d));
	}

	/**
	 * Creates a new category.
	 *
	 * @param {{name: string, color: string}} data - Data for the new category.
	 * @returns {Promise<Category>} The newly created Category instance.
	 * @throws {Error} When validation fails or the request fails.
	 */
	async create(data) {
		const result = await ApiService.post('/api/categories', {
			name: data.name,
			color: data.color,
		});
		return new Category(this._mapFromApi(result));
	}

	/**
	 * Updates an existing category by its identifier.
	 *
	 * @param {number} id - The identifier of the category to update.
	 * @param {{name?: string, color?: string}} data - Partial category data with fields to update.
	 * @returns {Promise<Category>} The updated Category instance.
	 * @throws {Error} When the category is not found, validation fails, or the request fails.
	 */
	async update(id, data) {
		const result = await ApiService.put(`/api/categories/${id}`, {
			name: data.name,
			color: data.color,
		});
		return new Category(this._mapFromApi(result));
	}

	/**
	 * Deletes a category by its identifier.
	 *
	 * @param {number} id - The identifier of the category to delete.
	 * @returns {Promise<true>} Resolves to `true` when deletion succeeds.
	 * @throws {Error} When the category is not found or the request fails.
	 */
	async delete(id) {
		await ApiService.delete(`/api/categories/${id}`);
		return true;
	}
}
