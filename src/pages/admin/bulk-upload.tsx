import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useStudentStore } from '@/services/studentService';
import { parseExcelData } from '@/services/studentService';
import { Student } from '@/models/Student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { mockDepartmentsByInstitution } from '@/components/InstitutionData';

const AdminBulkUploadPage: React.FC = () => {
  const { addStudents } = useStudentStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState<Omit<Student, 'id' | 'dateAdded'>[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Get all institutions and departments for display
  const institutions = mockDepartmentsByInstitution;
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Reset states
      setFile(selectedFile);
      setUploadError(null);
      setUploadSuccess(false);
      setPreviewData([]);
      
      // Validate file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
        setUploadError('Please upload a valid Excel or CSV file');
        setFile(null);
        return;
      }
      
      // For demo purposes, we'll use mock data instead of actually parsing the file
      handlePreviewFile(selectedFile);
    }
  };
  
  // Preview file data
  const handlePreviewFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(30);
      
      // Simulate file parsing delay
      setTimeout(() => {
        setUploadProgress(60);
      }, 500);
      
      // Parse Excel data (mock implementation)
      const parsedData = await parseExcelData(file);
      
      setUploadProgress(100);
      setPreviewData(parsedData);
      setIsUploading(false);
    } catch (error) {
      setUploadError('Failed to parse file. Please check the file format and try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Handle bulk upload
  const handleBulkUpload = () => {
    try {
      if (previewData.length === 0) {
        setUploadError('No data to upload');
        return;
      }
      
      // Add students to the store
      addStudents(previewData);
      
      // Show success message
      setUploadSuccess(true);
      setPreviewData([]);
      setFile(null);
      
      toast({
        title: 'Upload Successful',
        description: `${previewData.length} students have been added to the system.`,
      });
    } catch (error) {
      setUploadError('Failed to upload students. Please try again.');
      
      toast({
        title: 'Upload Failed',
        description: 'There was an error adding students to the system.',
        variant: 'destructive',
      });
    }
  };
  
  // Download template
  const handleDownloadTemplate = () => {
    // In a real implementation, this would generate and download an Excel template
    // For this demo, we'll just show a toast
    toast({
      title: 'Template Downloaded',
      description: 'The Excel template has been downloaded to your device.',
    });
  };
  
  // Get department and institution names
  const getDepartmentName = (departmentId: number) => {
    for (const institution of institutions) {
      const department = institution.departments.find(d => d.id === departmentId);
      if (department) return department.name;
    }
    return 'Unknown Department';
  };
  
  const getInstitutionName = (institutionId: number) => {
    const institution = institutions.find(i => i.id === institutionId);
    return institution ? institution.name : 'Unknown Institution';
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Student Upload</h1>
          <p className="text-gray-500 mt-1">
            Upload multiple students at once using an Excel spreadsheet
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Upload an Excel file with student data
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Drag and drop your Excel file here, or click to browse
                    </p>
                    
                    <Label
                      htmlFor="file-upload"
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-university-blue rounded-md cursor-pointer hover:bg-university-blue/90"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Browse Files
                    </Label>
                    
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {file && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                          {file.name}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setFile(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Processing file...</span>
                      <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
                
                {uploadSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Students have been successfully added to the system.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full"
                onClick={handleBulkUpload}
                disabled={previewData.length === 0 || isUploading}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Students
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardFooter>
          </Card>
          
          {/* Preview Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Review the data before uploading
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {previewData.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Institution</TableHead>
                          <TableHead>Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      
                      <TableBody>
                        {previewData.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {student.walletAddress.substring(0, 6)}...
                              {student.walletAddress.substring(student.walletAddress.length - 4)}
                            </TableCell>
                            <TableCell>{getDepartmentName(student.departmentId)}</TableCell>
                            <TableCell>{getInstitutionName(student.institutionId)}</TableCell>
                            <TableCell>{student.year}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <FileSpreadsheet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Upload a file to preview the data
                  </p>
                </div>
              )}
            </CardContent>
            
            {previewData.length > 0 && (
              <CardFooter>
                <p className="text-sm text-gray-500">
                  {previewData.length} students found in the file
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">File Format</h3>
                <p className="text-gray-500 text-sm">
                  The Excel file should have the following columns:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 mt-2 space-y-1">
                  <li>Name (required): Full name of the student</li>
                  <li>Email (required): Student's email address</li>
                  <li>Wallet Address (required): Ethereum wallet address</li>
                  <li>Department ID (required): ID of the department</li>
                  <li>Institution ID (required): ID of the institution</li>
                  <li>Year (required): Academic year</li>
                  <li>Status (optional): 'active', 'inactive', or 'graduated'</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Tips</h3>
                <ul className="list-disc list-inside text-sm text-gray-500 mt-2 space-y-1">
                  <li>Make sure all required fields are filled</li>
                  <li>Wallet addresses should be valid Ethereum addresses</li>
                  <li>Department and Institution IDs must match existing records</li>
                  <li>Download the template for the correct format</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBulkUploadPage;
