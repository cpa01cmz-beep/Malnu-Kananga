import React, { useState, useEffect } from 'react';
import { StudentSupportService, SupportTicket, SupportResource } from '../services/studentSupportService';

interface StudentSupportDashboardProps {
  studentId: string;
}

const StudentSupportDashboard: React.FC<StudentSupportDashboardProps> = ({ studentId }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [analytics, setAnalytics] = useState<any>(null);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    category: 'academic' as const,
    priority: 'medium' as const,
    subject: '',
    description: ''
  });

  useEffect(() => {
    loadSupportData();
  }, [studentId]);

  const loadSupportData = () => {
    const allTickets = StudentSupportService.getSupportTickets();
    const studentTickets = allTickets.filter(t => t.studentId === studentId);
    setTickets(studentTickets);

    const allResources = StudentSupportService.getSupportResources();
    setResources(allResources);

    const supportAnalytics = StudentSupportService.getSupportAnalytics();
    setAnalytics(supportAnalytics);
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Mohon lengkapi subjek dan deskripsi');
      return;
    }

    StudentSupportService.createSupportTicket({
      studentId,
      category: newTicket.category,
      priority: newTicket.priority,
      subject: newTicket.subject,
      description: newTicket.description,
      tags: [newTicket.category]
    });

    // Reset form
    setNewTicket({
      category: 'academic',
      priority: 'medium',
      subject: '',
      description: ''
    });
    setShowNewTicketForm(false);

    // Reload data
    loadSupportData();
  };

  const handleRateResource = (resourceId: string, rating: number) => {
    StudentSupportService.rateResource(resourceId, rating);
    loadSupportData();
  };

  const filteredTickets = selectedCategory === 'all' 
    ? tickets 
    : tickets.filter(t => t.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '📚';
      case 'technical': return '💻';
      case 'administrative': return '🏢';
      case 'behavioral': return '🧠';
      default: return '📋';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎓 Pusat Dukungan Siswa
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Dapatkan bantuan akademis dan teknis 24/7
        </p>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tiket</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTickets}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Terbuka</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.openTickets}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
                <p className="text-2xl font-bold text-green-600">{analytics.resolvedTickets}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Waktu Respon</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(analytics.averageResolutionTime)}j
                </p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tiket Dukungan Saya</h2>
        <button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          ➕ Tiket Baru
        </button>
      </div>

      {/* New Ticket Form */}
      {showNewTicketForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Buat Tiket Baru</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <select
                value={newTicket.category}
                onChange={(e) => setNewTicket({...newTicket, category: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="academic">📚 Akademis</option>
                <option value="technical">💻 Teknis</option>
                <option value="administrative">🏢 Administratif</option>
                <option value="behavioral">🧠 Perilaku</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioritas
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">🟢 Rendah</option>
                <option value="medium">🟡 Sedang</option>
                <option value="high">🟠 Tinggi</option>
                <option value="urgent">🔴 Mendesak</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subjek
            </label>
            <input
              type="text"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              placeholder="Jelaskan masalah Anda secara singkat"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi
            </label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              placeholder="Jelaskan masalah Anda secara detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreateTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Kirim Tiket
            </button>
            <button
              onClick={() => setShowNewTicketForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'academic', 'technical', 'administrative', 'behavioral'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? '📋 Semua' : getCategoryIcon(category) + ' ' + category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Belum ada tiket dukungan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Buat tiket baru untuk mendapatkan bantuan dari tim support kami
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getCategoryIcon(ticket.category)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(ticket.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">{ticket.description}</p>
              
              {ticket.resolution && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Solusi:</h4>
                  <p className="text-green-700 dark:text-green-300">{ticket.resolution}</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                {ticket.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Support Resources */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📚 Sumber Daya Bantuan</h2>
        
        {resources.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Sumber daya bantuan akan segera tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => (
              <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{resource.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {resource.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>⏱️ {resource.estimatedTime} menit</span>
                  <span>⭐ {resource.rating.toFixed(1)}</span>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                    Buka
                  </button>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleRateResource(resource.id, star)}
                        className={`w-6 h-6 text-sm ${
                          star <= Math.round(resource.rating) 
                            ? 'text-yellow-500' 
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Help */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🆘 Bantuan Cepat</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">📞 Kontak Darurat</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Admin IT: ext. 123</li>
              <li>• Guru BK: ext. 456</li>
              <li>• Satpam: ext. 888</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">💡 Tips Cepat</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Gunakan Magic Link untuk login</li>
              <li>• Clear cache jika portal lambat</li>
              <li>• Install PWA untuk akses offline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSupportDashboard;