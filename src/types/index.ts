export interface Student {
  id: string;
  name: string;
  dateOfBirth: Date;
  age: number;
  gender: 'Female' | 'Male' | 'Transgender';
  fatherName: string;
  fatherMobile: string;
  motherMobile: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: Date;
  status: 'Present' | 'Absent' | 'Leave' | 'Holiday' | 'No Class';
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  totalStudents: number;
  averageAttendance: number;
  totalDays: number;
  presentDays: number;
}