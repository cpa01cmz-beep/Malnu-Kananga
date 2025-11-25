// Student Support Component - Interface for automated student support system
// Komponen untuk menampilkan dan mengelola sistem dukungan siswa

import React, { useState, useEffect } from 'react';
import { StudentSupportService, SupportRequest, SupportResource, StudentProgress } from '../services/studentSupportService';

interface StudentSupportProps {
  studentId: string;
}

const StudentSupport: React.FC<StudentSupportProps> = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'resources' | 'progress'>('dashboard');
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [newRequest, setNewRequest] = useState<{
    type: 'academic' | 'technical' | 'administrative' | 'personal';
    category: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    type: 'academic',
    category: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSupportData();
  }, [studentId]);

   const loadSupportData = async () => {
     const supportService = StudentSupportService.getInstance();
     
     // Load student's support requests
     const requests = supportService.getSupportRequests();
     setSupportRequests(requests.filter((req: SupportRequest) => req.studentId === studentId));

     // Load available resources
     const allResources = await supportService.getRelevantResources('');
     setResources(allResources);

     // Load student progress
     const progress = supportService.getStudentProgress(studentId);
     setStudentProgress(progress || null);
   };

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description) {
      alert('Mohon lengkapi judul dan deskripsi permintaan');
      return;
    }

     const supportService = StudentSupportService.getInstance();
     const request = supportService.createSupportRequest(
       studentId,
       newRequest.type,
       newRequest.category || 'umum',
       newRequest.title,
       newRequest.description,
       newRequest.priority
     );

    setSupportRequests([...supportRequests, request]);
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
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Pusat Dukungan Siswa</h1>
            <p className="text-blue-100 text-lg">Sistem dukungan akademis dan teknis otomatis 24/7</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                🤖 AI-Powered
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                📊 Real-time Monitoring
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                🚨 Automated Interventions
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                📱 24/7 Support
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-1 sm:space-x-2 px-4 sm:px-6 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'blue' },
              { id: 'requests', label: 'Permintaan Saya', icon: '📝', color: 'green' },
              { id: 'resources', label: 'Resources', icon: '📚', color: 'purple' },
              { id: 'progress', label: 'Progress', icon: '📈', color: 'orange' }
            ].map(tab => (
              <button
                key={tab.id}
                 onClick={() => setActiveTab(tab.id as 'dashboard' | 'requests' | 'resources' | 'progress')}
                 className={`flex items-center py-3 px-3 sm:px-4 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 lg:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-600 text-3xl font-bold">
                      {supportRequests.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-blue-500 text-2xl">⏳</div>
                  </div>
                  <div className="text-blue-800 font-medium">Menunggu Respon</div>
                  <div className="text-blue-600 text-xs mt-1">AI sedang memproses</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 lg:p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-green-600 text-3xl font-bold">
                      {supportRequests.filter(r => r.status === 'resolved').length}
                    </div>
                    <div className="text-green-500 text-2xl">✅</div>
                  </div>
                  <div className="text-green-800 font-medium">Selesai</div>
                  <div className="text-green-600 text-xs mt-1">Ditangani otomatis</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 lg:p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-purple-600 text-3xl font-bold">{resources.length}</div>
                    <div className="text-purple-500 text-2xl">📚</div>
                  </div>
                  <div className="text-purple-800 font-medium">Resources Tersedia</div>
                  <div className="text-purple-600 text-xs mt-1">Panduan & tutorial</div>
                </div>
                
                <div className={`bg-gradient-to-br p-4 lg:p-6 rounded-xl border hover:shadow-lg transition-shadow duration-200 ${
                  studentProgress?.riskLevel === 'high' 
                    ? 'from-red-50 to-red-100 border-red-200' 
                    : studentProgress?.riskLevel === 'medium'
                    ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                    : 'from-green-50 to-green-100 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-3xl font-bold ${getRiskLevelColor(studentProgress?.riskLevel || 'low')}`}>
                      {studentProgress?.riskLevel.toUpperCase() || 'LOW'}
                    </div>
                    <div className={`text-2xl ${
                      studentProgress?.riskLevel === 'high' 
                        ? 'text-red-500' 
                        : studentProgress?.riskLevel === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}>
                      {studentProgress?.riskLevel === 'high' ? '🚨' : studentProgress?.riskLevel === 'medium' ? '⚠️' : '😊'}
                    </div>
                  </div>
                  <div className="font-medium">Tingkat Risiko</div>
                  <div className="text-xs mt-1 opacity-75">
                    {studentProgress?.riskLevel === 'high' 
                      ? 'Perlu perhatian khusus'
                      : studentProgress?.riskLevel === 'medium'
                      ? 'Monitor teratur'
                      : 'Kondisi baik'
                    }
                  </div>
                </div>
              </div>

              {/* Enhanced Recent Activity */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🕐</span>
                    Aktivitas Terkini
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    Real-time
                  </span>
                </div>
                <div className="space-y-3">
                  {supportRequests.slice(0, 3).map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 truncate">{request.title}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)} bg-opacity-10`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {request.type} • {request.priority}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(request.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {supportRequests.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-3xl mb-2">📝</div>
                      <p className="text-sm">Belum ada aktivitas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setShowNewRequestForm(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <span className="mr-2">📝</span>
                  <span>Buat Permintaan Baru</span>
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <span className="mr-2">📚</span>
                  <span>Jelajahi Resources</span>
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

      {/* Enhanced New Request Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            <h3 className="text-lg font-semibold mb-4">Buat Permintaan Dukungan Baru</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select
                   value={newRequest.type}
                   onChange={(e) => setNewRequest({...newRequest, type: e.target.value as 'academic' | 'technical' | 'administrative' | 'personal'})}
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
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'})}
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