const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
      type: String,
      required: true,
    },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
 })

module.exports = mongoose.model("Product", productSchema)
