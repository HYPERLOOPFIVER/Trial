import React, { useState, useEffect } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import "./Dashboard.css";

const Course = () => {
  const [user, setUser] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState("pending");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchAvailableCourses();
      } else {
        console.warn("No user logged in");
      }
    });

    return unsubscribe;
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAvailableCourses(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handlePaymentClick = (courseId, price) => {
    if (price === 0) {
      enrollInCourse(courseId);
    } else {
      setSelectedCourse({ courseId, price });
      initiatePayment(courseId, price);
    }
  };

  const initiatePayment = async (courseId, price) => {
    const transactionId = `${courseId}-${Date.now()}`;
    const upiId = "7870323030@ybl";

    try {
      // Save transaction details to Firestore
      const paymentRef = doc(db, "transactions", transactionId);
      await setDoc(paymentRef, {
        transactionId,
        courseId,
        userId: user.uid,
        amount: price,
        status: "pending",
        createdAt: new Date(),
      });

      // Monitor transaction status
      monitorTransactionStatus(transactionId);

      // Generate UPI link
      const paymentLink = `upi://pay?pa=${upiId}&pn=RS Agency&tid=${transactionId}&am=${price}&cu=INR`;

      // Redirect user to UPI app
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const monitorTransactionStatus = (transactionId) => {
    const paymentRef = doc(db, "transactions", transactionId);

    // Listen for status changes
    const unsubscribe = onSnapshot(paymentRef, (doc) => {
      if (doc.exists()) {
        const paymentData = doc.data();
        setTransactionStatus(paymentData.status);

        if (paymentData.status === "success") {
          enrollInCourse(paymentData.courseId);
          unsubscribe(); // Stop listening once payment is successful
        }
      }
    });
  };

  const enrollInCourse = async (courseId) => {
    if (!user) {
      alert("You must be logged in to enroll.");
      return;
    }

    try {
      const courseRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseRef);

      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const updatedStudents = [...(courseData.students || []), user.uid];
        await updateDoc(courseRef, { students: updatedStudents });

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedCourses = [...(userData.purchasedCourses || []), courseId];
          await updateDoc(userRef, { purchasedCourses: updatedCourses });
        }

        alert("Successfully enrolled in the course!");
      } else {
        console.error("Course does not exist.");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  return (
    <div className="course-container">
      <h2>Available Courses</h2>
      {availableCourses.map((course) => (
        <div className="course-card" key={course.id}>
          <h3>{course.name}</h3>
          <p>{course.description}</p>
          <p>Price: ₹{course.price}</p>
          <button onClick={() => handlePaymentClick(course.id, course.price)}>
            {course.price === 0 ? "Enroll" : "Pay to Enroll"}
          </button>
        </div>
      ))}

      {showPopup && selectedCourse && transactionStatus === "pending" && (
        <div className="popup">
          <div className="popup-content">
            <h3>Processing Payment</h3>
            <p>Transaction is being processed. Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
