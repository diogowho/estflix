/**
 * Represents a content category (genre) used to group catalogue entries.
 */
class Category {
	/**
	 * @param {Object} options - Category initialisation options.
	 * @param {string|null} [options.id=null] - Unique identifier; generated automatically when omitted.
	 * @param {string} options.name - Display name of the category.
	 * @param {string|null} [options.color=null] - Hex colour string; randomly chosen when omitted.
	 * @param {string|null} [options.createdAt=null] - ISO timestamp; defaults to now.
	 */
	constructor({ id = null, name, color = null, createdAt = null }) {
		this.id = id ?? Category.generateId();
		this.name = name;
		this.color = color ?? Category.generateColor();
		this.createdAt = createdAt ?? new Date().toISOString();
	}

	/**
	 * Generates a unique category identifier.
	 * @returns {string} A unique ID prefixed with `cat_`.
	 */
	static generateId() {
		return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	}

	/**
	 * Picks a random hex colour from a predefined palette.
	 * @returns {string} A hex colour string (e.g. `'#e50914'`).
	 */
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

	/**
	 * Validates that the category has a non-empty name.
	 * @throws {Error} If the name is blank or missing.
	 * @returns {void}
	 */
	validate() {
		if (!this.name?.trim()) throw new Error('Category name is required');
	}

	/**
	 * Applies partial updates to the category, leaving unspecified fields unchanged.
	 * @param {Object} changes - Fields to update.
	 * @param {string} [changes.name] - New category name.
	 * @param {string} [changes.color] - New hex colour string.
	 * @returns {Category} The current instance (for chaining).
	 */
	update({ name, color }) {
		if (name !== undefined) this.name = name;
		if (color !== undefined) this.color = color;
		return this;
	}
}
