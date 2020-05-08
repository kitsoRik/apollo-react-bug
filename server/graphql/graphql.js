const graphqlHTTP = require('express-graphql');
const schema = require("./schema");
const { getUserById } = require('../db/models/user');
const { getSessionBySesid } = require('../db/models/session');
const { ApolloServer, gql } = require('apollo-server');

const router = require("express").Router();

var corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.use("/graphql", require("cors")(corsOptions));

const server = new ApolloServer({
  typeDefs: gql`
    type Product {
      id: ID
      title: String
      imageName: String
      locationId: Int
      category: String
      price: Float
    }

    type Query {
      products(title: String, location: String, locationId: Int, category: String, priceFrom: Float, priceTo: Float, page: Int, limit: Int): Product
    }
  `,
  resolvers: {
    Query: {
      products: () => {
        return [{ id: 0, title: "Unknown", imageName: "qwe", locationId: 0, category: "any", price: 228.13 }]
      }
    }
  }
})

router.use('/api/graphql', async (req, res) => {
  if (req.method === 'OPTIONS') return res.send({});

  const { sesid } = req.cookies;

  const session = await getSessionBySesid(sesid);
  let user;

  if (session) user = await getUserById(session.userId);

  graphqlHTTP({
    schema: schema,
    graphiql: true,
    context: { req, res, user }
  })(req, res);
});

module.exports = router;