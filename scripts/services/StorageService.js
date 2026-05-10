class StorageService {
	static get(key) {
		try {
			const raw = localStorage.getItem(key);
			return raw !== null ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	static set(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	static remove(key) {
		localStorage.removeItem(key);
	}

	static clear() {
		localStorage.clear();
	}
}
