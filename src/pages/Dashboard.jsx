import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplay = (role) => {
    switch (role) {
      case 1: return 'Admin'
      case 2: return 'Teacher'
      case 3: return 'Student'
      default: return 'User'
    }
  }

  const getStatsForRole = () => {
    if (user?.role === 1) { // Admin
      return [
        { name: 'Total Students', value: dashboardData.total_students || 0, icon: UserGroupIcon, color: 'bg-blue-500' },
        { name: 'Total Teachers', value: dashboardData.total_teachers || 0, icon: AcademicCapIcon, color: 'bg-green-500' },
        { name: 'Total Classes', value: dashboardData.total_classes || 0, icon: BookOpenIcon, color: 'bg-purple-500' },
        { name: 'Total Subjects', value: dashboardData.total_subjects || 0, icon: DocumentTextIcon, color: 'bg-yellow-500' },
        { name: 'Recent Registrations', value: dashboardData.recent_registrations || 0, icon: UserGroupIcon, color: 'bg-indigo-500' }
      ]
    } else if (user?.role === 2) { // Teacher
      return [
        { name: 'My Classes', value: dashboardData.my_classes || 0, icon: BookOpenIcon, color: 'bg-blue-500' },
        { name: 'Total Students', value: dashboardData.total_students || 0, icon: UserGroupIcon, color: 'bg-green-500' },
        { name: 'Pending Assignments', value: dashboardData.pending_assignments || 0, icon: DocumentTextIcon, color: 'bg-yellow-500' },
        { name: 'Recent Submissions', value: dashboardData.recent_submissions || 0, icon: ClipboardDocumentListIcon, color: 'bg-purple-500' }
      ]
    } else if (user?.role === 3) { // Student
      return [
        { name: 'Enrolled Classes', value: dashboardData.enrolled_classes || 0, icon: BookOpenIcon, color: 'bg-blue-500' },
        { name: 'Pending Assignments', value: dashboardData.pending_assignments || 0, icon: DocumentTextIcon, color: 'bg-yellow-500' },
        { name: 'Average Grade', value: `${(dashboardData.average_grade || 0).toFixed(1)}%`, icon: ChartBarIcon, color: 'bg-green-500' },
        { name: 'Attendance Rate', value: `${dashboardData.attendance_rate || 0}%`, icon: ClipboardDocumentListIcon, color: 'bg-purple-500' }
      ]
    }
    return []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const stats = getStatsForRole()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.first_name} {user?.last_name} ({getRoleDisplay(user?.role)})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {user?.role === 3 && ( // Student specific sections
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/assignments"
                className="block p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-blue-900 font-medium">View Assignments</span>
                </div>
              </a>
              <a
                href="/grades"
                className="block p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-900 font-medium">Check Grades</span>
                </div>
              </a>
              <a
                href="/attendance"
                className="block p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-purple-900 font-medium">View Attendance</span>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Grade</span>
                  <span className="font-medium">{(dashboardData.average_grade || 0).toFixed(1)}%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(dashboardData.average_grade || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-medium">{dashboardData.attendance_rate || 0}%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dashboardData.attendance_rate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard