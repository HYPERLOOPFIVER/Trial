import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// Type definitions for the request body
interface CreatePaymentRequest {
  userId: string;
  courseId: string;
  amount: number;
}

interface VerifyPaymentRequest {
  paymentId: string;
  status: string;
}

// Function to create a payment record when the user initiates a payment
export const createPayment = onRequest(async (req, res) => {
  const { userId, courseId, amount }: CreatePaymentRequest = req.body;

  try {
    // Generate a payment ID and store the payment details in Firestore
    const paymentId = `${userId}-${courseId}-${Date.now()}`;
    const paymentDoc = {
      userId,
      courseId,
      amount,
      status: "pending", // Initially set to pending
      paymentId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Store payment details in Firestore under the "payments" collection
    await db.collection("payments").doc(paymentId).set(paymentDoc);

    // Respond with a success message and the payment ID
    res.status(200).send({ message: "Payment details stored successfully", paymentId });
  } catch (error) {
    logger.error("Error creating payment record:", error);
    res.status(500).send({ error: "Failed to create payment record" });
  }
});

// Function to verify payment status (can be called after UPI payment completion)
export const verifyPayment = onRequest(async (req, res) => {
  const { paymentId, status }: VerifyPaymentRequest = req.body;

  try {
    // Retrieve the payment document using the paymentId
    const paymentRef = db.collection("payments").doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return res.status(404).send({ error: "Payment not found" });
    }

    const paymentData = paymentDoc.data();

    // Update the payment status (Success/Failure)
    await paymentRef.update({
      status, // Update status to 'success' or 'failed'
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If payment is successful, enroll the user in the course
    if (status === "success") {
      // Enroll the user in the course
      const courseRef = db.collection("courses").doc(paymentData.courseId);
      const courseDoc = await courseRef.get();

      if (courseDoc.exists) {
        const updatedStudents = [...(courseDoc.data()?.students || []), paymentData.userId];
        await courseRef.update({ students: updatedStudents });

        // Add course to the user's purchased courses
        const userRef = db.collection("users").doc(paymentData.userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const updatedCourses = [...(userDoc.data()?.purchasedCourses || []), paymentData.courseId];
          await userRef.update({ purchasedCourses: updatedCourses });
        }
      }
    }

    res.status(200).send({ message: "Payment verified successfully" });
  } catch (error) {
    logger.error("Error verifying payment:", error);
    res.status(500).send({ error: "Failed to verify payment" });
  }
});
