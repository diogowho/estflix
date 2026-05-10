class EstflixCard extends HTMLElement {
	static get observedAttributes() {
		return [
			'content-id',
			'title',
			'rating',
			'year',
			'image-url',
			'category-name',
			'category-color',
			'is-favorite',
		];
	}

	constructor() {
		super();
		this._favoriteBtn = null;
		this._built = false;
	}

	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this._render();
	}

	_render() {
		const contentId = this.getAttribute('content-id') ?? '';
		const title = this.getAttribute('title') ?? '';
		const rating = this.getAttribute('rating') ?? '';
		const year = this.getAttribute('year') ?? '';
		const imageUrl = this.getAttribute('image-url') ?? '';
		const categoryName = this.getAttribute('category-name') ?? '';
		const categoryColor = this.getAttribute('category-color') ?? '#e50914';
		const isFavorite = this.getAttribute('is-favorite') === 'true';

		const card = document.createElement('div');
		card.classList.add('card');

		const img = document.createElement('img');
		img.classList.add('card__poster');
		img.setAttribute('src', imageUrl);
		img.setAttribute('alt', title);
		img.setAttribute('loading', 'lazy');

		const overlay = document.createElement('div');
		overlay.classList.add('card__overlay');

		const overlayTitle = document.createElement('span');
		overlayTitle.classList.add('card__overlay-title');
		overlayTitle.textContent = title;

		const overlayMeta = document.createElement('div');
		overlayMeta.classList.add('card__overlay-meta');

		const ratingSpan = document.createElement('span');
		ratingSpan.classList.add('card__rating');
		ratingSpan.textContent = '\u2605 ' + rating;

		const dot = document.createElement('span');
		dot.textContent = '\u2022';

		const yearSpan = document.createElement('span');
		yearSpan.textContent = year;

		overlayMeta.appendChild(ratingSpan);
		overlayMeta.appendChild(dot);
		overlayMeta.appendChild(yearSpan);

		overlay.appendChild(overlayTitle);
		overlay.appendChild(overlayMeta);

		const badge = document.createElement('span');
		badge.classList.add('card__badge');
		badge.style.background = categoryColor;
		badge.textContent = categoryName;

		this._favoriteBtn = document.createElement('button');
		this._favoriteBtn.classList.add('card__favorite');
		this._favoriteBtn.setAttribute('aria-label', 'Toggle favorite');
		if (isFavorite) {
			this._favoriteBtn.classList.add('active');
			this._favoriteBtn.textContent = '\u2665';
		} else {
			this._favoriteBtn.textContent = '\u2661';
		}

		this._favoriteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isNowFavorite = this._favoriteBtn.classList.toggle('active');
			this._favoriteBtn.textContent = isNowFavorite ? '\u2665' : '\u2661';
			this.dispatchEvent(
				new CustomEvent('favorite-toggle', {
					bubbles: true,
					detail: { contentId },
				}),
			);
		});

		card.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('card-click', {
					bubbles: true,
					detail: { contentId },
				}),
			);
		});

		card.appendChild(img);
		card.appendChild(overlay);
		card.appendChild(badge);
		card.appendChild(this._favoriteBtn);

		this.appendChild(card);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'is-favorite' && this._favoriteBtn) {
			const isFavorite = newValue === 'true';
			if (isFavorite) {
				this._favoriteBtn.classList.add('active');
				this._favoriteBtn.textContent = '\u2665';
			} else {
				this._favoriteBtn.classList.remove('active');
				this._favoriteBtn.textContent = '\u2661';
			}
		}
	}
}

customElements.define('estflix-card', EstflixCard);
