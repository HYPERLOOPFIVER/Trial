import React, { useState, useEffect } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Cca = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const createCourse = async () => {
    try {
      if (!courseName || !courseDescription || !coursePrice) {
        alert("Please fill in all course details.");
        return;
      }

      const courseDocRef = await addDoc(collection(db, "courses"), {
        name: courseName,
        description: courseDescription,
        price: parseFloat(coursePrice),
        teacherId: user.uid,
        meetingLink: "",
      });

      await setDoc(doc(db, "status", courseDocRef.id), {
        status: "offline",
      });

      alert("Course created successfully!");
      setCourseName("");
      setCourseDescription("");
      setCoursePrice("");
    } catch (error) {
      console.error("Error creating course:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h2>Welcome, {user.email}</h2>
        <p>Your role: {role}</p>
        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>

        <div>
          <h3>Create a New Course</h3>
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <textarea
            placeholder="Course Description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Course Price"
            value={coursePrice}
            onChange={(e) => setCoursePrice(e.target.value)}
          />
          <button className="btn btn-create" onClick={createCourse}>
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cca;
