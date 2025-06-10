import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { ChartBarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const Grades = () => {
  const { user } = useAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    fetchGrades()
    fetchSubjects()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades/')
      setGrades(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/')
      setSubjects(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.student?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.assignment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = !subjectFilter || grade.subject?.id.toString() === subjectFilter
    
    return matchesSearch && matchesSubject
  })

  const calculateAverageGrade = () => {
    if (filteredGrades.length === 0) return 0
    const total = filteredGrades.reduce((sum, grade) => sum + parseFloat(grade.percentage || 0), 0)
    return (total / filteredGrades.length).toFixed(1)
  }

  const getPageTitle = () => {
    switch (user?.role) {
      case 1: return 'All Grades'
      case 2: return 'Student Grades'
      case 3: return 'My Grades'
      default: return 'Grades'
    }
  }

  const getPageDescription = () => {
    switch (user?.role) {
      case 1: return 'View and manage all student grades'
      case 2: return 'View grades for your students'
      case 3: return 'View your academic performance'
      default: return 'Grade information'
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
        {filteredGrades.length > 0 && (
          <div className="mt-4 sm:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {calculateAverageGrade()}%
                </div>
                <div className="text-sm text-gray-500">Average Grade</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setSearchTerm('')
              setSubjectFilter('')
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
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letter Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50 transition-colors duration-200">
                  {user?.role !== 3 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">
                              {grade.student?.user?.first_name?.[0]}{grade.student?.user?.last_name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {grade.student?.user?.first_name} {grade.student?.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.student?.student_id}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grade.subject?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {grade.subject?.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade.assignment_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade.grade} / {grade.max_grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getGradeColor(grade.percentage)}`}>
                      {grade.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getGradeLetter(grade.percentage) === 'A' ? 'bg-green-100 text-green-800' :
                      getGradeLetter(grade.percentage) === 'B' ? 'bg-blue-100 text-blue-800' :
                      getGradeLetter(grade.percentage) === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      getGradeLetter(grade.percentage) === 'D' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getGradeLetter(grade.percentage)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(grade.date_assigned).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredGrades.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No grades found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || subjectFilter 
                ? 'Try adjusting your filters.' 
                : 'No grades available at the moment.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Grades