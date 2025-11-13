#!/usr/bin/env node

/**
 * Database Seeding Script for Cloudflare D1
 * Populates the database with all existing mock data
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Import mock data
import { 
  currentStudent, 
  subjects, 
  studentGrades, 
  weeklySchedule, 
  attendanceData, 
  announcements 
} from '../src/data/studentData.ts';

import { 
  currentTeacher, 
  teacherClasses, 
  classStudents 
} from '../src/data/teacherData.ts';

import { 
  currentParent, 
  parentChildren, 
  assignmentsData, 
  messagesData, 
  academicReports 
} from '../src/data/parentData.ts';

import { featuredPrograms } from '../src/data/featuredPrograms.ts';
import { latestNews } from '../src/data/latestNews.ts';
import { relatedLinks } from '../src/data/relatedLinksData.ts';

const DB_NAME = 'malnu-kananga-auth';

class DatabaseSeeder {
  constructor() {
    this.checkPrerequisites();
  }

  checkPrerequisites() {
    try {
      execSync('npx wrangler --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Wrangler CLI tidak ditemukan. Install dengan: npm install -g wrangler');
      process.exit(1);
    }
  }

  async runCommand(command, description) {
    console.log(`🔄 ${description}...`);
    try {
      const output = execSync(command, { encoding: 'utf8' });
      console.log(`✅ ${description} berhasil`);
      return output;
    } catch (error) {
      console.error(`❌ ${description} gagal:`, error.message);
      throw error;
    }
  }

  // Helper function to escape strings for SQL
  escapeString(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/'/g, "''");
  }

  // Helper function to format dates for SQL
  formatDate(dateStr) {
    if (!dateStr) return 'NULL';
    // If it's already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return `'${dateStr}'`;
    }
    // If it's a full date string, extract the date part
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'NULL';
    return `'${date.toISOString().split('T')[0]}'`;
  }

  // Seed featured programs data
  async seedFeaturedPrograms() {
    console.log('\n🌱 Seeding Featured Programs...');
    
    for (const program of featuredPrograms) {
      const sql = `
        INSERT OR REPLACE INTO featured_programs 
        (id, title, description, image_url, is_active, sort_order, created_at, updated_at)
        VALUES (
          ${program.id},
          '${this.escapeString(program.title)}',
          '${this.escapeString(program.description)}',
          '${this.escapeString(program.imageUrl)}',
          ${program.isActive ? 1 : 0},
          ${program.sortOrder || 0},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding featured program: ${program.title}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding featured program: ${program.title}`);
      }
    }
  }

  // Seed latest news data
  async seedLatestNews() {
    console.log('\n🌱 Seeding Latest News...');
    
    for (const news of latestNews) {
      const sql = `
        INSERT OR REPLACE INTO latest_news 
        (id, title, content, summary, category, image_url, publish_date, is_active, sort_order, created_at, updated_at)
        VALUES (
          ${news.id},
          '${this.escapeString(news.title)}',
          '${this.escapeString(news.content)}',
          '${this.escapeString(news.summary || '')}',
          '${this.escapeString(news.category)}',
          '${this.escapeString(news.imageUrl || '')}',
          ${this.formatDate(news.publishDate)},
          ${news.isActive ? 1 : 0},
          ${news.sortOrder || 0},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding latest news: ${news.title}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding latest news: ${news.title}`);
      }
    }
  }

  // Seed related links data
  async seedRelatedLinks() {
    console.log('\n🌱 Seeding Related Links...');
    
    for (const link of relatedLinks) {
      const sql = `
        INSERT OR REPLACE INTO related_links 
        (id, name, href, description, icon_name, color_class, is_active, sort_order, created_at, updated_at)
        VALUES (
          ${link.id},
          '${this.escapeString(link.name)}',
          '${this.escapeString(link.href)}',
          '${this.escapeString(link.description || '')}',
          '${this.escapeString(link.iconName || '')}',
          '${this.escapeString(link.colorClass || '')}',
          ${link.isActive ? 1 : 0},
          ${link.sortOrder || 0},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding related link: ${link.name}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding related link: ${link.name}`);
      }
    }
  }

  // Seed teachers data
  async seedTeachers() {
    console.log('\n🌱 Seeding Teachers...');
    
    const sql = `
      INSERT OR REPLACE INTO teachers 
      (id, employee_id, name, email, subject, class_teacher, phone, profile_image, join_date, status, created_at, updated_at)
      VALUES (
        1,
        '${this.escapeString(currentTeacher.id)}',
        '${this.escapeString(currentTeacher.name)}',
        '${this.escapeString(currentTeacher.email)}',
        '${this.escapeString(currentTeacher.subject)}',
        '${this.escapeString(currentTeacher.classTeacher || '')}',
        '${this.escapeString(currentTeacher.phone)}',
        '${this.escapeString(currentTeacher.profileImage || '')}',
        ${this.formatDate(currentTeacher.joinDate)},
        '${this.escapeString(currentTeacher.status)}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await this.runCommand(
        `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
        'Seeding current teacher'
      );
    } catch (error) {
      console.log('⚠️  Skip seeding current teacher');
    }
  }

  // Seed classes data
  async seedClasses() {
    console.log('\n🌱 Seeding Classes...');
    
    for (const classItem of teacherClasses) {
      const sql = `
        INSERT OR REPLACE INTO classes 
        (id, class_id, name, grade, major, homeroom_teacher_id, student_count, academic_year, status, created_at, updated_at)
        VALUES (
          ${parseInt(classItem.id.replace('CLS', ''))},
          '${this.escapeString(classItem.id)}',
          '${this.escapeString(classItem.name)}',
          ${classItem.grade},
          '${this.escapeString(classItem.major)}',
          1,  // Assuming the first teacher is the homeroom teacher
          ${classItem.studentCount},
          '${this.escapeString(classItem.academicYear)}',
          'active',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding class: ${classItem.name}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding class: ${classItem.name}`);
      }
    }
  }

  // Seed subjects data
  async seedSubjects() {
    console.log('\n🌱 Seeding Subjects...');
    
    for (const subject of subjects) {
      const teacherId = 1; // Assuming the first teacher teaches all subjects
      
      const sql = `
        INSERT OR REPLACE INTO subjects 
        (id, subject_id, name, code, teacher_id, credits, description, created_at, updated_at)
        VALUES (
          ${parseInt(subject.id.replace('SUBJ', ''))},
          '${this.escapeString(subject.id)}',
          '${this.escapeString(subject.name)}',
          '${this.escapeString(subject.code)}',
          ${teacherId},
          ${subject.credits},
          '${this.escapeString(subject.description)}',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding subject: ${subject.name}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding subject: ${subject.name}`);
      }
    }
  }

  // Seed students data
  async seedStudents() {
    console.log('\n🌱 Seeding Students...');
    
    const sql = `
      INSERT OR REPLACE INTO students 
      (id, student_id, name, email, class_id, academic_year, date_of_birth, address, phone, parent_phone, profile_image, enrollment_date, status, created_at, updated_at)
      VALUES (
        1,
        '${this.escapeString(currentStudent.id)}',
        '${this.escapeString(currentStudent.name)}',
        '${this.escapeString(currentStudent.email)}',
        1,  // Assuming the first class
        '${this.escapeString(currentStudent.academicYear)}',
        ${this.formatDate(currentStudent.dateOfBirth)},
        '${this.escapeString(currentStudent.address)}',
        '${this.escapeString(currentStudent.phone)}',
        '${this.escapeString(currentStudent.parentPhone)}',
        '${this.escapeString(currentStudent.profileImage || '')}',
        ${this.formatDate(currentStudent.enrollmentDate)},
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await this.runCommand(
        `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
        'Seeding current student'
      );
    } catch (error) {
      console.log('⚠️  Skip seeding current student');
    }
  }

  // Seed grades data
  async seedGrades() {
    console.log('\n🌱 Seeding Grades...');
    
    for (const grade of studentGrades) {
      const sql = `
        INSERT OR REPLACE INTO grades 
        (id, student_id, subject_id, semester, academic_year, midterm_score, final_score, assignment_score, attendance_score, final_grade, grade_point, status, created_at, updated_at)
        VALUES (
          ${parseInt(grade.id.replace('GRD', ''))},
          1,  // Assuming the first student
          ${parseInt(grade.subjectId.replace('SUBJ', ''))},
          ${grade.semester},
          '${this.escapeString(grade.academicYear)}',
          ${grade.midtermScore || 'NULL'},
          ${grade.finalScore || 'NULL'},
          ${grade.assignmentScore || 'NULL'},
          ${grade.attendanceScore || 'NULL'},
          '${this.escapeString(grade.finalGrade || '')}',
          ${grade.gradePoint || 'NULL'},
          '${this.escapeString(grade.status)}',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding grade for subject: ${grade.subjectName}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding grade for subject: ${grade.subjectName}`);
      }
    }
  }

  // Seed attendance data
  async seedAttendance() {
    console.log('\n🌱 Seeding Attendance...');
    
    for (const attendance of attendanceData) {
      const subjectId = subjects.find(s => s.name === attendance.subject)?.id;
      const subjectDbId = subjectId ? parseInt(subjectId.replace('SUBJ', '')) : 'NULL';
      
      const sql = `
        INSERT OR REPLACE INTO attendance 
        (id, student_id, date, subject_id, status, notes, created_at, updated_at)
        VALUES (
          ${parseInt(attendance.id.replace('ATT', ''))},
          1,  // Assuming the first student
          ${this.formatDate(attendance.date)},
          ${subjectDbId},
          '${this.escapeString(attendance.status)}',
          '${this.escapeString(attendance.notes || '')}',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding attendance record for date: ${attendance.date}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding attendance record for date: ${attendance.date}`);
      }
    }
  }

  // Seed schedule data
  async seedSchedule() {
    console.log('\n🌱 Seeding Schedule...');
    
    for (const schedule of weeklySchedule) {
      const subjectId = subjects.find(s => s.code === schedule.subjectCode)?.id;
      const subjectDbId = subjectId ? parseInt(subjectId.replace('SUBJ', '')) : 'NULL';
      
      // Parse time range
      const [timeStart, timeEnd] = schedule.time.split(' - ');
      
      const sql = `
        INSERT OR REPLACE INTO schedule 
        (id, class_id, subject_id, day, time_start, time_end, room, type, academic_year, created_at, updated_at)
        VALUES (
          ${parseInt(schedule.id.replace('SCH', ''))},
          1,  // Assuming the first class
          ${subjectDbId},
          '${this.escapeString(schedule.day)}',
          '${this.escapeString(timeStart)}',
          '${this.escapeString(timeEnd)}',
          '${this.escapeString(schedule.room)}',
          '${this.escapeString(schedule.type)}',
          '${this.escapeString(currentStudent.academicYear)}',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding schedule for day: ${schedule.day}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding schedule for day: ${schedule.day}`);
      }
    }
  }

  // Seed announcements data
  async seedAnnouncements() {
    console.log('\n🌱 Seeding Announcements...');
    
    for (const announcement of announcements) {
      const sql = `
        INSERT OR REPLACE INTO announcements 
        (id, title, content, category, priority, publish_date, is_read, created_at, updated_at)
        VALUES (
          ${parseInt(announcement.id.replace('ANN', ''))},
          '${this.escapeString(announcement.title)}',
          '${this.escapeString(announcement.content)}',
          '${this.escapeString(announcement.category)}',
          '${this.escapeString(announcement.priority)}',
          ${this.formatDate(announcement.date)},
          ${announcement.isRead ? 1 : 0},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      `;
      
      try {
        await this.runCommand(
          `echo "${sql}" | npx wrangler d1 execute ${DB_NAME} --command`,
          `Seeding announcement: ${announcement.title}`
        );
      } catch (error) {
        console.log(`⚠️  Skip seeding announcement: ${announcement.title}`);
      }
    }
  }

  async run() {
    console.log('🚀 Starting Database Seeding...\n');

    try {
      // Seed all data
      await this.seedFeaturedPrograms();
      await this.seedLatestNews();
      await this.seedRelatedLinks();
      await this.seedTeachers();
      await this.seedClasses();
      await this.seedSubjects();
      await this.seedStudents();
      await this.seedGrades();
      await this.seedAttendance();
      await this.seedSchedule();
      await this.seedAnnouncements();

      console.log('\n🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('\n❌ Database seeding failed:', error.message);
      process.exit(1);
    }
  }
}

// Run seeder
const seeder = new DatabaseSeeder();
seeder.run().catch(console.error);