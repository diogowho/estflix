class EstflixToast extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.classList.add('toast-container');
	}

	static show(message, type = 'info', duration = 4000) {
		let container = document.querySelector('estflix-toast');
		if (!container) {
			container = document.createElement('estflix-toast');
			document.body.appendChild(container);
		}

		const icons = { success: '✓', error: '✕', info: 'ℹ' };

		const toast = document.createElement('div');
		toast.classList.add('toast', type);

		const icon = document.createElement('span');
		icon.classList.add('toast__icon');
		icon.textContent = icons[type] ?? icons.info;

		const msg = document.createElement('span');
		msg.classList.add('toast__message');
		msg.textContent = message;

		const closeBtn = document.createElement('button');
		closeBtn.classList.add('toast__close');
		closeBtn.setAttribute('aria-label', 'Close');
		closeBtn.textContent = '×';
		closeBtn.addEventListener('click', () => EstflixToast.dismiss(toast));

		toast.appendChild(icon);
		toast.appendChild(msg);
		toast.appendChild(closeBtn);
		container.appendChild(toast);

		if (duration > 0) {
			setTimeout(() => EstflixToast.dismiss(toast), duration);
		}

		return toast;
	}

	static dismiss(toast) {
		toast.style.opacity = '0';
		toast.style.transform = 'translateX(120%)';
		toast.style.transition = 'all 0.3s ease';
		setTimeout(() => toast.remove(), 300);
	}
}

customElements.define('estflix-toast', EstflixToast);
