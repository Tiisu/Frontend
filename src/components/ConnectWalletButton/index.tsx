
import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const ConnectWalletButton: React.FC = () => {
  const { address, isConnected, isConnecting, connect, disconnect, error } = useWallet();

  const handleConnectClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  return (
    <div className="relative">
      <Button
        variant={isConnected ? "outline" : "default"}
        className={isConnected ? "bg-university-navy text-university-gold border-university-gold" : "bg-university-gold text-university-navy hover:bg-university-gold/80"}
        onClick={handleConnectClick}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : isConnected && address ? (
          <>
            {shortenAddress(address)}
          </>
        ) : (
          'Connect Wallet'
        )}
      </Button>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;
