
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Layout from '@/components/Layout';
import SearchForm, { SearchParams } from '@/components/SearchForm';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectData, AccessLevel } from '@/lib/blockchain';
import { getAllProjects } from '@/services/projectService';
import { mockDepartmentsByInstitution } from '@/components/InstitutionData';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<ProjectData[]>([]);
  const [filteredResults, setFilteredResults] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({ query: '' });
  const [sortOption, setSortOption] = useState<string>('recent');

  // Function to load projects
  const loadProjects = () => {
    setIsLoading(true);
    const projects = getAllProjects();
    setSearchResults(projects);
    setIsLoading(false);
  };

  // Parse query parameters from URL and load projects when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const newSearchParams: SearchParams = {
      query: queryParams.get('q') || '',
    };

    if (queryParams.has('inst')) {
      newSearchParams.institutionId = parseInt(queryParams.get('inst')!);
    }

    if (queryParams.has('dept')) {
      newSearchParams.departmentId = parseInt(queryParams.get('dept')!);
    }

    if (queryParams.has('year')) {
      newSearchParams.year = parseInt(queryParams.get('year')!);
    }

    if (queryParams.has('access')) {
      newSearchParams.accessLevel = parseInt(queryParams.get('access')!) as AccessLevel;
    }

    setSearchParams(newSearchParams);

    // Load projects
    loadProjects();
  }, [location.search]);

  // Also load projects when the component is focused (e.g., after navigation)
  useEffect(() => {
    // This will refresh the projects when the user navigates back to this page
    const handleFocus = () => loadProjects();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Apply filters and sort results
  useEffect(() => {
    let results = [...searchResults];

    // Filter by search query
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      results = results.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    // Filter by institution (if department is not specified)
    if (searchParams.institutionId !== undefined && searchParams.departmentId === undefined) {
      // Get all departments for this institution
      const departmentIds = mockDepartmentsByInstitution[searchParams.institutionId].map(dept => dept.id);
      // Filter projects by any of these departments
      results = results.filter(project => departmentIds.includes(project.departmentId));
    }

    // Filter by department
    if (searchParams.departmentId !== undefined) {
      results = results.filter(project => project.departmentId === searchParams.departmentId);
    }

    // Filter by year
    if (searchParams.year !== undefined) {
      results = results.filter(project => project.year === searchParams.year);
    }

    // Filter by access level
    if (searchParams.accessLevel !== undefined) {
      results = results.filter(project => project.accessLevel === searchParams.accessLevel);
    }

    // Sort results
    switch (sortOption) {
      case 'recent':
        results.sort((a, b) => b.uploadDate - a.uploadDate);
        break;
      case 'oldest':
        results.sort((a, b) => a.uploadDate - b.uploadDate);
        break;
      case 'title_asc':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        results.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setFilteredResults(results);
  }, [searchResults, searchParams, sortOption]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    // Navigate to search page with no parameters
    navigate('/search');
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-university-navy">Search Projects</h1>

      <div className="mb-8">
        <SearchForm onSearch={handleSearch} initialValues={searchParams} />

        {/* Show clear search button if there are any search parameters */}
        {(searchParams.query || searchParams.institutionId || searchParams.departmentId ||
          searchParams.year || searchParams.accessLevel !== undefined) && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              Clear All & Start New Search
            </Button>
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-gray-600">
            Found {filteredResults.length} {filteredResults.length === 1 ? 'project' : 'projects'}
          </div>

          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Sort by:</span>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg p-6 h-64"
            ></div>
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-university-navy">No projects found</h3>

          {searchParams.query || searchParams.institutionId || searchParams.departmentId ||
           searchParams.year || searchParams.accessLevel !== undefined ? (
            <>
              <p className="text-gray-600 mb-4">
                No projects match your search criteria. Try adjusting your filters.
              </p>
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="border-university-blue text-university-blue hover:bg-university-blue/10 mr-2"
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                There are no projects in the system yet. Be the first to upload one!
              </p>
              <Button
                asChild
                className="bg-university-blue hover:bg-university-blue/90 text-white"
              >
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" /> Upload a Project
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default SearchPage;
