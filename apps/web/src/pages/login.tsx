import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/auth/login',
        { username, password },
        { withCredentials: true }
      )
      const { user } = res.data
      if (user.role === 'ADMIN') router.push('/admin')
      else if (user.role === 'TEACHER') router.push('/teacher')
      else router.push('/student')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow rounded">
        <h1 className="text-2xl font-semibold mb-6">ESMS — Login</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  )
}
