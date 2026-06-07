(async function () {
	'use strict';

	// Check if user is logged in
	let currentUser = null;
	try {
		currentUser = await AuthService.me();
	} catch {
		// User is not logged in, keep currentUser as null
	}

	const loginRoot = document.getElementById('login-root');
	const profilesRoot = document.getElementById('profiles-root');
	const homeRoot = document.getElementById('home-root');
	const adminRoot = document.getElementById('admin-root');

	/**
	 * Hydrates the `<estflix-navbar>` custom element with the active profile details.
	 * @param {Profile} profile - The currently active profile.
	 * @returns {void}
	 */
	function hydrateNavbar(profile) {
		const navbar = document.querySelector('estflix-navbar');
		if (!navbar || !profile) return;
		navbar.setAttribute('profile-name', profile.name);
		navbar.setAttribute('profile-avatar', profile.avatar);
	}

	// Index page handles login and profile selection
	if (loginRoot && profilesRoot) {
		if (!currentUser) {
			const loginPage = new LoginPage();
			loginPage.render(loginRoot);
			loginRoot.style.display = 'block';
			profilesRoot.style.display = 'none';
		} else {
			loginRoot.style.display = 'none';
			profilesRoot.style.display = 'block';
			const profileService = new ProfileService();
			const page = new ProfilesPage(profileService);
			page.render(profilesRoot);
		}
		return;
	}

	// Other pages need authentication to access
	if (!currentUser) {
		window.location.href = '/';
		return;
	}

	const contentService = new ContentService();
	const categoryService = new CategoryService();
	const profileService = new ProfileService();

	document.addEventListener('profile-switch', () => {
		StorageService.remove('estflix_active_profile');
		window.location.href = '/';
	});

	if (homeRoot) {
		const activeProfile = await profileService.getActive();
		if (!activeProfile) {
			window.location.href = '/';
			return;
		}
		hydrateNavbar(activeProfile);
		const page = new HomePage(
			contentService,
			categoryService,
			profileService,
		);
		page.render(homeRoot, activeProfile);
		return;
	}

	if (adminRoot) {
		const activeProfile = await profileService.getActive();
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
