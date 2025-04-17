
import React, { useState } from 'react';
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
import { AccessLevel, mockDepartments, registerProject } from '@/lib/blockchain';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  title: string;
  description: string;
  ipfsHash: string;
  departmentId: string;
  year: string;
  accessLevel: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  ipfsHash?: string;
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
    ipfsHash: '',
    departmentId: '',
    year: currentYear.toString(),
    accessLevel: '0', // Default to public
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.ipfsHash.trim()) {
      newErrors.ipfsHash = 'IPFS Hash is required';
    } else if (!/^Qm[1-9A-Za-z]{44}$/i.test(formData.ipfsHash)) {
      newErrors.ipfsHash = 'Invalid IPFS Hash format';
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
      const projectId = await registerProject(
        formData.title,
        formData.description,
        formData.ipfsHash,
        parseInt(formData.departmentId),
        parseInt(formData.year),
        parseInt(formData.accessLevel) as AccessLevel
      );
      
      toast({
        title: "Project uploaded successfully!",
        description: `Your project has been registered with ID: ${projectId}`,
        variant: "default",
      });
      
      // Redirect to the new project page
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Failed to upload project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-university-blue/10">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.departmentId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
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
          <Label htmlFor="ipfsHash" className="text-lg font-medium">
            IPFS Hash
          </Label>
          <Input
            id="ipfsHash"
            name="ipfsHash"
            placeholder="Qm..."
            value={formData.ipfsHash}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={errors.ipfsHash ? "border-red-500" : ""}
          />
          {errors.ipfsHash && (
            <p className="text-red-500 text-sm">{errors.ipfsHash}</p>
          )}
          
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-800">
              <p>
                Upload your project files to IPFS and paste the resulting hash here. 
                <a 
                  href="https://web3.storage/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-university-blue hover:underline ml-1"
                >
                  web3.storage
                </a> or 
                <a 
                  href="https://pinata.cloud/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-university-blue hover:underline ml-1"
                >
                  Pinata
                </a> are recommended IPFS services.
              </p>
            </AlertDescription>
          </Alert>
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
