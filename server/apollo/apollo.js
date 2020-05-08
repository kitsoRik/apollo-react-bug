const { ApolloServer } = require('apollo-server-express');

const server = new ApolloServer({
    typeDefs: require("./typeDefs"),
    resolvers: require("./resolvers"),
    context: () => ({ user: { id: 1 } })
});

module.exports = (app,) => {
    server.applyMiddleware({ app, path: "/graphql", });;
}