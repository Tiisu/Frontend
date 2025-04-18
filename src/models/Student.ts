export interface Student {
  id: string;
  walletAddress: string;
  name: string;
  email: string;
  departmentId: number;
  institutionId: number;
  year: number;
  dateAdded: number;
  status: 'active' | 'inactive' | 'graduated';
}

// Generate a unique ID for new students
export const generateStudentId = (): string => {
  return `STU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
};
