import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Webhook for payment confirmation
app.post("/api/payment-confirmation", (req, res) => {
  const { userId, courseId, paymentStatus } = req.body;

  // Here you would interact with your database to confirm the payment status
  // For example, update the payment status in your "payments" collection
  console.log(`Payment status for user ${userId} and course ${courseId}: ${paymentStatus}`);

  // Simulate success response
  if (paymentStatus === "success") {
    res.status(200).json({ message: "Payment successful" });
  } else {
    res.status(400).json({ message: "Payment failed" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
