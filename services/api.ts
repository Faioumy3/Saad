import { Teacher, Student, AttendanceRecord, StudentDailyRecord } from '../types';

// Mock Data Initialization
const INITIAL_TEACHERS: Record<string, Teacher> = {
  'eman': { 
    name: 'إيمان الصباغ', 
    code: 'eman', 
    password: 'eman2025', 
    email: 'ahmed@example.com',
    students: [
      { id: '31201261802388', name: 'أروى نصر الحسيني المزين' },
      { id: '31112141802322', name: 'بسملة رضا جابر ساري' },
      { id: '31203151804361', name: 'بسملة سعيد إسماعيل نوار' },
      { id: '31210201800741', name: 'جنى إبراهيم أحمد الفاضلي' },
      { id: '31110171800976', name: 'سعد محمود سعد عبد الرحيم' },
      { id: '30905231802441', name: 'سمر سعد حسني الشاعر' },
      { id: '31205031802805', name: 'ليلى سمارة محمود الحلو' },
      { id: '31205101802344', name: 'بسملة محمد محمد الهنداوي' },
      { id: '31008141800301', name: 'جنات رضا عبد النبي حيدر' },
      { id: '31303161802728', name: 'خلود وائل نصر الفيومي' }
    ]
  },
  'samar': { 
    name: 'سمر الشاعر', 
    code: 'samar', 
    password: 'samar2025', 
    email: 'samar@example.com',
    students: [
      { id: '31309271801245', name: 'روان قطب إبراهيم أبوبكر' },
      { id: '31206201801651', name: 'محمد رمضان محمد محمد ساري' },
      { id: '31206211801161', name: 'مريم علي السيد نصر' },
      { id: '30901011806327', name: 'إيمان محمد عبد الحميد الصباغ' },
      { id: '31407171806209', name: 'آية محمود سعد عبد الرحيم' },
      { id: '31111111800884', name: 'تميمة مدحت أحمد الدهمة' },
      { id: '31408031801629', name: 'ريناد رزق سالم أبونوارج' },
      { id: '31001311801966', name: 'سمية عمر محمد القريشي' },
      { id: '31601261802378', name: 'محمد محمود إبراهيم الرويني' }
    ]
  }
};

const STORAGE_KEYS = {
  TEACHERS: 'quran_app_teachers',
  STUDENTS: 'quran_app_students',
  ATTENDANCE: 'quran_app_attendance',
  STUDENT_LOGS: 'quran_app_student_logs',
  ADMIN_PWD: 'quran_app_admin_pwd'
};

// Helper to get from local storage with default
const getStored = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultVal;
  }
};

const setStored = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const api = {
  // Admin Auth
  getAdminPassword: (): string => {
    return getStored(STORAGE_KEYS.ADMIN_PWD, 'admin2025');
  },

  setAdminPassword: (password: string) => {
    setStored(STORAGE_KEYS.ADMIN_PWD, password);
  },

  // Teachers
  getTeachers: (): Record<string, Teacher> => {
    return getStored(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  },
  
  saveTeacher: (teacher: Teacher) => {
    const teachers = api.getTeachers();
    teachers[teacher.code] = teacher;
    setStored(STORAGE_KEYS.TEACHERS, teachers);
  },

  deleteTeacher: (code: string) => {
    const teachers = api.getTeachers();
    delete teachers[code];
    setStored(STORAGE_KEYS.TEACHERS, teachers);
  },

  // Students (Global Registry)
  getStudents: (): Student[] => {
    return getStored(STORAGE_KEYS.STUDENTS, []);
  },

  registerStudent: (student: Student) => {
    const students = api.getStudents();
    students.push(student);
    setStored(STORAGE_KEYS.STUDENTS, students);
  },

  updateStudent: (student: Student) => {
    const students = api.getStudents();
    const idx = students.findIndex(s => s.id === student.id || (s.code && s.code === student.code));
    if (idx >= 0) {
      students[idx] = student;
      setStored(STORAGE_KEYS.STUDENTS, students);
    }
  },

  deleteStudent: (id: string) => {
    const students = api.getStudents().filter(s => s.id !== id);
    setStored(STORAGE_KEYS.STUDENTS, students);
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => {
    return getStored(STORAGE_KEYS.ATTENDANCE, []);
  },

  saveAttendanceBatch: (records: AttendanceRecord[]) => {
    const current = api.getAttendance();
    setStored(STORAGE_KEYS.ATTENDANCE, [...current, ...records]);
  },

  // Student Logs
  getStudentLogs: (studentCode: string): StudentDailyRecord[] => {
    const allLogs = getStored<Record<string, StudentDailyRecord[]>>(STORAGE_KEYS.STUDENT_LOGS, {});
    return allLogs[studentCode] || [];
  },

  saveStudentLog: (studentCode: string, record: StudentDailyRecord) => {
    const allLogs = getStored<Record<string, StudentDailyRecord[]>>(STORAGE_KEYS.STUDENT_LOGS, {});
    if (!allLogs[studentCode]) allLogs[studentCode] = [];
    allLogs[studentCode].push(record);
    setStored(STORAGE_KEYS.STUDENT_LOGS, allLogs);
  },

  // Reports
  exportData: () => {
    return {
      teachers: api.getTeachers(),
      students: api.getStudents(),
      attendance: api.getAttendance(),
      studentLogs: getStored<Record<string, StudentDailyRecord[]>>(STORAGE_KEYS.STUDENT_LOGS, {})
    };
  },

  importData: (data: any) => {
    if (data.teachers) setStored(STORAGE_KEYS.TEACHERS, data.teachers);
    if (data.students) setStored(STORAGE_KEYS.STUDENTS, data.students);
    if (data.attendance) setStored(STORAGE_KEYS.ATTENDANCE, data.attendance);
    if (data.studentLogs) setStored(STORAGE_KEYS.STUDENT_LOGS, data.studentLogs);
  }
};