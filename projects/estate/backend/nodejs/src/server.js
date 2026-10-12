const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const { connectAll } = require('./services/db');
const config = require('../config');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/listings', require('./routes/listings'));

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
    pretty: true,
  })
);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

connectAll().catch((err) => {
  console.warn('[Node.js API] background DB connection issue:', err.message);
});

app.listen(config.node.port, () => {
  console.log(
    `[Node.js API] REST on :${config.node.port}/api | GraphQL on :${config.node.port}/graphql`
  );
});

module.exports = app;