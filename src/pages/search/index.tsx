
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import SearchForm, { SearchParams } from '@/components/SearchForm';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectData, mockProjects, mockDepartments, AccessLevel } from '@/lib/blockchain';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<ProjectData[]>([]);
  const [filteredResults, setFilteredResults] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({ query: '' });
  const [sortOption, setSortOption] = useState<string>('recent');

  // Parse query parameters from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    const newSearchParams: SearchParams = {
      query: queryParams.get('q') || '',
    };
    
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
    
    // In a real app, we would fetch data from blockchain
    // For now, use mock data
    setSearchResults(mockProjects);
    setIsLoading(false);
  }, [location.search]);

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

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-university-navy">Search Projects</h1>
      
      <div className="mb-8">
        <SearchForm onSearch={handleSearch} initialValues={searchParams} />
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
          <p className="text-gray-600 mb-4">
            No projects match your search criteria. Try adjusting your filters.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchParams({ query: '' })}
            className="border-university-blue text-university-blue hover:bg-university-blue/10"
          >
            Clear filters
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default SearchPage;
