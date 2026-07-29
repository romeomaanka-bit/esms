import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<any[]>([])
  useEffect(() => {
    const t = localStorage.getItem('esms_token')
    if (!t) return
    axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/admin/teachers', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => setTeachers(r.data))
      .catch(() => setTeachers([]))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <section>
        <h2 className="text-lg font-medium">Teachers</h2>
        <ul className="mt-2 space-y-2">
          {teachers.map(t => (
            <li key={t.id} className="p-2 border rounded">
              <div className="font-semibold">{t.user?.profile?.fullName || t.user?.username}</div>
              <div className="text-sm text-gray-600">username: {t.user?.username}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
