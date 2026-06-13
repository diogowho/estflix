class EstflixNavbar extends HTMLElement {
	static get observedAttributes() {
		return ['active-page', 'profile-name', 'profile-avatar'];
	}

	constructor() {
		super();
		this._nav = null;
		this._links = {};
		this._avatarEl = null;
		this._nameEl = null;
		this._searchInput = null;
		this._debounceTimer = null;
		this._scrollHandler = null;
		this._outsideClickHandler = null;
		this._built = false;
	}

	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this._render();
	}

	disconnectedCallback() {
		if (this._scrollHandler) {
			window.removeEventListener('scroll', this._scrollHandler);
		}
		if (this._outsideClickHandler) {
			window.removeEventListener('click', this._outsideClickHandler);
		}
	}

	_render() {
		const activePage = this.getAttribute('active-page') ?? '';
		const profileName = this.getAttribute('profile-name') ?? '';
		const profileAvatar = this.getAttribute('profile-avatar') ?? '';

		this._nav = document.createElement('nav');
		this._nav.classList.add('navbar');
		this._nav.setAttribute('id', 'main-navbar');

		const container = document.createElement('div');
		container.classList.add('navbar__inner');

		const hamburgerBtn = document.createElement('button');
		hamburgerBtn.classList.add('navbar__hamburger');
		hamburgerBtn.setAttribute('aria-label', 'Menu');
		hamburgerBtn.setAttribute('aria-expanded', 'false');
		hamburgerBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;

		const logoLink = document.createElement('a');
		logoLink.classList.add('navbar__logo');
		logoLink.setAttribute('href', '/home');
		logoLink.textContent = 'EST';

		const logoSpan = document.createElement('span');
		logoSpan.textContent = 'FLIX';
		logoLink.appendChild(logoSpan);

		const menuWrapper = document.createElement('div');
		menuWrapper.classList.add('navbar__menu-wrapper');

		hamburgerBtn.addEventListener('click', (e) => {
			const isOpen = menuWrapper.classList.toggle('open');
			hamburgerBtn.setAttribute(
				'aria-expanded',
				isOpen ? 'true' : 'false',
			);
			// Stop event propagation so the outside click handler doesn't close the menu immediately
			e.stopPropagation();
		});

		const navList = document.createElement('ul');
		navList.classList.add('navbar__links');

		const pages = [
			{ key: 'home', label: 'Home', href: '/home' },
			{ key: 'favorites', label: 'My List', href: '/home#favorites' },
			{ key: 'admin', label: 'Admin', href: '/admin' },
		];

		pages.forEach(({ key, label, href }) => {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.classList.add('navbar__link');
			a.setAttribute('href', href);
			a.textContent = label;
			if (activePage === key) a.classList.add('active');
			this._links[key] = a;
			li.appendChild(a);
			navList.appendChild(li);

			// Close mobile menu when clicking a link
			a.addEventListener('click', () => {
				if (menuWrapper.classList.contains('open')) {
					menuWrapper.classList.remove('open');
					hamburgerBtn.setAttribute('aria-expanded', 'false');
				}
			});
		});

		const spacer = document.createElement('div');
		spacer.style.flex = '1';

		const searchWrapper = document.createElement('div');
		searchWrapper.classList.add('navbar__search');

		this._searchInput = document.createElement('input');
		this._searchInput.setAttribute('type', 'text');
		this._searchInput.classList.add('navbar__search-input');
		this._searchInput.setAttribute('placeholder', 'Search titles\u2026');
		this._searchInput.setAttribute('aria-label', 'Search titles');

		this._searchInput.addEventListener('input', () => {
			clearTimeout(this._debounceTimer);
			this._debounceTimer = setTimeout(() => {
				this._fireSearch(this._searchInput.value);
			}, 300);
		});

		this._searchInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				clearTimeout(this._debounceTimer);
				this._fireSearch(this._searchInput.value);
			}
		});

		const searchBtn = document.createElement('button');
		searchBtn.classList.add('navbar__search-btn');
		searchBtn.setAttribute('aria-label', 'Search');
		searchBtn.textContent = '\u2315';
		searchBtn.addEventListener('click', () => {
			clearTimeout(this._debounceTimer);
			this._fireSearch(this._searchInput.value);
		});

		searchWrapper.appendChild(this._searchInput);
		searchWrapper.appendChild(searchBtn);

		const profileDiv = document.createElement('div');
		profileDiv.classList.add('navbar__profile');
		profileDiv.setAttribute('id', 'navbar-profile-btn');

		this._avatarEl = document.createElement('div');
		this._avatarEl.classList.add('navbar__avatar');
		this._avatarEl.textContent = profileAvatar;

		this._nameEl = document.createElement('span');
		this._nameEl.classList.add('navbar__username');
		this._nameEl.textContent = profileName;

		profileDiv.appendChild(this._avatarEl);
		profileDiv.appendChild(this._nameEl);

		const logoutLink = document.createElement('a');
		logoutLink.classList.add('btn', 'btn-ghost', 'btn-sm');
		logoutLink.setAttribute('aria-label', 'Logout');
		logoutLink.textContent = '\u2192 Logout';
		logoutLink.style.marginLeft = '0.5rem';
		logoutLink.href = '/api/auth/logout';

		profileDiv.appendChild(logoutLink);

		profileDiv.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('profile-switch', { bubbles: true }),
			);
		});

		menuWrapper.appendChild(navList);
		menuWrapper.appendChild(searchWrapper);
		menuWrapper.appendChild(profileDiv);

		container.appendChild(hamburgerBtn);
		container.appendChild(logoLink);
		container.appendChild(spacer);
		container.appendChild(menuWrapper);

		this._nav.appendChild(container);
		this.appendChild(this._nav);

		// Close menu when user clicks outside
		this._outsideClickHandler = (e) => {
			if (
				!container.contains(e.target) &&
				menuWrapper.classList.contains('open')
			) {
				menuWrapper.classList.remove('open');
				hamburgerBtn.setAttribute('aria-expanded', 'false');
			}
		};
		window.addEventListener('click', this._outsideClickHandler);

		this._scrollHandler = () => {
			if (window.scrollY > 50) {
				this._nav.classList.add('scrolled');
			} else {
				this._nav.classList.remove('scrolled');
			}
		};

		window.addEventListener('scroll', this._scrollHandler, {
			passive: true,
		});
	}

	_fireSearch(query) {
		this.dispatchEvent(
			new CustomEvent('search-query', {
				bubbles: true,
				detail: { query },
			}),
		);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === 'active-page') {
			Object.entries(this._links).forEach(([key, a]) => {
				if (key === newValue) {
					a.classList.add('active');
				} else {
					a.classList.remove('active');
				}
			});
		} else if (name === 'profile-name' && this._nameEl) {
			this._nameEl.textContent = newValue ?? '';
		} else if (name === 'profile-avatar' && this._avatarEl) {
			this._avatarEl.textContent = newValue ?? '';
		}
	}
}

customElements.define('estflix-navbar', EstflixNavbar);
