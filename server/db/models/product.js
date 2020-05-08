const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    id: {
        type: Number,
        default: 0
    },
    ownerId: {
        type: Number,
        default: 1,
        required: true
    }
});

const productModel = model("Products", productSchema);

exports.getProductById = (id) => productModel.findOne({ id: +id });


(async () => {
    const count = await productModel.countDocuments();
    if (count !== 0) return;
    productModel.create({ id: 0, ownerId: 0 });
})();