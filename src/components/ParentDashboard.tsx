import React, { useState, useEffect } from 'react';
import {
  currentParent,
  parentChildren,
  assignmentsData,
  messagesData,
  academicReports,
  getUnreadMessages,
  getPendingAssignments,
  getUpcomingAssignments,
  type Assignment,
  type Message,
  type AcademicReport
} from '../data/parentData';

interface ParentDashboardProps {
  onLogout: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'assignments' | 'messages' | 'reports'>('overview');
  const [unreadMessages, setUnreadMessages] = useState(messagesData.filter(m => !m.isRead));
  const [pendingAssignments, setPendingAssignments] = useState(getPendingAssignments(assignmentsData));
  const [upcomingAssignments, setUpcomingAssignments] = useState(getUpcomingAssignments(assignmentsData));

  useEffect(() => {
    // Auto-refresh data setiap 30 detik
    const interval = setInterval(() => {
      setUnreadMessages(getUnreadMessages(messagesData));
      setPendingAssignments(getPendingAssignments(assignmentsData));
      setUpcomingAssignments(getUpcomingAssignments(assignmentsData));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    onLogout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'submitted': return 'text-green-600 bg-green-100';
      case 'graded': return 'text-purple-600 bg-purple-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '🔴';
      case 'normal': return '🟡';
      case 'low': return '🟢';
      default: return '📨';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {currentParent.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Portal Orang Tua
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selamat datang, {currentParent.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8">
          {[
            { id: 'overview', label: 'Ringkasan', icon: '📊' },
            { id: 'children', label: 'Anak', icon: '👨‍👩‍👧‍👦' },
            { id: 'assignments', label: 'Tugas', icon: '📚' },
            { id: 'messages', label: `Pesan ${unreadMessages.length > 0 ? `(${unreadMessages.length})` : ''}`, icon: '💬' },
            { id: 'reports', label: 'Rapor', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'children' | 'assignments' | 'messages' | 'reports')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ringkasan Akademik</h2>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Anak Aktif</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{parentChildren.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">👨‍👩‍👧‍👦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Tugas Pending</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{pendingAssignments.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">📚</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">Pesan Baru</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{unreadMessages.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">💬</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Rata-rata Nilai</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">87.5</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Assignments */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tugas Mendatang</h3>
                <div className="space-y-3">
                  {upcomingAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.subject} • {assignment.teacherName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status === 'assigned' ? 'Aktif' : assignment.status === 'overdue' ? 'Terlambat' : 'Selesai'}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Batas: {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pesan Terbaru</h3>
                <div className="space-y-3">
                  {unreadMessages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-lg">{getPriorityIcon(message.priority)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{message.subject}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dari: {message.from.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Informasi Anak</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parentChildren.map((child) => (
                  <div key={child.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={child.profileImage || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face`}
                        alt={child.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{child.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{child.class}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">ID: {child.studentId}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tanggal Lahir:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(child.dateOfBirth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tahun Akademik:</span>
                        <span className="text-gray-900 dark:text-white">{child.academicYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {child.status === 'active' ? 'Aktif' : child.status === 'graduate' ? 'Lulus' : 'Tidak Aktif'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tugas & Penilaian</h2>

              {/* Assignment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-400 text-sm">Total Tugas</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{assignmentsData.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-green-600 dark:text-green-400 text-sm">Sudah Dikumpul</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {assignmentsData.filter(a => a.status === 'submitted' || a.status === 'graded').length}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-orange-600 dark:text-orange-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{pendingAssignments.length}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">Terlambat</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {assignmentsData.filter(a => a.status === 'overdue').length}
                  </p>
                </div>
              </div>

              {/* Assignment List */}
              <div className="space-y-4">
                {assignmentsData.map((assignment) => (
                  <div key={assignment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{assignment.subject} • {assignment.teacherName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Diberikan: {formatDate(assignment.assignedDate)} • Batas: {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status === 'assigned' ? 'Aktif' :
                         assignment.status === 'submitted' ? 'Dikumpulkan' :
                         assignment.status === 'graded' ? 'Dinilai' : 'Terlambat'}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">{assignment.description}</p>

                    {assignment.instructions && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Instruksi:</h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm whitespace-pre-line">{assignment.instructions}</p>
                      </div>
                    )}

                    {assignment.submission && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Status Pengumpulan:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-green-700 dark:text-green-300">Dikumpulkan:</span>
                            <p className="font-medium">{formatDate(assignment.submission.submittedAt)}</p>
                          </div>
                          {assignment.submission.score && (
                            <div>
                              <span className="text-green-700 dark:text-green-300">Nilai:</span>
                              <p className="font-medium">{assignment.submission.score}/{assignment.maxScore}</p>
                            </div>
                          )}
                          {assignment.submission.feedback && (
                            <div className="md:col-span-3">
                              <span className="text-green-700 dark:text-green-300">Feedback:</span>
                              <p className="font-medium mt-1">{assignment.submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pesan & Komunikasi</h2>
              <div className="space-y-4">
                {messagesData.map((message) => (
                  <div key={message.id} className={`p-4 rounded-lg border-l-4 ${
                    !message.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span>{getPriorityIcon(message.priority)}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{message.subject}</h3>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{message.content}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dari: {message.from.name} ({message.from.role})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Laporan Akademik</h2>
              <div className="space-y-6">
                {academicReports.map((report) => (
                  <div key={report.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Rapor Semester {report.semester} - {report.academicYear}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{report.studentName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">IPK</p>
                        <p className="text-2xl font-bold text-green-600">{report.overallGPA}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tingkat Kehadiran</p>
                        <p className="text-xl font-semibold text-blue-600">{report.attendanceRate}%</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah Mata Pelajaran</p>
                        <p className="text-xl font-semibold text-purple-600">{report.subjects.length}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white">Detail Nilai per Mata Pelajaran</h4>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {report.subjects.map((subject, index) => (
                          <div key={index} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{subject.name}</h5>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{subject.teacher}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {subject.midtermScore && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">UTS:</span>
                                  <p className="font-medium">{subject.midtermScore}</p>
                                </div>
                              )}
                              {subject.finalScore && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">UAS:</span>
                                  <p className="font-medium">{subject.finalScore}</p>
                                </div>
                              )}
                              {subject.assignmentScore && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Tugas:</span>
                                  <p className="font-medium">{subject.assignmentScore}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Nilai Akhir:</span>
                                <p className="font-bold text-green-600">{subject.finalGrade} ({subject.gradePoint})</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {report.teacherComments && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Komentar Guru:</h5>
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">{report.teacherComments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;