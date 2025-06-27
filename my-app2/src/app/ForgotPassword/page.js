'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/Button';
import Input from '../components/Input';
import BackButton from '../components/about/BackButton'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('בקשת איפוס סיסמא נשלחה בהצלחה. בדוק את תיבת הדואר שלך.');
      setEmail('');
    } catch (err) {
      setError('שגיאה בשליחת בקשת איפוס: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center panels">
      <div className="panels p-10 rounded-lg shadow-xl w-96 relative" dir="rtl">
        <BackButton href="/login" variant="arrow" ariaLabel="חזרה להתחברות" />
        <h1 className="text-black text-2xl mb-5 text-right">איפוס סיסמא</h1>
        <form onSubmit={handleResetPassword}>
          <Input
            type="email"
            placeholder="מייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'שולח...' : 'שליחת בקשת איפוס'}
          </Button>
        </form>
        {error && (
          <p className="text-red-400 mt-2 text-right">{error}</p>
        )}
        {success && (
          <p className="text-green-400 mt-2 text-right">{success}</p>
        )}
        <p className="text-black mt-3 text-sm text-right">
          חזרה ל{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            התחברות
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;