'use client';
import { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/Button';
import Input from '../components/Input';
import BackArrow from '../components/BackArrow'; 

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error,
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
          fullName: fullName,
          role: role,
          createdAt: new Date(),
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
      setFullName('');
      setRole('student');
      router.push('/login');
    }
    if (error) {
      console.error('שגיאת Firebase:', error.message);
    }
  }, [user, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bdb4c0">
      <div className="panels p-10 rounded-lg shadow-xl w-96 relative" dir="rtl">
        <BackArrow href="/" ariaLabel="חזרה לעמוד הראשי" />
        <h1 className="text-black text-2xl mb-5 text-right">הרשמה</h1>
        <Input
          type="text"
          placeholder="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="מייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="סיסמא"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--input-text)',
            borderColor: 'var(--input-border)'
          }}
          className="w-full p-3 mb-4 border rounded-lg outline-none text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          dir="rtl"
        >
          <option value="student">תלמיד</option>
          <option value="teacher">מורה</option>
          <option value="parent">הורה</option>
        </select>
        <Button onClick={handleSignUp} loading={loading} className="w-full">
          {loading ? 'נרשם...' : 'הירשם'}
        </Button>
        {error && (
          <p className="text-red-400 mt-2 text-right">{error.message}</p>
        )}
      </div>
    </div>
  );
};

export default SignUp;