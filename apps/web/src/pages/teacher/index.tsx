import { useEffect, useState } from 'react'
import axios from 'axios'

export default function TeacherDashboard() {
  const [timetable, setTimetable] = useState<any[]>([])
  useEffect(() => {
    axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/teacher/timetable', { withCredentials: true })
      .then(r => setTimetable(r.data))
      .catch(() => setTimetable([]))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Teacher Dashboard</h1>
      <section>
        <h2 className="text-lg font-medium">My Timetable</h2>
        <ul className="mt-2 space-y-2">
          {timetable.map(tt => (
            <li key={tt.id} className="p-2 border rounded">
              <div>{tt.day} — {new Date(tt.startTime).toLocaleTimeString()} - {new Date(tt.endTime).toLocaleTimeString()}</div>
              <div className="text-sm text-gray-600">Subject: {tt.subject?.name} • Class: {tt.class?.name}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
