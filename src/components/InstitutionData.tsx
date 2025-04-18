import { useState, useEffect } from 'react';
import { getAllInstitutions, getDepartmentsByInstitution, Institution, Department, InstitutionEnum, DepartmentEnum } from '../lib/blockchain';
import { useWallet } from '@/context/WalletContext';

interface InstitutionWithDepartments extends Institution {
  departments?: Department[];
  isExpanded?: boolean;
  isSelected?: boolean;
}

interface InstitutionDataProps {
  onSelectInstitution?: (institution: Institution) => void;
  onSelectDepartment?: (department: Department, institutionId: number) => void;
  selectedInstitutionId?: number;
  selectedDepartmentId?: number;
  selectionMode?: 'none' | 'institution' | 'department';
}

// Mock data for when blockchain connection fails
export const mockInstitutions: Institution[] = [
  { id: InstitutionEnum.UniversityOfTechnology, name: "University of Technology" },
  { id: InstitutionEnum.StateUniversity, name: "State University" },
  { id: InstitutionEnum.NationalCollege, name: "National College" },
  { id: InstitutionEnum.TechnicalInstitute, name: "Technical Institute" },
  { id: InstitutionEnum.MedicalUniversity, name: "Medical University" }
];

// Mock departments data
export const mockDepartmentsByInstitution: Record<number, Department[]> = {
  [InstitutionEnum.UniversityOfTechnology]: [
    { id: DepartmentEnum.ComputerScience, name: "Computer Science" },
    { id: DepartmentEnum.ElectricalEngineering, name: "Electrical Engineering" },
    { id: DepartmentEnum.MechanicalEngineering, name: "Mechanical Engineering" }
  ],
  [InstitutionEnum.StateUniversity]: [
    { id: DepartmentEnum.BusinessAdministration, name: "Business Administration" },
    { id: DepartmentEnum.Economics, name: "Economics" },
    { id: DepartmentEnum.Law, name: "Law" }
  ],
  [InstitutionEnum.NationalCollege]: [
    { id: DepartmentEnum.Mathematics, name: "Mathematics" },
    { id: DepartmentEnum.Physics, name: "Physics" },
    { id: DepartmentEnum.Chemistry, name: "Chemistry" }
  ],
  [InstitutionEnum.TechnicalInstitute]: [
    { id: DepartmentEnum.CivilEngineering, name: "Civil Engineering" },
    { id: DepartmentEnum.Architecture, name: "Architecture" },
    { id: DepartmentEnum.UrbanPlanning, name: "Urban Planning" }
  ],
  [InstitutionEnum.MedicalUniversity]: [
    { id: DepartmentEnum.Medicine, name: "Medicine" },
    { id: DepartmentEnum.Pharmacy, name: "Pharmacy" },
    { id: DepartmentEnum.Nursing, name: "Nursing" }
  ]
};

export default function InstitutionData({
  onSelectInstitution,
  onSelectDepartment,
  selectedInstitutionId,
  selectedDepartmentId,
  selectionMode = 'none'
}: InstitutionDataProps = {}) {
  const [institutions, setInstitutions] = useState<InstitutionWithDepartments[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const { isConnected } = useWallet();

  useEffect(() => {
    // Always use mock data as requested
    setLoading(true);
    setUseMockData(true);

    // Load mock institutions data
    setInstitutions(mockInstitutions.map(inst => ({
      ...inst,
      isExpanded: false,
      isSelected: inst.id === selectedInstitutionId
    })));

    setLoading(false);
  }, [selectedInstitutionId]);

  const handleInstitutionClick = (institutionId: number, action: 'toggle' | 'select' = 'toggle') => {
    // If in selection mode and action is select, handle selection
    if (action === 'select' && selectionMode === 'institution' && onSelectInstitution) {
      const institution = institutions.find(inst => inst.id === institutionId);
      if (institution) {
        onSelectInstitution(institution);
      }

      // Update UI to show selection
      setInstitutions(prevInstitutions => {
        return prevInstitutions.map(inst => ({
          ...inst,
          isSelected: inst.id === institutionId
        }));
      });
      return;
    }

    // Otherwise handle expansion
    setInstitutions(prevInstitutions => {
      return prevInstitutions.map(inst => {
        if (inst.id === institutionId) {
          return { ...inst, isExpanded: !inst.isExpanded };
        }
        return inst;
      });
    });

    // Load departments if they haven't been loaded yet
    const institution = institutions.find(inst => inst.id === institutionId);
    if (institution && !institution.departments) {
      // Always use mock departments data
      const mockDepts = mockDepartmentsByInstitution[institutionId] || [];
      setInstitutions(prevInstitutions => {
        return prevInstitutions.map(inst => {
          if (inst.id === institutionId) {
            return {
              ...inst,
              departments: mockDepts.map(dept => ({
                ...dept,
                isSelected: dept.id === selectedDepartmentId
              }))
            };
          }
          return inst;
        });
      });
    }
  };

  const handleDepartmentClick = (department: Department, institutionId: number) => {
    if (selectionMode === 'department' && onSelectDepartment) {
      onSelectDepartment(department, institutionId);

      // Update UI to show selection
      setInstitutions(prevInstitutions => {
        return prevInstitutions.map(inst => {
          if (inst.id === institutionId && inst.departments) {
            return {
              ...inst,
              departments: inst.departments.map(dept => ({
                ...dept,
                isSelected: dept.id === department.id
              }))
            };
          }
          return inst;
        });
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading institution data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md mb-4">
        <p className="text-yellow-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">

      <h2 className="text-2xl font-bold mb-4">Institutions</h2>

      {institutions.length === 0 ? (
        <p>No institutions found.</p>
      ) : (
        <div className="space-y-4">
          {institutions.map(institution => (
            <div
              key={institution.id}
              className={`border rounded-lg p-4 ${institution.isSelected ? 'border-university-gold bg-university-gold/10' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div
                  className={`flex-1 flex items-center cursor-pointer ${selectionMode === 'institution' ? 'hover:text-university-gold' : ''}`}
                  onClick={() => selectionMode === 'institution'
                    ? handleInstitutionClick(institution.id, 'select')
                    : handleInstitutionClick(institution.id, 'toggle')
                  }
                >
                  <h3 className="text-xl font-semibold">{institution.name}</h3>
                  {institution.isSelected && selectionMode === 'institution' && (
                    <span className="ml-2 text-university-gold">✓</span>
                  )}
                </div>

                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => handleInstitutionClick(institution.id, 'toggle')}
                  aria-label={institution.isExpanded ? 'Collapse' : 'Expand'}
                >
                  <span>{institution.isExpanded ? '▼' : '►'}</span>
                </button>
              </div>

              {institution.isExpanded && (
                <div className="mt-4 pl-4">
                  <h4 className="text-lg font-medium mb-2">Departments</h4>

                  {!institution.departments ? (
                    <p>Loading departments...</p>
                  ) : institution.departments.length === 0 ? (
                    <p>No departments found for this institution.</p>
                  ) : (
                    <ul className="pl-5 space-y-2 mt-3">
                      {institution.departments.map(dept => (
                        <li
                          key={dept.id}
                          className={`p-2 rounded ${dept.isSelected ? 'bg-university-blue/10 text-university-blue font-medium' : 'hover:bg-gray-50'} ${selectionMode === 'department' ? 'cursor-pointer' : ''}`}
                          onClick={() => selectionMode === 'department' && handleDepartmentClick(dept, institution.id)}
                        >
                          <div className="flex items-center">
                            <span className="flex-1">{dept.name}</span>
                            {dept.isSelected && selectionMode === 'department' && (
                              <span className="text-university-blue">✓</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
