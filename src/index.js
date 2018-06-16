require('dotenv').load({ silent: true });
const assert = require('assert');
const express = require('express');
const uuid = require('uuid');
// const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;

const errorMiddleware = require('./middleware/error-handler.js');

const startedAt = new Date();
const app = express();

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.GITHUB_REDIRECT_ORIGIN}/auth/gh/callback`
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { accessToken, profile });
}));

// passport.serializeUser((user, done) => done(null, true));
// passport.deserializeUser((id, done) => done(null, true));

app.use(helmet());
// app.use(session({
//   secret: 'I collect different useless stuff at home',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true }
// }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
// app.use(passport.session());

app.get('/', (req, res) => res.status(200).send({ uptime: (new Date() - startedAt) / 1000 }));
app.get('/favicon', (req, res) => res.status(200));
app.get('/auth/gh', passport.authenticate('github', {
  scope: ['user:email']
}));
app.get('/auth/gh/callback', passport.authenticate('github', { session: false }), (req, res) => {
  const data = { ...req.user, appId: uuid.v4() };
  res.status(200).send(`<script>window.postMessage(${data}, 'localhost')</script>`);
});

app.use(errorMiddleware);

assert(process.env.PORT, 'PORT is undefined');

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
