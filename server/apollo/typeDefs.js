const { gql } = require("apollo-server");

module.exports = gql`
type User {
    id: ID!
    fullName: String!
    }

    type Product {
        id: ID!
        owner: User!
    }

    type Chat {
        id: ID!
        product: Product!
        shopper: User!
        seller: User!
        messages(page: Int, limit: Int): [Message!]!
    }

    type Message {
        id: ID!
        owner: User!
        text: String!
    }

    type Query {
            product(id: ID!): Product
            chat(id: ID!): Chat
    }

`