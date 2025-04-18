import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, generateStudentId } from '@/models/Student';

// Define the student store
interface StudentStore {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'dateAdded'>) => Student;
  addStudents: (students: Omit<Student, 'id' | 'dateAdded'>[]) => Student[];
  updateStudent: (id: string, updates: Partial<Omit<Student, 'id'>>) => boolean;
  deleteStudent: (id: string) => boolean;
  getStudentByWallet: (walletAddress: string) => Student | undefined;
  getStudentsByDepartment: (departmentId: number) => Student[];
  getStudentsByInstitution: (institutionId: number) => Student[];
}

// Create the student store with persistence
export const useStudentStore = create<StudentStore>()(
  persist(
    (set, get) => ({
      // Initialize with some mock students including one with a wallet address that will match the connected user
      students: [
        {
          id: 'STU-ADMIN-1',
          walletAddress: '0x1234567890123456789012345678901234567890', // This should match the connected wallet for testing
          name: 'Admin User',
          email: 'admin@example.com',
          departmentId: 1,
          institutionId: 1,
          year: 2023,
          dateAdded: Date.now(),
          status: 'active'
        }
      ],

      addStudent: (studentData) => {
        const newStudent: Student = {
          id: generateStudentId(),
          dateAdded: Date.now(),
          ...studentData
        };

        set((state) => ({
          students: [...state.students, newStudent]
        }));

        return newStudent;
      },

      addStudents: (studentsData) => {
        const newStudents = studentsData.map(studentData => ({
          id: generateStudentId(),
          dateAdded: Date.now(),
          ...studentData
        }));

        set((state) => ({
          students: [...state.students, ...newStudents]
        }));

        return newStudents;
      },

      updateStudent: (id, updates) => {
        const student = get().students.find(s => s.id === id);
        if (!student) return false;

        set((state) => ({
          students: state.students.map(s =>
            s.id === id ? { ...s, ...updates } : s
          )
        }));

        return true;
      },

      deleteStudent: (id) => {
        const studentExists = get().students.some(s => s.id === id);
        if (!studentExists) return false;

        set((state) => ({
          students: state.students.filter(s => s.id !== id)
        }));

        return true;
      },

      getStudentByWallet: (walletAddress) => {
        return get().students.find(s =>
          s.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
      },

      getStudentsByDepartment: (departmentId) => {
        return get().students.filter(s => s.departmentId === departmentId);
      },

      getStudentsByInstitution: (institutionId) => {
        return get().students.filter(s => s.institutionId === institutionId);
      }
    }),
    {
      name: 'student-store'
    }
  )
);

// Helper function to get a student by wallet address
export const getStudentByWallet = (walletAddress: string): Student | undefined => {
  return useStudentStore.getState().getStudentByWallet(walletAddress);
};

// Helper function to add a new student
export const addStudent = (
  walletAddress: string,
  name: string,
  email: string,
  departmentId: number,
  institutionId: number,
  year: number,
  status: 'active' | 'inactive' | 'graduated' = 'active'
): Student => {
  return useStudentStore.getState().addStudent({
    walletAddress,
    name,
    email,
    departmentId,
    institutionId,
    year,
    status
  });
};

// Helper function to add multiple students at once
export const addStudents = (
  students: Omit<Student, 'id' | 'dateAdded'>[]
): Student[] => {
  return useStudentStore.getState().addStudents(students);
};

// Helper function to parse Excel file data
export const parseExcelData = async (file: File): Promise<Omit<Student, 'id' | 'dateAdded'>[]> => {
  // In a real implementation, we would use a library like xlsx to parse the Excel file
  // For this demo, we'll simulate parsing with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data - in a real implementation, this would come from the Excel file
      const mockStudents: Omit<Student, 'id' | 'dateAdded'>[] = [
        {
          walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
          name: 'John Doe',
          email: 'john.doe@example.com',
          departmentId: 1,
          institutionId: 1,
          year: 2023,
          status: 'active'
        },
        {
          walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          departmentId: 2,
          institutionId: 1,
          year: 2023,
          status: 'active'
        },
        {
          walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          departmentId: 3,
          institutionId: 2,
          year: 2023,
          status: 'active'
        }
      ];

      resolve(mockStudents);
    }, 1000);
  });
};
