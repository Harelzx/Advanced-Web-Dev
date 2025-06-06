'use client'
import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [redirectLoading, setRedirectLoading] = useState(false); //added states

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (user && user.user) {
        setRedirectLoading(true); //loading
        try {
          //get user data from firebase
          const userDocRef = doc(db, 'users', user.user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;
            sessionStorage.setItem('user', true);
            sessionStorage.setItem('uid', user.user.uid);
            sessionStorage.setItem('Name', userData.name);
            setEmail('');
            setPassword('');
            if (role === 'teacher' || role === 'parent') {
              router.push('/dashboard');
            } else if (role === 'student') {
              //check if collection results exists for firstquiz
              try {
                const resultsRef = collection(db, `users/${user.user.uid}/results`);
                const resultsSnapshot = await getDocs(resultsRef);
                if (resultsSnapshot.empty) {
                  // collection doesnt exist redirect to firstquiz
                  router.push('/FirstQuiz');
                } else {
                  // results exist then go to main
                  router.push('/Main_Page');
                }
              } catch (resultsError) {
                console.error('Error checking results collection:', resultsError);
                // default main-page(incase of errors etc)
                router.push('/Main_Page');
              }
            } else {
              setRoleError('Unknown user role.');
              setRedirectLoading(false); // Stop loading on error
            }
          } else {
            setRoleError('User data not found.');
            setRedirectLoading(false); // Stop loading on error
          }
        } catch (err) {
          setRoleError('Error fetching user data.');
          console.error(err);
          setRedirectLoading(false); // Stop loading on error
        }
      }
    };

    checkRoleAndRedirect();
  }, [user, router]);

  // login click
  const handleLogin = () => {
    setRoleError('');
    signInWithEmailAndPassword(email, password);
  };

  //loading screen when redirecting
  if (redirectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl">Setting up your account...</h2>
          <p className="text-gray-300 mt-2">Please wait while we redirect you.</p>
        </div>
      </div>
    );
  }

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
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && (
          <p className="text-red-400 mt-2">Wrong credentials</p>
        )}
        {roleError && (
          <p className="text-red-400 mt-2">{roleError}</p>
        )}
        <p className="text-white mt-3 text-sm">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-indigo-400 hover:text-indigo-300">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;