
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Lock, Globe, Users, ExternalLink, Calendar, Building, Bookmark, Clock, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AccessLevel, ProjectData } from '@/lib/blockchain';
import { getProjectById, updateProject, getAllProjects, getAllProjectsAdmin } from '@/services/projectService';
import { mockDepartmentsByInstitution, mockInstitutions } from '@/components/InstitutionData';
import { getIpfsGatewayUrl } from '@/lib/pinata';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAccessLevel, setNewAccessLevel] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { address } = useWallet();

  // Function to load project data
  const loadProject = () => {
    setIsLoading(true);

    try {
      const projectId = parseInt(id || '0');
      const foundProject = getProjectById(projectId, address);

      if (foundProject) {
        setProject(foundProject);
        setNewAccessLevel(foundProject.accessLevel.toString());
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error loading project",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load project when component mounts, ID changes, or address changes
  useEffect(() => {
    loadProject();
  }, [id, address]);

  // Check if the current user is an author of the project
  const isAuthor = address && project?.authors.some(
    author => author.toLowerCase() === address.toLowerCase()
  );

  const handleAccessLevelChange = async () => {
    if (!project) return;

    setIsUpdating(true);

    try {
      // Create updated project with new access level
      const updatedProject = {
        ...project,
        accessLevel: parseInt(newAccessLevel) as AccessLevel
      };

      // Update the project in our store
      updateProject(updatedProject);

      // Update local state
      setProject(updatedProject);

      toast({
        title: "Access level updated",
        description: `Project access level has been changed to ${AccessLevel[parseInt(newAccessLevel)]}`,
      });
    } catch (error) {
      console.error('Error updating access level:', error);
      toast({
        title: "Failed to update access level",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render access level badge with appropriate icon and color
  const renderAccessLevelBadge = (accessLevel: AccessLevel) => {
    switch(accessLevel) {
      case AccessLevel.Public:
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-700 border-green-300 px-3 py-1">
            <Globe className="h-3 w-3" />
            Public
          </Badge>
        );
      case AccessLevel.Restricted:
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-300 px-3 py-1">
            <Users className="h-3 w-3" />
            Restricted
          </Badge>
        );
      case AccessLevel.Private:
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-100 text-red-700 border-red-300 px-3 py-1">
            <Lock className="h-3 w-3" />
            Private
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-university-blue" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    // Check if the project exists but user doesn't have access
    const projectExists = getAllProjectsAdmin().find(p => p.id === parseInt(id || '0'));

    return (
      <Layout>
        <div className="text-center py-20">
          {projectExists ? (
            <>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Restricted</h1>
              <p className="text-gray-600 mb-6">
                This project is {projectExists.accessLevel === AccessLevel.Private ? 'private' : 'restricted'} and you don't have permission to view it.
                {!address && (
                  <span className="block mt-2">
                    Please connect your wallet if you are the author of this project.
                  </span>
                )}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">Project Not Found</h1>
              <p className="text-gray-600 mb-6">
                The project you are looking for does not exist.
              </p>
            </>
          )}

          <Link to="/search">
            <Button className="bg-university-blue hover:bg-university-blue/90 text-white">
              Browse Projects
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back to search link */}
        <div className="mb-4">
          <Link
            to="/search"
            className="text-university-blue hover:text-university-navy transition-colors flex items-center text-sm"
          >
            &larr; Back to search
          </Link>
        </div>

        {/* Project header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-university-navy">{project.title}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-gray-600"
              onClick={() => {
                // Copy the current URL to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link copied",
                  description: "Project link copied to clipboard",
                });
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            {renderAccessLevelBadge(project.accessLevel)}
          </div>
        </div>

        {/* Project metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-university-blue" />
            <span className="text-gray-600 font-medium">Year:</span>
            <span>{project.year}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-university-blue" />
            <span className="text-gray-600 font-medium">Department:</span>
            <span>
              {(() => {
                // Find the department name by searching through all institutions
                for (const institutionId in mockDepartmentsByInstitution) {
                  const departments = mockDepartmentsByInstitution[parseInt(institutionId)];
                  const department = departments.find(d => d.id === project.departmentId);
                  if (department) {
                    const institution = mockInstitutions.find(i => i.id === parseInt(institutionId));
                    return `${department.name} (${institution?.name})`;
                  }
                }
                return 'Unknown Department';
              })()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-university-blue" />
            <span className="text-gray-600 font-medium">Upload Date:</span>
            <span>{new Date(project.uploadDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-university-blue" />
            <span className="text-gray-600 font-medium">Project ID:</span>
            <span>#{project.id}</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Project description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-university-navy">Description</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
          </div>
        </div>

        {/* Project Files section - only shown if IPFS hash exists */}
        {project.ipfsHash && project.ipfsHash.trim() !== '' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-university-navy">Project Files</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="font-medium">IPFS Hash:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                    {project.ipfsHash}
                  </code>
                </div>

                <a
                  href={getIpfsGatewayUrl(project.ipfsHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-university-blue text-white hover:bg-university-blue/90 transition-colors"
                >
                  View on IPFS
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>What is IPFS?</strong> The InterPlanetary File System is a distributed system for storing and accessing files.
                  We use <a
                    href="https://pinata.cloud/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-university-blue hover:underline"
                  >
                    Pinata
                  </a> to store your files on IPFS.
                  <a
                    href="https://ipfs.tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-university-blue hover:underline ml-1"
                  >
                    Learn more about IPFS
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authors section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-university-navy">Authors</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <ul className="space-y-2">
              {project.authors.map((author, index) => (
                <li key={index} className="flex items-center">
                  <a
                    href={`https://etherscan.io/address/${author}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-university-blue hover:underline flex items-center"
                  >
                    {author}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>

                  {address && author.toLowerCase() === address.toLowerCase() && (
                    <Badge className="ml-2 bg-university-gold">You</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Access control (for authors only) */}
        {isAuthor && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-university-navy">Access Control</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                As an author of this project, you can change who has access to view it.
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-university-blue hover:bg-university-blue/90 text-white">
                    Change Access Level
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Access Level</DialogTitle>
                  </DialogHeader>

                  <div className="py-4">
                    <RadioGroup
                      value={newAccessLevel}
                      onValueChange={setNewAccessLevel}
                      className="flex flex-col space-y-4"
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

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleAccessLevelChange}
                      disabled={isUpdating || newAccessLevel === project.accessLevel.toString()}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Access Level'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Related Projects */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-university-navy">Related Projects</h2>

          {(() => {
            // Get all projects from the same department (with access control)
            const allProjects = getAllProjects(address);
            const relatedProjects = allProjects
              .filter(p => p.departmentId === project.departmentId && p.id !== project.id)
              .slice(0, 3); // Limit to 3 related projects

            if (relatedProjects.length === 0) {
              return (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600">No related projects found from this department.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedProjects.map(relatedProject => (
                  <ProjectCard key={relatedProject.id} project={relatedProject} />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailsPage;
