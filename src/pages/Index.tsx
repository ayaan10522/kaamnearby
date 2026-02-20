import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Users, ArrowRight, MessageSquare, Shield, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToJobCount, subscribeToUserCount } from '@/lib/firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobCount, setJobCount] = useState(0);
  const [userCounts, setUserCounts] = useState({ employers: 0, jobseekers: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const unsub1 = subscribeToJobCount(setJobCount);
    const unsub2 = subscribeToUserCount(setUserCounts);
    return () => { unsub1(); unsub2(); };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
  };

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Smart Matching",
      description: "Our algorithm matches you with jobs that fit your skills, experience, and location automatically"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Direct Chat",
      description: "Connect with employers instantly through our in-app messaging system"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Quick Apply",
      description: "Apply in seconds with your saved profile — no need to re-enter details"
    }
  ];

  const steps = [
    { num: "01", title: "Create Profile", desc: "Set up your professional profile with skills and experience" },
    { num: "02", title: "Get Matched", desc: "Our algorithm finds the best opportunities for you" },
    { num: "03", title: "Apply & Connect", desc: "Apply instantly and chat directly with employers" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm mb-8 border border-primary-foreground/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
              </span>
              <span className="text-primary-foreground/90 font-medium">{jobCount} active jobs right now</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.08] tracking-tight">
              Your Next Job is{' '}
              <span className="text-gradient">Right Around</span>
              <br className="hidden sm:block" /> the Corner
            </h1>
            <p className="text-primary-foreground/65 mb-10 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              KaamNearby connects you with local employers using smart matching. 
              Find work that fits your skills, near where you live.
            </p>

            <form onSubmit={handleSearch} className="bg-card rounded-2xl p-2.5 shadow-elevated max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Job title, skill, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-foreground border-0 bg-muted/40 rounded-xl focus-visible:ring-1 focus-visible:ring-secondary/50"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="City or area..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12 text-foreground border-0 bg-muted/40 rounded-xl focus-visible:ring-1 focus-visible:ring-secondary/50"
                  />
                </div>
                <Button type="submit" className="h-12 px-7 gradient-secondary rounded-xl font-semibold text-sm shadow-sm">
                  Search Jobs
                </Button>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-8 text-primary-foreground/50 text-xs">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-secondary" /> Free to use</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-secondary" /> No hidden fees</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-secondary" /> Verified employers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { value: jobCount, label: "Active Jobs", icon: <Briefcase className="h-5 w-5" /> },
              { value: userCounts.employers, label: "Employers", icon: <Users className="h-5 w-5" /> },
              { value: userCounts.jobseekers, label: "Job Seekers", icon: <TrendingUp className="h-5 w-5" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-3 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-secondary tabular-nums">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-4">Three Simple Steps</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              Getting started with KaamNearby takes less than 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-card rounded-2xl p-7 border border-border hover:border-secondary/30 hover:shadow-elevated transition-all duration-300 h-full">
                  <span className="text-5xl font-extrabold text-muted/60 group-hover:text-secondary/20 transition-colors">{step.num}</span>
                  <h3 className="font-bold text-lg mt-3 mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest">Why KaamNearby</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-4">Built for You</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              Everything you need to land your next opportunity, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-7 border border-border hover:border-secondary/30 hover:shadow-elevated transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-5 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-5">
            Ready to Find Your Next Job?
          </h2>
          <p className="text-primary-foreground/60 mb-10 max-w-lg mx-auto text-sm leading-relaxed">
            Join thousands of job seekers and employers on KaamNearby. Create your free account and start today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gradient-secondary rounded-xl font-bold text-sm px-8 shadow-sm h-12" asChild>
              <Link to="/register">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl font-semibold text-sm h-12" asChild>
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
