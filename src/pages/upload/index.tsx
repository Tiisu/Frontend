
import React from 'react';
import Layout from '@/components/Layout';
import UploadForm from '@/components/UploadForm';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UploadPage: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-university-navy">Upload Your Project</h1>
        
        {isConnected ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Share your final year project with the academic community. Fill out the form below to upload your project details and files.
              </p>
            </div>
            
            <UploadForm />
          </>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                You need to connect your wallet before you can upload a project.
              </p>
              <Button className="bg-university-gold text-university-navy hover:bg-university-gold/90">
                Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-university-navy">How to upload your project</h2>
          
          <ol className="space-y-4 list-decimal pl-5">
            <li className="text-gray-700">
              <span className="font-medium">Connect your wallet:</span> Use the "Connect Wallet" button in the upper right corner to connect your Ethereum wallet.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Upload files to IPFS:</span> Before submitting the form, upload your project files (documents, code, etc.) to IPFS using services like 
              <a href="https://web3.storage/" target="_blank" rel="noopener noreferrer" className="text-university-blue hover:underline"> web3.storage</a> or 
              <a href="https://pinata.cloud/" target="_blank" rel="noopener noreferrer" className="text-university-blue hover:underline"> Pinata</a>.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Fill out the form:</span> Complete all required fields, including your IPFS hash from the previous step.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Choose access level:</span> Select who can access your project - public (everyone), restricted (your institution), or private (only you).
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Submit:</span> Click "Upload Project" to register your project on the blockchain.
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
