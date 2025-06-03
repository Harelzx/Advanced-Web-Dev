"use client";
import { useState, useEffect } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (user && user.user) {
        try {
          const userDocRef = doc(db, "users", user.user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;
            sessionStorage.setItem("user", true);
            setEmail("");
            setPassword("");

            if (role === "teacher") {
              router.push("/dashboard");
            } else if (role === "student") {
              window.location.href = "Main_Page";
            } else {
              setRoleError("Unknown user role.");
            }
          } else {
            setRoleError("User data not found.");
          }
        } catch (err) {
          setRoleError("Error fetching user data.");
          console.error(err);
        }
      }
    };

    checkRoleAndRedirect();
  }, [user, router]);

  const handleLogin = () => {
    setRoleError("");
    signInWithEmailAndPassword(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button
          onClick={handleLogin}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-400 mt-2">Wrong credentials</p>}
        {roleError && <p className="text-red-400 mt-2">{roleError}</p>}
        <p className="text-white mt-3 text-sm">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
