'use client'
import { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student'); // New state for role
  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error
  ] = useCreateUserWithEmailAndPassword(auth);

  const router = useRouter();

  // Handle form submission
  const handleSignUp = async () => {
    const userCredential = await createUserWithEmailAndPassword(email, password);
    
    // If user creation was successful, add role information to Firestore
    if (userCredential && userCredential.user) {
      try {
        // Create user data object based on role
        const userData = {
          email: userCredential.user.email,
          fullName: fullName,
          role: role,
          createdAt: new Date()
        };

        // Add children array for parents and teachers to track their students
        if (role === 'parent' || role === 'teacher') {
          userData.children = []; // Array for student IDs (for parents/teachers)
        }

        await setDoc(doc(db, "users", userCredential.user.uid), userData);
      } catch (err) {
        console.error("Error adding user data: ", err);
      }
    }
  };

  // Redirect to login on successful registration
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('student');
      router.push('/login');
    }
    if (error) {
      console.error('Firebase error:', error.message);
    }
  }, [user, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96 relative">
        {/* Back to login arrow */}
        <Link href="/" className="absolute left-4 top-4 text-white text-2xl hover:text-indigo-400" aria-label="Back to login">
          &#8592;
        </Link>
        <h1 className="text-white text-2xl mb-5 text-center">Sign Up</h1>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
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
          <option value="parent">Parent</option>
        </select>
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        {error && (
          <p className="text-red-400 mt-2">{error.message}</p>
        )}
      </div>
    </div>
  );
};

export default SignUp;
