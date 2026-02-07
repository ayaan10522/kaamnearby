import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getJobs, getUsers, getApplications } from '@/lib/firebase';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
  };

  const features = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Find Local Jobs",
      description: "Discover opportunities near you from trusted employers"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Direct Connect",
      description: "Chat directly with employers through in-app messaging"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Easy Apply",
      description: "One-click applications with your saved profile"
    }
  ];

  const [stats, setStats] = useState<{ value: string; label: string }[]>([
    { value: "0", label: "Jobs Posted" },
    { value: "0", label: "Companies" },
    { value: "0", label: "Job Seekers" },
    { value: "0", label: "Successful Hires" }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobs, users, applications] = await Promise.all([
          getJobs(),
          getUsers(),
          getApplications()
        ]);

        const jobsCount = Array.isArray(jobs) ? jobs.length : 0;
        const companiesCount = Array.isArray(users) ? users.filter((u: any) => u.userType === 'employer').length : 0;
        const seekersCount = Array.isArray(users) ? users.filter((u: any) => u.userType === 'jobseeker').length : 0;
        const hiresCount = Array.isArray(applications) ? applications.filter((a: any) => a.status === 'accepted').length : 0;

        setStats([
          { value: String(jobsCount), label: "Jobs Posted" },
          { value: String(companiesCount), label: "Companies" },
          { value: String(seekersCount), label: "Job Seekers" },
          { value: String(hiresCount), label: "Successful Hires" }
        ]);
      } catch (e) {
        // keep defaults on error
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Find Your Next <span className="text-secondary">Opportunity</span> Nearby
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/85 mb-8 max-w-xl mx-auto">
              Connect with local employers and land your dream job in your area
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-card rounded-xl p-3 shadow-xl max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Job title or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11 text-foreground border-0 bg-muted/50 focus-visible:ring-1"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9 h-11 text-foreground border-0 bg-muted/50 focus-visible:ring-1"
                  />
                </div>
                <Button type="submit" className="h-11 px-6 gradient-secondary font-semibold">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Why Choose KaamNearby?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Simple and effective job hunting. Connect with opportunities that match your skills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">
            Ready to Find Your Next Job?
          </h2>
          <p className="text-secondary-foreground/85 mb-6 max-w-lg mx-auto text-sm">
            Join thousands of job seekers who found their dream jobs through KaamNearby
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="gradient-secondary" 
              asChild
            >
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-foreground text-foreground hover:bg-foreground/10" 
              asChild
            >
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
