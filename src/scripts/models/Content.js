/**
 * Represents a piece of content (movie, series, etc.) in the catalogue.
 */
class Content {
	/**
	 * @param {Object} options - Content initialisation options.
	 * @param {string|null} [options.id=null] - Unique identifier; generated automatically when omitted.
	 * @param {string} options.title - Display title of the content.
	 * @param {string} options.description - Short description or synopsis.
	 * @param {string} options.categoryId - ID of the category this content belongs to.
	 * @param {number|string} options.year - Release year.
	 * @param {number|string} options.rating - Rating value between 0 and 5.
	 * @param {string} options.imageUrl - URL of the cover image.
	 * @param {string|null} [options.createdAt=null] - ISO timestamp; defaults to now.
	 */
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

	/**
	 * Generates a unique content identifier.
	 * @returns {string} A unique ID prefixed with `cnt_`.
	 */
	static generateId() {
		return `cnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	}

	/**
	 * Validates the content's required fields and value constraints.
	 * @throws {Error} If the title is empty or missing.
	 * @throws {Error} If the categoryId is missing.
	 * @throws {Error} If the year is outside the accepted range (1900 to current year + 5).
	 * @throws {Error} If the rating is not between 0 and 5.
	 * @returns {void}
	 */
	validate() {
		if (!this.title?.trim()) throw new Error('Title is required');
		if (!this.categoryId) throw new Error('Category is required');
		if (this.year < 1900 || this.year > new Date().getFullYear() + 5)
			throw new Error('Invalid year');
		if (this.rating < 0 || this.rating > 5)
			throw new Error('Rating must be between 0 and 5');
	}

	/**
	 * Applies partial updates to the content, leaving unspecified fields unchanged.
	 * @param {Object} changes - Fields to update.
	 * @param {string} [changes.title] - New title.
	 * @param {string} [changes.description] - New description.
	 * @param {string} [changes.categoryId] - New category ID.
	 * @param {number|string} [changes.year] - New release year.
	 * @param {number|string} [changes.rating] - New rating value.
	 * @param {string} [changes.imageUrl] - New cover image URL.
	 * @returns {Content} The current instance (for chaining).
	 */
	update({ title, description, categoryId, year, rating, imageUrl }) {
		if (title !== undefined) this.title = title;
		if (description !== undefined) this.description = description;
		if (categoryId !== undefined) this.categoryId = categoryId;
		if (year !== undefined) this.year = Number(year);
		if (rating !== undefined) this.rating = Number(rating);
		if (imageUrl !== undefined) this.imageUrl = imageUrl;
		return this;
	}

	/**
	 * Returns the rating rounded to the nearest half-star on a 0–5 scale.
	 * @returns {number} Half-star rounded rating.
	 */
	getStars() {
		return Math.round((this.rating / 5) * 5 * 2) / 2;
	}
}
