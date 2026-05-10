class ContentService {
	constructor() {
		this.storageKey = 'estflix_contents';
	}

	_load() {
		return (StorageService.get(this.storageKey) ?? []).map(
			(data) => new Content(data),
		);
	}

	_save(contents) {
		StorageService.set(this.storageKey, contents);
	}

	getAll() {
		return this._load();
	}

	getById(id) {
		return this._load().find((c) => c.id === id) ?? null;
	}

	getByCategoryId(categoryId) {
		return this._load().filter((c) => c.categoryId === categoryId);
	}

	search(query) {
		const normalised = query.trim().toLowerCase();
		return this._load().filter(
			(c) =>
				c.title.toLowerCase().includes(normalised) ||
				(c.description ?? '').toLowerCase().includes(normalised),
		);
	}

	create(data) {
		const contents = this._load();
		const duplicate = contents.find(
			(c) =>
				c.title.trim().toLowerCase() ===
				data.title?.trim().toLowerCase(),
		);
		if (duplicate)
			throw new Error('A content item with this title already exists');

		const content = new Content(data);
		content.validate();
		contents.push(content);
		this._save(contents);
		return content;
	}

	update(id, data) {
		const contents = this._load();
		const index = contents.findIndex((c) => c.id === id);
		if (index === -1) throw new Error('Content not found');

		if (data.title !== undefined) {
			const duplicate = contents.find(
				(c) =>
					c.id !== id &&
					c.title.trim().toLowerCase() ===
						data.title.trim().toLowerCase(),
			);
			if (duplicate)
				throw new Error(
					'A content item with this title already exists',
				);
		}

		contents[index].update(data);
		contents[index].validate();
		this._save(contents);
		return contents[index];
	}

	delete(id) {
		const contents = this._load();
		const filtered = contents.filter((c) => c.id !== id);
		if (filtered.length === contents.length) return false;
		this._save(filtered);
		return true;
	}
}
