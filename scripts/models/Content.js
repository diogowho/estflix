class Content {
	constructor({
		id = null,
		title,
		description,
		categoryId,
		year,
		rating,
		imageUrl,
		createdAt = null,
	}) {
		this.id = id ?? Content.generateId();
		this.title = title;
		this.description = description;
		this.categoryId = categoryId;
		this.year = Number(year);
		this.rating = Number(rating);
		this.imageUrl = imageUrl;
		this.createdAt = createdAt ?? new Date().toISOString();
	}

	static generateId() {
		return `cnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	}

	validate() {
		if (!this.title?.trim()) throw new Error('Title is required');
		if (!this.categoryId) throw new Error('Category is required');
		if (this.year < 1900 || this.year > new Date().getFullYear() + 5)
			throw new Error('Invalid year');
		if (this.rating < 0 || this.rating > 5)
			throw new Error('Rating must be between 0 and 5');
	}

	update({ title, description, categoryId, year, rating, imageUrl }) {
		if (title !== undefined) this.title = title;
		if (description !== undefined) this.description = description;
		if (categoryId !== undefined) this.categoryId = categoryId;
		if (year !== undefined) this.year = Number(year);
		if (rating !== undefined) this.rating = Number(rating);
		if (imageUrl !== undefined) this.imageUrl = imageUrl;
		return this;
	}

	getStars() {
		return Math.round((this.rating / 5) * 5 * 2) / 2;
	}
}
