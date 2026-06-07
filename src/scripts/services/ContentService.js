/**
 * Service for content CRUD operations.
 * Translates between the camelCase client model and the snake_case API
 * representation used by the server.
 */
class ContentService {
	/**
	 * Maps a raw API content object to the camelCase client model shape.
	 *
	 * @param {Object} d - Raw content object returned by the API.
	 * @returns {{id: number, title: string, description: string, categoryId: number, year: number, rating: number, imageUrl: string, createdAt: string}} The normalised client-side content shape.
	 */
	_mapFromApi(d) {
		return {
			id: d.id,
			title: d.title,
			description: d.description,
			categoryId: d.category_id,
			year: d.year,
			rating: d.rating,
			imageUrl: d.image_url,
			createdAt: d.created_at,
		};
	}

	/**
	 * Maps a partial client-side content object to the snake_case API payload.
	 * Only properties that are explicitly set (not `undefined`) are included.
	 *
	 * @param {{title?: string, description?: string, categoryId?: number, year?: number, rating?: number, imageUrl?: string}} data - Partial client-side content data.
	 * @returns {Object} Snake_case payload ready to send to the API.
	 */
	_mapToApi(data) {
		const obj = {};
		if (data.title !== undefined) obj.title = data.title;
		if (data.description !== undefined) obj.description = data.description;
		if (data.categoryId !== undefined)
			obj.category_id = Number(data.categoryId);
		if (data.year !== undefined) obj.year = Number(data.year);
		if (data.rating !== undefined) obj.rating = Number(data.rating);
		if (data.imageUrl !== undefined) obj.image_url = data.imageUrl;
		return obj;
	}

	/**
	 * Retrieves all content items, with optional filtering.
	 *
	 * @param {{categoryId?: number, search?: string}} [filters={}] - Optional filters to apply.
	 * @returns {Promise<Content[]>} Array of Content instances matching the filters.
	 * @throws {Error} When the request fails.
	 */
	async getAll(filters = {}) {
		const params = new URLSearchParams();
		if (filters.categoryId) params.set('category_id', filters.categoryId);
		if (filters.search) params.set('search', filters.search);
		const qs = params.toString();
		const data = await ApiService.get(`/api/contents${qs ? '?' + qs : ''}`);
		return data.map((d) => new Content(this._mapFromApi(d)));
	}

	/**
	 * Retrieves a single content item by its identifier.
	 *
	 * @param {number} id - The content identifier.
	 * @returns {Promise<Content>} The matching Content instance.
	 * @throws {Error} When the content is not found or the request fails.
	 */
	async getById(id) {
		const d = await ApiService.get(`/api/contents/${id}`);
		return new Content(this._mapFromApi(d));
	}

	/**
	 * Retrieves all content items belonging to a specific category.
	 *
	 * @param {number} categoryId - The category identifier to filter by.
	 * @returns {Promise<Content[]>} Array of Content instances in the specified category.
	 * @throws {Error} When the request fails.
	 */
	async getByCategoryId(categoryId) {
		return this.getAll({ categoryId });
	}

	/**
	 * Searches for content items whose title or description matches the query.
	 *
	 * @param {string} query - The search term.
	 * @returns {Promise<Content[]>} Array of Content instances matching the query.
	 * @throws {Error} When the request fails.
	 */
	async search(query) {
		return this.getAll({ search: query });
	}

	/**
	 * Creates a new content item.
	 *
	 * @param {{title: string, description: string, categoryId: number, year: number, rating: number, imageUrl: string}} data - Client-side content data for the new item.
	 * @returns {Promise<Content>} The newly created Content instance.
	 * @throws {Error} When validation fails or the request fails.
	 */
	async create(data) {
		const result = await ApiService.post(
			'/api/contents',
			this._mapToApi(data),
		);
		return new Content(this._mapFromApi(result));
	}

	/**
	 * Updates an existing content item by its identifier.
	 *
	 * @param {number} id - The identifier of the content item to update.
	 * @param {{title?: string, description?: string, categoryId?: number, year?: number, rating?: number, imageUrl?: string}} data - Partial client-side content data with fields to update.
	 * @returns {Promise<Content>} The updated Content instance.
	 * @throws {Error} When the content is not found, validation fails, or the request fails.
	 */
	async update(id, data) {
		const result = await ApiService.put(
			`/api/contents/${id}`,
			this._mapToApi(data),
		);
		return new Content(this._mapFromApi(result));
	}

	/**
	 * Deletes a content item by its identifier.
	 *
	 * @param {number} id - The identifier of the content item to delete.
	 * @returns {Promise<true>} Resolves to `true` when deletion succeeds.
	 * @throws {Error} When the content is not found or the request fails.
	 */
	async delete(id) {
		await ApiService.delete(`/api/contents/${id}`);
		return true;
	}
}
