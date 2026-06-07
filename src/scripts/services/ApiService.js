/**
 * Low-level HTTP client built on XMLHttpRequest.
 * All methods return Promises so callers can use async/await.
 */
class ApiService {
	/**
	 * Core AJAX wrapper using XMLHttpRequest.
	 * Resolves with the parsed JSON body on success, or with the raw response
	 * text when the body is not valid JSON.
	 *
	 * @param {string} method - HTTP method (e.g. 'GET', 'POST', 'PUT', 'DELETE').
	 * @param {string} url - The URL to request.
	 * @param {Object|null} [body=null] - Optional request body; will be JSON-serialised.
	 * @returns {Promise<Object|string>} Parsed JSON response, or raw response text if JSON parsing fails.
	 * @throws {Error} When the server returns a non-2xx status, a network error occurs, or the request times out.
	 */
	static request(method, url, body = null) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open(method, url, true); // Use async mode
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.withCredentials = true; // Include cookies for session

			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						resolve(JSON.parse(xhr.responseText));
					} catch {
						resolve(xhr.responseText);
					}
				} else {
					let message;
					try {
						const data = JSON.parse(xhr.responseText);
						message = data.message || `HTTP ${xhr.status}`;
					} catch {
						message = `HTTP ${xhr.status}`;
					}
					reject(new Error(message));
				}
			};

			xhr.onerror = function () {
				reject(new Error('Network error — could not reach the server'));
			};

			xhr.ontimeout = function () {
				reject(new Error('Request timed out'));
			};

			if (body !== null) {
				xhr.send(JSON.stringify(body));
			} else {
				xhr.send();
			}
		});
	}

	/**
	 * Sends an HTTP GET request.
	 *
	 * @param {string} url - The URL to request.
	 * @returns {Promise<Object|string>} Parsed JSON response, or raw response text.
	 * @throws {Error} When the request fails or returns a non-2xx status.
	 */
	static get(url) {
		return ApiService.request('GET', url);
	}

	/**
	 * Sends an HTTP POST request with a JSON body.
	 *
	 * @param {string} url - The URL to request.
	 * @param {Object} body - The request payload to JSON-serialise.
	 * @returns {Promise<Object|string>} Parsed JSON response, or raw response text.
	 * @throws {Error} When the request fails or returns a non-2xx status.
	 */
	static post(url, body) {
		return ApiService.request('POST', url, body);
	}

	/**
	 * Sends an HTTP PUT request with a JSON body.
	 *
	 * @param {string} url - The URL to request.
	 * @param {Object} body - The request payload to JSON-serialise.
	 * @returns {Promise<Object|string>} Parsed JSON response, or raw response text.
	 * @throws {Error} When the request fails or returns a non-2xx status.
	 */
	static put(url, body) {
		return ApiService.request('PUT', url, body);
	}

	/**
	 * Sends an HTTP DELETE request.
	 *
	 * @param {string} url - The URL to request.
	 * @returns {Promise<Object|string>} Parsed JSON response, or raw response text.
	 * @throws {Error} When the request fails or returns a non-2xx status.
	 */
	static delete(url) {
		return ApiService.request('DELETE', url);
	}
}
