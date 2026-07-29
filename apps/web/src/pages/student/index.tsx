import { useEffect, useState } from 'react'
import axios from 'axios'

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null)
  useEffect(() => {
    const t = localStorage.getItem('esms_token')
    if (!t) return
    axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/student/profile', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => setProfile(r.data))
      .catch(() => setProfile(null))
  }, [])

  if (!profile) return <div className="p-6">Loading...</div>
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Student Dashboard</h1>
      <section>
        <h2 className="text-lg font-medium">Profile</h2>
        <div className="mt-2 p-4 border rounded">
          <div className="font-semibold">{profile.user?.profile?.fullName}</div>
          <div className="text-sm text-gray-600">Student ID: {profile.studentId}</div>
          <div className="text-sm text-gray-600">Class: {profile.class?.name}</div>
        </div>
      </section>
    </div>
  )
}
