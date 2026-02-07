import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getJobs } from '@/lib/firebase';
import { Search, MapPin, Briefcase, Clock, IndianRupee, Loader2, Building2, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  requirements: string[];
  employerId: string;
  createdAt: number;
  status: string;
}

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const fetchedJobs = await getJobs();
      setJobs(fetchedJobs.filter((job: Job) => job.status === 'active'));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    setSearchParams(params);
  };

  // Improved fuzzy search - matches partial words and is more flexible
  const matchesSearch = (text: string, query: string): boolean => {
    if (!query) return true;
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const textLower = text.toLowerCase();
    
    return searchTerms.every(term => {
      // Check if any word in the text starts with the search term
      const words = textLower.split(/\s+/);
      return words.some(word => word.includes(term)) || textLower.includes(term);
    });
  };

  const filteredJobs = jobs.filter(job => {
    const q = searchParams.get('q') || '';
    const loc = searchParams.get('location') || '';
    
    const searchableText = `${job.title} ${job.company} ${job.description} ${job.requirements?.join(' ') || ''}`;
    const matchesQuery = matchesSearch(searchableText, q);
    const matchesLocation = matchesSearch(job.location, loc);
    
    return matchesQuery && matchesLocation;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Search Header */}
      <section className="bg-primary py-6 md:py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold text-primary-foreground mb-4">Find Jobs</h1>
          <form onSubmit={handleSearch} className="bg-card rounded-xl p-3 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Job title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 border-0 bg-muted/50 focus-visible:ring-1"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Location..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="pl-9 h-11 border-0 bg-muted/50 focus-visible:ring-1"
                />
              </div>
              <Button type="submit" className="h-11 px-6 gradient-secondary font-medium">
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Job Listings */}
      <main className="flex-1 py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No jobs found</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {searchParams.get('q') || searchParams.get('location') 
                  ? "Try different keywords or clear filters"
                  : "Check back later for new opportunities"}
              </p>
              {(searchParams.get('q') || searchParams.get('location')) && (
                <Button variant="outline" size="sm" onClick={() => setSearchParams({})}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs found
                </p>
              </div>

              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <Link 
                    key={job.id} 
                    to={`/jobs/${job.id}`}
                    className="block"
                  >
                    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                      <div className="flex gap-4">
                        {/* Company Icon */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        
                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(job.createdAt)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                              {job.type}
                            </Badge>
                            {job.requirements?.slice(0, 2).map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs font-normal px-2 py-0.5">
                                {req}
                              </Badge>
                            ))}
                            {job.requirements?.length > 2 && (
                              <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
                                +{job.requirements.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
