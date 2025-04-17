
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-university-navy text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-university-gold">UniVault</h3>
            <p className="text-gray-300">
              A decentralized platform for university project repositories.
              Securely store, search, and share academic projects using blockchain technology.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-university-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-university-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-university-gold transition-colors">
                  Search Projects
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-300 hover:text-university-gold transition-colors">
                  Upload Project
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-university-gold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://ipfs.tech/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-university-gold transition-colors"
                >
                  What is IPFS?
                </a>
              </li>
              <li>
                <a 
                  href="https://ethereum.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-university-gold transition-colors"
                >
                  Learn about Ethereum
                </a>
              </li>
              <li>
                <a 
                  href="https://metamask.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-university-gold transition-colors"
                >
                  Set up MetaMask
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} UniVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
