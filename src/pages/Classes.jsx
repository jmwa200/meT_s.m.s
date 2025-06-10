import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const Classes = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes/')
      setClasses(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = classes.filter(classItem =>
    classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacher?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacher?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (classItem) => {
    setSelectedClass(classItem)
    setShowModal(true)
  }

  const getPageTitle = () => {
    switch (user?.role) {
      case 1: return 'All Classes'
      case 2: return 'My Classes'
      case 3: return 'My Classes'
      default: return 'Classes'
    }
  }

  const getPageDescription = () => {
    switch (user?.role) {
      case 1: return 'Manage all classes and their details'
      case 2: return 'View and manage your assigned classes'
      case 3: return 'View your enrolled classes and schedules'
      default: return 'Class information'
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

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleViewDetails(classItem)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {classItem.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {classItem.student_count || 0}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Subject:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {classItem.subject?.name} ({classItem.subject?.code})
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Teacher:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {classItem.teacher?.user?.first_name} {classItem.teacher?.user?.last_name}
                  </span>
                </div>
                
                {classItem.room_number && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Room:</span>
                    <span className="ml-2 text-sm text-gray-900">{classItem.room_number}</span>
                  </div>
                )}
                
                {classItem.schedule_time && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Time:</span>
                    <span className="ml-2 text-sm text-gray-900">{classItem.schedule_time}</span>
                  </div>
                )}
                
                {classItem.schedule_days && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Days:</span>
                    <span className="ml-2 text-sm text-gray-900">{classItem.schedule_days}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Credits: {classItem.subject?.credits || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    Capacity: {classItem.student_count || 0}/{classItem.max_capacity || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No classes available at the moment.'}
            </p>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Class Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClass.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedClass.subject?.name} ({selectedClass.subject?.code})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedClass.teacher?.user?.first_name} {selectedClass.teacher?.user?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClass.room_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClass.schedule_time || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schedule Days</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClass.schedule_days || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credits</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClass.subject?.credits || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enrollment</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedClass.student_count || 0} / {selectedClass.max_capacity || 0} students
                    </p>
                  </div>
                </div>
                
                {selectedClass.subject?.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClass.subject.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Classes