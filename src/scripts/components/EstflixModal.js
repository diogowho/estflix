/**
 * Defines the `<estflix-modal>` custom element.
 *
 * A reusable modal dialog that renders a backdrop, a header with a title and
 * close button, a body slot for arbitrary content, and a footer with Cancel
 * and Confirm buttons. Clicking the backdrop or the close button dismisses the
 * modal. Use {@link EstflixModal#open} to show the dialog and
 * {@link EstflixModal#getBody} to insert custom content into the body.
 */
class EstflixModal extends HTMLElement {
	/**
	 * Creates an instance of EstflixModal and initialises all internal
	 * references to `null` before the DOM is built in `connectedCallback`.
	 */
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

	/**
	 * Invoked when the element is connected to the document.
	 * Builds the full modal DOM subtree — backdrop, header, body, footer —
	 * attaches all internal event listeners, and appends everything to the
	 * host element.
	 *
	 * @returns {void}
	 */
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
		// Close modal when header close button is clicked
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
		// Cancel button click: invoke callback then close modal
		this._cancelBtn.addEventListener('click', () => {
			if (typeof this._onCancel === 'function') this._onCancel();
			this.close();
		});

		this._confirmBtn = document.createElement('button');
		this._confirmBtn.classList.add('btn', 'btn-primary');
		this._confirmBtn.setAttribute('id', 'modal-confirm');
		this._confirmBtn.textContent = 'Confirm';
		// Confirm button click: invoke callback (caller handles closing if needed)
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

		/**
		 * Closes the modal when the user clicks directly on the backdrop
		 * (i.e. outside the modal panel).
		 *
		 * @param {MouseEvent} e - The click event on the backdrop element.
		 */
		this._backdrop.addEventListener('click', (e) => {
			if (e.target === this._backdrop) this.close();
		});
	}

	/**
	 * Opens the modal dialog with the given configuration, clears any previous
	 * body content, and resets the loading state.
	 *
	 * @param {Object} options - Configuration options for the modal.
	 * @param {string} options.title - Text displayed in the modal header.
	 * @param {Function} [options.onConfirm] - Callback invoked when the Confirm button is clicked.
	 * @param {Function} [options.onCancel] - Callback invoked when the Cancel button is clicked.
	 * @param {string} [options.confirmText='Confirm'] - Label for the Confirm button.
	 * @param {string} [options.cancelText='Cancel'] - Label for the Cancel button.
	 * @param {boolean} [options.showCancel=true] - Whether to show the Cancel button.
	 * @returns {void}
	 */
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

	/**
	 * Closes the modal dialog by removing the `open` class from the backdrop.
	 *
	 * @returns {void}
	 */
	close() {
		this._backdrop.classList.remove('open');
	}

	/**
	 * Returns the modal body element so callers can append custom content.
	 *
	 * @returns {HTMLDivElement} The `div.modal__body` element.
	 */
	getBody() {
		return this._bodyEl;
	}

	/**
	 * Enables or disables the loading state of the Confirm button.
	 * When loading, the button is disabled and styled to indicate it is busy.
	 *
	 * @param {boolean} isLoading - `true` to put the button into a loading
	 *   state; `false` to restore normal appearance.
	 * @returns {void}
	 */
	setLoading(isLoading) {
		this._confirmBtn.disabled = isLoading;
		this._confirmBtn.style.opacity = isLoading ? '0.6' : '';
		this._confirmBtn.style.cursor = isLoading ? 'not-allowed' : '';
	}
}

customElements.define('estflix-modal', EstflixModal);
