class LoginPage {
	constructor() {
		this._container = null;
		this._mode = 'login'; // Track current mode: login or register
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
		title.textContent =
			this._mode === 'login' ? 'Sign In' : 'Create Account';

		const form = document.createElement('form');
		form.classList.add('login-form');
		form.addEventListener('submit', (e) => this._handleSubmit(e));

		// Create email input
		const emailGroup = document.createElement('div');
		emailGroup.classList.add('form-group');
		const emailLabel = document.createElement('label');
		emailLabel.classList.add('form-label');
		emailLabel.textContent = 'Email';
		const emailInput = document.createElement('input');
		emailInput.classList.add('form-control');
		emailInput.setAttribute('type', 'email');
		emailInput.setAttribute('id', 'login-email');
		emailInput.setAttribute('name', 'email');
		emailInput.setAttribute('placeholder', 'Enter email...');
		emailInput.required = true;
		emailGroup.appendChild(emailLabel);
		emailGroup.appendChild(emailInput);

		// Create password input
		const passwordGroup = document.createElement('div');
		passwordGroup.classList.add('form-group');
		const passwordLabel = document.createElement('label');
		passwordLabel.classList.add('form-label');
		passwordLabel.textContent = 'Password';
		const passwordInput = document.createElement('input');
		passwordInput.classList.add('form-control');
		passwordInput.setAttribute('type', 'password');
		passwordInput.setAttribute('id', 'login-password');
		passwordInput.setAttribute('name', 'password');
		passwordInput.setAttribute('placeholder', 'Enter password...');
		passwordInput.setAttribute('minlength', '6');
		passwordInput.required = true;
		passwordGroup.appendChild(passwordLabel);
		passwordGroup.appendChild(passwordInput);

		// Error message display
		const errorMsg = document.createElement('p');
		errorMsg.classList.add('form-error');
		errorMsg.setAttribute('id', 'login-error');
		errorMsg.style.display = 'none';

		// Create submit button
		const submitBtn = document.createElement('button');
		submitBtn.classList.add('btn', 'btn-primary');
		submitBtn.setAttribute('type', 'submit');
		submitBtn.setAttribute('id', 'login-submit');
		submitBtn.textContent =
			this._mode === 'login' ? 'Sign In' : 'Create Account';

		form.appendChild(emailGroup);
		form.appendChild(passwordGroup);
		form.appendChild(errorMsg);
		form.appendChild(submitBtn);

		// Footer with login/register toggle
		const footer = document.createElement('div');
		footer.classList.add('login-footer');
		const toggleLink = document.createElement('a');
		toggleLink.href = '#';
		toggleLink.textContent =
			this._mode === 'login'
				? "Don't have an account? Register"
				: 'Already have an account? Sign In';
		toggleLink.addEventListener('click', (e) => {
			e.preventDefault();
			this._mode = this._mode === 'login' ? 'register' : 'login';
			this._draw();
		});
		footer.appendChild(toggleLink);

		card.appendChild(logo);
		card.appendChild(title);
		card.appendChild(form);
		card.appendChild(footer);
		page.appendChild(card);
		this._container.appendChild(page);
	}

	async _handleSubmit(e) {
		e.preventDefault();

		const email = document.getElementById('login-email')?.value?.trim();
		const password = document.getElementById('login-password')?.value;
		const errorEl = document.getElementById('login-error');
		const submitBtn = document.getElementById('login-submit');

		if (!email || !password) return;

		submitBtn.disabled = true;
		submitBtn.textContent =
			this._mode === 'login' ? 'Signing in...' : 'Creating account...';
		if (errorEl) errorEl.style.display = 'none';

		try {
			if (this._mode === 'login') {
				await AuthService.login(email, password);
			} else {
				await AuthService.register(email, password);
			}
			window.location.reload();
		} catch (err) {
			if (errorEl) {
				errorEl.textContent = err.message;
				errorEl.style.display = 'flex';
			}
			submitBtn.disabled = false;
			submitBtn.textContent =
				this._mode === 'login' ? 'Sign In' : 'Create Account';
		}
	}
}
