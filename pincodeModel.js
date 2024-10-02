const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
});

const pincodeModel = mongoose.model("Pincode", pincodeSchema);

module.exports = pincodeModel;
