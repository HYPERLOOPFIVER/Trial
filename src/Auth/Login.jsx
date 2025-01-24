import React, { useState, useEffect } from "react";
import { auth } from "../Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard"); // Redirect to dashboard if user is logged in
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in: ", error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "black", // Dark gradient
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        flexDirection: "column",
      
      }}
    >
      <h2
        style={{
          fontSize: "3rem",
          fontWeight: "700",
          marginBottom: "0px",
          background: "linear-gradient(45deg, #ff0000, #00d2ff)", // Red and cyan gradient
          backgroundClip: "text",
          color: "transparent", // Ensures the text is transparent to show the gradient
          textShadow: "0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px #ff0000",
          WebkitBackgroundClip: "text", // For Safari compatibility
        }}
      >
        Prep Economics
      </h2>
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(10px)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "15px",
            fontSize: "1.1rem",
            border: "none",
            borderRadius: "8px",
            background: "#fff",
            color: "#333",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "15px",
            fontSize: "1.1rem",
            border: "none",
            borderRadius: "8px",
            background: "#fff",
            color: "#333",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "15px",
            fontSize: "1.1rem",
            background: "linear-gradient(45deg, #ff0000, #ff7300)", // Red and orange gradient
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            transition: "background 0.3s ease, transform 0.2s ease",
          }}
        >
          Login
        </button>
      </form>
      <p
        style={{
          marginTop: "20px",
          fontSize: "1rem",
          color: "#fff",
          textAlign: "center",
        }}
      >
        Don't have an account?{" "}
        <a
          href="/signup"
          style={{
            color: "#ffcb05",
            textDecoration: "none",
            fontWeight: "700",
            transition: "color 0.3s ease",
          }}
        >
          Sign up
        </a>
      </p>
    </div>
  );
};

export default Login;
