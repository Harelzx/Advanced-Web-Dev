"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const userId = sessionStorage.getItem('uid');
        const userLoggedIn = sessionStorage.getItem('user');
        
        if (!userId || !userLoggedIn) {
          console.log('No authentication found - redirecting to login');
          router.push('/login');
          return;
        }
        
        // If no role restrictions, just check authentication
        if (allowedRoles.length === 0) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Check user role from Firebase
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          console.log('User document not found - redirecting to login');
          router.push('/login');
          return;
        }
        
        const userData = userDocSnap.data();
        const userRole = userData.role;
        
        if (!allowedRoles.includes(userRole)) {
          console.log(`Access denied. User role: ${userRole}, Required: ${allowedRoles}`);
          // Redirect based on role
          if (userRole === 'teacher' || userRole === 'parent') {
            router.push('/dashboard');
          } else if (userRole === 'student') {
            router.push('/Main_Page');
          } else {
            router.push('/login');
          }
          return;
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication/role:', error);
        router.push('/login');
      }
    };

    checkAuthAndRole();
  }, [router, allowedRoles]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">...בודק הרשאות</p>
          <p className="text-gray-500 text-sm mt-2">מתחבר למערכת</p>
        </div>
      </div>
    );
  }

  // Show children only if authenticated
  if (isAuthenticated) {
    return children;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute; 