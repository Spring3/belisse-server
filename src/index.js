require('dotenv').load({ silent: true });
const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const errorMiddleware = require('./middleware/error-handler.js');

const startedAt = new Date();
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.status(200).send({ uptime: (new Date() - startedAt) / 1000 }));
app.get('/favicon', (req, res) => res.status(200).send());

app.use(errorMiddleware);

assert(process.env.PORT, 'PORT is undefined');

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
