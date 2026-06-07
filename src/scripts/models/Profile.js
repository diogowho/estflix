/**
 * Represents a user profile, including their viewing favourites and history.
 */
class Profile {
	/**
	 * @param {Object} options - Profile initialisation options.
	 * @param {string|null} [options.id=null] - Unique identifier.
	 * @param {string} options.name - Display name of the profile.
	 * @param {string|null} [options.avatar=null] - Emoji avatar; derived from the name when omitted.
	 * @param {number[]} [options.favorites=[]] - Array of favourite content IDs.
	 * @param {number[]} [options.history=[]] - Array of recently viewed content IDs.
	 * @param {string|null} [options.createdAt=null] - ISO timestamp; defaults to now.
	 */
	constructor({
		id = null,
		name,
		avatar = null,
		favorites = [],
		history = [],
		createdAt = null,
	}) {
		this.id = id;
		this.name = name;
		this.avatar = avatar ?? Profile.generateAvatar(name);
		this.favorites = favorites.map(Number);
		this.history = history.map(Number);
		this.createdAt = createdAt ?? new Date().toISOString();
	}

	/**
	 * Deterministically selects an emoji avatar based on the first character of the given name.
	 * @param {string} name - The profile name used to derive an avatar.
	 * @returns {string} An emoji string representing the avatar.
	 */
	static generateAvatar(name) {
		const avatars = [
			'👾',
			'🎭',
			'🦊',
			'🌙',
			'⚡',
			'🔥',
			'💀',
			'🎪',
			'🌊',
			'🎯',
			'🦄',
		];
		const index = name ? name.charCodeAt(0) % avatars.length : 0;
		return avatars[index];
	}

	/**
	 * Adds a content ID to the profile's favourites list if it is not already present.
	 * @param {number|string} contentId - The ID of the content to add.
	 * @returns {void}
	 */
	addToFavorites(contentId) {
		const id = Number(contentId);
		if (!this.favorites.includes(id)) {
			this.favorites.push(id);
		}
	}

	/**
	 * Removes a content ID from the profile's favourites list.
	 * @param {number|string} contentId - The ID of the content to remove.
	 * @returns {void}
	 */
	removeFromFavorites(contentId) {
		const id = Number(contentId);
		this.favorites = this.favorites.filter((f) => f !== id);
	}

	/**
	 * Checks whether a given content ID is in the profile's favourites list.
	 * @param {number|string} contentId - The ID of the content to check.
	 * @returns {boolean} `true` if the content is a favourite, `false` otherwise.
	 */
	isFavorite(contentId) {
		const id = Number(contentId);
		return this.favorites.includes(id);
	}

	/**
	 * Prepends a content ID to the viewing history, deduplicates it, and caps the list at 50 entries.
	 * @param {number|string} contentId - The ID of the content to record.
	 * @returns {void}
	 */
	addToHistory(contentId) {
		const id = Number(contentId);
		this.history = this.history.filter((h) => h !== id);
		this.history.unshift(id);
		if (this.history.length > 50) {
			this.history = this.history.slice(0, 50);
		}
	}

	/**
	 * Validates that the profile has a non-empty name.
	 * @throws {Error} If the name is blank or missing.
	 * @returns {void}
	 */
	validate() {
		if (!this.name?.trim()) throw new Error('Profile name is required');
	}
}
