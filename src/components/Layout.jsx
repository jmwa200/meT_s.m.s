import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ]

  // Add role-specific navigation items
  if (user?.role === 1) { // Admin
    navigation.push(
      { name: 'Students', href: '/students', icon: UserGroupIcon },
      { name: 'Teachers', href: '/teachers', icon: AcademicCapIcon },
      { name: 'Classes', href: '/classes', icon: BookOpenIcon },
      { name: 'Subjects', href: '/subjects', icon: DocumentTextIcon },
      { name: 'Attendance', href: '/attendance', icon: ClipboardDocumentListIcon },
      { name: 'Grades', href: '/grades', icon: ChartBarIcon },
      { name: 'Assignments', href: '/assignments', icon: DocumentTextIcon }
    )
  } else if (user?.role === 2) { // Teacher
    navigation.push(
      { name: 'My Classes', href: '/classes', icon: BookOpenIcon },
      { name: 'Attendance', href: '/attendance', icon: ClipboardDocumentListIcon },
      { name: 'Grades', href: '/grades', icon: ChartBarIcon },
      { name: 'Assignments', href: '/assignments', icon: DocumentTextIcon }
    )
  } else if (user?.role === 3) { // Student
    navigation.push(
      { name: 'My Classes', href: '/classes', icon: BookOpenIcon },
      { name: 'My Attendance', href: '/attendance', icon: ClipboardDocumentListIcon },
      { name: 'My Grades', href: '/grades', icon: ChartBarIcon },
      { name: 'Assignments', href: '/assignments', icon: DocumentTextIcon }
    )
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} location={location} onLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-1 flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent navigation={navigation} location={location} onLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, location, onLogout, user }) => {
  const getRoleDisplay = (role) => {
    switch (role) {
      case 1: return 'Admin'
      case 2: return 'Teacher'
      case 3: return 'Student'
      default: return 'User'
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">School Management</h1>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <div className="px-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplay(user?.role)}</p>
            </div>
          </div>
          <nav className="px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400" />
          Sign out
        </button>
      </div>
    </>
  )
}

export default Layout