// Seeding script untuk populate database dengan data awal dari mock data
// Jalankan script ini setelah database migration untuk mengisi data contoh

import { featuredPrograms } from '../../data/featuredPrograms';
import { latestNews } from '../../data/latestNews';
import { relatedLinks } from '../../data/relatedLinks';

export class DatabaseSeeder {
  constructor(db) {
    this.db = db;
  }

  // Seed featured programs
  async seedFeaturedPrograms() {
    console.log('🌱 Seeding featured programs...');

    for (const program of featuredPrograms) {
      try {
        await this.db.prepare(
          "INSERT OR IGNORE INTO featured_programs (title, description, image_url, sort_order) VALUES (?, ?, ?, ?)"
        ).bind(
          program.title,
          program.description,
          program.imageUrl,
          featuredPrograms.indexOf(program)
        ).run();
      } catch (error) {
        console.error('Error seeding featured program:', program.title, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM featured_programs").first();
    console.log(`✅ Seeded ${count.count} featured programs`);
  }

  // Seed latest news
  async seedLatestNews() {
    console.log('🌱 Seeding latest news...');

    for (const news of latestNews) {
      try {
        await this.db.prepare(
          "INSERT OR IGNORE INTO latest_news (title, category, image_url, publish_date, sort_order) VALUES (?, ?, ?, ?, ?)"
        ).bind(
          news.title,
          news.category,
          news.imageUrl,
          news.date,
          latestNews.indexOf(news)
        ).run();
      } catch (error) {
        console.error('Error seeding news:', news.title, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM latest_news").first();
    console.log(`✅ Seeded ${count.count} news items`);
  }

  // Seed related links
  async seedRelatedLinks() {
    console.log('🌱 Seeding related links...');

    for (const link of relatedLinks) {
      try {
        await this.db.prepare(
          "INSERT OR IGNORE INTO related_links (name, href, icon_name, color_class, sort_order) VALUES (?, ?, ?, ?, ?)"
        ).bind(
          link.name,
          link.href,
          link.icon.type?.name || 'DefaultIcon', // Extract icon name if possible
          link.color,
          relatedLinks.indexOf(link)
        ).run();
      } catch (error) {
        console.error('Error seeding related link:', link.name, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM related_links").first();
    console.log(`✅ Seeded ${count.count} related links`);
  }

  // Seed sample students
  async seedSampleStudents() {
    console.log('🌱 Seeding sample students...');

    const sampleStudents = [
      {
        student_id: 'STU001',
        name: 'Ahmad Fauzi Rahman',
        email: 'siswa@ma-malnukananga.sch.id',
        class_id: 'CLS001',
        academic_year: '2024/2025',
        date_of_birth: '2007-03-15',
        address: 'Jl. Pendidikan No. 123, Kananga, Pandeglang',
        phone: '081234567890',
        parent_phone: '081987654321',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        enrollment_date: '2023-07-01'
      }
    ];

    for (const student of sampleStudents) {
      try {
        await this.db.prepare(`
          INSERT OR IGNORE INTO students
          (student_id, name, email, class_id, academic_year, date_of_birth, address, phone, parent_phone, profile_image, enrollment_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          student.student_id,
          student.name,
          student.email,
          student.class_id,
          student.academic_year,
          student.date_of_birth,
          student.address,
          student.phone,
          student.parent_phone,
          student.profile_image,
          student.enrollment_date
        ).run();
      } catch (error) {
        console.error('Error seeding student:', student.name, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM students").first();
    console.log(`✅ Seeded ${count.count} students`);
  }

  // Seed sample teachers
  async seedSampleTeachers() {
    console.log('🌱 Seeding sample teachers...');

    const sampleTeachers = [
      {
        employee_id: 'TCH001',
        name: 'Dr. Siti Nurhaliza, M.Pd.',
        email: 'guru@ma-malnukananga.sch.id',
        subject: 'Matematika',
        class_teacher: 'XII IPA 1',
        phone: '081234567890',
        profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        join_date: '2018-07-01'
      }
    ];

    for (const teacher of sampleTeachers) {
      try {
        await this.db.prepare(`
          INSERT OR IGNORE INTO teachers
          (employee_id, name, email, subject, class_teacher, phone, profile_image, join_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          teacher.employee_id,
          teacher.name,
          teacher.email,
          teacher.subject,
          teacher.class_teacher,
          teacher.phone,
          teacher.profile_image,
          teacher.join_date
        ).run();
      } catch (error) {
        console.error('Error seeding teacher:', teacher.name, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM teachers").first();
    console.log(`✅ Seeded ${count.count} teachers`);
  }

  // Seed sample classes
  async seedSampleClasses() {
    console.log('🌱 Seeding sample classes...');

    const sampleClasses = [
      {
        class_id: 'CLS001',
        name: 'XII IPA 1',
        grade: 12,
        major: 'IPA',
        homeroom_teacher_id: 1, // Will be updated after teachers are seeded
        student_count: 32,
        academic_year: '2024/2025'
      }
    ];

    for (const cls of sampleClasses) {
      try {
        await this.db.prepare(`
          INSERT OR IGNORE INTO classes
          (class_id, name, grade, major, homeroom_teacher_id, student_count, academic_year)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          cls.class_id,
          cls.name,
          cls.grade,
          cls.major,
          cls.homeroom_teacher_id,
          cls.student_count,
          cls.academic_year
        ).run();
      } catch (error) {
        console.error('Error seeding class:', cls.name, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM classes").first();
    console.log(`✅ Seeded ${count.count} classes`);
  }

  // Seed sample subjects
  async seedSampleSubjects() {
    console.log('🌱 Seeding sample subjects...');

    const sampleSubjects = [
      {
        subject_id: 'SUBJ001',
        name: 'Matematika',
        code: 'MAT12',
        teacher_id: 1,
        credits: 4,
        description: 'Matematika untuk kelas XII IPA'
      },
      {
        subject_id: 'SUBJ002',
        name: 'Fisika',
        code: 'FIS12',
        teacher_id: 1,
        credits: 3,
        description: 'Fisika dasar dan terapan'
      }
    ];

    for (const subject of sampleSubjects) {
      try {
        await this.db.prepare(`
          INSERT OR IGNORE INTO subjects
          (subject_id, name, code, teacher_id, credits, description)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          subject.subject_id,
          subject.name,
          subject.code,
          subject.teacher_id,
          subject.credits,
          subject.description
        ).run();
      } catch (error) {
        console.error('Error seeding subject:', subject.name, error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM subjects").first();
    console.log(`✅ Seeded ${count.count} subjects`);
  }

  // Seed sample grades
  async seedSampleGrades() {
    console.log('🌱 Seeding sample grades...');

    const sampleGrades = [
      {
        student_id: 1,
        subject_id: 1,
        semester: 1,
        academic_year: '2024/2025',
        midterm_score: 85,
        final_score: 88,
        assignment_score: 82,
        attendance_score: 90,
        final_grade: 'A',
        grade_point: 4.0,
        status: 'Lulus'
      }
    ];

    for (const grade of sampleGrades) {
      try {
        await this.db.prepare(`
          INSERT OR IGNORE INTO grades
          (student_id, subject_id, semester, academic_year, midterm_score, final_score, assignment_score, attendance_score, final_grade, grade_point, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          grade.student_id,
          grade.subject_id,
          grade.semester,
          grade.academic_year,
          grade.midterm_score,
          grade.final_score,
          grade.assignment_score,
          grade.attendance_score,
          grade.final_grade,
          grade.grade_point,
          grade.status
        ).run();
      } catch (error) {
        console.error('Error seeding grade:', error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM grades").first();
    console.log(`✅ Seeded ${count.count} grades`);
  }

  // Seed sample attendance
  async seedSampleAttendance() {
    console.log('🌱 Seeding sample attendance...');

    const sampleAttendance = [
      {
        student_id: 1,
        date: '2024-10-01',
        subject_id: 1,
        status: 'Hadir',
        notes: ''
      },
      {
        student_id: 1,
        date: '2024-10-02',
        subject_id: 2,
        status: 'Izin',
        notes: 'Sakit demam'
      }
    ];

    for (const attendance of sampleAttendance) {
      try {
        await this.db.prepare(`
          INSERT OR IGNORE INTO attendance
          (student_id, date, subject_id, status, notes)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          attendance.student_id,
          attendance.date,
          attendance.subject_id,
          attendance.status,
          attendance.notes
        ).run();
      } catch (error) {
        console.error('Error seeding attendance:', error);
      }
    }

    const count = await this.db.prepare("SELECT COUNT(*) as count FROM attendance").first();
    console.log(`✅ Seeded ${count.count} attendance records`);
  }

  // Run all seeders
  async seedAll() {
    console.log('🚀 Starting database seeding process...');

    try {
      await this.seedFeaturedPrograms();
      await this.seedLatestNews();
      await this.seedRelatedLinks();
      await this.seedSampleTeachers();
      await this.seedSampleClasses();
      await this.seedSampleSubjects();
      await this.seedSampleStudents();
      await this.seedSampleGrades();
      await this.seedSampleAttendance();

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }

  // Clear all data (untuk testing)
  async clearAllData() {
    console.log('🗑️ Clearing all data...');

    const tables = [
      'attendance',
      'grades',
      'schedule',
      'announcements',
      'students',
      'subjects',
      'classes',
      'teachers',
      'related_links',
      'latest_news',
      'featured_programs'
    ];

    for (const table of tables) {
      try {
        await this.db.prepare(`DELETE FROM ${table}`).run();
        console.log(`✅ Cleared ${table}`);
      } catch (error) {
        console.error(`❌ Error clearing ${table}:`, error);
      }
    }
  }
}

// Export untuk penggunaan di Cloudflare Worker atau environment lainnya
export default DatabaseSeeder;