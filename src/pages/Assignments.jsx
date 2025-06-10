import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { DocumentTextIcon, MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline'

const Assignments = () => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments/')
      setAssignments(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'P': return 'bg-green-100 text-green-800'
      case 'D': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'P': return 'Published'
      case 'D': return 'Draft'
      case 'C': return 'Closed'
      default: return status
    }
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class_session?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class_session?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment)
    setShowModal(true)
  }

  const getPageTitle = () => {
    switch (user?.role) {
      case 1: return 'All Assignments'
      case 2: return 'My Assignments'
      case 3: return 'My Assignments'
      default: return 'Assignments'
    }
  }

  const getPageDescription = () => {
    switch (user?.role) {
      case 1: return 'View and manage all assignments'
      case 2: return 'Manage assignments for your classes'
      case 3: return 'View your assigned work and deadlines'
      default: return 'Assignment information'
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="P">Published</option>
            <option value="D">Draft</option>
            <option value="C">Closed</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleViewDetails(assignment)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {assignment.class_session?.name}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Subject:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {assignment.class_session?.subject?.name}
                  </span>
                </div>
                
                {user?.role !== 2 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Teacher:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {assignment.teacher?.user?.first_name} {assignment.teacher?.user?.last_name}
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Max Points:</span>
                  <span className="ml-2 text-sm text-gray-900">{assignment.max_points}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span className={isOverdue(assignment.due_date) ? 'text-red-600 font-medium' : ''}>
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {assignment.submission_count || 0} submissions
                </div>
              </div>
              
              {isOverdue(assignment.due_date) && assignment.status === 'P' && (
                <div className="mt-2 p-2 bg-red-50 rounded-md">
                  <p className="text-xs text-red-700 font-medium">Overdue</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter 
                ? 'Try adjusting your filters.' 
                : 'No assignments available at the moment.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Assignment Details Modal */}
      {showModal && selectedAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assignment Details</h3>
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
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedAssignment.title}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                      {getStatusText(selectedAssignment.status)}
                    </span>
                    {isOverdue(selectedAssignment.due_date) && selectedAssignment.status === 'P' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.class_session?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.class_session?.subject?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAssignment.teacher?.user?.first_name} {selectedAssignment.teacher?.user?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Points</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.max_points}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className={`mt-1 text-sm ${isOverdue(selectedAssignment.due_date) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(selectedAssignment.due_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submissions</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.submission_count || 0}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedAssignment.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedAssignment.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assignments