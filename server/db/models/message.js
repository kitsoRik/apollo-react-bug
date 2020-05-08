const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
    id: {
        type: Number,
        default: 0
    },
    ownerId: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

const messageModel = model("Messages", messageSchema);

exports.getMessagesByIds = (ids = []) => messageModel.find({ id: { $in: ids } });


(async () => {
    const count = await messageModel.countDocuments();
    if (count !== 0) return;
    messageModel.create({ id: 0, ownerId: 1, text: "custom text" });
})();