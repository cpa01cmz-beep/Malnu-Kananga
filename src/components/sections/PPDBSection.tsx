
import React from 'react';
import ClipboardDocumentCheckIcon from '../icons/ClipboardDocumentCheckIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Heading from '../ui/Heading';
import Section from '../ui/Section';
import { getResponsiveGradient } from '../../config/gradients';

interface PPDBSectionProps {
  onRegisterClick: () => void;
}

const PPDBSection: React.FC<PPDBSectionProps> = ({ onRegisterClick }) => {
  return (
    <Section
      id="ppdb"
      title="Bergabunglah Bersama Kami"
      subtitle="Jadilah bagian dari generasi unggul MA Malnu Kananga. Pendaftaran Tahun Ajaran 2025/2026 telah dibuka."
      className={getResponsiveGradient('PPDB')}
      badge={
        <Badge variant="primary" size="md" styleType="solid" rounded className="animate-scale-in">
          Penerimaan Peserta Didik Baru
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-14">
            <Card
                variant="hover"
                className="text-center relative overflow-hidden group"
                padding="lg"
            >
                <div className={`absolute top-0 right-0 ${getResponsiveGradient('PRIMARY_LIGHT_SOLID')} text-primary-700 dark:text-primary-300 font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-bl-xl text-xs sm:text-sm shadow-subtle`}>01</div>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${getResponsiveGradient('BLUE_LIGHT')} text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-subtle`}>
                    <DocumentTextIcon />
                </div>
                <Heading level={3} size="lg" weight="semibold" className="sm:text-xl lg:text-2xl mb-2 sm:mb-3">Isi Formulir</Heading>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">Lengkapi data diri dan data sekolah asal melalui formulir pendaftaran online kami.</p>
            </Card>

            <Card
                variant="hover"
                className="text-center relative overflow-hidden group"
                padding="lg"
            >
                <div className={`absolute top-0 right-0 ${getResponsiveGradient('PRIMARY_LIGHT_SOLID')} text-primary-700 dark:text-primary-300 font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-bl-xl text-xs sm:text-sm shadow-subtle`}>02</div>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${getResponsiveGradient('PURPLE_LIGHT')} text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-subtle`}>
                    <ClipboardDocumentCheckIcon />
                </div>
                <Heading level={3} size="lg" weight="semibold" className="sm:text-xl lg:text-2xl mb-2 sm:mb-3">Verifikasi Berkas</Heading>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">Panitia akan memverifikasi data yang Anda kirimkan dalam waktu 1x24 jam.</p>
            </Card>

            <Card
                variant="hover"
                className="text-center relative overflow-hidden group"
                padding="lg"
            >
                <div className={`absolute top-0 right-0 ${getResponsiveGradient('PRIMARY_LIGHT_SOLID')} text-primary-700 dark:text-primary-300 font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-bl-xl text-xs sm:text-sm shadow-subtle`}>03</div>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${getResponsiveGradient('ORANGE_LIGHT')} text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-subtle`}>
                    <UsersIcon />
                </div>
                <Heading level={3} size="lg" weight="semibold" className="sm:text-xl lg:text-2xl mb-2 sm:mb-3">Wawancara & Tes</Heading>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">Ikuti tes akademik and wawancara sesuai jadwal yang ditentukan.</p>
            </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={onRegisterClick}
            variant="primary"
            size="lg"
            icon={<ArrowRightIcon />}
            iconPosition="right"
          >
            Daftar Sekarang
          </Button>
          <p className="mt-5 sm:mt-6 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Pendaftaran Gelombang 1 ditutup pada <strong className="text-neutral-900 dark:text-white font-semibold">30 April 2025</strong>.
          </p>
        </div>
    </Section>
  );
};

export default PPDBSection;
