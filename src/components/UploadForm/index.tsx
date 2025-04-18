
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoIcon, Loader2 } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessLevel, Institution, Department, InstitutionEnum, DepartmentEnum } from '@/lib/blockchain';
import { mockInstitutions, mockDepartmentsByInstitution } from '@/components/InstitutionData';
import { createProject, addProject } from '@/services/projectService';
import { toast } from '@/components/ui/use-toast';
import FileUpload from '@/components/FileUpload';

interface FormData {
  title: string;
  description: string;
  departmentId: string;
  year: string;
  accessLevel: string;
  ipfsHash: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  departmentId?: string;
  year?: string;
}

const UploadForm: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    departmentId: '',
    year: currentYear.toString(),
    accessLevel: '0', // Default to public
    ipfsHash: '',
  });

  // State for institutions and departments
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

  const [errors, setErrors] = useState<FormErrors>({});
  // No loading states needed for mock data

  // Load mock institutions when component mounts
  useEffect(() => {
    // Use mock institutions data
    setInstitutions(mockInstitutions);
  }, []);

  // Load departments when institution is selected
  useEffect(() => {
    if (!selectedInstitutionId) {
      setDepartments([]);
      return;
    }

    // Use mock departments data
    const institutionId = parseInt(selectedInstitutionId);
    const departmentsList = mockDepartmentsByInstitution[institutionId] || [];
    setDepartments(departmentsList);
  }, [selectedInstitutionId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear the error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit a project",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the selected institution and department for the success message
      const institution = institutions.find(inst => inst.id.toString() === selectedInstitutionId);
      const department = departments.find(dept => dept.id.toString() === formData.departmentId);

      // Create a new project with the form data
      const newProject = createProject(
        formData.title,
        formData.description,
        parseInt(formData.departmentId),
        parseInt(formData.year),
        parseInt(formData.accessLevel) as AccessLevel,
        formData.ipfsHash,
        address // Use the connected wallet address as the author
      );

      // Add the project to our store
      addProject(newProject);

      // Simulate a delay for better UX
      setTimeout(() => {
        toast({
          title: "Project uploaded successfully!",
          description: `Your project "${formData.title}" has been registered with ID: ${newProject.id} in ${department?.name} at ${institution?.name}`,
          variant: "default",
        });

        // Redirect to the home page to see the new project
        navigate('/');

        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Failed to upload project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-university-blue/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Project Files</h3>
          <FileUpload
            onUploadComplete={(hash) => setFormData({ ...formData, ipfsHash: hash })}
            maxSizeMB={50}
            acceptedFileTypes={['application/pdf', 'application/zip', 'application/x-zip-compressed']}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg font-medium">
            Project Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter project title"
            value={formData.title}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-lg font-medium">
            Project Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your project in detail..."
            value={formData.description}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`min-h-[150px] ${errors.description ? "border-red-500" : ""}`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="institutionId" className="text-lg font-medium">
              Institution
            </Label>
            <Select
              value={selectedInstitutionId}
              onValueChange={(value) => {
                setSelectedInstitutionId(value);
                // Reset department when institution changes
                setFormData({ ...formData, departmentId: '' });
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                {
                  institutions.map(institution => (
                    <SelectItem key={institution.id} value={institution.id.toString()}>
                      {institution.name}
                    </SelectItem>
                  ))
}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId" className="text-lg font-medium">
              Department
            </Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => {
                setFormData({ ...formData, departmentId: value });
                if (errors.departmentId) {
                  setErrors({ ...errors, departmentId: undefined });
                }
              }}
              disabled={isSubmitting || !selectedInstitutionId}
            >
              <SelectTrigger className={errors.departmentId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.length > 0 ? (
                  departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500">
                    {selectedInstitutionId ? "No departments found" : "Select an institution first"}
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-red-500 text-sm">{errors.departmentId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-lg font-medium">
              Year
            </Label>
            <Select
              value={formData.year}
              onValueChange={(value) => {
                setFormData({ ...formData, year: value });
                if (errors.year) {
                  setErrors({ ...errors, year: undefined });
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.year ? "border-red-500" : ""}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.year && (
              <p className="text-red-500 text-sm">{errors.year}</p>
            )}
          </div>
        </div>



        <div className="space-y-2">
          <Label className="text-lg font-medium">
            Access Level
          </Label>

          <RadioGroup
            value={formData.accessLevel}
            onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
            className="flex flex-col space-y-3 mt-2"
            disabled={isSubmitting}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="0" id="access-public" />
              <Label htmlFor="access-public" className="font-medium cursor-pointer">
                Public
                <p className="font-normal text-gray-600 text-sm">
                  Anyone can view your project details and files
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="1" id="access-restricted" />
              <Label htmlFor="access-restricted" className="font-medium cursor-pointer">
                Restricted
                <p className="font-normal text-gray-600 text-sm">
                  Only users from your institution/department can view your project
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="2" id="access-private" />
              <Label htmlFor="access-private" className="font-medium cursor-pointer">
                Private
                <p className="font-normal text-gray-600 text-sm">
                  Only you (project author) can view your project
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          type="submit"
          className="w-full bg-university-blue hover:bg-university-blue/90 text-white"
          disabled={isSubmitting || !isConnected}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Project'
          )}
        </Button>

        {!isConnected && (
          <p className="text-center text-amber-600 mt-2">
            Please connect your wallet to upload projects
          </p>
        )}
      </form>
    </div>
  );
};

export default UploadForm;
