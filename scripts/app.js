(function () {
	'use strict';

	const contentService = new ContentService();
	const categoryService = new CategoryService();
	const profileService = new ProfileService();

	MockData.seed();

	function hydrateNavbar(profile) {
		const navbar = document.querySelector('estflix-navbar');
		if (!navbar || !profile) return;
		navbar.setAttribute('profile-name', profile.name);
		navbar.setAttribute('profile-avatar', profile.avatar);
	}

	const profilesRoot = document.getElementById('profiles-root');
	const homeRoot = document.getElementById('home-root');
	const adminRoot = document.getElementById('admin-root');

	if (profilesRoot) {
		const page = new ProfilesPage(profileService);
		page.render(profilesRoot);
		return;
	}

	document.addEventListener('profile-switch', () => {
		window.location.href = 'index.html';
	});

	if (homeRoot) {
		const activeProfile = profileService.getActive();
		if (!activeProfile) {
			window.location.href = 'index.html';
			return;
		}
		hydrateNavbar(activeProfile);
		const page = new HomePage(
			contentService,
			categoryService,
			profileService,
		);
		page.render(homeRoot);
		return;
	}

	if (adminRoot) {
		const activeProfile = profileService.getActive();
		hydrateNavbar(activeProfile);
		const page = new AdminPage(
			contentService,
			categoryService,
			profileService,
		);
		page.render(adminRoot);
		return;
	}
})();
