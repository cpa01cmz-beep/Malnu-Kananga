// Enhanced lesson plans for IPA subjects (Fisika, Kimia, Biologi)
// MA Malnu Kananga - Kurikulum 2024/2025

export interface LessonPlan {
  id: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  major: string;
  semester: number;
  week: number;
  title: string;
  duration: number; // in minutes
  learningObjectives: string[];
  coreCompetencies: string[];
  basicCompetencies: string[];
  materials: Array<{
    type: 'video' | 'document' | 'interactive' | 'experiment' | 'simulation';
    title: string;
    url?: string;
    description: string;
    duration?: number;
  }>;
  activities: Array<{
    name: string;
    type: 'discussion' | 'experiment' | 'practice' | 'presentation' | 'group_work';
    duration: number;
    description: string;
    instructions: string[];
    assessment: string;
  }>;
  assessment: {
    formative: Array<{
      type: 'observation' | 'question' | 'quiz' | 'assignment';
      description: string;
      criteria: string[];
    }>;
    summative?: {
      type: 'test' | 'project' | 'presentation';
      description: string;
      rubric: string[];
    };
  };
  differentiation: {
    remedial: string[];
    regular: string[];
    enrichment: string[];
  };
  reflection: {
    teacher: string[];
    student: string[];
  };
  crossCurricular: string[];
  technologyIntegration: string[];
  characterBuilding: string[];
}

// FISIKA LESSON PLANS
export const physicsLessonPlans: LessonPlan[] = [
  {
    id: 'fis_lp_001',
    subjectId: 'SUBJ002',
    subjectName: 'Fisika',
    grade: 12,
    major: 'IPA',
    semester: 1,
    week: 1,
    title: 'Gerak Lurus Beraturan (GLB) dan Aplikasinya',
    duration: 90,
    learningObjectives: [
      'Menjelaskan pengertian gerak lurus beraturan',
      'Menurunkan persamaan GLB dari grafik kecepatan-waktu',
      'Menerapkan konsep GLB dalam kehidupan sehari-hari',
      'Menganalisis grafik posisi-waktu dan kecepatan-waktu untuk GLB'
    ],
    coreCompetencies: [
      'KI.3: Memahami, menerapkan, menganalisis pengetahuan faktual, konseptual, prosedural berdasarkan rasa ingin tahunya tentang ilmu pengetahuan, teknologi, seni, budaya terkait fenomena dan kejadian tampak mata'
    ],
    basicCompetencies: [
      'KD.3.1: Menganalisis gerak lurus dan gerak melingkar',
      'KD.4.1: Melakukan percobaan dan analisis gerak lurus'
    ],
    materials: [
      {
        type: 'video',
        title: 'Konsep Gerak Lurus Beraturan',
        url: 'https://example.com/fisika-glb',
        description: 'Video pembelajaran interaktif tentang GLB dengan animasi dan contoh nyata',
        duration: 15
      },
      {
        type: 'simulation',
        title: 'Simulasi Gerak Fisika',
        url: 'https://phet.colorado.edu/sims/html/moving-man/latest/moving-man_en.html',
        description: 'PhET simulation untuk eksplorasi konsep gerak',
        duration: 20
      },
      {
        type: 'document',
        title: 'Modul GLB',
        description: 'Modul pembelajaran lengkap dengan contoh soal dan latihan',
        duration: 10
      }
    ],
    activities: [
      {
        name: 'Eksplorasi Konsep',
        type: 'discussion',
        duration: 15,
        description: 'Diskusi kelas tentang pengalaman siswa dengan gerak dalam kehidupan sehari-hari',
        instructions: [
          'Guru memulai dengan pertanyaan "Apa itu gerak?"',
          'Siswa berbagi contoh gerak yang mereka amati sehari-hari',
          'Guru memandu diskusi ke arah definisi ilmiah gerak',
          'Siswa mengidentifikasi karakteristik GLB dari contoh yang diberikan'
        ],
        assessment: 'Observasi partisipasi dan kemampuan menghubungkan konsep dengan realitas'
      },
      {
        name: 'Praktikum Virtual',
        type: 'experiment',
        duration: 25,
        description: 'Menggunakan PhET simulation untuk mengeksplorasi hubungan posisi, kecepatan, dan waktu',
        instructions: [
          'Siswa membuka simulasi Moving Man',
          'Eksplorasi gerak dengan kecepatan konstan',
          'Mencatat data posisi dan waktu',
          'Membuat grafik posisi-waktu dan kecepatan-waktu',
          'Menganalisis hubungan antara variabel'
        ],
        assessment: 'Laporan praktikum virtual dengan analisis grafik'
      },
      {
        name: 'Problem Solving',
        type: 'practice',
        duration: 20,
        description: 'Pemecahan masalah GLB dalam konteks nyata',
        instructions: [
          'Siswa mengerjakan soal-soal aplikasi GLB',
          'Kerja kelompok untuk soal kasus kompleks',
          'Presentasi solusi di depan kelas',
          'Peer review dan diskusi'
        ],
        assessment: 'Ketepatan perhitungan dan kemampuan menjelaskan konsep'
      }
    ],
    assessment: {
      formative: [
        {
          type: 'observation',
          description: 'Observasi partisipasi dalam diskusi dan praktikum',
          criteria: ['Aktivitas bertanya', 'Kemampuan menjelaskan', 'Kolaborasi tim']
        },
        {
          type: 'question',
          description: 'Pertanyaan cepat selama pembelajaran',
          criteria: ['Pemahaman konsep', 'Kecepatan respons', 'Logika berpikir']
        },
        {
          type: 'assignment',
          description: 'Laporan praktikum virtual',
          criteria: ['Kelengkapan data', 'Analisis grafik', 'Kesimpulan ilmiah']
        }
      ],
      summative: {
        type: 'test',
        description: 'Tes formatif GLB dengan soal pilihan ganda dan essay',
        rubric: [
          'Pemahaman konsep (30%)',
          'Aplikasi rumus (40%)',
          'Analisis grafik (20%)',
          'Aplikasi kehidupan nyata (10%)'
        ]
      }
    },
    differentiation: {
      remedial: [
        'Fokus pada konsep dasar gerak dan kecepatan',
        'Bimbingan langkah demi langkah dalam perhitungan',
        'Contoh tambahan dengan visualisasi sederhana',
        'Peer tutoring dengan siswa yang sudah menguasai'
      ],
      regular: [
        'Kombinasi teori dan aplikasi',
        'Soal-soal dengan tingkat kesulitan sedang',
        'Praktikum virtual dengan analisis dasar',
        'Diskusi kelompok terstruktur'
      ],
      enrichment: [
        'Analisis gerak dalam 2 dimensi',
        'Aplikasi GLB dalam teknologi modern',
        'Proyek penelitian sederhana tentang gerak',
        'Studi kasus gerak dalam olahraga'
      ]
    },
    reflection: {
      teacher: [
        'Apakah tujuan pembelajaran tercapai?',
        'Bagian mana yang perlu diperbaiki?',
        'Bagaimana respon siswa terhadap simulasi?',
        'Apakah diferensiasi berhasil?'
      ],
      student: [
        'Konsep apa yang paling sulit dipahami?',
        'Bagaimana hubungan GLB dengan kehidupan sehari-hari?',
        'Apa yang bisa diperbaiki dari proses belajar?',
        'Manfaat apa yang didapat dari praktikum virtual?'
      ]
    },
    crossCurricular: [
      'Matematika: Konsep fungsi linear dan grafik',
      'Teknologi: Penggunaan simulasi digital',
      'Olahraga: Analisis gerak atlet',
      'Teknik: Aplikasi dalam desain mesin'
    ],
    technologyIntegration: [
      'PhET Interactive Simulations',
      'Google Sheets untuk analisis data',
      'Canva untuk presentasi grafik',
      'Kahoot untuk kuis interaktif'
    ],
    characterBuilding: [
      'Disiplin dalam mengikuti prosedur praktikum',
      'Kerjasama dalam tim',
      'Jujur dalam melaporkan hasil',
      'Rasa ingin tahu dan eksplorasi'
    ]
  },
  {
    id: 'fis_lp_002',
    subjectId: 'SUBJ002',
    subjectName: 'Fisika',
    grade: 12,
    major: 'IPA',
    semester: 1,
    week: 2,
    title: 'Gerak Lurus Berubah Beraturan (GLBB) dan Gravitasi',
    duration: 90,
    learningObjectives: [
      'Menjelaskan pengertian GLBB dan percepatan',
      'Menurunkan persamaan GLBB dari grafik kecepatan-waktu',
      'Menerapkan konsep GLBB dalam gerak jatuh bebas',
      'Menganalisis pengaruh gravitasi pada gerak benda'
    ],
    coreCompetencies: [
      'KI.3: Memahami, menerapkan, menganalisis pengetahuan faktual, konseptual, prosedural berdasarkan rasa ingin tahunya tentang ilmu pengetahuan, teknologi, seni, budaya terkait fenomena dan kejadian tampak mata'
    ],
    basicCompetencies: [
      'KD.3.1: Menganalisis gerak lurus dan gerak melingkar',
      'KD.4.1: Melakukan percobaan dan analisis gerak lurus'
    ],
    materials: [
      {
        type: 'video',
        title: 'Konsep GLBB dan Gravitasi',
        url: 'https://example.com/fisika-glbb',
        description: 'Video pembelajaran tentang percepatan dan gerak jatuh bebas',
        duration: 20
      },
      {
        type: 'experiment',
        title: 'Eksperimen Jatuh Bebas Sederhana',
        description: 'Praktikum dengan benda sederhana untuk mengamati gerak jatuh bebas',
        duration: 25
      },
      {
        type: 'interactive',
        title: 'Projectile Motion Simulator',
        url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
        description: 'Simulasi gerak parabola dan jatuh bebas',
        duration: 15
      }
    ],
    activities: [
      {
        name: 'Demonstrasi Jatuh Bebas',
        type: 'experiment',
        duration: 20,
        description: 'Demonstrasi guru dengan berbagai benda untuk menunjukkan konsep jatuh bebas',
        instructions: [
          'Guru menjatuhkan berbagai benda dari ketinggian sama',
          'Siswa mengamati perbedaan waktu jatuh',
          'Diskusi tentang faktor yang mempengaruhi gerak',
          'Introduksi konsep gravitasi dan hambatan udara'
        ],
        assessment: 'Observasi kemampuan mengajukan hipotesis dan menganalisis data'
      },
      {
        name: 'Analisis Video',
        type: 'group_work',
        duration: 25,
        description: 'Analisis video gerak benda menggunakan slow motion',
        instructions: [
          'Siswa merekam gerak jatuh benda sederhana',
          'Analisis frame demi frame untuk menghitung percepatan',
          'Perbandingan hasil dengan teori',
          'Diskusi tentang sumber error'
        ],
        assessment: 'Laporan analisis video dengan perhitungan'
      },
      {
        name: 'Problem Solving',
        type: 'practice',
        duration: 20,
        description: 'Pemecahan masalah GLBB dalam konteks transportasi',
        instructions: [
          'Soal-soal tentang pengereman kendaraan',
          'Analisis jarak pengereman ideal',
          'Aplikasi dalam keselamatan berkendara',
          'Presentasi hasil analisis'
        ],
        assessment: 'Ketepatan analisis dan aplikasi konsep'
      }
    ],
    assessment: {
      formative: [
        {
          type: 'observation',
          description: 'Observasi partisipasi dalam praktikum dan diskusi',
          criteria: ['Keterampilan praktik', 'Kemampuan analisis', 'Kolaborasi']
        },
        {
          type: 'quiz',
          description: 'Kuis singkat konsep GLBB',
          criteria: ['Pemahaman percepatan', 'Aplikasi rumus', 'Analisis grafik']
        }
      ],
      summative: {
        type: 'project',
        description: 'Proyek analisis gerak dalam video olahraga',
        rubric: [
          'Ketepatan pengukuran (25%)',
          'Analisis matematis (35%)',
          'Kreativitas pemilihan video (20%)',
          'Presentasi hasil (20%)'
        ]
      }
    },
    differentiation: {
      remedial: [
        'Fokus pada konsep percepatan sederhana',
        'Bimbingan langkah demi langkah',
        'Contoh konkret dengan benda sehari-hari',
        'Visualisasi grafik berwarna'
      ],
      regular: [
        'Kombinasi teori dan praktikum sederhana',
        'Soal-soal aplikasi langsung',
        'Analisis video dengan bimbingan',
        'Diskusi kelompok terstruktur'
      ],
      enrichment: [
        'Analisis gerak dengan hambatan udara',
        'Studi kasus roket dan satelit',
        'Proyek penelitian gerak parabola',
        'Aplikasi dalam teknologi antariksa'
      ]
    },
    reflection: {
      teacher: [
        'Apakah praktikum berjalan efektif?',
        'Bagaimana respon siswa terhadap analisis video?',
        'Apakah konsep gravitasi tersampaikan dengan baik?',
        'Apa yang perlu ditambah untuk pemahaman lebih baik?'
      ],
      student: [
        'Bagaimana perbedaan GLB dan GLBB dalam kehidupan nyata?',
        'Mengapa benda jatuh dengan percepatan sama?',
        'Apa tantangan terbesar dalam analisis gerak?',
        'Bagaimana menerapkan konsep ini untuk keselamatan?'
      ]
    },
    crossCurricular: [
      'Matematika: Kalkulus dan turunan',
      'Teknik: Desain transportasi',
      'Olahraga: Analisis gerak atlet',
      'Kesehatan: Dampak percepatan pada tubuh'
    ],
    technologyIntegration: [
      'Video analysis software',
      'PhET simulations',
        'Spreadsheet untuk analisis data',
        'Online quiz platforms'
    ],
    characterBuilding: [
      'Teliti dalam pengukuran',
      'Jujur dalam melaporkan hasil',
      'Kritis terhadap sumber error',
      'Kesadaran keselamatan'
    ]
  }
];

// KIMIA LESSON PLANS
export const chemistryLessonPlans: LessonPlan[] = [
  {
    id: 'kim_lp_001',
    subjectId: 'SUBJ003',
    subjectName: 'Kimia',
    grade: 12,
    major: 'IPA',
    semester: 1,
    week: 1,
    title: 'Struktur Atom dan Sistem Periodik Unsur',
    duration: 90,
    learningObjectives: [
      'Menjelaskan perkembangan model atom dari Dalton hingga modern',
      'Mengidentifikasi bagian-bagian atom (proton, neutron, elektron)',
      'Menganalisis konfigurasi elektron dan hubungannya dengan sifat unsur',
      'Menerapkan hukum periodik dalam memprediksi sifat unsur'
    ],
    coreCompetencies: [
      'KI.3: Memahami, menerapkan, menganalisis pengetahuan faktual, konseptual, prosedural berdasarkan rasa ingin tahunya tentang ilmu pengetahuan, teknologi, seni, budaya terkait fenomena dan kejadian tampak mata'
    ],
    basicCompetencies: [
      'KD.3.1: Menganalisis struktur atom dan sistem periodik unsur',
      'KD.4.1: Melakukan percobaan sifat-sifat unsur'
    ],
    materials: [
      {
        type: 'video',
        title: 'Perjalanan Panjang Model Atom',
        url: 'https://example.com/kimia-atom',
        description: 'Animasi perkembangan teori atom dari zaman Yunani hingga kuantum',
        duration: 18
      },
      {
        type: 'interactive',
        title: 'Interactive Periodic Table',
        url: 'https://ptable.com/',
        description: 'Tabel periodik interaktif dengan informasi lengkap setiap unsur',
        duration: 15
      },
      {
        type: 'simulation',
        title: 'Atom Builder Simulation',
        url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
        description: 'Simulasi membangun atom dan menghitung partikel subatomik',
        duration: 20
      }
    ],
    activities: [
      {
        name: 'Timeline Teori Atom',
        type: 'group_work',
        duration: 20,
        description: 'Membuat timeline perkembangan model atom secara kolaboratif',
        instructions: [
          'Kelas dibagi menjadi 5 kelompok',
          'Setiap kelompok meneliti satu model atom (Dalton, Thomson, Rutherford, Bohr, Modern)',
          'Membuat poster digital dengan Canva',
          'Presentasi di depan kelas dengan urutan kronologis'
        ],
        assessment: 'Kelengkapan informasi, kreativitas, dan kemampuan presentasi'
      },
      {
        name: 'Atom Builder Challenge',
        type: 'experiment',
        duration: 25,
        description: 'Kompetisi membangun atom dengan simulasi PhET',
        instructions: [
          'Siswa menggunakan simulasi Atom Builder',
          'Tantangan: membangun atom dengan nomor atom tertentu',
          'Menghitung jumlah proton, neutron, elektron',
          'Menentukan konfigurasi elektron yang benar'
        ],
        assessment: 'Keakuratan perhitungan dan pemahaman konfigurasi elektron'
      },
      {
        name: 'Periodic Table Detective',
        type: 'discussion',
        duration: 20,
        description: 'Menjadi detektif untuk menemukan pola dalam tabel periodik',
        instructions: [
          'Siswa mendapatkan "kartu misteri" dengan data unsur',
          'Menggunakan tabel periodik untuk mengidentifikasi unsur',
          'Memprediksi sifat-sifat unsur berdasarkan posisinya',
          'Justifikasi prediksi dengan hukum periodik'
        ],
        assessment: 'Kemampuan analisis dan penerapan hukum periodik'
      }
    ],
    assessment: {
      formative: [
        {
          type: 'observation',
          description: 'Observasi partisipasi dalam diskusi dan kerja kelompok',
          criteria: ['Kontribusi tim', 'Kemampuan analisis', 'Komunikasi ilmiah']
        },
        {
          type: 'assignment',
          description: 'Laporan praktikum virtual Atom Builder',
          criteria: ['Kelengkapan data', 'Analisis partikel', 'Konfigurasi elektron']
        },
        {
          type: 'quiz',
          description: 'Kuis singkat struktur atom',
          criteria: ['Identifikasi partikel', 'Konfigurasi elektron', 'Hukum periodik']
        }
      ],
      summative: {
        type: 'project',
        description: 'Proyek "Unsur Superhero" - menciptakan karakter superhero berdasarkan sifat unsur',
        rubric: [
          'Ketepatan sifat unsur (30%)',
          'Kreativitas karakter (25%)',
          'Justifikasi ilmiah (25%)',
          'Presentasi visual (20%)'
        ]
      }
    },
    differentiation: {
      remedial: [
        'Fokus pada bagian-bagian atom dasar',
        'Bimbingan langkah demi langkah konfigurasi elektron',
        'Visualisasi tabel periodik berwarna',
        'Contoh unsur yang familiar (H, O, C, N)'
      ],
      regular: [
        'Kombinasi teori dan aplikasi',
        'Analisis unsur-unsur umum',
        'Praktikum virtual dengan bimbingan',
        'Diskusi kelompok terstruktur'
      ],
      enrichment: [
        'Analisis unsur transisi dan lantanida/aktinida',
        'Studi kasus aplikasi unsur dalam teknologi',
        'Penelitian tentang unsur sintetis',
        'Proyek prediksi unsur baru'
      ]
    },
    reflection: {
      teacher: [
        'Apakah timeline aktivitas meningkatkan pemahaman?',
        'Bagaimana efektivitas simulasi Atom Builder?',
        'Apakah siswa dapat menghubungkan struktur dengan sifat?',
        'Apa yang perlu diperbaiki untuk pembelajaran periodik?'
      ],
      student: [
        'Model atom mana yang paling masuk akal?',
        'Bagaimana hubungan struktur atom dengan kehidupan?',
        'Mengapa posisi unsur dalam tabel periodik penting?',
        'Apa aplikasi pengetahuan struktur atom dalam teknologi?'
      ]
    },
    crossCurricular: [
      'Fisika: Konsep partikel subatomik',
      'Matematika: Pola matematis dalam tabel periodik',
      'Sejarah: Perkembangan ilmu pengetahuan',
      'Teknologi: Aplikasi unsur dalam industri'
    ],
    technologyIntegration: [
      'PhET Interactive Simulations',
      'Ptable.com untuk tabel periodik interaktif',
      'Canva untuk pembuatan poster',
      'Google Slides untuk presentasi'
    ],
    characterBuilding: [
      'Rasa ingin tahu tentang alam semesta',
      'Kerjasama dalam tim',
      'Kritis terhadap perkembangan ilmu',
      'Appresiasi terhadap kerja ilmuwan'
    ]
  }
];

// BIOLOGI LESSON PLANS
export const biologyLessonPlans: LessonPlan[] = [
  {
    id: 'bio_lp_001',
    subjectId: 'SUBJ004',
    subjectName: 'Biologi',
    grade: 12,
    major: 'IPA',
    semester: 1,
    week: 1,
    title: 'Struktur dan Fungsi Sel sebagai Unit Kehidupan',
    duration: 90,
    learningObjectives: [
      'Menjelaskan teori sel dan sejarah penemuannya',
      'Mengidentifikasi struktur organel sel eukariotik dan prokariotik',
      'Menganalisis fungsi setiap organel dalam menjaga kehidupan sel',
      'Membandingkan sel hewan dan sel tumbuhan'
    ],
    coreCompetencies: [
      'KI.3: Memahami, menerapkan, menganalisis pengetahuan faktual, konseptual, prosedural berdasarkan rasa ingin tahunya tentang ilmu pengetahuan, teknologi, seni, budaya terkait fenomena dan kejadian tampak mata'
    ],
    basicCompetencies: [
      'KD.3.1: Menganalisis struktur dan fungsi sel sebagai unit kehidupan',
      'KD.4.1: Melakukan pengamatan struktur sel dengan mikroskop'
    ],
    materials: [
      {
        type: 'video',
        title: 'Jelajah Dunia Sel',
        url: 'https://example.com/biologi-sel',
        description: 'Video animasi 3D tentang struktur dan fungsi organel sel',
        duration: 22
      },
      {
        type: 'interactive',
        title: 'Virtual Cell Explorer',
        url: 'https://www.cellsalive.com/cells/cell_model.htm',
        description: 'Eksplorasi 3D sel hewan dan tumbuhan interaktif',
        duration: 18
      },
      {
        type: 'experiment',
        title: 'Mikroskopi Sel Bawang Merah',
        description: 'Praktikum pengamatan sel tumbuhan dengan mikroskop',
        duration: 25
      }
    ],
    activities: [
      {
        name: 'Cell City Project',
        type: 'group_work',
        duration: 25,
        description: 'Membuat analogi sel sebagai kota dengan organel sebagai bangunan',
        instructions: [
          'Kelompok mendapatkan bagian sel tertentu',
          'Mencari analogi fungsi organel dengan bagian kota',
          'Membuat poster atau model 3D "Cell City"',
          'Presentasi analogi dengan justifikasi ilmiah'
        ],
        assessment: 'Kreativitas analogi, ketepatan fungsi, kemampuan presentasi'
      },
      {
        name: 'Microscope Adventure',
        type: 'experiment',
        duration: 30,
        description: 'Pengamatan preparat sel bawang merah dan sel pipi',
        instructions: [
          'Demonstrasi penggunaan mikroskop',
          'Membuat preparat sel bawang merah',
          'Pengamatan sel pipi sendiri',
          'Menggambar hasil pengamatan dengan label'
        ],
        assessment: 'Keterampilan mikroskop, ketepatan gambar, identifikasi organel'
      },
      {
        name: 'Organel Function Match',
        type: 'practice',
        duration: 15,
        description: 'Game mencocokkan organel dengan fungsinya',
        instructions: [
          'Siswa mendapatkan kartu organel dan kartu fungsi',
          'Mencocokkan secara cepat dan akurat',
          'Justifikasi pencocokan dengan penjelasan ilmiah',
          'Kompetisi antar kelompok'
        ],
        assessment: 'Kecepatan dan akurasi pencocokan, kemampuan menjelaskan'
      }
    ],
    assessment: {
      formative: [
        {
          type: 'observation',
          description: 'Observasi keterampilan mikroskop dan kerja kelompok',
          criteria: ['Teknik mikroskop', 'Kolaborasi', 'Kemampuan identifikasi']
        },
        {
          type: 'assignment',
          description: 'Laporan praktikum mikroskop dengan gambar dan analisis',
          criteria: ['Kualitas gambar', 'Labeling', 'Analisis fungsi']
        },
        {
          type: 'assignment',
          description: 'Presentasi Cell City Project',
          criteria: ['Kreativitas', 'Justifikasi ilmiah', 'Komunikasi']
        }
      ],
      summative: {
        type: 'test',
        description: 'Tes struktur dan fungsi sel dengan gambar dan soal aplikasi',
        rubric: [
          'Identifikasi struktur (25%)',
          'Pemahaman fungsi (35%)',
          'Perbandingan sel (20%)',
          'Aplikasi konsep (20%)'
        ]
      }
    },
    differentiation: {
      remedial: [
        'Fokus pada organel utama (inti, mitokondria, kloroplas)',
        'Bimbingan langkah demi langkah penggunaan mikroskop',
        'Visualisasi dengan gambar berwarna besar',
        'Analogi sederhana dengan benda sehari-hari'
      ],
      regular: [
        'Kombinasi teori dan praktikum',
        'Analisis organel lengkap',
        'Praktikum dengan bimbingan terbatas',
        'Diskusi kelompok terstruktur'
      ],
      enrichment: [
        'Analisis organel khusus (silium, flagel, vakuola)',
        'Studi kasus penyakit akibat kelainan organel',
        'Penelitian tentang sel punca',
        'Proyek perbandingan sel berbagai organisme'
      ]
    },
    reflection: {
      teacher: [
        'Apakah analogi Cell City membantu pemahaman?',
        'Bagaimana efektivitas praktikum mikroskop?',
        'Apakah siswa dapat menghubungkan struktur dengan fungsi?',
        'Apa tantangan dalam pembelajaran organel sel?'
      ],
      student: [
        'Organel mana yang paling menarik dan mengapa?',
        'Bagaimana hubungan struktur sel dengan kesehatan?',
        'Mengapa mikroskop penting dalam biologi?',
        'Apa aplikasi pengetahuan sel dalam kedokteran?'
      ]
    },
    crossCurricular: [
      'Kimia: Struktur molekuler organel',
      'Fisika: Optik mikroskop',
      'Teknologi: Teknik mikroskop modern',
      'Kesehatan: Sel dan penyakit'
    ],
    technologyIntegration: [
      'Virtual Cell Explorer',
      'Microscope camera attachment',
      'Digital drawing tools',
      'Online collaboration platforms'
    ],
    characterBuilding: [
      'Teliti dalam pengamatan',
      'Sabar dalam praktikum',
        'Kerjasama dalam tim',
        'Appresiasi terhadap kehidupan mikro'
    ]
  }
];

// Utility functions for lesson plan management
class LessonPlanManager {
  private static instance: LessonPlanManager;
  private LESSON_PLANS_KEY = 'malnu_lesson_plans';

  private constructor() {}

  static getInstance(): LessonPlanManager {
    if (!LessonPlanManager.instance) {
      LessonPlanManager.instance = new LessonPlanManager();
    }
    return LessonPlanManager.instance;
  }

  // Initialize lesson plans
  initialize(): void {
    const existingPlans = localStorage.getItem(this.LESSON_PLANS_KEY);
    if (existingPlans) return;

    const allPlans = [
      ...physicsLessonPlans,
      ...chemistryLessonPlans,
      ...biologyLessonPlans
    ];

    localStorage.setItem(this.LESSON_PLANS_KEY, JSON.stringify(allPlans));
    console.log('📚 Lesson Plans initialized successfully');
  }

  // Get lesson plans by subject
  getLessonPlans(subjectId: string, semester?: number): LessonPlan[] {
    const plans = this.getAllLessonPlans();
    return plans.filter(plan => {
      const subjectMatch = plan.subjectId === subjectId;
      const semesterMatch = semester ? plan.semester === semester : true;
      return subjectMatch && semesterMatch;
    });
  }

  // Get all lesson plans
  getAllLessonPlans(): LessonPlan[] {
    const plans = localStorage.getItem(this.LESSON_PLANS_KEY);
    return plans ? JSON.parse(plans) : [];
  }

  // Get lesson plan by ID
  getLessonPlanById(id: string): LessonPlan | null {
    const plans = this.getAllLessonPlans();
    return plans.find(plan => plan.id === id) || null;
  }

  // Get lesson plans by week
  getLessonPlansByWeek(week: number, subjectId?: string): LessonPlan[] {
    const plans = this.getAllLessonPlans();
    return plans.filter(plan => {
      const weekMatch = plan.week === week;
      const subjectMatch = subjectId ? plan.subjectId === subjectId : true;
      return weekMatch && subjectMatch;
    });
  }

  // Add new lesson plan
  addLessonPlan(plan: LessonPlan): void {
    const plans = this.getAllLessonPlans();
    plans.push(plan);
    localStorage.setItem(this.LESSON_PLANS_KEY, JSON.stringify(plans));
  }

  // Update lesson plan
  updateLessonPlan(id: string, updates: Partial<LessonPlan>): void {
    const plans = this.getAllLessonPlans();
    const index = plans.findIndex(plan => plan.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updates };
      localStorage.setItem(this.LESSON_PLANS_KEY, JSON.stringify(plans));
    }
  }

  // Delete lesson plan
  deleteLessonPlan(id: string): void {
    const plans = this.getAllLessonPlans();
    const filteredPlans = plans.filter(plan => plan.id !== id);
    localStorage.setItem(this.LESSON_PLANS_KEY, JSON.stringify(filteredPlans));
  }

  // Generate weekly schedule
  generateWeeklySchedule(subjectId: string, semester: number): LessonPlan[] {
    const plans = this.getLessonPlans(subjectId, semester);
    return plans.sort((a, b) => a.week - b.week);
  }

  // Export lesson plans
  exportLessonPlans(subjectId?: string): string {
    const plans = subjectId ? this.getLessonPlans(subjectId) : this.getAllLessonPlans();
    return JSON.stringify(plans, null, 2);
  }

  // Import lesson plans
  importLessonPlans(plansJson: string): void {
    try {
      const plans = JSON.parse(plansJson) as LessonPlan[];
      localStorage.setItem(this.LESSON_PLANS_KEY, JSON.stringify(plans));
      console.log('📚 Lesson plans imported successfully');
    } catch (error) {
      console.error('Failed to import lesson plans:', error);
    }
  }
}

// Export service instance
export const LessonPlanService = LessonPlanManager.getInstance();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  try {
    LessonPlanService.initialize();
  } catch (error) {
    console.error('Failed to initialize Lesson Plan Service:', error);
  }
}