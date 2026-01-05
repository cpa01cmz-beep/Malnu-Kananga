
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { ppdbAPI } from '../services/apiService';
import type { PPDBRegistrant } from '../types';

interface PPDBRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PPDBRegistration: React.FC<PPDBRegistrationProps> = ({ isOpen, onClose, onShowToast }) => {
  const [formData, setFormData] = useState<Partial<PPDBRegistrant>>({
    fullName: '',
    nisn: '',
    originSchool: '',
    parentName: '',
    phoneNumber: '',
    email: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await ppdbAPI.create({
        fullName: formData.fullName!,
        nisn: formData.nisn!,
        originSchool: formData.originSchool!,
        parentName: formData.parentName!,
        phoneNumber: formData.phoneNumber!,
        email: formData.email!,
        address: formData.address!,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      });

      if (response.success) {
        setIsSubmitting(false);
        onShowToast('Pendaftaran berhasil! Data Anda sedang diverifikasi.', 'success');

        setFormData({
          fullName: '',
          nisn: '',
          originSchool: '',
          parentName: '',
          phoneNumber: '',
          email: '',
          address: '',
        });

        onClose();
      } else {
        throw new Error(response.error || 'Gagal mendaftar');
      }
    } catch {
      setIsSubmitting(false);
      onShowToast('Gagal mendaftar. Silakan coba lagi.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Formulir Pendaftaran PPDB</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tahun Ajaran 2025/2026</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Data Siswa */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Calon Siswa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                            <input name="fullName" required type="text" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NISN</label>
                            <input name="nisn" required type="text" value={formData.nisn} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asal Sekolah</label>
                            <input name="originSchool" required type="text" value={formData.originSchool} onChange={handleChange} placeholder="SMP/MTs..." className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                    </div>
                </div>

                {/* Data Kontak */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Orang Tua & Kontak</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Orang Tua/Wali</label>
                            <input name="parentName" required type="text" value={formData.parentName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor WhatsApp</label>
                            <input name="phoneNumber" required type="tel" value={formData.phoneNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input name="email" required type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
                            <textarea name="address" required value={formData.address} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"></textarea>
                        </div>
                     </div>
                </div>

                {/* Upload Dokumen */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Upload Dokumen (Opsional)</h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Klik untuk upload Pas Foto & Scan Ijazah/SKL</p>
                        <p className="text-xs text-gray-400 mt-1">Maks. 5MB (PDF/JPG)</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">Dengan mendaftar, Anda menyetujui kebijakan privasi data sekolah.</p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PPDBRegistration;
