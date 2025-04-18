
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/lib/blockchain';
import { getAllProjects } from '@/services/projectService';
import { ArrowRight, Upload } from 'lucide-react';

const Index: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useWallet();

  // Function to load projects
  const loadProjects = () => {
    setIsLoading(true);
    // Get projects from our project service with access control
    const projects = getAllProjects(address);
    // Sort projects by upload date (newest first)
    const sortedProjects = [...projects].sort((a, b) => b.uploadDate - a.uploadDate);
    setFeaturedProjects(sortedProjects);
    setIsLoading(false);
  };

  // Load projects when component mounts or when address changes
  useEffect(() => {
    loadProjects();
  }, [address]);

  // Also load projects when the component is focused (e.g., after navigation)
  useEffect(() => {
    // This will refresh the projects when the user navigates back to this page
    const handleFocus = () => loadProjects();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-university-blue to-university-navy rounded-lg text-white mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            University Project Vault
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A decentralized repository for final year undergraduate projects
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              className="bg-university-gold text-university-navy hover:bg-university-gold/90 rounded-full px-8 py-6 text-lg"
            >
              <Link to="/search">
                Browse Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg"
            >
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" /> Upload Your Project
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-university-navy">
            Featured Projects
          </h2>
          <Link
            to="/search"
            className="text-university-blue hover:text-university-navy transition-colors flex items-center"
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg p-6 h-64"
              ></div>
            ))}
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Be the first to upload a project!</p>
            <Button
              asChild
              className="bg-university-blue hover:bg-university-blue/90"
            >
              <Link to="/upload">
                <Upload className="mr-2 h-4 w-4" /> Upload Project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="mb-12 bg-university-light rounded-lg p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-university-navy mb-6 text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-university-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-university-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-university-navy">
              Upload
            </h3>
            <p className="text-gray-600">
              Submit your final year project with details and upload your files to IPFS
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-university-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-university-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-university-navy">
              Store
            </h3>
            <p className="text-gray-600">
              Your project is securely stored on the blockchain with your selected access level
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-university-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-university-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-university-navy">
              Search
            </h3>
            <p className="text-gray-600">
              Browse and search for projects based on department, year, and other criteria
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
