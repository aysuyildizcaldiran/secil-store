'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/slices/authSlice'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { token, loading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(login({ username, password }))
  }

  useEffect(() => {
    if (token) {
      router.push('/collections')
    }
  }, [token, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-100 to-blue-100">
      <div className="w-full max-w-xl min-h-[80vh] flex flex-col items-center justify-center bg-white border border-gray-200 rounded-3xl shadow-2xl px-10 py-12">
        <div className="flex flex-col items-center mb-10">
          <span className="text-5xl font-extrabold tracking-widest text-indigo-600 mb-2 select-none">LOGO</span>
          <p className="text-gray-500 text-sm">Hesabınıza giriş yapın</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
              E-Posta
            </label>
            <input
              id="username"
              type="email"
              placeholder="johnsondoe@nomail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-base bg-white"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="**************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-base bg-white"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition"
              style={{ top: 'calc(50% + 0.5rem)' }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.562 2.175A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-1.562-2.175A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-400 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="rememberMe" className="text-gray-600 text-sm select-none">Beni Hatırla</label>
          </div>
          {error && <div className="text-red-500 text-sm text-center mt-1">{error}</div>}
          {loading && <div className="text-gray-500 text-sm text-center mt-1">Giriş yapılıyor...</div>}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 disabled:opacity-60 mt-2"
            disabled={loading}
          >
            Giriş Yap
          </button>
        </form>
        <div className="mt-6 text-sm text-gray-500">
          Hesabınız yok mu? <a href="/register" className="text-indigo-600 hover:underline">Kayıt Ol</a>
        </div>
      </div>
    </main>
  )
}
