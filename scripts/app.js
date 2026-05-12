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

	const loginRoot = document.getElementById('login-root');
	const profilesRoot = document.getElementById('profiles-root');
	const homeRoot = document.getElementById('home-root');
	const adminRoot = document.getElementById('admin-root');

	const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

	if (loginRoot && profilesRoot) {
		if (!isLoggedIn) {
			const loginPage = new LoginPage();
			loginPage.render(loginRoot);
			loginRoot.style.display = 'block';
			profilesRoot.style.display = 'none';
		} else {
			loginRoot.style.display = 'none';
			profilesRoot.style.display = 'block';
			const page = new ProfilesPage(profileService);
			page.render(profilesRoot);
		}
		return;
	}

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
