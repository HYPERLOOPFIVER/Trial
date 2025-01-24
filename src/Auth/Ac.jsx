import React, { useEffect, useState } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { Link } from "react-router-dom";

const Attend = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);
          if (userData.role === "student") {
            setPurchasedCourses(userData.purchasedCourses || []);
          }
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
    } else if (role === "student") {
      fetchAvailableCourses();
    }
  }, [role, user]);

  useEffect(() => {
    if (role === "student" && purchasedCourses.length > 0) {
      fetchPurchasedCourses();
    }
  }, [role, purchasedCourses]);

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

  const fetchAvailableCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const allCourses = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allCourses.push({ id: doc.id, ...data });
      });
      setAvailableCourses(allCourses);
    } catch (error) {
      console.error("Error fetching available courses: ", error.message);
    }
  };

  const fetchPurchasedCourses = async () => {
    try {
      if (purchasedCourses.length > 0) {
        const courseDetails = [];
        for (const courseId of purchasedCourses) {
          const courseDoc = await getDoc(doc(db, "courses", courseId));
          if (courseDoc.exists()) {
            courseDetails.push({ id: courseId, ...courseDoc.data() });
          }
        }
        setCourses(courseDetails);
      }
    } catch (error) {
      console.error("Error fetching purchased course details: ", error.message);
    }
  };

  const createCourse = async () => {
    const courseName = prompt("Enter course name:");
    const description = prompt("Enter course description:");
    const price = prompt("Enter course price:");
    if (courseName && description && price) {
      try {
        const newCourse = {
          name: courseName,
          description,
          teacherId: user.uid,
          students: [],
          meetingLink: "",
          price: parseFloat(price),
        };
        await addDoc(collection(db, "courses"), newCourse);
        fetchCoursesByTeacher();
      } catch (error) {
        console.error("Error creating course: ", error.message);
      }
    }
  };

  const startClass = async (courseId) => {
    const roomName = `Course-${courseId}`;
    const domain = "meet.jit.si";
    const url = `https://${domain}/${roomName}`;
    try {
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, { meetingLink: url });
      fetchCoursesByTeacher();
    } catch (error) {
      console.error("Error updating meeting link: ", error.message);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const courseRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const updatedStudents = [...courseData.students, user.uid];
        await updateDoc(courseRef, { students: updatedStudents });

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedCourses = [...(userData.purchasedCourses || []), courseId];
          await updateDoc(userRef, { purchasedCourses: updatedCourses });
          setPurchasedCourses(updatedCourses);
        }
      }
    } catch (error) {
      console.error("Error enrolling in course: ", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error.message);
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
            <h3>Your Courses</h3>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <h4>{course.name}</h4>
                  <p>{course.description}</p>
                  <p>Price: ${course.price}</p>
                  <button className="btn btn-start" onClick={() => startClass(course.id)}>
                    Start Class
                  </button>
                  {course.meetingLink && (
                    <p>
                      Meeting Link:{" "}
                      <a href={course.meetingLink} target="_blank" rel="noopener noreferrer">
                        Join Class
                      </a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        )}

        {role === "student" && (
          <>
            <div>
              <h3>Your Purchased Courses</h3>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div className="course-card" key={course.id}>
                    <h4>{course.name}</h4>
                    <p>{course.description}</p>
                    <p>Price: ${course.price}</p>
                    {course.meetingLink ? (
                      <a href={course.meetingLink} target="_blank" rel="noopener noreferrer">
                        Join Class
                      </a>
                    ) : (
                      <p>Class not started yet.</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No purchased courses yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Attend;
