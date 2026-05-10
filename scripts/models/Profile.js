class Profile {
	constructor({
		id = null,
		name,
		avatar = null,
		favorites = [],
		history = [],
		createdAt = null,
	}) {
		this.id = id ?? Profile.generateId();
		this.name = name;
		this.avatar = avatar ?? Profile.generateAvatar(name);
		this.favorites = [...favorites];
		this.history = [...history];
		this.createdAt = createdAt ?? new Date().toISOString();
	}

	static generateId() {
		return `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	}

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

	addToFavorites(contentId) {
		if (!this.favorites.includes(contentId)) {
			this.favorites.push(contentId);
		}
	}

	removeFromFavorites(contentId) {
		this.favorites = this.favorites.filter((id) => id !== contentId);
	}

	isFavorite(contentId) {
		return this.favorites.includes(contentId);
	}

	addToHistory(contentId) {
		this.history = this.history.filter((id) => id !== contentId);
		this.history.unshift(contentId);
		if (this.history.length > 50) {
			this.history = this.history.slice(0, 50);
		}
	}

	validate() {
		if (!this.name?.trim()) throw new Error('Profile name is required');
	}
}
