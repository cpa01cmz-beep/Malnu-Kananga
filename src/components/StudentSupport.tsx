// Student Support Component - Interface for automated student support system
// Komponen untuk menampilkan dan mengelola sistem dukungan siswa

import React, { useState, useEffect } from 'react';
import { StudentSupportService, SupportRequest, SupportResource, StudentProgress } from '../services/studentSupportService';
import RealTimeMonitoringService from '../services/realTimeMonitoringService';

interface StudentSupportProps {
  studentId: string;
}

const StudentSupport: React.FC<StudentSupportProps> = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'resources' | 'progress'>('dashboard');
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [newRequest, setNewRequest] = useState({
    type: 'academic' as const,
    category: '',
    title: '',
    description: '',
    priority: 'medium' as const
  });
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSupportData();
    
    // Track student session for real-time monitoring
    const monitoringService = RealTimeMonitoringService.getInstance();
    monitoringService.trackStudentSession(studentId, {
      studentId,
      timestamp: new Date().toISOString(),
      loginFrequency: 1,
      pageViews: 1,
      timeOnPortal: 0,
      resourceAccess: 0,
      assignmentProgress: 0,
      lastLogin: new Date().toISOString(),
      currentSession: {
        startTime: new Date().toISOString(),
        pagesVisited: ['student-support'],
        timeSpent: 0,
        interactions: 0
      }
    });
  }, [studentId]);

  const loadSupportData = () => {
    // Load student's support requests
    const requests = StudentSupportService.getSupportRequests();
     setSupportRequests(requests.filter(req => req.studentId === studentId));

    // Load available resources
    const allResourcesPromise = StudentSupportService.getRelevantResources('');
    allResourcesPromise.then(allResources => {
      setResources(allResources);
    });

    // Load student progress
    const progress = StudentSupportService.getStudentProgress(studentId);
    setStudentProgress(progress || null);
  };

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description) {
      alert('Mohon lengkapi judul dan deskripsi permintaan');
      return;
    }

    const request = StudentSupportService.createSupportRequest(
      studentId,
      newRequest.type,
      newRequest.category || 'umum',
      newRequest.title,
      newRequest.description,
      newRequest.priority
    );

    setSupportRequests([...supportRequests, request]);
    
    // Track support request for monitoring
    const monitoringService = RealTimeMonitoringService.getInstance();
    monitoringService.trackResourceAccess(studentId, `support-request-${request.id}`);
    
    setNewRequest({
      type: 'academic',
      category: '',
      title: '',
      description: '',
      priority: 'medium'
    });
    setShowNewRequestForm(false);
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-blue-600';
      case 'resolved': return 'text-green-600';
      case 'escalated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Pusat Dukungan Siswa</h1>
          <p className="text-gray-600 mt-2">Sistem dukungan akademis dan teknis otomatis</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'requests', label: 'Permintaan Saya', icon: '📝' },
              { id: 'resources', label: 'Resources', icon: '📚' },
              { id: 'progress', label: 'Progress', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-2xl font-bold">
                    {supportRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-blue-800 text-sm">Menunggu Respon</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-2xl font-bold">
                    {supportRequests.filter(r => r.status === 'resolved').length}
                  </div>
                  <div className="text-green-800 text-sm">Selesai</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-purple-600 text-2xl font-bold">{resources.length}</div>
                  <div className="text-purple-800 text-sm">Resources Tersedia</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold ${getRiskLevelColor(studentProgress?.riskLevel || 'low')}`}>
                    {studentProgress?.riskLevel.toUpperCase() || 'LOW'}
                  </div>
                  <div className="text-orange-800 text-sm">Tingkat Risiko</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Aktivitas Terkini</h3>
                <div className="space-y-2">
                  {supportRequests.slice(0, 3).map(request => (
                    <div key={request.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{request.title}</span>
                        <span className={`ml-2 ${getStatusColor(request.status)}`}>
                          ({request.status})
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowNewRequestForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  📝 Buat Permintaan Baru
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  📚 Jelajahi Resources
                </button>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Permintaan Dukungan Saya</h2>
                <button
                  onClick={() => setShowNewRequestForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Permintaan Baru
                </button>
              </div>

              {supportRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>Belum ada permintaan dukungan</p>
                  <p className="text-sm">Buat permintaan baru untuk mendapatkan bantuan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportRequests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`text-sm ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{request.type} - {request.category}</span>
                        <span>{new Date(request.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      {request.resolution && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-800 mb-1">Resolusi:</div>
                          <div className="text-sm text-green-700 whitespace-pre-line">{request.resolution}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Resources Pembelajaran</h2>
                <input
                  type="text"
                  placeholder="Cari resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map(resource => (
                  <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">
                        {resource.type === 'guide' ? '📖' : 
                         resource.type === 'video' ? '🎥' : 
                         resource.type === 'document' ? '📄' : '🔧'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                        <span className="text-xs text-gray-500">{resource.category} - {resource.difficulty}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{resource.content}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Buka Resource →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Progress Akademik</h2>
              
              {studentProgress ? (
                <div className="space-y-6">
                  {/* Academic Metrics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Metrik Akademik</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">IPK</div>
                        <div className="text-2xl font-bold text-blue-600">{studentProgress.academicMetrics.gpa}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Trend Nilai</div>
                        <div className={`text-2xl font-bold ${
                          studentProgress.academicMetrics.gradeTrend === 'improving' ? 'text-green-600' :
                          studentProgress.academicMetrics.gradeTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {studentProgress.academicMetrics.gradeTrend === 'improving' ? '📈 Meningkat' :
                           studentProgress.academicMetrics.gradeTrend === 'declining' ? '📉 Menurun' : '➡️ Stabil'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Kehadiran</div>
                        <div className="text-2xl font-bold text-green-600">{studentProgress.academicMetrics.attendanceRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Penyelesaian Tugas</div>
                        <div className="text-2xl font-bold text-purple-600">{studentProgress.academicMetrics.assignmentCompletion}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Metrik Keterlibatan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Frekuensi Login</div>
                        <div className="text-2xl font-bold text-blue-600">{studentProgress.engagementMetrics.loginFrequency}/minggu</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Akses Resource</div>
                        <div className="text-2xl font-bold text-green-600">{studentProgress.engagementMetrics.resourceAccess}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Permintaan Support</div>
                        <div className="text-2xl font-bold text-orange-600">{studentProgress.engagementMetrics.supportRequests}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Skor Partisipasi</div>
                        <div className="text-2xl font-bold text-purple-600">{studentProgress.engagementMetrics.participationScore}</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className={`p-4 rounded-lg ${
                    studentProgress.riskLevel === 'low' ? 'bg-green-50' :
                    studentProgress.riskLevel === 'medium' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <h3 className="font-semibold mb-2">Assesmen Risiko</h3>
                    <div className={`text-lg font-bold ${
                      studentProgress.riskLevel === 'low' ? 'text-green-600' :
                      studentProgress.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Tingkat Risiko: {studentProgress.riskLevel.toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Update terakhir: {new Date(studentProgress.lastUpdated).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Belum ada data progress yang tersedia</p>
                  <p className="text-sm">Data akan muncul setelah sistem memonitor aktivitas Anda</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Buat Permintaan Dukungan Baru</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({...newRequest, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="academic">Akademis</option>
                  <option value="technical">Teknis</option>
                  <option value="administrative">Administratif</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                  placeholder="contoh: login, tugas, ujian"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Judul permintaan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Jelaskan masalah atau bantuan yang Anda butuhkan"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="urgent">Darurat</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewRequestForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleCreateRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kirim Permintaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSupport;