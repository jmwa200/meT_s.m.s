import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const Attendance = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/')
      setAttendance(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'P': return 'bg-green-100 text-green-800'
      case 'A': return 'bg-red-100 text-red-800'
      case 'L': return 'bg-yellow-100 text-yellow-800'
      case 'E': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'P': return 'Present'
      case 'A': return 'Absent'
      case 'L': return 'Late'
      case 'E': return 'Excused'
      default: return status
    }
  }

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = 
      record.student?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.class_session?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.class_session?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateFilter || record.date === dateFilter
    const matchesStatus = !statusFilter || record.status === statusFilter
    
    return matchesSearch && matchesDate && matchesStatus
  })

  const getPageTitle = () => {
    switch (user?.role) {
      case 1: return 'All Attendance Records'
      case 2: return 'Class Attendance'
      case 3: return 'My Attendance'
      default: return 'Attendance'
    }
  }

  const getPageDescription = () => {
    switch (user?.role) {
      case 1: return 'View and manage all attendance records'
      case 2: return 'Track attendance for your classes'
      case 3: return 'View your attendance history'
      default: return 'Attendance information'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="mt-2 text-sm text-gray-700">{getPageDescription()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <input
            type="date"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="P">Present</option>
            <option value="A">Absent</option>
            <option value="L">Late</option>
            <option value="E">Excused</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setSearchTerm('')
              setDateFilter('')
              setStatusFilter('')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {user?.role !== 3 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marked By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-200">
                  {user?.role !== 3 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">
                              {record.student?.user?.first_name?.[0]}{record.student?.user?.last_name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.student?.user?.first_name} {record.student?.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.student?.student_id}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.class_session?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.class_session?.subject?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.marked_by?.first_name} {record.marked_by?.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAttendance.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || dateFilter || statusFilter 
                ? 'Try adjusting your filters.' 
                : 'No attendance records available at the moment.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance