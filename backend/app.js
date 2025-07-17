const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const config = require('./config');

const usersRouter = require('./routes/users');
const auth = require('./auth');
const listingRoutes = require('./routes/listings');
const messagesRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/review');
const locationRoutes = require('./routes/location');
const favoriteRoutes = require('./routes/favorites');

const app = express();

mongoose.connect(config.dbURL)
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => {
        console.error('Database Connection Error:', err);
        process.exit(1);
    });

app.use(cors({
    origin: config.clientURL,
    credentials: true,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/users', usersRouter);
app.use('/api/auth', auth.router);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use(function(req, res, next) {
    if (!res.headersSent) {
        res.status(404).json({ error: 'Not Found - API endpoint does not exist or route not handled' });
    }
});

app.use(function(err, req, res, next) {
    const statusCode = err.status || 500;
    const errorMessage = (process.env.NODE_ENV === 'development' || err.expose) ? err.message : 'Internal Server Error';
    if (!res.headersSent) {
        res.status(statusCode).json({ error: errorMessage });
    } else {
        next(err);
    }
});

module.exports = app;