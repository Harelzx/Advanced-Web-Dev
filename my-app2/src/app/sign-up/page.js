"use client";
import { useState, useEffect } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignUp = async () => {
    const userCredential = await createUserWithEmailAndPassword(
      email,
      password
    );

    if (userCredential && userCredential.user) {
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: role,
          createdAt: new Date(),
        });
      } catch (err) {
        console.error("Error adding user data: ", err);
      }
    }
  };

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", true);
      setEmail("");
      setPassword("");
      setRole("student");
      router.push("/login");
    }
    if (error) {
      console.error("Firebase error:", error.message);
    }
  }, [user, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96 relative">
        <Link
          href="/"
          className="absolute left-4 top-4 text-white text-2xl hover:text-indigo-400"
          aria-label="Back to login"
        >
          &#8592;
        </Link>
        <h1 className="text-white text-2xl mb-5 text-center">Sign Up</h1>
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
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        {error && <p className="text-red-400 mt-2">{error.message}</p>}
      </div>
    </div>
  );
};

export default SignUp;
