class CategoryService {
	constructor() {
		this.storageKey = 'estflix_categories';
	}

	_load() {
		return (StorageService.get(this.storageKey) ?? []).map(
			(data) => new Category(data),
		);
	}

	_save(categories) {
		StorageService.set(this.storageKey, categories);
	}

	getAll() {
		return this._load();
	}

	getById(id) {
		return this._load().find((c) => c.id === id) ?? null;
	}

	create(data) {
		const categories = this._load();
		const duplicate = categories.find(
			(c) =>
				c.name.trim().toLowerCase() === data.name?.trim().toLowerCase(),
		);
		if (duplicate)
			throw new Error('A category with this name already exists');

		const category = new Category(data);
		category.validate();
		categories.push(category);
		this._save(categories);
		return category;
	}

	update(id, data) {
		const categories = this._load();
		const index = categories.findIndex((c) => c.id === id);
		if (index === -1) throw new Error('Category not found');

		if (data.name !== undefined) {
			const duplicate = categories.find(
				(c) =>
					c.id !== id &&
					c.name.trim().toLowerCase() ===
						data.name.trim().toLowerCase(),
			);
			if (duplicate)
				throw new Error('A category with this name already exists');
		}

		categories[index].update(data);
		categories[index].validate();
		this._save(categories);
		return categories[index];
	}

	delete(id, contentService) {
		const associated = contentService.getByCategoryId(id);
		if (associated.length > 0) {
			throw new Error('Cannot delete category with associated content');
		}

		const categories = this._load();
		const filtered = categories.filter((c) => c.id !== id);
		if (filtered.length === categories.length) return false;
		this._save(filtered);
		return true;
	}
}
