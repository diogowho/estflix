/**
 * Defines the `<estflix-hero>` custom element.
 *
 * Renders the full-width hero banner at the top of a content page. The banner
 * includes a backdrop image, gradient overlay, category badge, title, rating,
 * year, description, and three action buttons — Watch Now, More Info, and a
 * favorite toggle. Emits `hero-watch`, `hero-info`, and `favorite-toggle`
 * custom events that bubble up to the document.
 */
class EstflixHero extends HTMLElement {
	/**
	 * Returns the list of attributes that the element observes for changes.
	 *
	 * @static
	 * @returns {string[]} Array of observed attribute names.
	 */
	static get observedAttributes() {
		return [
			'content-id',
			'title',
			'description',
			'year',
			'rating',
			'category-name',
			'image-url',
			'is-favorite',
		];
	}

	/**
	 * Creates an instance of EstflixHero and initialises internal state.
	 */
	constructor() {
		super();
		this._favBtn = null;
		this._built = false;
	}

	/**
	 * Invoked when the element is first connected to the document.
	 * Renders the hero DOM exactly once and sets the `_built` guard so
	 * subsequent reconnections are no-ops.
	 *
	 * @returns {void}
	 */
	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this._render();
	}

	/**
	 * Rewrites an arbitrary image URL to the 1280×720 resolution variant by
	 * replacing the trailing `/<width>/<height>` path segments.
	 *
	 * @param {string} raw - The original image URL, potentially at any resolution.
	 * @returns {string} The transformed URL at 1280×720, or an empty string if
	 *   `raw` is falsy.
	 */
	_buildImageUrl(raw) {
		if (!raw) return '';
		return raw.replace(/\/\d+\/\d+$/, '/1280/720');
	}

	/**
	 * Reads all relevant attributes and builds the complete hero DOM subtree,
	 * attaches click handlers for each action button, and appends everything
	 * to the host element.
	 *
	 * @returns {void}
	 */
	_render() {
		const contentId = this.getAttribute('content-id') ?? '';
		const title = this.getAttribute('title') ?? '';
		const description = this.getAttribute('description') ?? '';
		const year = this.getAttribute('year') ?? '';
		const rating = this.getAttribute('rating') ?? '';
		const categoryName = this.getAttribute('category-name') ?? '';
		const imageUrl = this._buildImageUrl(this.getAttribute('image-url'));
		const isFavorite = this.getAttribute('is-favorite') === 'true';

		const section = document.createElement('section');
		section.classList.add('hero');

		const backdrop = document.createElement('img');
		backdrop.classList.add('hero__backdrop-image');
		backdrop.setAttribute('src', imageUrl);
		backdrop.setAttribute('alt', title);

		const gradient = document.createElement('div');
		gradient.classList.add('hero__gradient');

		const content = document.createElement('div');
		content.classList.add('hero__content', 'animate-fade-in');

		const badge = document.createElement('span');
		badge.classList.add('hero__badge');
		badge.textContent = categoryName;

		const titleEl = document.createElement('h1');
		titleEl.classList.add('hero__title');
		titleEl.textContent = title;

		const meta = document.createElement('div');
		meta.classList.add('hero__meta');

		const ratingEl = document.createElement('span');
		ratingEl.classList.add('hero__rating');
		ratingEl.textContent = '\u2605 ' + rating;

		const metaDot = document.createElement('span');
		metaDot.classList.add('hero__meta-dot');

		const yearEl = document.createElement('span');
		yearEl.textContent = year;

		meta.appendChild(ratingEl);
		meta.appendChild(metaDot);
		meta.appendChild(yearEl);

		const descEl = document.createElement('p');
		descEl.classList.add('hero__description');
		descEl.textContent = description;

		const actions = document.createElement('div');
		actions.classList.add('hero__actions');

		const playBtn = document.createElement('button');
		playBtn.classList.add('btn', 'btn-primary', 'hero__play-btn');
		playBtn.textContent = '\u25b6 Watch Now';
		// Fire hero-watch event when Watch Now button is clicked
		playBtn.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('hero-watch', {
					bubbles: true,
					detail: { contentId },
				}),
			);
		});

		const infoBtn = document.createElement('button');
		infoBtn.classList.add('btn', 'btn-secondary', 'hero__info-btn');
		infoBtn.textContent = '\u24d8 More Info';
		// Fire hero-info event when More Info button is clicked
		infoBtn.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('hero-info', {
					bubbles: true,
					detail: { contentId },
				}),
			);
		});

		this._favBtn = document.createElement('button');
		this._favBtn.classList.add(
			'btn',
			'btn-ghost',
			'btn-icon',
			'hero__fav-btn',
		);
		this._favBtn.setAttribute('aria-label', 'Favorite');
		if (isFavorite) {
			this._favBtn.classList.add('active');
			this._favBtn.textContent = '\u2665';
		} else {
			this._favBtn.textContent = '\u2661';
		}

		// Toggle favorite state and fire favorite-toggle event
		this._favBtn.addEventListener('click', () => {
			const isNowFavorite = this._favBtn.classList.toggle('active');
			this._favBtn.textContent = isNowFavorite ? '\u2665' : '\u2661';
			this.dispatchEvent(
				new CustomEvent('favorite-toggle', {
					bubbles: true,
					detail: { contentId },
				}),
			);
		});

		actions.appendChild(playBtn);
		actions.appendChild(infoBtn);
		actions.appendChild(this._favBtn);

		content.appendChild(badge);
		content.appendChild(titleEl);
		content.appendChild(meta);
		content.appendChild(descEl);
		content.appendChild(actions);

		section.appendChild(backdrop);
		section.appendChild(gradient);
		section.appendChild(content);

		this.appendChild(section);
	}

	/**
	 * Invoked whenever an observed attribute changes.
	 * Handles the `is-favorite` attribute by updating the favorite button's
	 * visual state without re-rendering the whole hero.
	 *
	 * @param {string} name - Name of the attribute that changed.
	 * @param {string|null} oldValue - Previous value of the attribute.
	 * @param {string|null} newValue - New value of the attribute.
	 * @returns {void}
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === 'is-favorite' && this._favBtn) {
			const isFavorite = newValue === 'true';
			if (isFavorite) {
				this._favBtn.classList.add('active');
				this._favBtn.textContent = '\u2665';
			} else {
				this._favBtn.classList.remove('active');
				this._favBtn.textContent = '\u2661';
			}
		}
	}
}

customElements.define('estflix-hero', EstflixHero);
