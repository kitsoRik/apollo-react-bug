const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
    id: {
        type: Number,
    },
    productId: {
        type: Number,
        required: true
    },
    shopperId: {
        type: Number,
        required: true
    },
    sellerId: {
        type: Number,
        required: true
    },
    messagesIds: {
        type: [Number],
        default: []
    }
});

const chatModel = model("Chats", chatSchema);

exports.getChatById = (id) => chatModel.findOne({ id });


(async () => {
    const count = await chatModel.countDocuments();
    if (count !== 0) return;
    chatModel.create({ id: 0, productId: 0, shopperId: 1, sellerId: 0, messagesIds: [0] });
})();