'use client'
import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingWheel from '../components/LoadingWheel';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error
  ] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const [roleError, setRoleError] = useState('');
  const [redirectLoading, setRedirectLoading] = useState(false);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (user && user.user) {
        setRedirectLoading(true); // Start loading
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, 'users', user.user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;
            sessionStorage.setItem('user', true);
            sessionStorage.setItem('uid', user.user.uid);
            setEmail('');
            setPassword('');
            if (role === 'teacher' || role === 'parent') {
              router.push('/dashboard');
            } else if (role === 'student') {
              // Check if results collection exists for FirstQuiz
              try {
                const resultsRef = collection(db, `users/${user.user.uid}/results`);
                const resultsSnapshot = await getDocs(resultsRef);
                if (resultsSnapshot.empty) {
                  // Collection doesn't exist, redirect to FirstQuiz
                  router.push('/FirstQuiz');
                } else {
                  // Results exist, go to Main Page
                  router.push('/Main_Page');
                }
              } catch (resultsError) {
                console.error('Error checking results collection:', resultsError);
                // Default to Main Page in case of errors
                router.push('/Main_Page');
              }
            } else {
              setRoleError('תפקיד משתמש לא ידוע.');
              setRedirectLoading(false);
            }
          } else {
            setRoleError('נתוני המשתמש לא נמצאו.');
            setRedirectLoading(false);
          }
        } catch (err) {
          setRoleError('שגיאה באחזור נתוני המשתמש.');
          console.error(err);
          setRedirectLoading(false);
        }
      }
    };

    checkRoleAndRedirect();
  }, [user, router]);

  // Handle login click
  const handleLogin = () => {
    setRoleError('');
    signInWithEmailAndPassword(email, password);
  };

  // Show loading wheel when redirecting
  if (redirectLoading) {
    return <LoadingWheel title="מכין את החשבון שלך..." message="אנא המתן בסבלנות." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bdb4c0">
      <div className="bg-white p-10 rounded-lg shadow-xl w-96" dir="rtl">
        <h1 className="text-black text-2xl mb-5 text-right">התחברות</h1>
        <input 
          type="email" 
          placeholder="מייל" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder:text-right ltr text-left"
        />
        <input 
          type="password" 
          placeholder="סיסמא" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder:text-right ltr text-left"
        />
        <button 
          onClick={handleLogin}
          className="roup relative flex-mid w-full p-3 bg-green-600 rounded text-white hover:bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'מתחבר...' : 'התחבר'}
        </button>
        {error && (
          <p className="text-red-400 mt-2 text-right">שגיאה בהתחברות</p>
        )}
        {roleError && (
          <p className="text-red-400 mt-2 text-right">{roleError}</p>
        )}
        <p className="text-black mt-3 text-sm text-right">
          אין משתמש?{' '}
          <Link href="/sign-up" className="text-indigo-400 hover:text-indigo-300">
            הרשמה
          </Link>
        </p>
           <p className="text-black mt-3 text-sm text-right">
            שכחת סיסמא?{' '}
           <Link href="/ForgotPassword" className="text-indigo-400 hover:text-indigo-300">
           שחזור
           </Link>
         </p>
      </div>
    </div>
  );
};

export default Login;