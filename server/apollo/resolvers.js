const { getProductById } = require("../db/models/product");
const { getUserById } = require("../db/models/user");

const { getMessagesByIds } = require("../db/models/message");
const { getChatById } = require("../db/models/chat");

module.exports = {
    Product: {
        owner: ({ ownerId }) => {
            console.log(ownerId)
            return getUserById(ownerId);
        }
    },
    Chat: {
        product: async ({ productId }) => {
            return await getProductById(productId);
        },
        shopper: async ({ shopperId }) => {
            return await getUserById(shopperId);
        },
        seller: async ({ sellerId }) => {
            return await getUserById(sellerId);
        },
        messages: async ({ messagesIds }) => {
            return await getMessagesByIds(messagesIds);
        }
    },
    Message: {
        owner: async ({ ownerId }) => {
            return await getUserById(ownerId);
        }
    },
    Query: {
        product: async (source, { id }) => {
            return await getProductById(id);
        },

        chat: async (source, { id }, { user }) => {
            if (!user) return;

            return getChatById(id);
        }
    }
}