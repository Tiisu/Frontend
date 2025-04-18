
import { ethers } from 'ethers';

// ABI for the University Project Repository contract
const contractABI = [
  // Project Registration Functions
  "function registerProject(string title, string ipfsHash, uint256 departmentId, uint256 year, string description, uint8 accessLevel) external returns (uint256)",

  // Project Retrieval Functions
  "function getProjectById(uint256 projectId) external view returns (uint256 projectId, string title, address[] authors, uint256 uploadDate, string ipfsHash, uint256 departmentId, uint256 year, string description, uint8 accessLevel)",
  "function getProjectsByDepartment(uint256 departmentId, uint256 start, uint256 limit) external view returns (uint256[])",
  "function getProjectsByYear(uint256 year, uint256 start, uint256 limit) external view returns (uint256[])",
  "function getProjectsByAuthor(address author, uint256 start, uint256 limit) external view returns (uint256[])",
  "function getTotalProjects() external view returns (uint256)",

  // Access Control Functions
  "function getProjectAccessLevel(uint256 projectId) external view returns (uint8)",
  "function setProjectAccessLevel(uint256 projectId, uint8 accessLevel) external",
  "function canUserViewProject(uint256 projectId, address user) external view returns (bool)",

  // Institution Management Functions
  "function getAllInstitutions() external view returns (uint256[] ids, string[] names)",
  "function getDepartmentsByInstitution(uint256 institutionId) external view returns (uint256[] ids, string[] names)",
  "function registerUserWithDepartment(address user, uint256 departmentId, bool isStudent) external",
  "function setInstitutionalAdmin(address admin, bool isAdmin) external",
  "function getUserInfo(address user) external view returns (bool isRegistered, bool isStudent, bool isAdmin, uint256 departmentId, uint256 institutionId)",
  "function getStudentsByDepartment(uint256 departmentId) external view returns (address[])",
  "function isInstitutionAdmin(address user, uint256 institutionId) external view returns (bool)",

  // Events
  "event ProjectRegistered(uint256 indexed projectId, string title, address indexed uploader, uint256 indexed departmentId, uint8 accessLevel, uint256 timestamp)",
  "event AccessLevelChanged(uint256 indexed projectId, uint8 oldAccessLevel, uint8 newAccessLevel, address indexed changedBy, uint256 timestamp)",
  "event DepartmentAdded(uint256 indexed departmentId, string name, uint256 indexed institutionId, address indexed addedBy, uint256 timestamp)",
  "event InstitutionAdded(uint256 indexed institutionId, string name, address indexed addedBy, uint256 timestamp)",
  "event UserRegistered(address indexed user, uint256 indexed departmentId, uint256 indexed institutionId, bool isStudent, address registeredBy, uint256 timestamp)"
];

// Access level enum mapping
export enum AccessLevel {
  Public = 0,
  Restricted = 1,
  Private = 2
}

// Institution enum mapping
export enum InstitutionEnum {
  UniversityOfTechnology = 0,
  StateUniversity = 1,
  NationalCollege = 2,
  TechnicalInstitute = 3,
  MedicalUniversity = 4
}

// Department enum mapping
export enum DepartmentEnum {
  // University of Technology Departments (1-3)
  ComputerScience = 0,
  ElectricalEngineering = 1,
  MechanicalEngineering = 2,

  // State University Departments (4-6)
  BusinessAdministration = 3,
  Economics = 4,
  Law = 5,

  // National College Departments (7-9)
  Mathematics = 6,
  Physics = 7,
  Chemistry = 8,

  // Technical Institute Departments (10-12)
  CivilEngineering = 9,
  Architecture = 10,
  UrbanPlanning = 11,

  // Medical University Departments (13-15)
  Medicine = 12,
  Pharmacy = 13,
  Nursing = 14
}

export interface ProjectData {
  id: number;
  title: string;
  authors: string[];
  uploadDate: number;
  ipfsHash: string;
  departmentId: number;
  year: number;
  description: string;
  accessLevel: AccessLevel;
  aiSummary?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Institution {
  id: number;
  name: string;
}

export interface UserInfo {
  isRegistered: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  departmentId: number;
  institutionId: number;
}

// The address of the deployed contract (from .env file)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xaF7993E02C51cb2c40837eE8c58750490112d3AE";

// Connect to the provider (injected provider like MetaMask)
export async function getProvider() {
  // This is for connecting to the injected provider (MetaMask)
  if (window.ethereum) {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      return new ethers.BrowserProvider(window.ethereum);
    } catch (error) {
      console.error("User denied account access");
      throw error;
    }
  } else {
    throw new Error("Ethereum provider not detected. Please install MetaMask or a compatible wallet.");
  }
}

// Get contract instance with signer
export async function getContract() {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}

// Get contract instance with provider (for read-only operations)
export async function getContractReadOnly() {
  const provider = await getProvider();

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
}

// Register a new project
export async function registerProject(
  title: string,
  description: string,
  ipfsHash: string,
  departmentId: number,
  year: number,
  accessLevel: AccessLevel
) {
  const contract = await getContract();

  try {
    const tx = await contract.registerProject(
      title,
      ipfsHash,
      departmentId,
      year,
      description,
      accessLevel
    );

    const receipt = await tx.wait();

    // Find the ProjectRegistered event
    const event = receipt.logs
      .filter(log => {
        const decoded = contract.interface.parseLog(log);
        return decoded?.name === 'ProjectRegistered';
      })
      .map(log => contract.interface.parseLog(log))[0];

    if (event) {
      const projectId = event.args[0];
      return projectId;
    }

    throw new Error("Failed to register project: Event not emitted");
  } catch (error) {
    console.error("Error registering project:", error);
    throw error;
  }
}

// Get project by ID
export async function getProjectById(projectId: number): Promise<ProjectData> {
  const contract = await getContractReadOnly();

  try {
    const project = await contract.getProjectById(projectId);
    return {
      id: Number(project.id),
      title: project.title,
      authors: project.authors,
      uploadDate: Number(project.uploadDate),
      ipfsHash: project.ipfsHash,
      departmentId: Number(project.departmentId),
      year: Number(project.year),
      description: project.description,
      accessLevel: project.accessLevel
    };
  } catch (error) {
    console.error(`Error getting project with ID ${projectId}:`, error);
    throw error;
  }
}

// Get projects by department
export async function getProjectsByDepartment(departmentId: number): Promise<number[]> {
  const contract = await getContractReadOnly();

  try {
    const projectIds = await contract.getProjectsByDepartment(departmentId);
    return projectIds.map((id: ethers.BigNumberish) => Number(id));
  } catch (error) {
    console.error(`Error getting projects for department ${departmentId}:`, error);
    throw error;
  }
}

// Get projects by year
export async function getProjectsByYear(year: number): Promise<number[]> {
  const contract = await getContractReadOnly();

  try {
    const projectIds = await contract.getProjectsByYear(year);
    return projectIds.map((id: ethers.BigNumberish) => Number(id));
  } catch (error) {
    console.error(`Error getting projects for year ${year}:`, error);
    throw error;
  }
}

// Get projects by author
export async function getProjectsByAuthor(author: string): Promise<number[]> {
  const contract = await getContractReadOnly();

  try {
    const projectIds = await contract.getProjectsByAuthor(author);
    return projectIds.map((id: ethers.BigNumberish) => Number(id));
  } catch (error) {
    console.error(`Error getting projects for author ${author}:`, error);
    throw error;
  }
}

// Change project access level
export async function setProjectAccessLevel(projectId: number, accessLevel: AccessLevel) {
  const contract = await getContract();

  try {
    const tx = await contract.setProjectAccessLevel(projectId, accessLevel);
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error setting access level for project ${projectId}:`, error);
    throw error;
  }
}

// Get all institutions
export async function getAllInstitutions(): Promise<Institution[]> {
  const contract = await getContractReadOnly();

  try {
    const [ids, names] = await contract.getAllInstitutions();

    const institutions: Institution[] = [];
    for (let i = 0; i < ids.length; i++) {
      institutions.push({
        id: Number(ids[i]),
        name: names[i]
      });
    }

    return institutions;
  } catch (error) {
    console.error('Error getting institutions:', error);
    throw error;
  }
}

// Get departments for an institution
export async function getDepartmentsByInstitution(institutionId: number): Promise<Department[]> {
  const contract = await getContractReadOnly();

  try {
    const [ids, names] = await contract.getDepartmentsByInstitution(institutionId);

    const departments: Department[] = [];
    for (let i = 0; i < ids.length; i++) {
      departments.push({
        id: Number(ids[i]),
        name: names[i]
      });
    }

    return departments;
  } catch (error) {
    console.error(`Error getting departments for institution ${institutionId}:`, error);
    throw error;
  }
}

// Check if a project can be viewed by the current user
export async function canViewProject(projectId: number, address: string): Promise<boolean> {
  const contract = await getContractReadOnly();

  try {
    return await contract.canUserViewProject(projectId, address);
  } catch (error) {
    console.error(`Error checking view access for project ${projectId}:`, error);
    return false;
  }
}

// Get user information
export async function getUserInfo(address: string): Promise<UserInfo> {
  const contract = await getContractReadOnly();

  try {
    const [isRegistered, isStudent, isAdmin, departmentId, institutionId] = await contract.getUserInfo(address);

    return {
      isRegistered,
      isStudent,
      isAdmin,
      departmentId: Number(departmentId),
      institutionId: Number(institutionId)
    };
  } catch (error) {
    console.error(`Error getting user info for ${address}:`, error);
    throw error;
  }
}

// Register a user with a department
export async function registerUserWithDepartment(user: string, departmentId: number, isStudent: boolean): Promise<boolean> {
  const contract = await getContract();

  try {
    const tx = await contract.registerUserWithDepartment(user, departmentId, isStudent);
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error registering user with department:`, error);
    throw error;
  }
}

// Set a user as an institutional admin
export async function setInstitutionalAdmin(admin: string, isAdmin: boolean): Promise<boolean> {
  const contract = await getContract();

  try {
    const tx = await contract.setInstitutionalAdmin(admin, isAdmin);
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error setting institutional admin:`, error);
    throw error;
  }
}

// Get students by department
export async function getStudentsByDepartment(departmentId: number): Promise<string[]> {
  const contract = await getContractReadOnly();

  try {
    return await contract.getStudentsByDepartment(departmentId);
  } catch (error) {
    console.error(`Error getting students for department ${departmentId}:`, error);
    throw error;
  }
}

// Check if a user is an admin for a specific institution
export async function isInstitutionAdmin(user: string, institutionId: number): Promise<boolean> {
  const contract = await getContractReadOnly();

  try {
    return await contract.isInstitutionAdmin(user, institutionId);
  } catch (error) {
    console.error(`Error checking if user ${user} is admin for institution ${institutionId}:`, error);
    return false;
  }
}

// Mock department data for testing UI
export const mockDepartments = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Electrical Engineering" },
  { id: 3, name: "Mechanical Engineering" },
  { id: 4, name: "Civil Engineering" },
  { id: 5, name: "Economics" },
  { id: 6, name: "Business Administration" },
  { id: 7, name: "Mathematics" },
  { id: 8, name: "Physics" },
  { id: 9, name: "Chemistry" },
  { id: 10, name: "Biology" }
];

// Mock project data for testing UI
export const mockProjects: ProjectData[] = [
  {
    id: 1,
    title: "Decentralized Identity Management System",
    authors: ["0x1234567890123456789012345678901234567890"],
    uploadDate: Date.now() - 86400000 * 5, // 5 days ago
    ipfsHash: "QmT8TstX4ngjQwvQfS9ZnuXAT3Cmey1NefdRs5QXwXFiP7",
    departmentId: 1,
    year: 2023,
    description: "A blockchain-based identity management system that allows users to control their personal data and share it securely with service providers.",
    accessLevel: AccessLevel.Public
  },
  {
    id: 2,
    title: "Smart Grid Energy Distribution",
    authors: ["0x2345678901234567890123456789012345678901"],
    uploadDate: Date.now() - 86400000 * 10, // 10 days ago
    ipfsHash: "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",
    departmentId: 2,
    year: 2023,
    description: "An intelligent energy distribution system that uses IoT devices and blockchain to optimize energy consumption in smart buildings.",
    accessLevel: AccessLevel.Restricted
  },
  {
    id: 3,
    title: "Blockchain-based Supply Chain Management",
    authors: ["0x3456789012345678901234567890123456789012"],
    uploadDate: Date.now() - 86400000 * 15, // 15 days ago
    ipfsHash: "QmZMHCFoYMfxw7bUca4wRtmD8ubWxucJNAqjTgG5ATJLVd",
    departmentId: 6,
    year: 2023,
    description: "A supply chain management system that uses blockchain to track products from manufacturer to consumer, ensuring authenticity and transparency.",
    accessLevel: AccessLevel.Public
  },
  {
    id: 4,
    title: "Privacy-Preserving Machine Learning",
    authors: ["0x4567890123456789012345678901234567890123"],
    uploadDate: Date.now() - 86400000 * 20, // 20 days ago
    ipfsHash: "QmSgvgwxZGMrjhpVNvKmh3mBJhgUVfhKhrSVnxKzCGNnxk",
    departmentId: 1,
    year: 2023,
    description: "A machine learning framework that preserves data privacy by using federated learning and secure multi-party computation.",
    accessLevel: AccessLevel.Private
  },
  {
    id: 5,
    title: "Sustainable Building Materials Analysis",
    authors: ["0x5678901234567890123456789012345678901234"],
    uploadDate: Date.now() - 86400000 * 25, // 25 days ago
    ipfsHash: "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ",
    departmentId: 4,
    year: 2023,
    description: "Analysis of sustainable building materials and their impact on energy consumption and carbon footprint in modern construction.",
    accessLevel: AccessLevel.Public
  },
  {
    id: 6,
    title: "Quantum Algorithm for Optimization Problems",
    authors: ["0x6789012345678901234567890123456789012345"],
    uploadDate: Date.now() - 86400000 * 30, // 30 days ago
    ipfsHash: "QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D",
    departmentId: 7,
    year: 2023,
    description: "A quantum computing algorithm designed to solve complex optimization problems more efficiently than classical approaches.",
    accessLevel: AccessLevel.Restricted
  }
];
