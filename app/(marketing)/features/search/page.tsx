'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { redirect, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { cn } from "@/lib/utils";
import { BorderBeam } from '@/components/magicui/border-beam';
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Job {
  'Company Name': string;
  'Job Title': string;
  'Location': string;
  'Application Link': string;
  'Job Description': string;
  'Required Certifications': string[];
  'Additional Details': string;
}

interface Company {
  id: string;
  name: string;
  web?: string;
  status: 'pending' | 'searching' | 'completed' | 'error';
}

interface JobResult {
  "Company Name": string;
  "Job Title": string;
  "Application Link": string;
  "Job Description": string;
  "Required Certifications": string[];
  "Location": string;
  "Additional Details": string;
}

export default function SearchPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('any');
  const [numberOfResults, setNumberOfResults] = useState('2');
  const [whitelist, setWhitelist] = useState('');
  const [blacklist, setBlacklist] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobResults, setJobResults] = useState<Record<string, JobResult[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [avoidPreviousCompanies, setAvoidPreviousCompanies] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/features/search');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const response = await fetch('/api/user/api-keys');
        if (!response.ok) throw new Error('Failed to fetch API keys');
        
        const { data } = await response.json();
        setHasApiKeys(Boolean(data?.openaiKey && data?.googleApiKey && data?.googleCseId));
      } catch (error) {
        console.error('Failed to check API keys:', error);
        setHasApiKeys(false);
      }
    };

    if (isSignedIn) {
      checkApiKeys();
    }
  }, [isSignedIn]);

  const toggleCard = (companyId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    setCompanies([]);
    setJobResults({});
    setExpandedCards({});

    try {
      const response = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position,
          location,
          industry,
          numResults: parseInt(numberOfResults)
        }),
      });

      if (!response.ok) throw new Error('Failed to start search');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              const data = JSON.parse(jsonStr);

              if (data.type === 'companies_list') {
                setCompanies(data.companies.map((company: any) => ({
                  ...company,
                  status: 'searching'
                })));
              } 
              else if (data.type === 'progress_update') {
                const { company_id, status, jobs } = data;
                
                setCompanies(prev => prev.map(company => 
                  company.id === company_id 
                    ? { ...company, status }
                    : company
                ));

                if (jobs) {
                  setJobResults(prev => ({
                    ...prev,
                    [company_id]: jobs
                  }));
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (!hasApiKeys) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing API Keys</AlertTitle>
            <AlertDescription>
              Please configure your API keys in your{' '}
              <Link href="/profile" className="font-medium underline underline-offset-4">
                profile settings
              </Link>
              {' '}before using the search feature.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Search Jobs</h1>
        <Card className="p-6 mb-8">
          <form ref={formRef} onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium">Position</label>
                <input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Software Engineer, Data Scientist..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="San Francisco, Remote..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium">Industry</label>
                <input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Tech, Finance..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="companySize" className="text-sm font-medium">Company Size</label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="any">Any Size</option>
                  <option value="startup">Startup (1-50)</option>
                  <option value="small">Small (51-200)</option>
                  <option value="medium">Medium (201-1000)</option>
                  <option value="large">Large (1000+)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="numberOfResults" className="text-sm font-medium">Number of Results</label>
                <input
                  id="numberOfResults"
                  type="number"
                  value={numberOfResults}
                  onChange={(e) => setNumberOfResults(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min={1}
                  max={50}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="whitelist" className="text-sm font-medium">Preferred Companies</label>
                <input
                  id="whitelist"
                  value={whitelist}
                  onChange={(e) => setWhitelist(e.target.value)}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Company A, Company B (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="blacklist" className="text-sm font-medium">Excluded Companies</label>
                <input
                  id="blacklist"
                  value={blacklist}
                  onChange={(e) => setBlacklist(e.target.value)}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Company X, Company Y (comma-separated)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoidPrevious"
                  checked={avoidPreviousCompanies}
                  onCheckedChange={(checked) => setAvoidPreviousCompanies(checked as boolean)}
                />
                <label
                  htmlFor="avoidPrevious"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Avoid previously searched companies
                </label>
              </div>

              <div className="flex items-center space-x-2 self-end">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSearching || !hasApiKeys}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                {!hasApiKeys && (
                  <p className="text-red-500 mt-2">
                    Please configure your API keys in your profile before searching.
                  </p>
                )}
                {error && (
                  <p className="text-red-500 mt-2">{error}</p>
                )}
              </div>
            </div>
          </form>
        </Card>

        {companies.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const jobs = jobResults[company.id] || [];
              const hasJobs = jobs.length > 0;
              const isSearching = !hasJobs && company.status !== 'completed';
              
              return (
                <Card key={company.id} className="relative overflow-hidden">
                  {hasJobs && <BorderBeam />}
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{company.name}</CardTitle>
                      {company.web && (
                        <a 
                          href={company.web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Career Page
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
                        <span>Searching for jobs...</span>
                      </div>
                    ) : hasJobs ? (
                      <div>
                        <Button
                          onClick={() => setExpandedCards(prev => ({
                            ...prev,
                            [company.id]: !prev[company.id]
                          }))}
                          variant="outline"
                          className="w-full justify-between relative z-10"
                        >
                          {jobs.length} Jobs Found
                          <span>{expandedCards[company.id] ? '▼' : '▶'}</span>
                        </Button>
                        
                        {expandedCards[company.id] && (
                          <div className="mt-4 space-y-4 relative z-10">
                            {jobs.map((job: any, index: number) => (
                              <div key={index} className="border-t pt-4">
                                <h4 className="font-medium">{job["Job Title"]}</h4>
                                <p className="text-sm text-gray-600">{job.Location}</p>
                                <p className="text-sm mt-1">{job["Job Description"]}</p>
                                <a 
                                  href={job["Application Link"]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  Apply Now
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No jobs found</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}