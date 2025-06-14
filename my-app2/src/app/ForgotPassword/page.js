'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/Button';
import Input from '../components/Input'; 

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
    <div className="min-h-screen flex items-center justify-center bg-bdb4c0">
      <div className="bg-white p-10 rounded-lg shadow-xl w-96 relative" dir="rtl">
        <Link
          href="/login"
          className="absolute right-4 top-4 text-black text-2xl hover:text-indigo-400"
          aria-label="חזרה להתחברות"
        >
          →
        </Link>
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