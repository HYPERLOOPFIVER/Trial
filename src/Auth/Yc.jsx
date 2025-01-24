import React, { useState, useEffect } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Yc = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error.message);
        }
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (role === "teacher" && user) {
      fetchCoursesByTeacher();
    }
  }, [role, user]);

  const fetchCoursesByTeacher = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const teacherCourses = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.teacherId === user.uid) {
          teacherCourses.push({ id: doc.id, ...data });
        }
      });
      setCourses(teacherCourses);
    } catch (error) {
      console.error("Error fetching teacher courses: ", error.message);
    }
  };

  const handleStartClass = (courseId) => {
    setCurrentCourse(courseId);
    setShowPopup(true);
  };

  const submitMeetingLink = async () => {
    if (!meetingLink.trim()) {
      alert("Meeting link cannot be empty.");
      return;
    }
    try {
      const courseRef = doc(db, "courses", currentCourse);
      await updateDoc(courseRef, { status: "online", meetingLink });
      setShowPopup(false);
      setMeetingLink("");
      setCurrentCourse(null);
      fetchCoursesByTeacher();
      alert("Class started successfully!");
    } catch (error) {
      console.error("Error updating course: ", error.message);
      alert("Failed to start the class. Please try again.");
    }
  };

  const handleEndClass = async (courseId) => {
    try {
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, { status: "offline", meetingLink: "" });
      fetchCoursesByTeacher();
      alert("Class ended successfully!");
    } catch (error) {
      console.error("Error ending class: ", error.message);
      alert("Failed to end the class. Please try again.");
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

        {role === "teacher" && (
          <div>
            <h3>Your Courses</h3>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <h4>{course.name}</h4>
                  <p>{course.description}</p>
                  <p>Price: ${course.price}</p>
                  <p>Status: {course.status || "offline"}</p>
                  <p>
                    Meeting Link:{" "}
                    {course.meetingLink ? (
                      <a
                        href={course.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join the Meeting
                      </a>
                    ) : (
                      "Not set"
                    )}
                  </p>
                  {course.status === "offline" ? (
                    <button
                      onClick={() => handleStartClass(course.id)}
                      className="start-class-btn"
                    >
                      Start Class
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEndClass(course.id)}
                      className="end-class-btn"
                    >
                      End Class
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        )}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Enter Meeting Link</h3>
            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Enter meeting link"
            />
            <button onClick={submitMeetingLink} className="submit-btn">
              Submit
            </button>
            <button
              onClick={() => {
                setShowPopup(false);
                setMeetingLink("");
                setCurrentCourse(null);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yc;
