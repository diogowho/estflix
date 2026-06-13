require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

require('./src/server/config/passport');

const authRoutes = require('./src/server/routes/auth');
const categoryRoutes = require('./src/server/routes/categories');
const contentRoutes = require('./src/server/routes/contents');
const profileRoutes = require('./src/server/routes/profiles');

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'estflix-secret',
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			sameSite: 'lax',
			secure: false,
			httpOnly: true,
		},
	}),
);
app.use(passport.initialize());
app.use(passport.session());

// Set up all the API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/profiles', profileRoutes);

// Serve the static CSS and JavaScript files
app.use('/styles', express.static(path.join(__dirname, 'src/styles')));
app.use('/scripts', express.static(path.join(__dirname, 'src/scripts')));

// Serve HTML pages for SPA navigation
app.get('/', (req, res) =>
	res.sendFile(path.join(__dirname, 'src/pages/index.html')),
);
app.get('/home', (req, res) =>
	res.sendFile(path.join(__dirname, 'src/pages/home.html')),
);
app.get('/admin', (req, res) =>
	res.sendFile(path.join(__dirname, 'src/pages/admin.html')),
);

const PORT = process.env.PORT || 3000;
// Start listening on the specified port
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
	if (err.code === 'EADDRINUSE') {
		console.log(`Port ${PORT} is already in use.`);
		process.exit(1);
	} else {
		console.error(err);
	}
});
