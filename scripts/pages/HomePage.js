class HomePage {
	constructor(contentService, categoryService, profileService) {
		this._contentService = contentService;
		this._categoryService = categoryService;
		this._profileService = profileService;
		this._container = null;
		this._activeProfile = null;
		this._heroIndex = 0;
		this._featuredContents = [];
		this._searchQuery = '';
		this._heroTimer = null;
	}

	render(container) {
		this._container = container;
		this._activeProfile = this._profileService.getActive();
		this._setupEventListeners();
		this._draw();
	}

	_setupEventListeners() {
		document.addEventListener('search-query', (e) => {
			this._searchQuery = e.detail?.query ?? '';
			this._draw();
		});

		document.addEventListener('profile-switch', () => {
			window.location.href = 'index.html';
		});

		document.addEventListener('card-click', (e) => {
			this._handleCardClick(e.detail.contentId);
		});

		document.addEventListener('favorite-toggle', (e) => {
			this._handleFavoriteToggle(e.detail.contentId);
		});

		document.addEventListener('hero-watch', (e) => {
			this._handleCardClick(e.detail.contentId);
		});

		document.addEventListener('hero-info', (e) => {
			this._handleCardClick(e.detail.contentId);
		});

		// handle if the user clicks a link with a hash (e.g. #favorites)
		window.addEventListener('hashchange', () => this._applyHashScroll());

		// also handle same-hash links being clicked
		document.addEventListener('click', (e) => {
			const link = e.target.closest('a[href*="#"]');
			if (link && link.href.includes('#')) {
				const hash = link.href.split('#')[1];
				if (hash) {
					// force hash change to trigger scroll
					e.preventDefault();
					window.location.hash = '';
					window.location.hash = hash;
				}
			}
		});
	}

	_draw() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		if (this._heroTimer) clearInterval(this._heroTimer);

		if (this._searchQuery) {
			this._renderSearchResults();
		} else {
			this._renderNormalView();
		}

		// support deep-links to rows like #favorites — scroll after render
		this._applyHashScroll();
	}

	// Scroll to a section when URL has a hash (e.g. #favorites)
	_applyHashScroll() {
		const hash = window.location.hash.replace('#', '').trim();
		if (!hash || !this._container) return;
		requestAnimationFrame(() => {
			const target = this._container.querySelector(
				`[data-row-id="${hash}"]`,
			);
			if (target) {
				const navbar = document.getElementById('main-navbar');
				const navHeight = navbar ? navbar.offsetHeight + 24 : 96; // leave some breathing room
				const rect = target.getBoundingClientRect();
				const top = window.scrollY + rect.top - navHeight;
				window.scrollTo({ top, behavior: 'smooth' });
			}
		});
	}

	_renderNormalView() {
		const allContent = this._contentService.getAll();
		if (allContent.length === 0) return;

		this._featuredContents = [...allContent]
			.sort((a, b) => b.rating - a.rating)
			.slice(0, 5);

		const heroContent = this._featuredContents[this._heroIndex];
		const hero = this._buildHero(heroContent);
		this._container.appendChild(hero);

		this._heroTimer = setInterval(() => {
			this._heroIndex =
				(this._heroIndex + 1) % this._featuredContents.length;
			const newHeroContent = this._featuredContents[this._heroIndex];
			const newHero = this._buildHero(newHeroContent);
			const old = this._container.querySelector('estflix-hero');
			if (old) this._container.replaceChild(newHero, old);
		}, 8000);

		const history = this._activeProfile?.history ?? [];
		if (history.length > 0) {
			const historyContent = history
				.map((id) => this._contentService.getById(id))
				.filter(Boolean);
			if (historyContent.length > 0) {
				this._container.appendChild(
					this._buildRow(
						'Continue Watching',
						historyContent,
						'history',
					),
				);
			}
		}

		const favorites = this._activeProfile?.favorites ?? [];
		if (favorites.length > 0) {
			const favContent = favorites
				.map((id) => this._contentService.getById(id))
				.filter(Boolean);
			if (favContent.length > 0) {
				this._container.appendChild(
					this._buildRow('My List', favContent, 'favorites'),
				);
			}
		}

		const categories = this._categoryService.getAll();
		categories.forEach((cat) => {
			const catContent = this._contentService.getByCategoryId(cat.id);
			if (catContent.length > 0) {
				this._container.appendChild(
					this._buildRow(cat.name, catContent, cat.id, cat.color),
				);
			}
		});

		const spacer = document.createElement('div');
		spacer.style.height = '4rem';
		this._container.appendChild(spacer);
	}

	_renderSearchResults() {
		const results = this._contentService.search(this._searchQuery);

		const section = document.createElement('div');
		section.style.cssText = 'padding: 120px clamp(24px,4vw,60px) 4rem;';

		const title = document.createElement('h2');
		title.style.cssText =
			'font-family:"Merriweather", serif; font-size: clamp(1.6rem,3.6vw,2rem); letter-spacing: 0.02em; margin-bottom: 0.5rem; color: var(--text);';
		title.textContent = 'Search Results';

		const subtitle = document.createElement('p');
		subtitle.style.cssText =
			'font-family:Inter, sans-serif; color: var(--text-2); margin-bottom: 2rem;';
		subtitle.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} for "${this._searchQuery}"`;

		section.appendChild(title);
		section.appendChild(subtitle);

		if (results.length === 0) {
			const empty = document.createElement('div');
			empty.classList.add('empty-state');
			const icon = document.createElement('div');
			icon.classList.add('empty-state__icon');
			icon.textContent = '\uD83D\uDD0D';
			const text = document.createElement('div');
			text.classList.add('empty-state__text');
			text.textContent = 'Nothing found in the void';
			empty.appendChild(icon);
			empty.appendChild(text);
			section.appendChild(empty);
		} else {
			const grid = document.createElement('div');
			grid.classList.add('grid-auto');
			grid.style.gap = '1.5rem';
			results.forEach((content) => {
				const categories = this._categoryService.getAll();
				const cat = categories.find((c) => c.id === content.categoryId);
				grid.appendChild(this._buildCard(content, cat));
			});
			section.appendChild(grid);
		}

		this._container.appendChild(section);
	}

	_buildHero(content) {
		const categories = this._categoryService.getAll();
		const cat = categories.find((c) => c.id === content.categoryId);
		const isFav = this._activeProfile?.isFavorite(content.id) ?? false;

		const hero = document.createElement('estflix-hero');
		hero.setAttribute('content-id', content.id);
		hero.setAttribute('title', content.title);
		hero.setAttribute('description', content.description);
		hero.setAttribute('year', content.year);
		hero.setAttribute('rating', content.rating);
		hero.setAttribute('category-name', cat?.name ?? '');
		hero.setAttribute('image-url', content.imageUrl);
		hero.setAttribute('is-favorite', isFav ? 'true' : 'false');
		return hero;
	}

	_buildRow(title, contents, rowId, accentColor = null) {
		const section = document.createElement('div');
		section.classList.add('content-section');
		section.setAttribute('data-row-id', rowId);

		const header = document.createElement('div');
		header.classList.add('content-section__header');

		const titleEl = document.createElement('h2');
		titleEl.classList.add('content-section__title');

		if (accentColor) {
			const span = document.createElement('span');
			span.style.color = accentColor;
			span.textContent = '— ';
			titleEl.appendChild(span);
		}

		titleEl.appendChild(document.createTextNode(title));
		header.appendChild(titleEl);
		section.appendChild(header);

		const row = document.createElement('div');
		row.classList.add('content-row');

		const categories = this._categoryService.getAll();
		contents.forEach((content) => {
			const cat = categories.find((c) => c.id === content.categoryId);
			row.appendChild(this._buildCard(content, cat));
		});

		section.appendChild(row);
		return section;
	}

	_buildCard(content, category) {
		const isFav = this._activeProfile?.isFavorite(content.id) ?? false;
		const card = document.createElement('estflix-card');
		card.setAttribute('content-id', content.id);
		card.setAttribute('title', content.title);
		card.setAttribute('rating', content.rating);
		card.setAttribute('year', content.year);
		card.setAttribute('image-url', content.imageUrl);
		card.setAttribute('category-name', category?.name ?? '');
		card.setAttribute('category-color', category?.color ?? '#7b2ff7');
		card.setAttribute('is-favorite', isFav ? 'true' : 'false');
		return card;
	}

	_handleCardClick(contentId) {
		const content = this._contentService.getById(contentId);
		if (!content) return;

		if (this._activeProfile) {
			this._profileService.addToHistory(
				this._activeProfile.id,
				contentId,
			);
			this._activeProfile = this._profileService.getActive();
		}

		this._showContentDetail(content);
	}

	_handleFavoriteToggle(contentId) {
		if (!this._activeProfile) return;

		const isFav = this._activeProfile.isFavorite(contentId);
		if (isFav) {
			this._profileService.removeFromFavorites(
				this._activeProfile.id,
				contentId,
			);
			EstflixToast.show('Removed from My List', 'info');
		} else {
			this._profileService.addToFavorites(
				this._activeProfile.id,
				contentId,
			);
			EstflixToast.show('Added to My List', 'success');
		}
		this._activeProfile = this._profileService.getActive();

		document
			.querySelectorAll(`estflix-card[content-id="${contentId}"]`)
			.forEach((card) => {
				card.setAttribute('is-favorite', !isFav ? 'true' : 'false');
			});
		const hero = document.querySelector(
			`estflix-hero[content-id="${contentId}"]`,
		);
		if (hero) hero.setAttribute('is-favorite', !isFav ? 'true' : 'false');

		this._updateFavoritesRow();
	}

	_updateFavoritesRow() {
		const favorites = this._activeProfile?.favorites ?? [];
		const favContent = favorites
			.map((id) => this._contentService.getById(id))
			.filter(Boolean);

		const existingRow = this._container.querySelector(
			'[data-row-id="favorites"]',
		);

		if (favContent.length > 0) {
			const newRow = this._buildRow('My List', favContent, 'favorites');
			if (existingRow) {
				existingRow.replaceWith(newRow);
			} else {
				const historyRow = this._container.querySelector(
					'[data-row-id="history"]',
				);
				if (historyRow) {
					historyRow.after(newRow);
				} else {
					const hero = this._container.querySelector('estflix-hero');
					if (hero) {
						hero.after(newRow);
					} else {
						// fallback
						this._draw();
					}
				}
			}
		} else if (existingRow) {
			existingRow.remove();
		}
	}

	_showContentDetail(content) {
		const categories = this._categoryService.getAll();
		const cat = categories.find((c) => c.id === content.categoryId);
		const isFav = this._activeProfile?.isFavorite(content.id) ?? false;

		const overlay = document.createElement('div');
		overlay.classList.add('modal-backdrop');
		overlay.style.alignItems = 'flex-end';

		const panel = document.createElement('div');
		panel.classList.add('modal');
		panel.style.cssText =
			'max-width:700px;width:100%;padding:0;overflow:hidden;border-radius:20px;';

		const imgWrap = document.createElement('div');
		imgWrap.style.cssText =
			'position:relative;height:300px;overflow:hidden;';
		const img = document.createElement('img');
		img.src = content.imageUrl.replace(/\/\d+\/\d+$/, '/700/300');
		img.alt = content.title;
		img.style.cssText =
			'width:100%;height:100%;object-fit:cover;filter:brightness(0.6);';
		const imgGrad = document.createElement('div');
		imgGrad.classList.add('modal__image-mask');
		const imgTitle = document.createElement('div');
		imgTitle.style.cssText =
			'position:absolute;bottom:1.5rem;left:1.5rem;right:1.5rem;';
		const h2 = document.createElement('h2');
		h2.style.cssText =
			'font-family:"Merriweather", serif; font-size:clamp(2rem,5vw,3.5rem); line-height:1; color: var(--text);';
		h2.textContent = content.title;
		imgTitle.appendChild(h2);
		imgWrap.appendChild(img);
		imgWrap.appendChild(imgGrad);
		imgWrap.appendChild(imgTitle);

		const body = document.createElement('div');
		body.style.cssText = 'padding:1.5rem 2rem 2rem;';

		const meta = document.createElement('div');
		meta.style.cssText =
			'display:flex;gap:1rem;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;';

		const catPill = document.createElement('span');
		catPill.style.cssText = `background:${cat?.color ?? '#7b2ff7'};color:#fff;font-family:Inter, sans-serif;font-weight:700;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;padding:4px 14px;border-radius:30px;`;
		catPill.textContent = cat?.name ?? '';

		const year = document.createElement('span');
		year.style.cssText =
			'font-family:Inter, sans-serif; color: var(--text-2);';
		year.textContent = content.year;

		const rating = document.createElement('span');
		rating.style.cssText =
			'font-family:Inter, sans-serif; font-weight:700; color: var(--rating); display:flex; align-items:center; gap:4px;';
		rating.textContent = '\u2605 ' + content.rating;

		meta.appendChild(catPill);
		meta.appendChild(year);
		meta.appendChild(rating);

		const desc = document.createElement('p');
		desc.style.cssText =
			'font-family:Inter, sans-serif; color: var(--text-2); line-height:1.7; margin-bottom:1.5rem;';
		desc.textContent = content.description;

		const actions = document.createElement('div');
		actions.style.cssText = 'display:flex;gap:1rem;flex-wrap:wrap;';

		const watchBtn = document.createElement('button');
		watchBtn.classList.add('btn', 'btn-primary');
		watchBtn.textContent = '\u25B6 Watch Now';
		watchBtn.addEventListener('click', () => {
			EstflixToast.show(`Now playing: ${content.title}`, 'success');
			overlay.remove();
		});

		const favBtn = document.createElement('button');
		favBtn.classList.add('btn', isFav ? 'btn-danger' : 'btn-ghost');
		favBtn.textContent = isFav
			? '\u2665 In My List'
			: '\u2661 Add to My List';
		favBtn.addEventListener('click', () => {
			this._handleFavoriteToggle(content.id);
			overlay.remove();
		});

		const closeDetailBtn = document.createElement('button');
		closeDetailBtn.classList.add('btn', 'btn-ghost');
		closeDetailBtn.textContent = 'Close';
		closeDetailBtn.addEventListener('click', () => overlay.remove());

		actions.appendChild(watchBtn);
		actions.appendChild(favBtn);
		actions.appendChild(closeDetailBtn);

		body.appendChild(meta);
		body.appendChild(desc);
		body.appendChild(actions);

		panel.appendChild(imgWrap);
		panel.appendChild(body);
		overlay.appendChild(panel);
		document.body.appendChild(overlay);

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) overlay.remove();
		});

		requestAnimationFrame(() => overlay.classList.add('open'));
	}
}

customElements.define('home-page', HomePage);
