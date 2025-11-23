import React, { useState } from 'react';
import { NotificationService } from '../services/notificationService';
import LoadingSpinner from './LoadingSpinner';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'student' | 'teacher' | 'admin' | 'parent';
  userName?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  userRole = 'student',
  userName
}) => {
  const [formData, setFormData] = useState({
    name: userName || '',
    email: '',
    role: userRole,
    category: 'general',
    subject: '',
    message: '',
    rating: 5,
    wouldRecommend: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call untuk feedback submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success notification
      NotificationService.addNotification({
        title: 'Feedback Terkirim',
        message: 'Terima kasih atas feedback Anda! Kami akan meninjaunya segera.',
        type: 'system',
        priority: 'medium'
      });

      setIsSubmitted(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: userName || '',
          email: '',
          role: userRole,
          category: 'general',
          subject: '',
          message: '',
          rating: 5,
          wouldRecommend: true
        });
        onClose();
      }, 2000);

     } catch (_error) {
      NotificationService.addNotification({
        title: 'Gagal Mengirim Feedback',
        message: 'Terjadi kesalahan saat mengirim feedback. Silakan coba lagi.',
        type: 'system',
        priority: 'high'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Berikan Feedback
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Feedback Terkirim!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Terima kasih atas feedback berharga Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSubmitting && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner
                    size="md"
                    message="Mengirim feedback..."
                  />
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    placeholder="Nama Anda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    placeholder="email@anda.com"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Feedback
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="general">Umum</option>
                  <option value="bug">Laporan Bug</option>
                  <option value="feature">Permintaan Fitur</option>
                  <option value="ui">Interface & Design</option>
                  <option value="performance">Performa</option>
                  <option value="accessibility">Aksesibilitas</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subjek
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  placeholder="Ringkasan feedback Anda"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating Pengalaman (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => !isSubmitting && handleInputChange('rating', rating)}
                      disabled={isSubmitting}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.rating >= rating
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pesan Detail
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  placeholder="Jelaskan feedback Anda secara detail..."
                  required
                />
              </div>

              {/* Would Recommend */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={formData.wouldRecommend}
                  onChange={(e) => handleInputChange('wouldRecommend', e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="wouldRecommend" className={`text-sm text-gray-700 dark:text-gray-300 ${isSubmitting ? 'opacity-50' : ''}`}>
                  Saya akan merekomendasikan portal ini kepada orang lain
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Feedback</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;