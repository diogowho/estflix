class ProfileService {
	constructor() {
		this.storageKey = 'estflix_profiles';
		this.activeKey = 'estflix_active_profile';
	}

	_load() {
		return (StorageService.get(this.storageKey) ?? []).map(
			(data) => new Profile(data),
		);
	}

	_save(profiles) {
		StorageService.set(this.storageKey, profiles);
	}

	getAll() {
		return this._load();
	}

	getById(id) {
		return this._load().find((p) => p.id === id) ?? null;
	}

	getActive() {
		const activeId = StorageService.get(this.activeKey);
		const profiles = this._load();
		if (!profiles.length) return null;
		return profiles.find((p) => p.id === activeId) ?? profiles[0];
	}

	setActive(id) {
		StorageService.set(this.activeKey, id);
	}

	create(data) {
		const profiles = this._load();
		const profile = new Profile(data);
		profile.validate();
		profiles.push(profile);
		this._save(profiles);
		return profile;
	}

	delete(id) {
		const profiles = this._load();
		const filtered = profiles.filter((p) => p.id !== id);
		if (filtered.length === profiles.length) return false;

		const activeId = StorageService.get(this.activeKey);
		if (activeId === id) {
			const next = filtered[0] ?? null;
			if (next) {
				StorageService.set(this.activeKey, next.id);
			} else {
				StorageService.remove(this.activeKey);
			}
		}

		this._save(filtered);
		return true;
	}

	addToFavorites(profileId, contentId) {
		const profiles = this._load();
		const profile = profiles.find((p) => p.id === profileId);
		if (!profile) throw new Error('Profile not found');
		profile.addToFavorites(contentId);
		this._save(profiles);
	}

	removeFromFavorites(profileId, contentId) {
		const profiles = this._load();
		const profile = profiles.find((p) => p.id === profileId);
		if (!profile) throw new Error('Profile not found');
		profile.removeFromFavorites(contentId);
		this._save(profiles);
	}

	isFavorite(profileId, contentId) {
		const profile = this.getById(profileId);
		return profile ? profile.isFavorite(contentId) : false;
	}

	addToHistory(profileId, contentId) {
		const profiles = this._load();
		const profile = profiles.find((p) => p.id === profileId);
		if (!profile) throw new Error('Profile not found');
		profile.addToHistory(contentId);
		this._save(profiles);
	}

	getHistory(profileId) {
		const profile = this.getById(profileId);
		return profile ? profile.history : [];
	}
}
