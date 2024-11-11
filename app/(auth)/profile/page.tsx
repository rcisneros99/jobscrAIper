'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import { ChevronDown, ChevronRight, Download, User } from 'lucide-react';
import { BorderBeam } from '@/components/magicui/border-beam';

interface SearchResult {
  id: string;
  companyName: string;
  jobs: any[];
}

interface SearchHistoryItem {
  id: string;
  searchQuery: {
    position: string;
    location: string;
    industry: string;
  };
  timestamp: string;
  searchTime: number;
  resultsCount: number;
  searchResults: SearchResult[];
}

interface Search {
  timestamp: string;
  query: {
    position: string;
    location: string;
    industry: string;
  };
  results: SearchResult[];
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState({
    openaiKey: '',
    googleApiKey: '',
    googleCseId: ''
  });
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [expandedSearches, setExpandedSearches] = useState<Record<string, boolean>>({});
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [searches, setSearches] = useState<Search[]>([]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch API keys');
      }
      const { data } = await response.json();
      if (data) {
        setApiKeys({
          openaiKey: data.openaiKey || '',
          googleApiKey: data.googleApiKey || '',
          googleCseId: data.googleCseId || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch API keys');
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch search history');
      }
      const { data } = await response.json();
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch search history');
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      Promise.all([
        fetchApiKeys(),
        fetchSearchHistory()
      ]).finally(() => setIsLoading(false));
    }
  }, [isSignedIn]);

  const saveApiKeys = async () => {
    try {
      setIsSavingKeys(true);
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeys),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save API keys');
      }

      setError(null);
    } catch (error) {
      console.error('Failed to save API keys:', error);
      setError(error instanceof Error ? error.message : 'Failed to save API keys');
    } finally {
      setIsSavingKeys(false);
    }
  };

  const toggleSearch = (searchId: string) => {
    setExpandedSearches(prev => ({
      ...prev,
      [searchId]: !prev[searchId]
    }));
  };

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  const downloadSearchResults = (searchData: SearchHistoryItem, filename = 'search-results.csv') => {
    const headers = ['Company', 'Job Title', 'Location', 'Description', 'Application URL'];
    const jobs = searchData.searchResults.flatMap(result => 
      result.jobs.map(job => [
        result.companyName,
        job.title,
        job.location,
        job.description,
        job.applicationUrl
      ])
    );

    const csvContent = [
      headers.join(','),
      ...jobs.map(row => row.map(cell => `"${String(cell)}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllSearchResults = () => {
    const allJobs: SearchResult[] = searches.flatMap((search) => search.results);
    
    // Create a complete SearchHistoryItem object
    const combinedSearchHistory: SearchHistoryItem = {
      id: 'all-searches',
      searchQuery: {
        position: 'All Positions',
        location: 'All Locations',
        industry: 'All Industries'
      },
      timestamp: new Date().toISOString(),
      searchTime: 0,
      resultsCount: allJobs.length,
      searchResults: allJobs
    };

    downloadSearchResults(combinedSearchHistory, 'all-search-results.csv');
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>
                    {isLoaded && isSignedIn && user ? user.fullName || 'User' : 'Loading...'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isLoaded && isSignedIn && user ? user.primaryEmailAddress?.emailAddress : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your API keys for job searching
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="openaiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiKey"
                    type="password"
                    value={apiKeys.openaiKey}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openaiKey: e.target.value }))}
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <Label htmlFor="googleApiKey">Google API Key</Label>
                  <Input
                    id="googleApiKey"
                    type="password"
                    value={apiKeys.googleApiKey}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, googleApiKey: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="googleCseId">Google CSE ID</Label>
                  <Input
                    id="googleCseId"
                    type="password"
                    value={apiKeys.googleCseId}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, googleCseId: e.target.value }))}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button 
                  onClick={saveApiKeys} 
                  disabled={isSavingKeys}
                >
                  {isSavingKeys ? 'Saving...' : 'Save API Keys'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Search History</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => downloadSearchResults({ 
                  id: 'all',
                  searchQuery: { position: '', location: '', industry: '' },
                  timestamp: new Date().toISOString(),
                  searchTime: 0,
                  resultsCount: searchHistory.reduce((acc, curr) => acc + curr.resultsCount, 0),
                  searchResults: searchHistory.flatMap(s => s.searchResults)
                }, 'all-search-results.csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download All Results
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : searchHistory.length === 0 ? (
                <p>No search history found</p>
              ) : (
                <div className="space-y-6">
                  {searchHistory.map((search) => (
                    <div key={search.id} className="border rounded-lg relative group overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BorderBeam />
                      </div>

                      <div className="flex items-center justify-between p-4 relative z-10">
                        <div 
                          className="flex-grow cursor-pointer"
                          onClick={() => toggleSearch(search.id)}
                        >
                          <p className="font-medium">
                            Searched "{search.searchQuery.position}" in "{search.searchQuery.location}"
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(search.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSearchResults(search, `search-${search.id}.csv`);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSearch(search.id)}
                          >
                            {expandedSearches[search.id] ? <ChevronDown /> : <ChevronRight />}
                          </Button>
                        </div>
                      </div>

                      {expandedSearches[search.id] && search.searchResults && (
                        <div className="p-4 border-t space-y-4 relative z-10">
                          {search.searchResults.map((result) => (
                            <div key={result.id} className="ml-4">
                              <div 
                                className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-primary/5 transition-colors"
                                onClick={() => toggleCompany(result.id)}
                              >
                                <p className="font-medium">
                                  {result.companyName} ({result.jobs.length} jobs)
                                </p>
                                {expandedCompanies[result.id] ? <ChevronDown /> : <ChevronRight />}
                              </div>

                              {expandedCompanies[result.id] && (
                                <div className="mt-2 space-y-4">
                                  {result.jobs.map((job) => (
                                    <div key={job.id} className="ml-4 p-4 bg-primary/5 rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">{job.title}</h4>
                                          <p className="text-sm text-muted-foreground">{job.location}</p>
                                          <p className="text-sm mt-2">{job.description}</p>
                                        </div>
                                        <Button 
                                          variant="outline"
                                          size="sm"
                                          className="ml-4"
                                          asChild
                                        >
                                          <a 
                                            href={job.applicationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            Apply
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 