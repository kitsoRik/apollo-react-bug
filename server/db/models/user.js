const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    id: {
        type: Number,
    },
    fullName: {
        type: String,
        required: true
    },
});

const userModel = model("Users", userSchema);

exports.getUserById = (id) => userModel.findOne({ id });


(async () => {
    const count = await userModel.countDocuments();
    if (count !== 0) return;
    userModel.create({ id: 0, fullName: "User1" });
    userModel.create({ id: 1, fullName: "User2" });
})();