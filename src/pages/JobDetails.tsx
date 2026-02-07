import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById, createApplication, getUserById } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { MapPin, IndianRupee, Clock, Briefcase, Building2, ArrowLeft, Loader2, CheckCircle, User, Calendar, Send } from 'lucide-react';
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

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableFrom: ''
  });

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const fetchedJob = await getJobById(id!);
      if (fetchedJob) {
        setJob(fetchedJob);
        const employerData = await getUserById(fetchedJob.employerId);
        setEmployer(employerData);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.userType === 'employer') {
      toast({
        title: "Cannot Apply",
        description: "Employers cannot apply for jobs",
        variant: "destructive"
      });
      return;
    }

    if (!user.profile) {
      toast({
        title: "Complete Your Profile",
        description: "Please complete your profile before applying",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!user || !job) return;

    setApplying(true);
    try {
      await createApplication({
        jobId: job.id,
        jobTitle: job.title,
        userId: user.id,
        userName: user.name,
        coverLetter: applicationData.coverLetter,
        expectedSalary: applicationData.expectedSalary,
        availableFrom: applicationData.availableFrom,
        employerId: job.employerId
      });

      toast({
        title: "Application Submitted!",
        description: "The employer will review your application soon",
      });

      setShowApplyModal(false);
      setApplicationData({ coverLetter: '', expectedSalary: '', availableFrom: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground text-sm mb-4">This job may have been removed</p>
          <Button asChild variant="outline">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back Link */}
          <Link 
            to="/jobs" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>

          {/* Job Header Card */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground flex-shrink-0 shadow-sm">
                  <Building2 className="h-7 w-7" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold mb-1">{job.title}</h1>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" />
                  {job.salary}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-secondary/90 hover:bg-secondary text-secondary-foreground">{job.type}</Badge>
                {job.requirements?.slice(0, 4).map((req, index) => (
                  <Badge key={index} variant="outline">{req}</Badge>
                ))}
              </div>

              {/* Apply Button */}
              {user?.id !== job.employerId && (
                <Button 
                  onClick={handleApply} 
                  size="lg" 
                  className="w-full sm:w-auto gradient-secondary shadow-sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Description Section */}
          <div className="mt-6 space-y-6">
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">About this Role</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Employer Info */}
            {employer && (
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">About the Company</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{employer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Member since {new Date(employer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {employer.profile?.companyDescription && (
                  <p className="mt-4 text-muted-foreground text-sm">
                    {employer.profile.companyDescription}
                  </p>
                )}
              </div>
            )}

            {/* Mobile Apply Button */}
            {user?.id !== job.employerId && (
              <div className="sm:hidden">
                <Button 
                  onClick={handleApply} 
                  size="lg" 
                  className="w-full gradient-secondary shadow-sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              at {job.company}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Why should we hire you?</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell the employer why you're a great fit..."
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary</Label>
                <Input
                  id="expectedSalary"
                  placeholder="₹20,000/month"
                  value={applicationData.expectedSalary}
                  onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={applicationData.availableFrom}
                  onChange={(e) => setApplicationData({ ...applicationData, availableFrom: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Your profile, skills, and experience will be shared with the employer.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowApplyModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={submitApplication} className="flex-1 gradient-secondary" disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobDetails;
