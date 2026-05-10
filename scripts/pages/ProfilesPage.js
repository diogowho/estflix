class ProfilesPage {
	constructor(profileService) {
		this._profileService = profileService;
		this._container = null;
	}

	render(container) {
		this._container = container;
		this._draw();
	}

	_draw() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		const page = document.createElement('div');
		page.classList.add('profiles-page');

		const logo = document.createElement('div');
		logo.classList.add('navbar__logo');
		logo.style.cssText = 'font-size:3rem;margin-bottom:0;cursor:default';
		const logoSpan = document.createElement('span');
		logoSpan.textContent = 'FLIX';
		logo.textContent = 'EST';
		logo.appendChild(logoSpan);

		const title = document.createElement('h1');
		title.classList.add('profiles-page__title');
		const titleSpan = document.createElement('span');
		titleSpan.textContent = "WHO'S WATCHING?";
		title.appendChild(titleSpan);

		const grid = document.createElement('div');
		grid.classList.add('profiles-grid');

		const profiles = this._profileService.getAll();
		profiles.forEach((profile) => {
			grid.appendChild(this._buildProfileCard(profile));
		});

		grid.appendChild(this._buildAddProfileCard());

		page.appendChild(logo);
		page.appendChild(title);
		page.appendChild(grid);
		this._container.appendChild(page);
	}

	_buildProfileCard(profile) {
		const card = document.createElement('div');
		card.classList.add('profile-card');
		card.setAttribute('data-profile-id', profile.id);

		const avatar = document.createElement('div');
		avatar.classList.add('profile-card__avatar');
		avatar.textContent = profile.avatar;

		const name = document.createElement('span');
		name.classList.add('profile-card__name');
		name.textContent = profile.name;

		card.appendChild(avatar);
		card.appendChild(name);

		card.addEventListener('click', () => {
			this._profileService.setActive(profile.id);
			window.location.href = 'home.html';
		});

		return card;
	}

	_buildAddProfileCard() {
		const card = document.createElement('div');
		card.classList.add('profile-card', 'add-profile');

		const avatar = document.createElement('div');
		avatar.classList.add('profile-card__avatar');
		avatar.textContent = '+';

		const name = document.createElement('span');
		name.classList.add('profile-card__name');
		name.textContent = 'NEW PROFILE';

		card.appendChild(avatar);
		card.appendChild(name);

		card.addEventListener('click', () => this._showAddProfileModal());

		return card;
	}

	_showAddProfileModal() {
		const overlay = document.createElement('div');
		overlay.classList.add('modal-backdrop');

		const modal = document.createElement('div');
		modal.classList.add('modal');

		const header = document.createElement('div');
		header.classList.add('modal__header');

		const title = document.createElement('span');
		title.classList.add('modal__title');
		title.textContent = 'CREATE PROFILE';

		const closeBtn = document.createElement('button');
		closeBtn.classList.add('modal__close');
		closeBtn.textContent = '\u00D7';
		closeBtn.addEventListener('click', () => overlay.remove());

		header.appendChild(title);
		header.appendChild(closeBtn);

		const body = document.createElement('div');
		body.classList.add('modal__body');

		const nameGroup = document.createElement('div');
		nameGroup.classList.add('form-group');
		const nameLabel = document.createElement('label');
		nameLabel.classList.add('form-label');
		nameLabel.textContent = 'Profile Name';
		const nameInput = document.createElement('input');
		nameInput.classList.add('form-control');
		nameInput.setAttribute('type', 'text');
		nameInput.setAttribute('placeholder', 'Enter a name...');
		nameInput.setAttribute('maxlength', '20');
		nameGroup.appendChild(nameLabel);
		nameGroup.appendChild(nameInput);

		const errorMsg = document.createElement('span');
		errorMsg.classList.add('form-error');
		errorMsg.style.display = 'none';

		body.appendChild(nameGroup);
		body.appendChild(errorMsg);

		const footer = document.createElement('div');
		footer.classList.add('modal__footer');

		const cancelBtn = document.createElement('button');
		cancelBtn.classList.add('btn', 'btn-ghost');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.addEventListener('click', () => overlay.remove());

		const confirmBtn = document.createElement('button');
		confirmBtn.classList.add('btn', 'btn-primary');
		confirmBtn.textContent = 'Create';
		confirmBtn.addEventListener('click', () => {
			const name = nameInput.value.trim();
			if (!name) {
				errorMsg.textContent = 'Profile name is required';
				errorMsg.style.display = 'flex';
				return;
			}
			try {
				this._profileService.create({ name });
				overlay.remove();
				this._draw();
				EstflixToast.show('Profile created!', 'success');
			} catch (e) {
				errorMsg.textContent = e.message;
				errorMsg.style.display = 'flex';
			}
		});

		footer.appendChild(cancelBtn);
		footer.appendChild(confirmBtn);

		modal.appendChild(header);
		modal.appendChild(body);
		modal.appendChild(footer);
		overlay.appendChild(modal);
		document.body.appendChild(overlay);

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) overlay.remove();
		});

		requestAnimationFrame(() => overlay.classList.add('open'));
		nameInput.focus();
	}
}
