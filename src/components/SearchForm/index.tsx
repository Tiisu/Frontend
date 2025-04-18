
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccessLevel } from '@/lib/blockchain';
import { mockInstitutions, mockDepartmentsByInstitution } from '@/components/InstitutionData';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  initialValues?: SearchParams;
}

export interface SearchParams {
  query: string;
  institutionId?: number;
  departmentId?: number;
  year?: number;
  accessLevel?: AccessLevel;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, initialValues = { query: '' } }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialValues);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const navigate = useNavigate();

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, query: e.target.value });
  };

  const handleInstitutionChange = (value: string) => {
    const institutionId = parseInt(value);
    // When institution changes, reset department
    setSearchParams({
      ...searchParams,
      institutionId,
      departmentId: undefined
    });
  };

  const handleDepartmentChange = (value: string) => {
    setSearchParams({ ...searchParams, departmentId: parseInt(value) });
  };

  // Get available departments based on selected institution
  const getAvailableDepartments = () => {
    if (!searchParams.institutionId) return [];
    return mockDepartmentsByInstitution[searchParams.institutionId] || [];
  };

  const handleYearChange = (value: string) => {
    setSearchParams({ ...searchParams, year: parseInt(value) });
  };

  const handleAccessLevelChange = (value: string) => {
    setSearchParams({ ...searchParams, accessLevel: parseInt(value) as AccessLevel });
  };

  const handleClearFilter = (filter: keyof SearchParams) => {
    const newParams = { ...searchParams };
    delete newParams[filter];
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    setSearchParams({ query: searchParams.query });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);

    // Update URL with search parameters
    const queryParams = new URLSearchParams();

    if (searchParams.query) queryParams.set('q', searchParams.query);
    if (searchParams.institutionId) queryParams.set('inst', searchParams.institutionId.toString());
    if (searchParams.departmentId) queryParams.set('dept', searchParams.departmentId.toString());
    if (searchParams.year) queryParams.set('year', searchParams.year.toString());
    if (searchParams.accessLevel !== undefined) queryParams.set('access', searchParams.accessLevel.toString());

    navigate({
      pathname: '/search',
      search: queryParams.toString()
    });
  };

  const toggleAdvanced = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };

  // Count active filters (excluding query)
  const activeFilterCount = Object.keys(searchParams).filter(
    key => key !== 'query' && searchParams[key as keyof SearchParams] !== undefined
  ).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-university-blue/10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search for projects..."
              value={searchParams.query}
              onChange={handleInputChange}
              className="pl-10 pr-4 py-2 w-full border-university-blue/20 focus:border-university-blue focus:ring-university-blue"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            {searchParams.query && (
              <button
                type="button"
                onClick={() => setSearchParams({ ...searchParams, query: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            className="bg-university-blue hover:bg-university-blue/90 text-white"
          >
            Search
          </Button>
        </div>

        <div>
          <button
            type="button"
            onClick={toggleAdvanced}
            className="text-university-blue hover:text-university-navy text-sm font-medium flex items-center"
          >
            {isAdvancedOpen ? 'Hide' : 'Show'} Advanced Search
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-university-blue text-white">
                {activeFilterCount}
              </Badge>
            )}
          </button>

          {isAdvancedOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <Select
                  value={searchParams.institutionId?.toString()}
                  onValueChange={handleInstitutionChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInstitutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Select
                  value={searchParams.departmentId?.toString()}
                  onValueChange={handleDepartmentChange}
                  disabled={!searchParams.institutionId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={searchParams.institutionId ? "Select department" : "Select institution first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableDepartments().map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Select
                  value={searchParams.year?.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <Select
                  value={searchParams.accessLevel?.toString()}
                  onValueChange={handleAccessLevelChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Public</SelectItem>
                    <SelectItem value="1">Restricted</SelectItem>
                    <SelectItem value="2">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isAdvancedOpen && activeFilterCount > 0 && (
            <>
              <Separator className="my-4" />

              <div className="flex flex-wrap gap-2">
                <div className="text-sm text-gray-600 mr-2 pt-0.5">Active filters:</div>

                {searchParams.institutionId !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Institution: {mockInstitutions.find(i => i.id === searchParams.institutionId)?.name}
                    <button onClick={() => handleClearFilter('institutionId')}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}

                {searchParams.departmentId !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Department: {getAvailableDepartments().find(d => d.id === searchParams.departmentId)?.name}
                    <button onClick={() => handleClearFilter('departmentId')}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}

                {searchParams.year !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Year: {searchParams.year}
                    <button onClick={() => handleClearFilter('year')}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}

                {searchParams.accessLevel !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Access: {AccessLevel[searchParams.accessLevel]}
                    <button onClick={() => handleClearFilter('accessLevel')}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}

                {activeFilterCount > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-gray-500 hover:text-university-blue text-xs ml-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
