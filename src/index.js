const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const path = require('path');
const keys = require('./config/keys');
const logger = require('./config/logger');

require('./services/rabbitmq');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(express.json({ limit: '25mb', extended: true }));
app.use(cookieParser());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(
    session({
        secret: keys.cookieKey,
        store: new MemoryStore({
            checkPeriod: 86400000, // prune expired entries every 24h
            max: 128,
        }),
        resave: false,
        saveUninitialized: false,
    })
);

app.use(
    morgan('common', {
        skip: (req, res) =>
            res.statusCode < 400 || process.env.MUTE_MORGAN === 'on',
        stream: process.stderr,
    })
);

app.use(
    morgan('common', {
        skip: (req, res) =>
            res.statusCode >= 400 || process.env.MUTE_MORGAN === 'on',
        stream: process.stdout,
    })
);

require('./routes/index')(app);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Server Error');
});

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
    logger.error('400 page requested');
    res.status(404).send('Page not found');
});

app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));

module.exports = app;
