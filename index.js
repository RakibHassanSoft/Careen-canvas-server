const express = require("express");
const app = express();
const connectDB=require("./Config/dbConfig")
 
require("dotenv").config();
connectDB()
// Middleware
app.use(express.json());
//  Home route
app.get("/", (req, res) => {
  res.send("hello Developer");
});
// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});