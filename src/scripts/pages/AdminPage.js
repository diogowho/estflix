class AdminPage {
	constructor(contentService, categoryService, profileService) {
		this._contentService = contentService;
		this._categoryService = categoryService;
		this._profileService = profileService;
		this._container = null;
		this._modal = null;
		this._activeTab = 'contents';
		this._contentFilter = '';
		this._contentsCurrentPage = 1;
		this._contentsItemsPerPage = 10;
	}

	render(container) {
		this._container = container;
		this._modal = document.querySelector('estflix-modal');
		this._draw();
	}

	_draw() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		const wrapper = document.createElement('div');
		wrapper.classList.add('admin-layout');

		wrapper.appendChild(this._buildTabs());

		const panelsWrapper = document.createElement('div');
		panelsWrapper.classList.add('admin-panels');
		panelsWrapper.appendChild(this._buildContentPanel());
		panelsWrapper.appendChild(this._buildCategoryPanel());
		panelsWrapper.appendChild(this._buildProfilePanel());

		wrapper.appendChild(panelsWrapper);
		this._container.appendChild(wrapper);

		this._switchTab(this._activeTab);
	}

	_buildTabs() {
		const tabBar = document.createElement('div');
		tabBar.classList.add('admin-tabs');

		const tabs = [
			{ id: 'contents', label: 'Contents' },
			{ id: 'categories', label: 'Categories' },
			{ id: 'profiles', label: 'Profiles' },
		];

		tabs.forEach(({ id, label }) => {
			const btn = document.createElement('button');
			btn.classList.add('admin-tab');
			btn.setAttribute('data-tab', id);
			btn.textContent = label;
			btn.addEventListener('click', () => this._switchTab(id));
			tabBar.appendChild(btn);
		});

		return tabBar;
	}

	_switchTab(tabName) {
		this._activeTab = tabName;

		this._container.querySelectorAll('.admin-tab').forEach((tab) => {
			tab.classList.toggle(
				'active',
				tab.getAttribute('data-tab') === tabName,
			);
		});

		this._container.querySelectorAll('.admin-panel').forEach((panel) => {
			panel.style.display =
				panel.getAttribute('data-panel') === tabName ? 'block' : 'none';
		});
	}

	_buildContentPanel() {
		const panel = document.createElement('div');
		panel.classList.add('admin-panel');
		panel.setAttribute('data-panel', 'contents');

		const panelHeader = document.createElement('div');
		panelHeader.classList.add('panel-header');

		const addBtn = document.createElement('button');
		addBtn.classList.add('btn', 'btn-primary');
		addBtn.textContent = 'Add Content';
		addBtn.addEventListener('click', () => this._showAddContentModal());

		const searchInput = document.createElement('input');
		searchInput.classList.add('form-control');
		searchInput.style.cssText = 'max-width:280px;padding:8px 16px;';
		searchInput.setAttribute('type', 'text');
		searchInput.setAttribute('placeholder', 'Search contents...');
		searchInput.value = this._contentFilter;
		searchInput.addEventListener('input', (e) => {
			this._contentFilter = e.target.value;
			this._contentsCurrentPage = 1;
			this._refreshContentsTable();
		});

		panelHeader.appendChild(addBtn);
		panelHeader.appendChild(searchInput);

		const content = document.createElement('div');
		content.classList.add('admin-content');
		content.setAttribute('id', 'contents-table-wrapper');

		panel.appendChild(panelHeader);
		panel.appendChild(content);

		this._buildContentsTable(content);
		return panel;
	}

	_buildCategoryPanel() {
		const panel = document.createElement('div');
		panel.classList.add('admin-panel');
		panel.setAttribute('data-panel', 'categories');

		const panelHeader = document.createElement('div');
		panelHeader.classList.add('panel-header');

		const addBtn = document.createElement('button');
		addBtn.classList.add('btn', 'btn-primary');
		addBtn.textContent = 'Add Category';
		addBtn.addEventListener('click', () => this._showAddCategoryModal());

		panelHeader.appendChild(addBtn);

		const content = document.createElement('div');
		content.classList.add('admin-content');
		content.setAttribute('id', 'categories-table-wrapper');

		panel.appendChild(panelHeader);
		panel.appendChild(content);

		this._buildCategoriesTable(content);
		return panel;
	}

	_buildProfilePanel() {
		const panel = document.createElement('div');
		panel.classList.add('admin-panel');
		panel.setAttribute('data-panel', 'profiles');

		const panelHeader = document.createElement('div');
		panelHeader.classList.add('panel-header');

		const addBtn = document.createElement('button');
		addBtn.classList.add('btn', 'btn-primary');
		addBtn.textContent = 'Add Profile';
		addBtn.addEventListener('click', () => this._showAddProfileModal());

		panelHeader.appendChild(addBtn);

		const content = document.createElement('div');
		content.classList.add('admin-content');
		content.setAttribute('id', 'profiles-table-wrapper');

		panel.appendChild(panelHeader);
		panel.appendChild(content);

		this._buildProfilesTable(content);
		return panel;
	}

	async _buildContentsTable(target) {
		while (target.firstChild) {
			target.removeChild(target.firstChild);
		}

		const contents = await this._contentService.getAll();
		const categories = await this._categoryService.getAll();

		const categoryMap = {};
		categories.forEach((c) => {
			categoryMap[c.id] = c;
		});

		const filter = this._contentFilter.toLowerCase().trim();
		const filtered = filter
			? contents.filter((c) => c.title.toLowerCase().includes(filter))
			: contents;

		if (filtered.length === 0) {
			target.appendChild(
				this._buildEmptyState(
					'🎬',
					filter
						? 'No contents match your search.'
						: 'No contents yet. Add your first one!',
				),
			);
			return;
		}

		const totalPages = Math.ceil(
			filtered.length / this._contentsItemsPerPage,
		);
		if (this._contentsCurrentPage > totalPages) {
			this._contentsCurrentPage = totalPages || 1;
		}

		const startIndex =
			(this._contentsCurrentPage - 1) * this._contentsItemsPerPage;
		const endIndex = startIndex + this._contentsItemsPerPage;
		const pageData = filtered.slice(startIndex, endIndex);

		const table = document.createElement('table');
		table.classList.add('data-table');

		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		['Thumbnail', 'Title', 'Category', 'Year', 'Rating', 'Actions'].forEach(
			(text) => {
				const th = document.createElement('th');
				th.textContent = text;
				headerRow.appendChild(th);
			},
		);
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement('tbody');

		pageData.forEach((content) => {
			const category = categoryMap[content.categoryId] ?? null;
			const tr = document.createElement('tr');

			const tdThumb = document.createElement('td');
			const img = document.createElement('img');
			img.classList.add('table-thumbnail');
			img.setAttribute('src', content.imageUrl || '');
			img.setAttribute('alt', content.title);
			tdThumb.appendChild(img);

			const tdTitle = document.createElement('td');
			const titleSpan = document.createElement('span');
			titleSpan.classList.add('content-title');
			titleSpan.textContent = content.title;
			tdTitle.appendChild(titleSpan);

			const tdCategory = document.createElement('td');
			const catPill = document.createElement('span');
			catPill.classList.add('category-pill');
			catPill.textContent = category ? category.name : 'Unknown';
			if (category?.color) {
				catPill.style.backgroundColor = category.color;
				// Choose white or black text based on background brightness
				const bgColor = category.color;
				const luminance = this._getLuminance(bgColor);
				catPill.style.color = luminance > 0.5 ? '#000' : '#fff';
			}
			tdCategory.appendChild(catPill);

			const tdYear = document.createElement('td');
			tdYear.textContent = content.year ?? '';

			const tdRating = document.createElement('td');
			const ratingBadge = document.createElement('span');
			ratingBadge.classList.add('rating-badge');
			ratingBadge.textContent = '\u2605 ' + (content.rating ?? 0);
			tdRating.appendChild(ratingBadge);

			const tdActions = document.createElement('td');
			tdActions.classList.add('actions');

			const editBtn = document.createElement('button');
			editBtn.classList.add('btn', 'btn-ghost', 'btn-sm');
			editBtn.textContent = 'Edit';
			editBtn.addEventListener('click', () =>
				this._showEditContentModal(content),
			);

			const deleteBtn = document.createElement('button');
			deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
			deleteBtn.textContent = 'Delete';
			deleteBtn.addEventListener('click', () =>
				this._showDeleteContentModal(content),
			);

			tdActions.appendChild(editBtn);
			tdActions.appendChild(deleteBtn);

			tr.appendChild(tdThumb);
			tr.appendChild(tdTitle);
			tr.appendChild(tdCategory);
			tr.appendChild(tdYear);
			tr.appendChild(tdRating);
			tr.appendChild(tdActions);
			tbody.appendChild(tr);
		});

		table.appendChild(tbody);
		target.appendChild(table);

		if (totalPages > 1) {
			target.appendChild(this._buildPaginationUI(totalPages));
		}
	}

	_buildPaginationUI(totalPages) {
		const wrap = document.createElement('div');
		wrap.style.cssText =
			'display:flex; justify-content:space-between; align-items:center; padding: 1.5rem 0 0.5rem; margin-top: 1rem; border-top: 1px solid var(--border);';

		const info = document.createElement('div');
		info.style.cssText =
			'font-size: 0.85rem; color: var(--text-2); font-weight: 600;';
		info.textContent = `Page ${this._contentsCurrentPage} of ${totalPages}`;

		const controls = document.createElement('div');
		controls.style.cssText = 'display:flex; gap: 0.5rem;';

		const prevBtn = document.createElement('button');
		prevBtn.classList.add('btn', 'btn-ghost', 'btn-sm');
		prevBtn.textContent = 'Previous';
		prevBtn.disabled = this._contentsCurrentPage === 1;
		if (this._contentsCurrentPage === 1) prevBtn.style.opacity = '0.5';
		prevBtn.addEventListener('click', () => {
			if (this._contentsCurrentPage > 1) {
				this._contentsCurrentPage--;
				this._refreshContentsTable();
			}
		});

		const nextBtn = document.createElement('button');
		nextBtn.classList.add('btn', 'btn-ghost', 'btn-sm');
		nextBtn.textContent = 'Next';
		nextBtn.disabled = this._contentsCurrentPage === totalPages;
		if (this._contentsCurrentPage === totalPages)
			nextBtn.style.opacity = '0.5';
		nextBtn.addEventListener('click', () => {
			if (this._contentsCurrentPage < totalPages) {
				this._contentsCurrentPage++;
				this._refreshContentsTable();
			}
		});

		controls.appendChild(prevBtn);
		controls.appendChild(nextBtn);

		wrap.appendChild(info);
		wrap.appendChild(controls);

		return wrap;
	}

	async _refreshContentsTable() {
		const wrapper = document.getElementById('contents-table-wrapper');
		if (wrapper) await this._buildContentsTable(wrapper);
	}

	async _showAddContentModal() {
		this._modal.open({
			title: 'ADD CONTENT',
			confirmText: 'Add',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				const data = this._extractContentFormData();
				if (!data) return;
				this._modal.setLoading(true);
				try {
					await this._contentService.create(data);
					this._modal.close();
					EstflixToast.show('Content added successfully!', 'success');
					await this._refreshContentsTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		await this._appendContentForm(this._modal.getBody(), null);
	}

	async _showEditContentModal(content) {
		this._modal.open({
			title: 'EDIT CONTENT',
			confirmText: 'Save',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				const data = this._extractContentFormData();
				if (!data) return;
				this._modal.setLoading(true);
				try {
					await this._contentService.update(content.id, data);
					this._modal.close();
					EstflixToast.show(
						'Content updated successfully!',
						'success',
					);
					await this._refreshContentsTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		await this._appendContentForm(this._modal.getBody(), content);
	}

	async _appendContentForm(body, content) {
		const categories = await this._categoryService.getAll();

		const titleInput = document.createElement('input');
		titleInput.setAttribute('type', 'text');
		titleInput.setAttribute('id', 'form-content-title');
		titleInput.setAttribute('required', 'true');
		titleInput.classList.add('form-control');
		if (content) titleInput.value = content.title;

		const descTextarea = document.createElement('textarea');
		descTextarea.setAttribute('id', 'form-content-description');
		descTextarea.setAttribute('required', 'true');
		descTextarea.classList.add('form-control');
		if (content) descTextarea.textContent = content.description;

		const categorySelect = document.createElement('select');
		categorySelect.setAttribute('id', 'form-content-category');
		categorySelect.setAttribute('required', 'true');
		categorySelect.classList.add('form-control');

		const defaultOption = document.createElement('option');
		defaultOption.setAttribute('value', '');
		defaultOption.textContent = '— Select a category —';
		defaultOption.setAttribute('disabled', 'true');
		if (!content) defaultOption.setAttribute('selected', 'true');
		categorySelect.appendChild(defaultOption);

		categories.forEach((cat) => {
			const option = document.createElement('option');
			option.setAttribute('value', cat.id);
			option.textContent = cat.name;
			if (content && content.categoryId == cat.id) {
				option.setAttribute('selected', 'true');
			}
			categorySelect.appendChild(option);
		});

		const yearInput = document.createElement('input');
		yearInput.setAttribute('type', 'number');
		yearInput.setAttribute('id', 'form-content-year');
		yearInput.setAttribute('min', '1900');
		yearInput.setAttribute('max', '2030');
		yearInput.classList.add('form-control');
		if (content) yearInput.value = content.year;

		const ratingInput = document.createElement('input');
		ratingInput.setAttribute('type', 'number');
		ratingInput.setAttribute('id', 'form-content-rating');
		ratingInput.setAttribute('min', '0');
		ratingInput.setAttribute('max', '5');
		ratingInput.setAttribute('step', '0.1');
		ratingInput.classList.add('form-control');
		if (content) ratingInput.value = content.rating;

		const imageInput = document.createElement('input');
		imageInput.setAttribute('type', 'text');
		imageInput.setAttribute('id', 'form-content-image');
		imageInput.setAttribute(
			'placeholder',
			'https://picsum.photos/seed/SEED/300/450',
		);
		imageInput.classList.add('form-control');
		if (content) imageInput.value = content.imageUrl;

		body.appendChild(this._buildFormGroup('Title', titleInput));
		body.appendChild(this._buildFormGroup('Description', descTextarea));
		body.appendChild(this._buildFormGroup('Category', categorySelect));
		body.appendChild(this._buildFormGroup('Year', yearInput));
		body.appendChild(this._buildFormGroup('Rating', ratingInput));
		body.appendChild(this._buildFormGroup('Image URL', imageInput));
	}

	_extractContentFormData() {
		const title = document
			.getElementById('form-content-title')
			.value.trim();
		const description = document
			.getElementById('form-content-description')
			.value.trim();
		const categoryId = document.getElementById(
			'form-content-category',
		).value;
		const yearRaw = document.getElementById('form-content-year').value;
		const ratingRaw = document.getElementById('form-content-rating').value;
		const imageUrl = document
			.getElementById('form-content-image')
			.value.trim();

		if (!title || !description || !categoryId) {
			EstflixToast.show('Please fill in all required fields.', 'error');
			return null;
		}

		return {
			title,
			description,
			categoryId,
			year: yearRaw ? parseInt(yearRaw, 10) : null,
			rating: ratingRaw ? parseFloat(ratingRaw) : null,
			imageUrl,
		};
	}

	_showDeleteContentModal(content) {
		this._modal.open({
			title: 'DELETE CONTENT',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				this._modal.setLoading(true);
				try {
					await this._contentService.delete(content.id);
					this._modal.close();
					EstflixToast.show(
						'Content deleted successfully!',
						'success',
					);
					await this._refreshContentsTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		const body = this._modal.getBody();
		const msg = document.createElement('p');
		msg.classList.add('modal-confirm-message');

		const intro = document.createTextNode(
			'Are you sure you want to delete ',
		);
		const strong = document.createElement('strong');
		strong.textContent = content.title;
		const outro = document.createTextNode(
			'? This action cannot be undone.',
		);

		msg.appendChild(intro);
		msg.appendChild(strong);
		msg.appendChild(outro);
		body.appendChild(msg);
	}

	async _buildCategoriesTable(target) {
		while (target.firstChild) {
			target.removeChild(target.firstChild);
		}

		const categories = await this._categoryService.getAll();

		if (categories.length === 0) {
			target.appendChild(
				this._buildEmptyState(
					'🗂️',
					'No categories yet. Add your first one!',
				),
			);
			return;
		}

		const contents = await this._contentService.getAll();
		const contentCountMap = {};
		contents.forEach((c) => {
			contentCountMap[c.categoryId] =
				(contentCountMap[c.categoryId] ?? 0) + 1;
		});

		const table = document.createElement('table');
		table.classList.add('data-table');

		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		['Name', 'Color', 'Content Count', 'Actions'].forEach((text) => {
			const th = document.createElement('th');
			th.textContent = text;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement('tbody');

		categories.forEach((category) => {
			const tr = document.createElement('tr');

			const tdName = document.createElement('td');
			tdName.classList.add('category-name-cell');

			const swatch = document.createElement('span');
			swatch.classList.add('color-swatch');
			swatch.style.display = 'inline-block';
			swatch.style.width = '20px';
			swatch.style.height = '20px';
			swatch.style.borderRadius = '50%';
			swatch.style.backgroundColor = category.color ?? '#7b2ff7';
			swatch.style.marginRight = '10px';
			swatch.style.verticalAlign = 'middle';
			swatch.style.flexShrink = '0';

			const nameSpan = document.createElement('span');
			nameSpan.textContent = category.name;

			tdName.appendChild(swatch);
			tdName.appendChild(nameSpan);

			const tdColor = document.createElement('td');
			const colorCode = document.createElement('code');
			colorCode.classList.add('color-code');
			colorCode.textContent = category.color ?? '#7b2ff7';
			tdColor.appendChild(colorCode);

			const tdCount = document.createElement('td');
			tdCount.textContent = contentCountMap[category.id] ?? 0;

			const tdActions = document.createElement('td');
			tdActions.classList.add('actions');

			const editBtn = document.createElement('button');
			editBtn.classList.add('btn', 'btn-ghost', 'btn-sm');
			editBtn.textContent = 'Edit';
			editBtn.addEventListener('click', () =>
				this._showEditCategoryModal(category),
			);

			const deleteBtn = document.createElement('button');
			deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
			deleteBtn.textContent = 'Delete';
			deleteBtn.addEventListener('click', () =>
				this._confirmDeleteCategory(category),
			);

			tdActions.appendChild(editBtn);
			tdActions.appendChild(deleteBtn);

			tr.appendChild(tdName);
			tr.appendChild(tdColor);
			tr.appendChild(tdCount);
			tr.appendChild(tdActions);
			tbody.appendChild(tr);
		});

		table.appendChild(tbody);
		target.appendChild(table);
	}

	async _refreshCategoriesTable() {
		const wrapper = document.getElementById('categories-table-wrapper');
		if (wrapper) await this._buildCategoriesTable(wrapper);
	}

	_showAddCategoryModal() {
		this._modal.open({
			title: 'ADD CATEGORY',
			confirmText: 'Add',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				const data = this._extractCategoryFormData();
				if (!data) return;
				this._modal.setLoading(true);
				try {
					await this._categoryService.create(data);
					this._modal.close();
					EstflixToast.show(
						'Category added successfully!',
						'success',
					);
					await this._refreshCategoriesTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		this._appendCategoryForm(this._modal.getBody(), null);
	}

	_showEditCategoryModal(category) {
		this._modal.open({
			title: 'EDIT CATEGORY',
			confirmText: 'Save',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				const data = this._extractCategoryFormData();
				if (!data) return;
				this._modal.setLoading(true);
				try {
					await this._categoryService.update(category.id, data);
					this._modal.close();
					EstflixToast.show(
						'Category updated successfully!',
						'success',
					);
					await this._refreshCategoriesTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		this._appendCategoryForm(this._modal.getBody(), category);
	}

	_appendCategoryForm(body, category) {
		const nameInput = document.createElement('input');
		nameInput.setAttribute('type', 'text');
		nameInput.setAttribute('id', 'form-category-name');
		nameInput.setAttribute('required', 'true');
		nameInput.classList.add('form-control');
		if (category) nameInput.value = category.name;

		const initialColor = category?.color ?? '#7b2ff7';

		const colorInput = document.createElement('input');
		colorInput.setAttribute('type', 'color');
		colorInput.setAttribute('id', 'form-category-color');
		colorInput.classList.add('form-control');
		colorInput.value = initialColor;

		// Update hex label live as color changes
		const hexLabel = document.createElement('code');
		hexLabel.classList.add('color-code');
		hexLabel.style.cssText =
			'display:inline-block;margin-top:6px;font-size:0.85rem;';
		hexLabel.textContent = initialColor;
		colorInput.addEventListener('input', () => {
			hexLabel.textContent = colorInput.value;
		});

		const colorGroup = document.createElement('div');
		colorGroup.classList.add('form-group');
		const colorLabel = document.createElement('label');
		colorLabel.classList.add('form-label');
		colorLabel.textContent = 'Color';
		colorGroup.appendChild(colorLabel);
		colorGroup.appendChild(colorInput);
		colorGroup.appendChild(hexLabel);

		body.appendChild(this._buildFormGroup('Name', nameInput));
		body.appendChild(colorGroup);
	}

	_extractCategoryFormData() {
		const name = document.getElementById('form-category-name').value.trim();
		const color = document.getElementById('form-category-color').value;

		if (!name) {
			EstflixToast.show('Please enter a category name.', 'error');
			return null;
		}

		return { name, color };
	}

	_confirmDeleteCategory(category) {
		this._modal.open({
			title: 'DELETE CATEGORY',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				this._modal.setLoading(true);
				try {
					await this._categoryService.delete(category.id);
					this._modal.close();
					EstflixToast.show(
						'Category deleted successfully!',
						'success',
					);
					await this._refreshCategoriesTable();
				} catch (e) {
					this._modal.setLoading(false);
					EstflixToast.show(e.message, 'error');
				}
			},
			onCancel: () => this._modal.close(),
		});

		const body = this._modal.getBody();
		const msg = document.createElement('p');
		msg.classList.add('modal-confirm-message');

		const intro = document.createTextNode(
			'Are you sure you want to delete the category ',
		);
		const strong = document.createElement('strong');
		strong.textContent = category.name;
		const outro = document.createTextNode(
			'? This action cannot be undone.',
		);

		msg.appendChild(intro);
		msg.appendChild(strong);
		msg.appendChild(outro);
		body.appendChild(msg);
	}

	async _buildProfilesTable(target) {
		while (target.firstChild) {
			target.removeChild(target.firstChild);
		}

		const profiles = await this._profileService.getAll();

		if (profiles.length === 0) {
			target.appendChild(
				this._buildEmptyState(
					'👤',
					'No profiles yet. Add your first one!',
				),
			);
			return;
		}

		const table = document.createElement('table');
		table.classList.add('data-table');

		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		['Avatar', 'Name', 'Favorites', 'History', 'Actions'].forEach(
			(text) => {
				const th = document.createElement('th');
				th.textContent = text;
				headerRow.appendChild(th);
			},
		);
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement('tbody');

		profiles.forEach((profile) => {
			const tr = document.createElement('tr');

			const tdAvatar = document.createElement('td');
			const avatarSpan = document.createElement('span');
			avatarSpan.classList.add('profile-avatar');
			avatarSpan.textContent = profile.avatar ?? '👤';
			tdAvatar.appendChild(avatarSpan);

			const tdName = document.createElement('td');
			tdName.textContent = profile.name;

			const tdFavorites = document.createElement('td');
			tdFavorites.textContent = profile.favorites?.length ?? 0;

			const tdHistory = document.createElement('td');
			tdHistory.textContent = profile.history?.length ?? 0;

			const tdActions = document.createElement('td');
			tdActions.classList.add('actions');

			const deleteBtn = document.createElement('button');
			deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
			deleteBtn.textContent = 'Delete';
			deleteBtn.addEventListener('click', () =>
				this._confirmDeleteProfile(profile),
			);
			tdActions.appendChild(deleteBtn);

			tr.appendChild(tdAvatar);
			tr.appendChild(tdName);
			tr.appendChild(tdFavorites);
			tr.appendChild(tdHistory);
			tr.appendChild(tdActions);
			tbody.appendChild(tr);
		});

		table.appendChild(tbody);
		target.appendChild(table);
	}

	async _refreshProfilesTable() {
		const wrapper = document.getElementById('profiles-table-wrapper');
		if (wrapper) await this._buildProfilesTable(wrapper);
	}

	_showAddProfileModal() {
		this._modal.open({
			title: 'ADD PROFILE',
			confirmText: 'Add',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				const name = document
					.getElementById('form-profile-name')
					.value.trim();
				if (!name) {
					EstflixToast.show('Please enter a profile name.', 'error');
					return;
				}
				this._modal.setLoading(true);
				try {
					await this._profileService.create({ name });
					this._modal.close();
					EstflixToast.show(
						'Profile created successfully!',
						'success',
					);
					await this._refreshProfilesTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		const body = this._modal.getBody();
		const nameInput = document.createElement('input');
		nameInput.setAttribute('type', 'text');
		nameInput.setAttribute('id', 'form-profile-name');
		nameInput.setAttribute('required', 'true');
		nameInput.classList.add('form-control');
		body.appendChild(this._buildFormGroup('Name', nameInput));
	}

	_confirmDeleteProfile(profile) {
		this._modal.open({
			title: 'DELETE PROFILE',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			showCancel: true,
			onConfirm: async () => {
				this._modal.setLoading(true);
				try {
					await this._profileService.delete(profile.id);
					this._modal.close();
					EstflixToast.show(
						'Profile deleted successfully!',
						'success',
					);
					await this._refreshProfilesTable();
				} catch (e) {
					EstflixToast.show(e.message, 'error');
					this._modal.setLoading(false);
				}
			},
			onCancel: () => this._modal.close(),
		});

		const body = this._modal.getBody();
		const msg = document.createElement('p');
		msg.classList.add('modal-confirm-message');

		const intro = document.createTextNode(
			'Are you sure you want to delete the profile ',
		);
		const strong = document.createElement('strong');
		strong.textContent = profile.name;
		const outro = document.createTextNode(
			'? This action cannot be undone.',
		);

		msg.appendChild(intro);
		msg.appendChild(strong);
		msg.appendChild(outro);
		body.appendChild(msg);
	}

	_buildEmptyState(icon, message) {
		const empty = document.createElement('div');
		empty.classList.add('empty-state');

		const iconEl = document.createElement('span');
		iconEl.classList.add('empty-state__icon');
		iconEl.textContent = icon;

		const msgEl = document.createElement('p');
		msgEl.classList.add('empty-state__text');
		msgEl.textContent = message;

		empty.appendChild(iconEl);
		empty.appendChild(msgEl);
		return empty;
	}

	_buildFormGroup(labelText, input) {
		const group = document.createElement('div');
		group.classList.add('form-group');

		const label = document.createElement('label');
		label.classList.add('form-label');
		label.textContent = labelText;
		if (input.id) label.setAttribute('for', input.id);

		group.appendChild(label);
		group.appendChild(input);
		return group;
	}

	// Calculate how light or dark a color is (0 = darkest, 1 = lightest)
	_getLuminance(hexColor) {
		// First convert hex color to RGB
		const r = parseInt(hexColor.slice(1, 3), 16) / 255;
		const g = parseInt(hexColor.slice(3, 5), 16) / 255;
		const b = parseInt(hexColor.slice(5, 7), 16) / 255;

		// Apply gamma correction to each channel
		const a = [r, g, b].map((v) => {
			return v <= 0.03928
				? v / 12.92
				: Math.pow((v + 0.055) / 1.055, 2.4);
		});

		return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
	}
}
