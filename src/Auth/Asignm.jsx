import React, { useState, useEffect } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { getDoc} from "firebase/firestore";


const Asign = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid)); // Corrected here
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

  const assignHomework = async () => {
    try {
      if (!selectedCourse || !assignmentTitle || !assignmentDescription || !dueDate) {
        alert("Please fill in all assignment details.");
        return;
      }

      await addDoc(collection(db, "assignments"), {
        courseId: selectedCourse,
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        teacherId: user.uid,
      });

      alert("Assignment created successfully!");
      setSelectedCourse("");
      setAssignmentTitle("");
      setAssignmentDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error assigning homework:", error.message);
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
            <h3>Assign Homework</h3>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Assignment Title"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
            />
            <textarea
              placeholder="Assignment Description"
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button className="btn btn-create" onClick={assignHomework}>
              Assign Homework
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Asign;
