const express = require("express");
const { payments, createPaymentIntent, getPayments } = require("./PaymentControllers");

const route = express.Router();

route.post("/createPaymentIntent", createPaymentIntent);
// Define the POST route for creating a payment
route.post("/payments", payments);
route.get("/getPayments", getPayments)

module.exports = route;
