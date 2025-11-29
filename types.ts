export interface Student {
  id: string;
  name: string;
  code?: string;
  password?: string;
  class?: string;
  registrationDate?: string;
}

export interface Teacher {
  code: string;
  name: string;
  password?: string;
  email?: string;
  students: Student[];
}

export interface AttendanceRecord {
  id: string;
  teacherCode: string;
  studentName: string;
  status: 'present' | 'absent';
  notes: string;
  date: string;
  timestamp: string;
}

export interface StudentDailyRecord {
  date: string;
  dateDisplay: string;
  newMemorizing: string;
  review: string;
  listening: string;
  newTarget: string;
  notes: string;
}

export type ViewState = 
  | 'HOME' 
  | 'LOGIN_TEACHER' 
  | 'LOGIN_ADMIN' 
  | 'LOGIN_STUDENT' 
  | 'REGISTER_STUDENT'
  | 'DASHBOARD_TEACHER' 
  | 'DASHBOARD_ADMIN' 
  | 'DASHBOARD_STUDENT';

export interface UserSession {
  type: 'admin' | 'teacher' | 'student';
  data?: any;
}
