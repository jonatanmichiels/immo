const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const db = require('./db.json');
const { jwksUri, issuer } = require('../auth.conf.json');

const app = express();

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri,
  }),
  issuer,
  algorithm: ['RS256'],
});

let properties = db.properties;
let nextId = 4;

app.use(express.json());

app.get('/api/properties', checkJwt, (req, res) => {
  res.json(properties);
});

app.post('/api/properties', checkJwt, (req, res) => {
  properties = [...properties, { id: nextId, ...req.body }];
  nextId++;

  res.status(201).send();
});

app.put('/api/properties/:id', checkJwt, (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!properties.find(p => p.id === id)) {
    return res.status(404).send();
  }

  properties = properties.map(p =>
    p.id === id ? { id: p.id, ...req.body } : p
  );

  res.status(204).send();
});

app.delete('/api/properties/:id', checkJwt, (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!properties.find(p => p.id === id)) {
    return res.status(404).send();
  }

  properties = properties.filter(p => p.id !== id);

  res.status(204).send();
});

app.listen(3000, () => console.log('API listening on 3000'));
