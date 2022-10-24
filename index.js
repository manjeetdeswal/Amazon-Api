const express = require("express");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const mongoose = require("mongoose");
const productRoute = require("./routes/productCategory");
const userRoute = require("./routes/userRoute");

const app = express();
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRoute);
app.use(userRoute);

mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.cu3lgrd.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connection Succesful");
  })
  .catch((e) => {
    console.log(e);
  });
app.listen(3000, () => {
  console.log("started");
});

app.get("/", (req, res) => {
  res.send("ji");
});
