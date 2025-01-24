const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

// API to create a payment
app.post("/create-payment", async (req, res) => {
  const { userId, courseId, amount } = req.body;

  try {
    // Create a payment record in Firestore
    const paymentRef = await db.collection("payments").add({
      userId,
      courseId,
      amount,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const paymentId = paymentRef.id;

    // Generate payment URL (Google Pay API simulation)
    const paymentLink = `https://pay.google.com/gp/p/${paymentId}`; // Replace this with actual API integration

    res.status(200).send({ paymentId, paymentLink });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).send({ error: "Failed to create payment" });
  }
});

// Webhook to verify payment
app.post("/verify-payment", async (req, res) => {
  const { paymentId, status } = req.body;

  try {
    const paymentRef = db.collection("payments").doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return res.status(404).send({ error: "Payment not found" });
    }

    const paymentData = paymentDoc.data();

    // Update payment status
    await paymentRef.update({ status });

    if (status === "success") {
      // Enroll the user in the course
      const courseRef = db.collection("courses").doc(paymentData.courseId);
      const courseDoc = await courseRef.get();

      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const updatedStudents = [...(courseData.students || []), paymentData.userId];
        await courseRef.update({ students: updatedStudents });

        const userRef = db.collection("users").doc(paymentData.userId);
        const userDoc = await userRef.get();

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedCourses = [...(userData.purchasedCourses || []), paymentData.courseId];
          await userRef.update({ purchasedCourses: updatedCourses });
        }
      }
    }

    res.status(200).send({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).send({ error: "Failed to verify payment" });
  }
});

exports.api = functions.https.onRequest(app);
