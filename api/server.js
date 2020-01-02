const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const db = require('./db.json');

const app = express();

const authConfig = {
  domain: 'jonatanm.eu.auth0.com',
  audience: 'http://localhost:3000/',
};

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ['RS256'],
});

app.get('/api/properties', checkJwt, (req, res) => {
  res.send(db.properties);
});

app.listen(3000, () => console.log('API listening on 3000'));
