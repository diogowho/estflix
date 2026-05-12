class LoginPage {
	constructor() {}

	render(container) {
		this._container = container;
		this._draw();
	}

	_draw() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		const page = document.createElement('div');
		page.classList.add('login-page');

		const card = document.createElement('div');
		card.classList.add('login-card');

		const logo = document.createElement('div');
		logo.classList.add('login-logo');
		const logoSpan = document.createElement('span');
		logoSpan.textContent = 'FLIX';
		logo.textContent = 'EST';
		logo.appendChild(logoSpan);

		const title = document.createElement('h1');
		title.classList.add('login-title');
		title.textContent = 'Sign In';

		const form = document.createElement('form');
		form.classList.add('login-form');
		form.addEventListener('submit', (e) => this._handleSubmit(e));

		const emailGroup = document.createElement('div');
		emailGroup.classList.add('form-group');
		const emailLabel = document.createElement('label');
		emailLabel.classList.add('form-label');
		emailLabel.textContent = 'Email';
		const emailInput = document.createElement('input');
		emailInput.classList.add('form-control');
		emailInput.setAttribute('type', 'text');
		emailInput.setAttribute('name', 'email');
		emailInput.setAttribute('placeholder', 'Enter email...');
		emailInput.required = true;
		emailGroup.appendChild(emailLabel);
		emailGroup.appendChild(emailInput);

		const passwordGroup = document.createElement('div');
		passwordGroup.classList.add('form-group');
		const passwordLabel = document.createElement('label');
		passwordLabel.classList.add('form-label');
		passwordLabel.textContent = 'Password';
		const passwordInput = document.createElement('input');
		passwordInput.classList.add('form-control');
		passwordInput.setAttribute('type', 'password');
		passwordInput.setAttribute('name', 'password');
		passwordInput.setAttribute('placeholder', 'Enter password...');
		passwordInput.required = true;
		passwordGroup.appendChild(passwordLabel);
		passwordGroup.appendChild(passwordInput);

		const submitBtn = document.createElement('button');
		submitBtn.classList.add('btn', 'btn-primary');
		submitBtn.setAttribute('type', 'submit');
		submitBtn.textContent = 'Sign In';

		form.appendChild(emailGroup);
		form.appendChild(passwordGroup);
		form.appendChild(submitBtn);

		const footer = document.createElement('div');
		footer.classList.add('login-footer');
		const helpLink = document.createElement('a');
		helpLink.href = '#';
		helpLink.textContent = 'Need help?';
		footer.appendChild(helpLink);

		card.appendChild(logo);
		card.appendChild(title);
		card.appendChild(form);
		card.appendChild(footer);
		page.appendChild(card);
		this._container.appendChild(page);
	}

	_handleSubmit(e) {
		e.preventDefault();
		localStorage.setItem('isLoggedIn', 'true');
		window.location.reload();
	}
}
