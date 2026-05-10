class Category {
	constructor({ id = null, name, color = null, createdAt = null }) {
		this.id = id ?? Category.generateId();
		this.name = name;
		this.color = color ?? Category.generateColor();
		this.createdAt = createdAt ?? new Date().toISOString();
	}

	static generateId() {
		return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	}

	static generateColor() {
		const colors = [
			'#e50914',
			'#7b2ff7',
			'#00d4ff',
			'#ff6b35',
			'#00c896',
			'#ffd700',
			'#ff3d8a',
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}

	validate() {
		if (!this.name?.trim()) throw new Error('Category name is required');
	}

	update({ name, color }) {
		if (name !== undefined) this.name = name;
		if (color !== undefined) this.color = color;
		return this;
	}
}
