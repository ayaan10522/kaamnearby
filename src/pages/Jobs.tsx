import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getJobs } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { rankJobsForUser } from '@/lib/jobRanking';
import { Search, MapPin, Briefcase, Clock, IndianRupee, Loader2, Building2, ArrowRight, Sparkles, TrendingUp, Filter } from 'lucide-react';
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
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => { fetchJobs(); }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const fetchedJobs = await getJobs();
      const activeJobs = fetchedJobs.filter((job: Job) => job.status === 'active');
      // Apply smart ranking if user has a profile
      const profile = user?.userType === 'jobseeker' ? user?.profile : null;
      const ranked = rankJobsForUser(activeJobs, profile);
      setJobs(ranked);
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

  const matchesSearch = (text: string, query: string): boolean => {
    if (!query) return true;
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const textLower = text.toLowerCase();
    return searchTerms.every(term => {
      const words = textLower.split(/\s+/);
      return words.some(word => word.includes(term)) || textLower.includes(term);
    });
  };

  const filteredJobs = jobs.filter(job => {
    const q = searchParams.get('q') || '';
    const loc = searchParams.get('location') || '';
    const searchableText = `${job.title} ${job.company} ${job.description} ${job.requirements?.join(' ') || ''}`;
    const matchesQ = matchesSearch(searchableText, q);
    const matchesLoc = matchesSearch(job.location, loc);
    const matchesType = !selectedType || job.type === selectedType;
    return matchesQ && matchesLoc && matchesType;
  });

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Daily Wage'];
  const hasProfile = user?.userType === 'jobseeker' && user?.profile;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Search Header */}
      <section className="gradient-hero py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">
                {hasProfile ? 'Jobs For You' : 'Find Jobs'}
              </h1>
              {hasProfile && (
                <p className="text-primary-foreground/60 text-xs mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Personalized based on your profile
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-secondary tabular-nums">{filteredJobs.length}</span>
              <span className="text-primary-foreground/60 text-xs block">jobs found</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="bg-card rounded-2xl p-2.5 shadow-elevated">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Job title, skill, or company..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-10 h-11 border-0 bg-muted/40 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-secondary/50" 
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="City or area..." 
                  value={locationQuery} 
                  onChange={(e) => setLocationQuery(e.target.value)} 
                  className="pl-10 h-11 border-0 bg-muted/40 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-secondary/50" 
                />
              </div>
              <Button type="submit" className="h-11 px-6 gradient-secondary rounded-xl text-sm font-semibold shadow-sm">
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          </form>

          {/* Type Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedType('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                !selectedType 
                  ? 'bg-secondary text-secondary-foreground shadow-sm' 
                  : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/15'
              }`}
            >
              All Types
            </button>
            {jobTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? '' : type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedType === type 
                    ? 'bg-secondary text-secondary-foreground shadow-sm' 
                    : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/15'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 py-5 px-4">
        <div className="container mx-auto max-w-4xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-secondary mb-3" />
              <p className="text-muted-foreground text-sm">Finding the best jobs for you...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/80 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-bold text-lg mb-1">No jobs found</h2>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">Try different keywords, change your filters, or check back later</p>
              {(searchParams.get('q') || searchParams.get('location') || selectedType) && (
                <Button variant="outline" size="sm" onClick={() => { setSearchParams({}); setSelectedType(''); }} className="rounded-xl">
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job, index) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block group">
                  <div className={`bg-card border rounded-2xl p-5 hover:shadow-elevated transition-all duration-300 ${
                    job.matchScore >= 50 ? 'border-secondary/30 ring-1 ring-secondary/10' : 'border-border hover:border-secondary/20'
                  }`}>
                    {/* Match indicator for top matches */}
                    {hasProfile && job.matchScore >= 30 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2.5 py-1 rounded-lg">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-[11px] font-semibold">{job.matchScore}% Match</span>
                        </div>
                        {job.matchReasons?.slice(0, 3).map((reason: string, i: number) => (
                          <span key={i} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        job.matchScore >= 50 
                          ? 'bg-secondary/10 group-hover:bg-secondary/15' 
                          : 'bg-primary/8 group-hover:bg-primary/12'
                      }`}>
                        <Building2 className={`h-6 w-6 ${
                          job.matchScore >= 50 ? 'text-secondary' : 'text-primary'
                        } transition-colors`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-[15px] group-hover:text-secondary transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-secondary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {job.description?.substring(0, 120)}...
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />{job.location}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1.5">
                              <IndianRupee className="h-3.5 w-3.5" />{job.salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />{formatDate(job.createdAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <Badge variant="secondary" className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg">
                            {job.type}
                          </Badge>
                          {job.requirements?.slice(0, 3).map((req: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] font-normal px-2.5 py-0.5 rounded-lg">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements?.length > 3 && (
                            <Badge variant="outline" className="text-[10px] font-normal px-2.5 py-0.5 rounded-lg">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
