
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getStudentByWallet } from '@/services/studentService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MetaMaskPopup from '@/components/MetaMaskPopup';
import { AccessLevel, Institution, Department } from '@/lib/blockchain';
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
  const location = useLocation();
  const { isConnected, address } = useWallet();
  const { isAuthenticated } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'confirming' | 'ai-processing' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<{gas: string, price: string, total: string} | null>(null);

  // State for MetaMask popup
  const [showMetaMaskPopup, setShowMetaMaskPopup] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [estimatedGasFee, setEstimatedGasFee] = useState('');

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

  // Auto-select department and institution when wallet is connected and user is on admin dashboard
  useEffect(() => {
    if (isConnected && address) {
      // Check if the user is an admin and has a student record
      const student = getStudentByWallet(address);

      // Check if user is on admin dashboard
      const isOnAdminDashboard = location.pathname.includes('/admin');

      console.log('Connected wallet:', address);
      console.log('Found student:', student);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Is on admin dashboard:', isOnAdminDashboard);

      if (student && (isAuthenticated || isOnAdminDashboard)) {
        console.log('Auto-selecting institution:', student.institutionId, 'and department:', student.departmentId);

        // Auto-select the institution
        setSelectedInstitutionId(student.institutionId.toString());

        // Auto-select the department
        setFormData(prev => ({
          ...prev,
          departmentId: student.departmentId.toString()
        }));
      }
    }
  }, [isConnected, address, isAuthenticated, location]);

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

  // Generate a random transaction hash
  const generateTransactionHash = () => {
    const characters = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return hash;
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

    // Store the project for later use
    setPendingProject(newProject);

    // Generate a random gas fee estimate
    const gasEstimate = `${((Math.random() * 0.005) + 0.001).toFixed(6)} ETH`;
    setEstimatedGasFee(gasEstimate);

    // Show MetaMask popup
    setShowMetaMaskPopup(true);
  };

  // Function to handle the actual transaction after wallet confirmation
  const handleConfirmTransaction = async () => {
    if (!pendingProject) return;

    // Close the MetaMask popup
    setShowMetaMaskPopup(false);

    // Start the transaction process
    setIsSubmitting(true);
    setTransactionStatus('pending');

    try {
      // Get the selected institution and department for the success message
      const institution = institutions.find(inst => inst.id.toString() === selectedInstitutionId);
      const department = departments.find(dept => dept.id.toString() === formData.departmentId);

      // Use the pending project that was created earlier
      const newProject = pendingProject;

      // Simulate a blockchain transaction
      const txHash = generateTransactionHash();
      setTransactionHash(txHash);

      // Simulate gas estimation
      const gasLimit = Math.floor(Math.random() * 50000) + 150000; // Between 150,000 and 200,000
      const gasPrice = (Math.random() * 20 + 30).toFixed(2); // Between 30 and 50 Gwei
      const totalEth = ((gasLimit * parseFloat(gasPrice)) / 1e9).toFixed(6); // Convert to ETH

      setGasEstimate({
        gas: gasLimit.toLocaleString(),
        price: `${gasPrice} Gwei`,
        total: `${totalEth} ETH`
      });

      // Show transaction pending toast
      toast({
        title: "Transaction Initiated",
        description: "Your project is being submitted to the blockchain...",
      });

      // Simulate transaction confirmation delay (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTransactionStatus('confirming');

      // Show transaction confirming toast
      toast({
        title: "Transaction Confirming",
        description: "Waiting for blockchain confirmation...",
      });

      // Simulate block confirmations (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionStatus('success');

      // Update status to AI processing
      setTransactionStatus('ai-processing');

      // Show AI generation toast
      toast({
        title: "Generating AI Summary",
        description: "Creating an AI-powered summary of your project...",
      });

      // Add the project to our store (this will also generate the AI summary)
      await addProject(newProject);

      // Update status to success
      setTransactionStatus('success');

      // Show success toast
      toast({
        title: "Project uploaded successfully!",
        description: `Your project "${formData.title}" has been registered with ID: ${newProject.id} in ${department?.name} at ${institution?.name}`,
        variant: "default",
      });

      // Wait a moment before redirecting
      setTimeout(() => {
        // Redirect to the home page to see the new project
        navigate('/');
        setIsSubmitting(false);
        setTransactionStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Error submitting project:', error);
      setTransactionStatus('error');
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
        {/* MetaMask Popup */}
        <MetaMaskPopup
          isOpen={showMetaMaskPopup}
          onClose={() => setShowMetaMaskPopup(false)}
          onConfirm={handleConfirmTransaction}
          onReject={() => setShowMetaMaskPopup(false)}
          data={{
            title: formData.title || '',
            department: departments.find(d => d.id.toString() === formData.departmentId)?.name || '',
            accessLevel: AccessLevel[parseInt(formData.accessLevel) as AccessLevel],
            gasEstimate: estimatedGasFee
          }}
        />
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

        {/* Transaction Status Display */}
        {transactionStatus !== 'idle' && (
          <div className={`mb-4 p-4 rounded-lg border ${transactionStatus === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              {transactionStatus === 'pending' && (
                <>
                  <Loader2 className="mr-2 h-5 w-5 text-blue-500 animate-spin" />
                  <span className="text-blue-700">Transaction Pending</span>
                </>
              )}
              {transactionStatus === 'confirming' && (
                <>
                  <Loader2 className="mr-2 h-5 w-5 text-amber-500 animate-spin" />
                  <span className="text-amber-700">Confirming Transaction</span>
                </>
              )}
              {transactionStatus === 'ai-processing' && (
                <>
                  <Loader2 className="mr-2 h-5 w-5 text-purple-500 animate-spin" />
                  <span className="text-purple-700">Generating AI Summary</span>
                </>
              )}
              {transactionStatus === 'success' && (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-green-700">Transaction Successful</span>
                </>
              )}
              {transactionStatus === 'error' && (
                <>
                  <span className="mr-2 h-5 w-5 text-red-500">⚠️</span>
                  <span className="text-red-700">Transaction Failed</span>
                </>
              )}
            </h3>

            {transactionHash && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                <div className="bg-white p-2 rounded border border-gray-200 overflow-x-auto flex justify-between items-center">
                  <code className="text-xs text-gray-800 truncate">{transactionHash}</code>
                  <a
                    href={`https://etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-university-blue hover:text-university-navy ml-2 flex-shrink-0"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                {transactionStatus === 'success' && (
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-green-600">
                      ✓ Confirmed in block #{Math.floor(Math.random() * 1000000) + 15000000}
                    </p>
                    <a
                      href="https://etherscan.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-university-blue hover:underline"
                    >
                      View on Etherscan
                    </a>
                  </div>
                )}
              </div>
            )}

            {(transactionStatus === 'pending' || transactionStatus === 'confirming' || transactionStatus === 'ai-processing') && (
              <>
                <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${transactionStatus === 'pending' ? 'w-1/4' :
                      transactionStatus === 'confirming' ? 'w-2/4' :
                      transactionStatus === 'ai-processing' ? 'w-3/4' : 'w-full'}
                      ${transactionStatus === 'ai-processing' ? 'bg-purple-500' : 'bg-blue-500'} animate-pulse`}
                  ></div>
                </div>

                {gasEstimate && (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                    <div>
                      <span className="block font-medium">Gas Limit</span>
                      <span>{gasEstimate.gas}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Gas Price</span>
                      <span>{gasEstimate.price}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Est. Fee</span>
                      <span>{gasEstimate.total}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-university-blue hover:bg-university-blue/90 text-white"
          disabled={isSubmitting || !isConnected}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {transactionStatus === 'pending' ? 'Initiating Transaction...' :
               transactionStatus === 'confirming' ? 'Confirming Transaction...' :
               transactionStatus === 'ai-processing' ? 'Generating AI Summary...' :
               transactionStatus === 'success' ? 'Complete' : 'Uploading...'}
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
