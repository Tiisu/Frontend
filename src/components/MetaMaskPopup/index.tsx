import React, { useState, useEffect } from 'react';
import { X, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import metamaskLogo from '@/assets/metamask-fox.svg';

interface MetaMaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  data: {
    title: string;
    department: string;
    accessLevel: string;
    gasEstimate: string;
  };
}

const MetaMaskPopup: React.FC<MetaMaskPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  data
}) => {
  const [currentTab, setCurrentTab] = useState<'details' | 'data' | 'hex'>('details');
  const [isLoading, setIsLoading] = useState(false);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    setIsLoading(true);
    // Simulate a short delay before confirming
    setTimeout(() => {
      onConfirm();
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="bg-[#FBFBFB] border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={metamaskLogo} 
              alt="MetaMask" 
              className="h-8 w-8 mr-2"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg';
              }}
            />
            <span className="font-bold text-lg">MetaMask</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Signature Request</h2>
          <p className="text-gray-600 mb-4">
            Only sign this message if you fully understand the content and trust the requesting site.
          </p>
          
          {/* Origin Site */}
          <div className="bg-[#F2F4F6] p-3 rounded-md mb-4">
            <p className="text-sm text-gray-600">Origin: university-project-vault.edu</p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium ${currentTab === 'details' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setCurrentTab('details')}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${currentTab === 'data' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setCurrentTab('data')}
            >
              Data
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${currentTab === 'hex' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setCurrentTab('hex')}
            >
              Hex
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="mb-4">
            {currentTab === 'details' && (
              <div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Project Title</p>
                  <p className="text-sm text-gray-900">{data.title}</p>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-sm text-gray-900">{data.department}</p>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Access Level</p>
                  <p className="text-sm text-gray-900">{data.accessLevel}</p>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Estimated Gas Fee</p>
                  <p className="text-sm text-gray-900">{data.gasEstimate}</p>
                </div>
              </div>
            )}
            
            {currentTab === 'data' && (
              <div className="bg-[#F2F4F6] p-3 rounded-md">
                <pre className="text-xs overflow-auto whitespace-pre-wrap" style={{ maxHeight: '200px' }}>
                  {`{
  "types": {
    "EIP712Domain": [
      { "name": "name", "type": "string" },
      { "name": "version", "type": "string" },
      { "name": "chainId", "type": "uint256" },
      { "name": "verifyingContract", "type": "address" }
    ],
    "Project": [
      { "name": "title", "type": "string" },
      { "name": "department", "type": "uint256" },
      { "name": "accessLevel", "type": "uint8" },
      { "name": "year", "type": "uint16" }
    ]
  },
  "primaryType": "Project",
  "domain": {
    "name": "University Project Vault",
    "version": "1",
    "chainId": 1,
    "verifyingContract": "0x1234567890123456789012345678901234567890"
  },
  "message": {
    "title": "${data.title}",
    "department": ${data.department.split(' ')[0]},
    "accessLevel": ${data.accessLevel === 'Public' ? 0 : data.accessLevel === 'Restricted' ? 1 : 2},
    "year": ${new Date().getFullYear()}
  }
}`}
                </pre>
              </div>
            )}
            
            {currentTab === 'hex' && (
              <div className="bg-[#F2F4F6] p-3 rounded-md">
                <pre className="text-xs overflow-auto" style={{ maxHeight: '200px' }}>
                  {`0x1901f1f3f34a1e4c772a3c5e5305a0a8cd0a64b1a834e9b95a5c8d59f5af49bc8a94092c5a042f7e4908c6e1781aaa8b196f0d29ae8b497c9c4a8633c3f96e91c${Math.random().toString(16).substring(2, 30)}${Math.random().toString(16).substring(2, 30)}${Math.random().toString(16).substring(2, 30)}`}
                </pre>
              </div>
            )}
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 flex">
            <AlertCircle className="text-yellow-500 mr-2 h-5 w-5 flex-shrink-0" />
            <p className="text-xs text-yellow-700">
              This is a contract interaction that may move funds or approve token access. Make sure you trust this site.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-[#FBFBFB] border-t border-gray-200 p-4 flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onReject}
            className="sm:w-auto w-full"
            disabled={isLoading}
          >
            Reject
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#037DD6] hover:bg-[#0372c3] text-white sm:w-auto w-full flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-pulse">Processing</span>
                <span className="ml-1 animate-bounce">...</span>
              </span>
            ) : (
              <>
                Sign <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskPopup;
