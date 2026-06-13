const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./database');

/**
 * Passport LocalStrategy verify callback.
 *
 * Looks up a user by email and validates the supplied plaintext password
 * against the stored bcrypt hash. The `usernameField` option remaps
 * Passport's default `username` field to `email`.
 *
 * @param {string} email - The email address submitted by the client.
 * @param {string} password - The plaintext password submitted by the client.
 * @param {import('passport-local').VerifyFunction} done - Passport callback:
 *   `done(err)` on error, `done(null, false, info)` on auth failure,
 *   `done(null, user)` on success.
 * @returns {Promise<void>}
 * @throws {Error} Propagates unexpected database errors via `done(err)`.
 */
passport.use(
	new LocalStrategy(
		{ usernameField: 'email' },
		async (email, password, done) => {
			try {
				const [rows] = await pool.query(
					'SELECT * FROM users WHERE email = ?',
					[email],
				);

				if (rows.length === 0) {
					return done(null, false, {
						message: 'Invalid email or password',
					});
				}

				const user = rows[0];
				const match = await bcrypt.compare(password, user.password);

				if (!match) {
					return done(null, false, {
						message: 'Invalid email or password',
					});
				}

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		},
	),
);

/**
 * Serialize the authenticated user into the session.
 *
 * Only the user's numeric `id` is stored in the session store to keep
 * the session payload minimal.
 *
 * @param {{ id: number }} user - The authenticated user object.
 * @param {function(Error|null, number=): void} done - Passport session callback.
 */
passport.serializeUser((user, done) => {
	done(null, user.id);
});

/**
 * Deserialize a user from the session on every authenticated request.
 *
 * Fetches a fresh user record from the database using the `id` stored in
 * the session. Sensitive fields such as `password` are intentionally
 * excluded from the query.
 *
 * @param {number} id - The user ID previously stored by `serializeUser`.
 * @param {function(Error|null, object|false=): void} done - Passport callback:
 *   `done(null, false)` when the user no longer exists,
 *   `done(null, user)` on success.
 * @returns {Promise<void>}
 * @throws {Error} Propagates unexpected database errors via `done(err)`.
 */
passport.deserializeUser(async (id, done) => {
	try {
		const [rows] = await pool.query(
			'SELECT id, email, created_at FROM users WHERE id = ?',
			[id],
		);

		if (rows.length === 0) {
			return done(null, false);
		}

		done(null, rows[0]);
	} catch (err) {
		done(err);
	}
});
