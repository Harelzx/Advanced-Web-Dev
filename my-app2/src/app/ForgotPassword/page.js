'use client'
import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/app/firebase/config'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('נא להכניס כתובת מייל תקינה')
      return
    }

    try {
      setError('')
      setMessage('')
      setLoading(true)
      
      await sendPasswordResetEmail(auth, email)
      setMessage('נשלח בקשת איפוס למייל שסופק')
    } catch (error) {
      setError('Failed to send reset email. Please check your email address.')
      console.error('שגיאה בשליחת איפוס סיסמא:', error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bdb4c0">
      <div className="bg-white p-10 rounded-lg shadow-xl w-96" dir="rtl">
            <Link href="/" className="text-black text-2xl hover:text-black-400" aria-label="חזרה להתחברות">
                →
            </Link>
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-black">אפס את הסיסמה שלך</h2>
                <p className="mt-2 text-sm text-black-600">הזן את כתובת הדוא"ל שלך ואנו נשלח לך קישור לאיפוס הסיסמה שלך</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                <div>
                    <label htmlFor="email" className="sr-only">
                    כתובת מייל
                    </label>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 placeholder:text-right ltr text-left"
                    placeholder="כתובת מייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {error && (
                    <div className="text-red-600 text-sm text-center">
                    {error}
                    </div>
                )}
                {message && (
                    <div className="text-green-600 text-sm text-center">
                    {message}
                    </div>
                )}
                <div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex-mid w-full p-3 bg-green-600 rounded text-white hover:bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {loading ? 'שולח....' : 'שליחת בקשת איפוס'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}