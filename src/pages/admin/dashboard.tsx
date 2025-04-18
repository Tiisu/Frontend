import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentStore } from '@/services/studentService';
import { useProjectStore } from '@/services/projectService';
import { mockDepartmentsByInstitution } from '@/components/InstitutionData';
import { Users, FileText, School, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { students } = useStudentStore();
  const { projects } = useProjectStore();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProjects: 0,
    activeStudents: 0,
    departmentsWithProjects: 0,
  });

  useEffect(() => {
    // Calculate dashboard statistics
    const activeStudents = students.filter(s => s.status === 'active').length;

    // Get unique departments with projects
    const departmentsWithProjects = new Set(
      projects.map(project => project.departmentId)
    ).size;

    setStats({
      totalStudents: students.length,
      totalProjects: projects.length,
      activeStudents,
      departmentsWithProjects,
    });
  }, [students, projects]);

  // Get departments for display
  // Convert mockDepartmentsByInstitution from Record<number, Department[]> to an array of departments
  const allDepartments = Object.values(mockDepartmentsByInstitution).flat();

  // Get recent students
  const recentStudents = [...students]
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 5);

  // Get recent projects
  const recentProjects = [...projects]
    .sort((a, b) => b.uploadDate - a.uploadDate)
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of students, projects, and institution data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeStudents} active
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProjects}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Across all departments
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{allDepartments.length}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.departmentsWithProjects} with projects
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <School className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalStudents > 0
                    ? Math.round((stats.totalProjects / stats.totalStudents) * 7.9)
                    : 0}%
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Projects per student
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>
                Recently added students to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentStudents.length > 0 ? (
                <div className="space-y-4">
                  {recentStudents.map(student => {
                    const department = allDepartments.find(d => d.id === student.departmentId);

                    return (
                      <div key={student.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                            {student.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{department?.name || 'Unknown Department'}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(student.dateAdded).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No students added yet
                </div>
              )}

              <Link
                to="/admin/students"
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all students
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Recently uploaded projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map(project => {
                    const department = allDepartments.find(d => d.id === project.departmentId);

                    return (
                      <div key={project.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium text-gray-900">{project.title}</p>
                          <p className="text-sm text-gray-500">{department?.name || 'Unknown Department'}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(project.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No projects uploaded yet
                </div>
              )}

              <Link
                to="/projects"
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all projects
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
