import React, { useState } from 'react';
import Layout from '@/components/Layout';
import InstitutionData from '../components/InstitutionData';
import { Institution, Department } from '../lib/blockchain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const InstitutionsPage: React.FC = () => {
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectionMode, setSelectionMode] = useState<'none' | 'institution' | 'department'>('institution');

  const handleInstitutionSelect = (institution: Institution) => {
    setSelectedInstitution(institution);
    // If we're selecting an institution, clear any previously selected department
    setSelectedDepartment(null);
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
  };

  const handleContinue = () => {
    // Here you would typically navigate to another page or perform an action with the selected institution/department
    console.log('Selected institution:', selectedInstitution);
    console.log('Selected department:', selectedDepartment);

    // For demonstration purposes, show an alert
    if (selectionMode === 'institution' && selectedInstitution) {
      alert(`You selected: ${selectedInstitution.name}`);
    } else if (selectionMode === 'department' && selectedDepartment) {
      alert(`You selected: ${selectedDepartment.name} department`);
    } else {
      alert('Please make a selection first');
    }
  };

  const toggleSelectionMode = () => {
    if (selectionMode === 'institution') {
      setSelectionMode('department');
    } else {
      setSelectionMode('institution');
      // Clear department selection when switching back to institution mode
      setSelectedDepartment(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-university-navy">University Institutions</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Select an Institution</CardTitle>
              <CardDescription>
                Choose the institution you want to work with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {selectedInstitution ? (
                  <p>You selected: <strong>{selectedInstitution.name}</strong></p>
                ) : (
                  <p>No institution selected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selection Mode</CardTitle>
              <CardDescription>
                Choose what you want to select
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={toggleSelectionMode}
                variant="outline"
                className="w-full"
              >
                {selectionMode === 'institution' ? 'Switch to Department Selection' : 'Switch to Institution Selection'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department</CardTitle>
              <CardDescription>
                {selectionMode === 'department' ? 'Select a department' : 'Switch to department mode to select'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {selectedDepartment ? (
                  <p>You selected: <strong>{selectedDepartment.name}</strong></p>
                ) : (
                  <p>No department selected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Button onClick={handleContinue} className="w-full bg-university-gold text-university-navy hover:bg-university-gold/90">
            Continue with Selection
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-university-navy">Select from Available Institutions</h2>
          <p className="mb-6 text-gray-600">
            {selectionMode === 'institution'
              ? 'Click on an institution to select it.'
              : 'Expand an institution and click on a department to select it.'}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Using mock data for demonstration purposes.
          </p>

          <InstitutionData
            onSelectInstitution={handleInstitutionSelect}
            onSelectDepartment={handleDepartmentSelect}
            selectedInstitutionId={selectedInstitution?.id}
            selectedDepartmentId={selectedDepartment?.id}
            selectionMode={selectionMode}
          />
        </div>
      </div>
    </Layout>
  );
};

export default InstitutionsPage;
