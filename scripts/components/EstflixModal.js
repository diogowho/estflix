class EstflixModal extends HTMLElement {
	constructor() {
		super();
		this._onConfirm = null;
		this._onCancel = null;
		this._backdrop = null;
		this._modalEl = null;
		this._titleEl = null;
		this._bodyEl = null;
		this._confirmBtn = null;
		this._cancelBtn = null;
	}

	connectedCallback() {
		this._backdrop = document.createElement('div');
		this._backdrop.classList.add('modal-backdrop');

		this._modalEl = document.createElement('div');
		this._modalEl.classList.add('modal');

		const header = document.createElement('div');
		header.classList.add('modal__header');

		this._titleEl = document.createElement('span');
		this._titleEl.classList.add('modal__title');

		const closeBtn = document.createElement('button');
		closeBtn.classList.add('modal__close');
		closeBtn.setAttribute('aria-label', 'Close');
		closeBtn.textContent = '×';
		closeBtn.addEventListener('click', () => this.close());

		header.appendChild(this._titleEl);
		header.appendChild(closeBtn);

		this._bodyEl = document.createElement('div');
		this._bodyEl.classList.add('modal__body');

		const footer = document.createElement('div');
		footer.classList.add('modal__footer');

		this._cancelBtn = document.createElement('button');
		this._cancelBtn.classList.add('btn', 'btn-ghost');
		this._cancelBtn.setAttribute('id', 'modal-cancel');
		this._cancelBtn.textContent = 'Cancel';
		this._cancelBtn.addEventListener('click', () => {
			if (typeof this._onCancel === 'function') this._onCancel();
			this.close();
		});

		this._confirmBtn = document.createElement('button');
		this._confirmBtn.classList.add('btn', 'btn-primary');
		this._confirmBtn.setAttribute('id', 'modal-confirm');
		this._confirmBtn.textContent = 'Confirm';
		this._confirmBtn.addEventListener('click', () => {
			if (typeof this._onConfirm === 'function') this._onConfirm();
		});

		footer.appendChild(this._cancelBtn);
		footer.appendChild(this._confirmBtn);

		this._modalEl.appendChild(header);
		this._modalEl.appendChild(this._bodyEl);
		this._modalEl.appendChild(footer);

		this._backdrop.appendChild(this._modalEl);
		this.appendChild(this._backdrop);

		this._backdrop.addEventListener('click', (e) => {
			if (e.target === this._backdrop) this.close();
		});
	}

	open({
		title,
		onConfirm,
		onCancel,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		showCancel = true,
	}) {
		this._onConfirm = onConfirm ?? null;
		this._onCancel = onCancel ?? null;

		this._titleEl.textContent = title ?? '';
		this._confirmBtn.textContent = confirmText;
		this._cancelBtn.textContent = cancelText;
		this._cancelBtn.style.display = showCancel ? '' : 'none';

		while (this._bodyEl.firstChild) {
			this._bodyEl.removeChild(this._bodyEl.firstChild);
		}

		this.setLoading(false);
		this._backdrop.classList.add('open');
	}

	close() {
		this._backdrop.classList.remove('open');
	}

	getBody() {
		return this._bodyEl;
	}

	setLoading(isLoading) {
		this._confirmBtn.disabled = isLoading;
		this._confirmBtn.style.opacity = isLoading ? '0.6' : '';
		this._confirmBtn.style.cursor = isLoading ? 'not-allowed' : '';
	}
}

customElements.define('estflix-modal', EstflixModal);
