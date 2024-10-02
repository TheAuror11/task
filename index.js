const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const pincodeModel = require("./pincodeModel");

const app = express();

// app.use(bodyParser);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const uri = "mongodb://127.0.0.1:27017/pincode";
mongoose.connect(uri).then(() => {
  console.log("DB Connected");
});

app.get("/home", (req, res) => {
  return res.json({ msg: "server connected" });
});

app.post("/pincode", async (req, res) => {
  const pincode = req.body;
  //   console.log(pincode);

  const data = await pincodeModel.findOne(pincode);

  return res.json({ data });
});

app.listen(8000, () => {
  console.log("Server connected to port: 8000");
});
