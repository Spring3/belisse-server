require('dotenv').load({ silent: true });
const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;

const { disconnect } = require('./modules/mongodb.js');
const errorMiddleware = require('./middleware/error-handler.js');
const appIdCheckMiddleware = require('./middleware/check-appId.js');
const ghAuthCallbackRoute = require('./routes/gh-auth-callback.js');

assert(process.env.PORT, 'PORT is undefined');
const startedAt = new Date();
const app = express();

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.GITHUB_REDIRECT_ORIGIN}/auth/gh/callback`
}, (accessToken, refreshToken, profile, done) => done(null, { accessToken, profile })));

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.get('/', (req, res) => res.status(200).send({ uptime: (new Date() - startedAt) / 1000 }));
app.get('/favicon', (req, res) => res.status(200));
app.get('/auth/gh', appIdCheckMiddleware, passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/gh/callback', appIdCheckMiddleware, passport.authenticate('github', { session: false }), ghAuthCallbackRoute);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});

process.on('exit', () => {
  console.log('Closing database connection...');
  disconnect();
  console.log('Exiting...');
});
