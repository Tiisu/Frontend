import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File as FileIcon, X, Check, ExternalLink } from 'lucide-react';
import { uploadFileToPinata, getIpfsGatewayUrl } from '@/lib/pinata';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onUploadComplete: (ipfsHash: string) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  maxSizeMB = 100, // Default max size: 100MB
  acceptedFileTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed']
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const { toast } = useToast();

  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);

    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      // Validate file type
      if (!acceptedFileTypes.includes(selectedFile.type)) {
        setFileError(`File type not accepted. Please upload ${acceptedFileTypes.join(', ')}`);
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSize) {
        setFileError(`File is too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(10); // Start progress

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 500);

      // Upload file to Pinata
      const hash = await uploadFileToPinata(file, {
        projectName: file.name,
        timestamp: new Date().toISOString()
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIpfsHash(hash);
      onUploadComplete(hash);

      toast({
        title: "Upload successful",
        description: "Your file has been uploaded to IPFS",
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file to IPFS",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setIpfsHash(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full space-y-4">
      {!file ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-300 hover:border-university-blue/50">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedFileTypes.join(',')}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-lg font-medium">
              Upload your project file
            </p>
            <Button
              variant="ghost"
              type="button"
              onClick={handleBrowseClick}
              className="text-university-blue hover:text-university-blue/80"
            >
              Browse files
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Accepted file types: PDF, ZIP (Max size: {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileIcon className="h-8 w-8 text-university-blue" />
                <div>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              {!ipfsHash && !uploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to IPFS...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {ipfsHash && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">File uploaded successfully</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                  <span className="font-mono truncate max-w-[200px] sm:max-w-xs">{ipfsHash}</span>
                  <a
                    href={getIpfsGatewayUrl(ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-university-blue hover:underline flex items-center"
                  >
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            )}

            {!ipfsHash && !uploading && (
              <Button
                onClick={handleUpload}
                className="w-full mt-4 bg-university-blue hover:bg-university-blue/90"
              >
                Upload to IPFS
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {fileError && (
        <div className="text-red-500 text-sm mt-2">
          <p>{fileError}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
