import React, { useState, useEffect } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState([]);
  const [liveCourses, setLiveCourses] = useState([]);  // State to hold live courses
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [notices, setNotices] = useState([]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDescription, setNoticeDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
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
    fetchNotices();
    fetchLiveCourses();  // Fetch live courses when the role is student
  }, [role, user]);

  // Function to fetch live courses
  const fetchLiveCourses = async () => {
    try {
      // Fetch courses owned by the logged-in teacher
      const querySnapshot = await getDocs(collection(db, "courses"));
      const liveCoursesList = [];
  
      querySnapshot.forEach((docSnap) => {
        const courseData = docSnap.data();
  
        // Check if the logged-in user is the teacher for this course
        if (courseData.teacherId === user.uid) {
          // Check if the course status is 'online'
          if (courseData.status === "online") {
            liveCoursesList.push({
              id: docSnap.id,
              name: courseData.name,
              description: courseData.description,
              price: courseData.price,
              teacherId: courseData.teacherId,
              teacherName: courseData.teacherName, // Assuming teacher name is stored in the course document
            });
          }
        }
      });
  
      // Update state with live courses
      setLiveCourses(liveCoursesList);
    } catch (error) {
      console.error("Error fetching live courses: ", error.message);
    }
  };
  
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

  const fetchNotices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "notices"));
      const fetchedNotices = [];
      querySnapshot.forEach((doc) => {
        fetchedNotices.push({ id: doc.id, ...doc.data() });
      });
      setNotices(fetchedNotices);
    } catch (error) {
      console.error("Error fetching notices: ", error.message);
    }
  };

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
      fetchCoursesByTeacher();
    } catch (error) {
      console.error("Error creating course:", error.message);
    }
  };

  const addNotice = async () => {
    try {
      if (!noticeTitle || !noticeDescription) {
        alert("Please fill in all notice details.");
        return;
      }

      await addDoc(collection(db, "notices"), {
        title: noticeTitle,
        description: noticeDescription,
        date: Timestamp.fromDate(new Date()),
        teacherId: user.uid,
      });

      alert("Notice created successfully!");
      setNoticeTitle("");
      setNoticeDescription("");
      fetchNotices();
    } catch (error) {
      console.error("Error adding notice:", error.message);
    }
  };

  const startClass = async (courseId) => {
    try {
      const statusDocRef = doc(db, "status", courseId);
      await updateDoc(statusDocRef, { status: "online" });

      const meetingLink = prompt("Enter the meeting link:");
      if (meetingLink) {
        const courseDocRef = doc(db, "courses", courseId);
        await updateDoc(courseDocRef, { meetingLink });
        alert("Class started and meeting link updated successfully!");
        fetchCoursesByTeacher();
      }
    } catch (error) {
      console.error("Error starting class:", error.message);
    }
  };

  const endClass = async (courseId) => {
    try {
      const statusDocRef = doc(db, "status", courseId);
      await updateDoc(statusDocRef, { status: "offline" });
      alert("Class ended and status updated to offline.");
      fetchCoursesByTeacher();
    } catch (error) {
      console.error("Error ending class:", error.message);
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

        {role === "teacher" && (
          <div>
            <h3>Notices</h3>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div className="notice-card" key={notice.id}>
                  <h4>{notice.title}</h4>
                  <p>{notice.description}</p>
                  <p>{new Date(notice.date.seconds * 1000).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No notices available.</p>
            )}
            <center>
              <Link to="/cca" className="btn-square">Create Courses</Link>
              <Link to="/asign" className="btn-square">Assignments</Link>
              <Link to="/yc" className="btn-square">Your Courses</Link>
            </center>
          </div>
        )}

        {role === "student" && (
          <>
            <div>
              <h3>Live Now Courses</h3>
              {liveCourses.length > 0 ? (
                liveCourses.map((course) => (
                  <div className="course-card" key={course.id}>
                    <h4>{course.name}</h4>
                    <p>{course.description}</p>
                    <p>Price: {course.price === 0 ? "Free" : `$${course.price}`}</p>
                    <p>Taught by: {course.teacherName}</p>
                    <button className="btn btn-enroll" onClick={() => window.location.href = course.meetingLink}>
                      Join Class
                    </button>
                  </div>
                ))
              ) : (
                <p>No live courses right now.</p>
              )}
            </div>

            <div>
              <center>
                <Link to="/courses" className="btn-square">Buy Courses</Link>
              </center>
            </div>

            <div>
              <center>
                <Link to="/Attend" className="btn-square">Attend Courses</Link>
              </center>
            </div>

            <div>
              <h3>Notices</h3>
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div className="notice-card" key={notice.id}>
                    <h4>{notice.title}</h4>
                    <p>{notice.description}</p>
                    <p>{new Date(notice.date.seconds * 1000).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p>No notices available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
