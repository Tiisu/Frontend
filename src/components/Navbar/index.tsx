
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectWalletButton from '@/components/ConnectWalletButton';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected } = useWallet();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-university-blue text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-university-gold font-bold text-2xl">UniVault</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors">
              Home
            </Link>
            <Link to="/search" className="px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors">
              Search
            </Link>
            {/* <Link to="/institutions" className="px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors">
              Institutions
            </Link> */}
            {isConnected && (
              <Link to="/upload" className="px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors">
                Upload Project
              </Link>
            )}
            <div className="ml-4">
              <ConnectWalletButton />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-university-gold focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-university-navy">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
            <Link
              to="/institutions"
              className="block px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Institutions
            </Link>
            {isConnected && (
              <Link
                to="/upload"
                className="block px-3 py-2 rounded-md text-white hover:text-university-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Upload Project
              </Link>
            )}
            <div className="px-3 py-2">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
