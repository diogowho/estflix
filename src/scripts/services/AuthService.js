/**
 * Service for authentication-related API calls.
 * Handles login, registration, logout, and current-user retrieval.
 */
class AuthService {
	/**
	 * Fetches the currently authenticated user from the active session.
	 *
	 * @returns {Promise<Object>} The authenticated user object.
	 * @throws {Error} When the request fails or no active session exists.
	 */
	static async me() {
		const data = await ApiService.get('/api/auth/me');
		return data.user;
	}

	/**
	 * Authenticates a user with email and password.
	 *
	 * @param {string} email - The user's email address.
	 * @param {string} password - The user's password.
	 * @returns {Promise<Object>} The authenticated user object.
	 * @throws {Error} When credentials are invalid or the request fails.
	 */
	static async login(email, password) {
		const data = await ApiService.post('/api/auth/login', {
			email,
			password,
		});
		return data.user;
	}

	/**
	 * Registers a new user account with email and password.
	 *
	 * @param {string} email - The desired email address for the new account.
	 * @param {string} password - The desired password for the new account.
	 * @returns {Promise<Object>} The newly created user object.
	 * @throws {Error} When the email is already in use or the request fails.
	 */
	static async register(email, password) {
		const data = await ApiService.post('/api/auth/register', {
			email,
			password,
		});
		return data.user;
	}

	/**
	 * Logs out the currently authenticated user and destroys the session.
	 *
	 * @returns {Promise<Object|string>} The server response confirming logout.
	 * @throws {Error} When the request fails.
	 */
	static async logout() {
		return ApiService.get('/api/auth/logout');
	}
}
