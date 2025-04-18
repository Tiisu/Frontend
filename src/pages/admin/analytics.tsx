import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useStudentStore } from '@/services/studentService';
import { useProjectStore } from '@/services/projectService';
import { mockDepartmentsByInstitution, mockInstitutions } from '@/components/InstitutionData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, LineChart, PieChart } from 'lucide-react';

// Mock chart components - in a real implementation, you would use a charting library like Chart.js or Recharts
const MockBarChart: React.FC<{ data: any; title: string }> = ({ data, title }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">{title}</h3>
    <div className="h-64 bg-gray-50 rounded-lg border p-4 flex items-end space-x-2">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-university-blue rounded-t"
            style={{
              height: `${(item.value / Math.max(...data.map((d: any) => d.value))) * 180}px`,
            }}
          ></div>
          <div className="text-xs mt-2 text-gray-600 truncate w-full text-center">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MockLineChart: React.FC<{ data: any; title: string }> = ({ data, title }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">{title}</h3>
    <div className="h-64 bg-gray-50 rounded-lg border p-4 relative">
      <svg className="w-full h-full">
        <polyline
          points={data
            .map((point: any, index: number) => {
              const x = (index / (data.length - 1)) * 100;
              const max = Math.max(...data.map((d: any) => d.value));
              const y = 100 - (point.value / max) * 100;
              return `${x}%,${y}%`;
            })
            .join(' ')}
          fill="none"
          stroke="#0066cc"
          strokeWidth="2"
        />
        {data.map((point: any, index: number) => {
          const x = (index / (data.length - 1)) * 100;
          const max = Math.max(...data.map((d: any) => d.value));
          const y = 100 - (point.value / max) * 100;
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="#0066cc"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
        {data.map((point: any, index: number) => (
          <div key={index}>{point.label}</div>
        ))}
      </div>
    </div>
  </div>
);

const MockPieChart: React.FC<{ data: any; title: string }> = ({ data, title }) => {
  const colors = ['#0066cc', '#003366', '#0099ff', '#66ccff', '#003399', '#ffcc00'];
  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);

  let currentAngle = 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="h-64 bg-gray-50 rounded-lg border p-4 flex justify-center items-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item: any, index: number) => {
              const percentage = item.value / total;
              const angle = percentage * 360;

              // Calculate the SVG arc path
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;

              const startX = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 50 50`,
                `L ${startX} ${startY}`,
                `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`,
              ].join(' ');

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>

        <div className="ml-6 space-y-2">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700">
                {item.label} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminAnalyticsPage: React.FC = () => {
  const { students } = useStudentStore();
  const { projects } = useProjectStore();
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Get all institutions and departments
  // Convert mockDepartmentsByInstitution from Record<number, Department[]> to an array format
  const institutions = Object.entries(mockDepartmentsByInstitution).map(([id, departments]) => ({
    id: parseInt(id),
    name: mockInstitutions.find(inst => inst.id === parseInt(id))?.name || `Institution ${id}`,
    departments
  }));

  // Get unique years from projects
  const years = Array.from(
    new Set([...projects.map(p => p.year), new Date().getFullYear()])
  ).sort((a, b) => b - a);

  // Filter data based on selections
  const filteredProjects = projects.filter(project => {
    if (selectedInstitution !== 'all' && project.institutionId.toString() !== selectedInstitution) {
      return false;
    }

    if (selectedYear !== 'all' && project.year.toString() !== selectedYear) {
      return false;
    }

    return true;
  });

  const filteredStudents = students.filter(student => {
    if (selectedInstitution !== 'all' && student.institutionId.toString() !== selectedInstitution) {
      return false;
    }

    if (selectedYear !== 'all' && student.year.toString() !== selectedYear) {
      return false;
    }

    return true;
  });

  // Prepare chart data

  // Projects by department
  const projectsByDepartment = filteredProjects.reduce((acc: any, project) => {
    const departmentId = project.departmentId;

    if (!acc[departmentId]) {
      const department = institutions
        .flatMap(i => i.departments)
        .find(d => d.id === departmentId);

      acc[departmentId] = {
        label: department?.name || `Department ${departmentId}`,
        value: 0,
      };
    }

    acc[departmentId].value += 1;
    return acc;
  }, {});

  // Students by department
  const studentsByDepartment = filteredStudents.reduce((acc: any, student) => {
    const departmentId = student.departmentId;

    if (!acc[departmentId]) {
      const department = institutions
        .flatMap(i => i.departments)
        .find(d => d.id === departmentId);

      acc[departmentId] = {
        label: department?.name || `Department ${departmentId}`,
        value: 0,
      };
    }

    acc[departmentId].value += 1;
    return acc;
  }, {});

  // Projects by month (for the selected year)
  const projectsByMonth = Array(12)
    .fill(0)
    .map((_, index) => {
      const month = new Date(0, index).toLocaleString('default', { month: 'short' });

      const count = filteredProjects.filter(project => {
        const projectDate = new Date(project.uploadDate);
        return projectDate.getMonth() === index &&
               (selectedYear === 'all' || projectDate.getFullYear().toString() === selectedYear);
      }).length;

      return {
        label: month,
        value: count,
      };
    });

  // Projects by access level
  const projectsByAccessLevel = filteredProjects.reduce((acc: any, project) => {
    const accessLevel = project.accessLevel;
    const accessLevelName = accessLevel === 0 ? 'Public' : accessLevel === 1 ? 'Institution' : 'Private';

    if (!acc[accessLevel]) {
      acc[accessLevel] = {
        label: accessLevelName,
        value: 0,
      };
    }

    acc[accessLevel].value += 1;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Visualize data about students and projects
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={selectedInstitution}
              onValueChange={setSelectedInstitution}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id.toString()}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="projects">
          <TabsList className="mb-6">
            <TabsTrigger value="projects" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Project Analytics
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center">
              <LineChart className="mr-2 h-4 w-4" />
              Student Analytics
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center">
              <PieChart className="mr-2 h-4 w-4" />
              Department Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects by Department</CardTitle>
                  <CardDescription>
                    Number of projects submitted by each department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockBarChart
                    data={Object.values(projectsByDepartment)}
                    title="Projects by Department"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projects by Month</CardTitle>
                  <CardDescription>
                    Number of projects submitted each month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockLineChart
                    data={projectsByMonth}
                    title="Projects by Month"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projects by Access Level</CardTitle>
                  <CardDescription>
                    Distribution of projects by access level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockPieChart
                    data={Object.values(projectsByAccessLevel)}
                    title="Projects by Access Level"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Statistics</CardTitle>
                  <CardDescription>
                    Key metrics about projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Projects</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredProjects.length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Public Projects</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredProjects.filter(p => p.accessLevel === 0).length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Institution Projects</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredProjects.filter(p => p.accessLevel === 1).length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Private Projects</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredProjects.filter(p => p.accessLevel === 2).length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Average Projects per Student</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {filteredStudents.length > 0
                          ? (filteredProjects.length / filteredStudents.length).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Students by Department</CardTitle>
                  <CardDescription>
                    Number of students in each department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockBarChart
                    data={Object.values(studentsByDepartment)}
                    title="Students by Department"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Status</CardTitle>
                  <CardDescription>
                    Distribution of students by status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockPieChart
                    data={[
                      {
                        label: 'Active',
                        value: filteredStudents.filter(s => s.status === 'active').length,
                      },
                      {
                        label: 'Inactive',
                        value: filteredStudents.filter(s => s.status === 'inactive').length,
                      },
                      {
                        label: 'Graduated',
                        value: filteredStudents.filter(s => s.status === 'graduated').length,
                      },
                    ]}
                    title="Student Status"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Statistics</CardTitle>
                  <CardDescription>
                    Key metrics about students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredStudents.length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Active Students</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredStudents.filter(s => s.status === 'active').length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Inactive Students</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredStudents.filter(s => s.status === 'inactive').length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Graduated Students</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {filteredStudents.filter(s => s.status === 'graduated').length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Students with Projects</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {new Set(filteredProjects.map(p => p.creatorAddress)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects per Department</CardTitle>
                  <CardDescription>
                    Average number of projects per department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockBarChart
                    data={Object.values(projectsByDepartment).map((dept: any) => ({
                      label: dept.label,
                      value: dept.value / (studentsByDepartment[dept.label]?.value || 1),
                    }))}
                    title="Projects per Department"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Size</CardTitle>
                  <CardDescription>
                    Number of students in each department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockPieChart
                    data={Object.values(studentsByDepartment)}
                    title="Department Size"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Activity</CardTitle>
                  <CardDescription>
                    Projects submitted in the last 6 months by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MockLineChart
                    data={Object.values(projectsByDepartment).map((dept: any) => ({
                      label: dept.label,
                      value: filteredProjects.filter(p => {
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        return (
                          p.departmentId === parseInt(dept.id) &&
                          new Date(p.uploadDate) >= sixMonthsAgo
                        );
                      }).length,
                    }))}
                    title="Department Activity"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Statistics</CardTitle>
                  <CardDescription>
                    Key metrics about departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Departments</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {Object.keys(studentsByDepartment).length}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Active Departments</p>
                        <p className="text-2xl font-bold text-university-navy">
                          {Object.keys(projectsByDepartment).length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Most Active Department</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {Object.values(projectsByDepartment).length > 0
                          ? Object.values(projectsByDepartment).reduce(
                              (max: any, dept: any) => (dept.value > max.value ? dept : max),
                              { value: 0, label: 'None' }
                            ).label
                          : 'None'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Largest Department</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {Object.values(studentsByDepartment).length > 0
                          ? Object.values(studentsByDepartment).reduce(
                              (max: any, dept: any) => (dept.value > max.value ? dept : max),
                              { value: 0, label: 'None' }
                            ).label
                          : 'None'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;

