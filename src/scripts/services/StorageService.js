/**
 * Thin wrapper around `localStorage` that handles JSON serialisation and deserialisation.
 */
class StorageService {
	/**
	 * Retrieves and parses a value from `localStorage`.
	 * @param {string} key - The storage key to read.
	 * @returns {*|null} The parsed value, or `null` if the key does not exist or parsing fails.
	 */
	static get(key) {
		try {
			const raw = localStorage.getItem(key);
			return raw !== null ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	/**
	 * Serialises a value and writes it to `localStorage`.
	 * @param {string} key - The storage key to write.
	 * @param {*} value - The value to serialise and store.
	 * @returns {void}
	 */
	static set(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	/**
	 * Removes a single entry from `localStorage`.
	 * @param {string} key - The storage key to delete.
	 * @returns {void}
	 */
	static remove(key) {
		localStorage.removeItem(key);
	}

	/**
	 * Clears all entries from `localStorage`.
	 * @returns {void}
	 */
	static clear() {
		localStorage.clear();
	}
}
