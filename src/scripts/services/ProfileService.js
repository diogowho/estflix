/**
 * Service for profile CRUD operations and profile-specific features such as
 * favourites, watch history, and content recommendations.
 * The active profile is persisted in local storage via StorageService.
 */
class ProfileService {
	/**
	 * Initialises the service and sets the local-storage key used to track
	 * the currently active profile.
	 */
	constructor() {
		this._activeKey = 'estflix_active_profile';
	}

	/**
	 * Maps a raw API profile object to the camelCase client model shape.
	 *
	 * @param {Object} d - Raw profile object returned by the API.
	 * @returns {{id: number, name: string, avatar: string, favorites: number[], history: number[], createdAt: string}} The normalised client-side profile shape.
	 */
	_mapFromApi(d) {
		return {
			id: d.id,
			name: d.name,
			avatar: d.avatar,
			favorites: (d.favorites || []).map(Number),
			history: (d.history || []).map(Number),
			createdAt: d.created_at,
		};
	}

	/**
	 * Retrieves all profiles belonging to the authenticated user.
	 *
	 * @returns {Promise<Profile[]>} Array of all Profile instances.
	 * @throws {Error} When the request fails.
	 */
	async getAll() {
		const data = await ApiService.get('/api/profiles');
		return data.map((d) => new Profile(this._mapFromApi(d)));
	}

	/**
	 * Retrieves a single profile by its identifier.
	 *
	 * @param {number} id - The profile identifier.
	 * @returns {Promise<Profile>} The matching Profile instance.
	 * @throws {Error} When the profile is not found or the request fails.
	 */
	async getById(id) {
		const d = await ApiService.get(`/api/profiles/${id}`);
		return new Profile(this._mapFromApi(d));
	}

	/**
	 * Returns the currently active profile, or `null` if none is set or the
	 * stored profile id can no longer be found on the server.
	 * Clears the stale active-profile key from local storage when the lookup fails.
	 *
	 * @returns {Promise<Profile|null>} The active Profile instance, or `null`.
	 */
	async getActive() {
		const activeId = StorageService.get(this._activeKey);
		if (activeId === null || activeId === undefined) return null;
		try {
			return await this.getById(activeId);
		} catch {
			StorageService.remove(this._activeKey);
			return null;
		}
	}

	/**
	 * Persists the given profile id as the active profile in local storage.
	 *
	 * @param {number} id - The identifier of the profile to set as active.
	 * @returns {void}
	 */
	setActive(id) {
		StorageService.set(this._activeKey, id);
	}

	/**
	 * Creates a new profile. If no avatar URL is provided, one is generated
	 * automatically from the profile name via `Profile.generateAvatar`.
	 *
	 * @param {{name: string, avatar?: string}} data - Data for the new profile.
	 * @returns {Promise<Profile>} The newly created Profile instance.
	 * @throws {Error} When validation fails or the request fails.
	 */
	async create(data) {
		const avatar = data.avatar || Profile.generateAvatar(data.name);
		const result = await ApiService.post('/api/profiles', {
			name: data.name,
			avatar,
		});
		return new Profile(
			this._mapFromApi({ ...result, favorites: [], history: [] }),
		);
	}

	/**
	 * Deletes a profile by its identifier.
	 * If the deleted profile was the active one, the active-profile key is
	 * removed from local storage.
	 *
	 * @param {number} id - The identifier of the profile to delete.
	 * @returns {Promise<true>} Resolves to `true` when deletion succeeds.
	 * @throws {Error} When the profile is not found or the request fails.
	 */
	async delete(id) {
		await ApiService.delete(`/api/profiles/${id}`);
		const activeId = StorageService.get(this._activeKey);
		if (activeId == id) StorageService.remove(this._activeKey);
		return true;
	}

	/**
	 * Adds a content item to a profile's favourites list.
	 *
	 * @param {number} profileId - The identifier of the profile.
	 * @param {number} contentId - The identifier of the content item to add.
	 * @returns {Promise<void>}
	 * @throws {Error} When the request fails.
	 */
	async addToFavorites(profileId, contentId) {
		await ApiService.post(`/api/profiles/${profileId}/favorites`, {
			content_id: Number(contentId),
		});
	}

	/**
	 * Removes a content item from a profile's favourites list.
	 *
	 * @param {number} profileId - The identifier of the profile.
	 * @param {number} contentId - The identifier of the content item to remove.
	 * @returns {Promise<void>}
	 * @throws {Error} When the request fails.
	 */
	async removeFromFavorites(profileId, contentId) {
		await ApiService.delete(
			`/api/profiles/${profileId}/favorites/${contentId}`,
		);
	}

	/**
	 * Appends a content item to a profile's watch history.
	 *
	 * @param {number} profileId - The identifier of the profile.
	 * @param {number} contentId - The identifier of the content item to record.
	 * @returns {Promise<void>}
	 * @throws {Error} When the request fails.
	 */
	async addToHistory(profileId, contentId) {
		await ApiService.post(`/api/profiles/${profileId}/history`, {
			content_id: Number(contentId),
		});
	}

	/**
	 * Removes a content item from a profile's watch history.
	 *
	 * @param {number} profileId - The identifier of the profile.
	 * @param {number} contentId - The identifier of the content item to remove.
	 * @returns {Promise<void>}
	 * @throws {Error} When the request fails.
	 */
	async removeFromHistory(profileId, contentId) {
		await ApiService.delete(
			`/api/profiles/${profileId}/history/${contentId}`,
		);
	}

	/**
	 * Retrieves personalised content recommendations for a profile.
	 *
	 * @param {number} profileId - The identifier of the profile.
	 * @returns {Promise<Array<{content: Content, category: {id: number, name: string, color: string}}>>} Array of recommendation objects, each containing a Content instance and its associated category metadata.
	 * @throws {Error} When the request fails.
	 */
	async getRecommendations(profileId) {
		const data = await ApiService.get(
			`/api/profiles/${profileId}/recommendations`,
		);
		return data.map((d) => ({
			content: new Content({
				id: d.id,
				title: d.title,
				description: d.description,
				categoryId: d.category_id,
				year: d.year,
				rating: d.rating,
				imageUrl: d.image_url,
				createdAt: d.created_at,
			}),
			category: {
				id: d.category_id,
				name: d.category_name,
				color: d.category_color,
			},
		}));
	}
}
