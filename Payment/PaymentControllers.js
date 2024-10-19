const Payment = require("./PaymentSchema");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  // Validation
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  // if (!email) {
  //   return res.status(400).json({ message: "User Email is required" });
  // }

  try {
    // Create a PaymentIntent with the provided amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects the amount in the smallest currency unit (e.g., cents)
      currency: "usd",
      payment_method_types: ["card"],
      // receipt_email: email, // Attach user's email for the receipt
    });

    // Respond with the client secret needed for frontend integration
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      message: "Payment Intent created successfully",
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

exports.payments = async (req, res) => {
  try {
    const { amount, paymentIntentId, email, status } = req.body;

    // Validate the incoming payment data
    if (!amount || !paymentIntentId || !email || !status) {
      return res.status(400).json({ message: "Missing required payment fields." });
    }

    // Find and update the existing payment or create a new one
    const payment = await Payment.findOneAndUpdate(
      { email },
      { paymentIntentId, amount, status },
      { new: true, upsert: true } // upsert creates a new document if no document matches the query
    );

    console.log('Payment saved/updated:', payment);
    
    return res.status(201).send(payment);
  } catch (error) {
    console.error("Error creating/updating payment:", error);
    return res.status(500).json({
      message: "Server error during payment creation/update",
      error: error.message,
    });
  }
};
