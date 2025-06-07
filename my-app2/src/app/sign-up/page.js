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
  const [role, setRole] = useState('student');
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
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: role,
          createdAt: new Date()
        });
      } catch (err) {
        console.error("שגיאה בהוספת נתוני משתמש: ", err);
      }
    }
  };

  // Redirect to login on successful registration
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');
      setRole('student');
      router.push('/login');
    }
    if (error) {
      console.error('שגיאת Firebase:', error.message);
    }
  }, [user, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bdb4c0">
      <div className="bg-white p-10 rounded-lg shadow-xl w-96 relative" dir="rtl">
        {/* Back to login arrow */}
        <Link href="/" className="absolute right-4 top-4 text-black text-2xl hover:text-indigo-400" aria-label="חזרה להתחברות">
          →
        </Link>
        <h1 className="text-black text-2xl mb-5 text-right">הרשמה</h1>
        <input
          type="email"
          placeholder="מייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500 text-right"
        />
        <input
          type="password"
          placeholder="סיסמא"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500 text-right"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white text-right"
        >
          <option value="student">תלמיד</option>
          <option value="teacher">מורה</option>
        </select>
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-green-600 rounded text-white"
          disabled={loading}
        >
          {loading ? 'נרשם...' : 'הירשם'}
        </button>
        {error && (
          <p className="text-red-400 mt-2 text-right">{error.message}</p>
        )}
      </div>
    </div>
  );
};

export default SignUp;