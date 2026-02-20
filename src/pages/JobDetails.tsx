import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById, createApplication, getUserById } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { MapPin, IndianRupee, Clock, Briefcase, Building2, ArrowLeft, Loader2, CheckCircle, User, Calendar, Send, Globe, Users, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Job {
  id: string; title: string; description: string; company: string; location: string;
  salary: string; type: string; requirements: string[]; employerId: string; createdAt: number; status: string;
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
  const [applicationData, setApplicationData] = useState({ coverLetter: '', expectedSalary: '', availableFrom: '' });

  useEffect(() => { if (id) fetchJob(); }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const fetchedJob = await getJobById(id!);
      if (fetchedJob) {
        setJob(fetchedJob);
        const employerData = await getUserById(fetchedJob.employerId);
        setEmployer(employerData);
      }
    } catch (error) { console.error('Error fetching job:', error); }
    finally { setLoading(false); }
  };

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.userType === 'employer') { toast({ title: "Cannot Apply", description: "Employers cannot apply for jobs", variant: "destructive" }); return; }
    if (!user.profile) { toast({ title: "Complete Your Profile", description: "Please complete your profile before applying", variant: "destructive" }); navigate('/profile'); return; }
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!user || !job) return;
    setApplying(true);
    try {
      await createApplication({ jobId: job.id, jobTitle: job.title, userId: user.id, userName: user.name, coverLetter: applicationData.coverLetter, expectedSalary: applicationData.expectedSalary, availableFrom: applicationData.availableFrom, employerId: job.employerId });
      toast({ title: "Application Submitted!", description: "The employer will review your application soon" });
      setShowApplyModal(false);
      setApplicationData({ coverLetter: '', expectedSalary: '', availableFrom: '' });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit application", variant: "destructive" });
    } finally { setApplying(false); }
  };

  const formatDate = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading job details...</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Briefcase className="h-8 w-8 text-muted-foreground" /></div>
        <h2 className="font-bold text-lg mb-1">Job Not Found</h2>
        <p className="text-muted-foreground text-sm mb-5">This job may have been removed or doesn't exist</p>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/jobs">Browse All Jobs</Link></Button>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Job Header */}
        <div className="gradient-hero py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/jobs" className="inline-flex items-center text-xs text-primary-foreground/50 hover:text-primary-foreground mb-6 transition-colors font-medium">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Jobs
            </Link>
            <div className="flex gap-5 items-start">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Building2 className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-1.5">{job.title}</h1>
                <p className="text-primary-foreground/70 text-sm font-medium">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-xs text-primary-foreground/55 mt-4 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
                  {job.salary && <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4" />{job.salary}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Posted {formatDate(job.createdAt)}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{job.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl py-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-secondary/90 hover:bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-lg">{job.type}</Badge>
                {job.requirements?.slice(0, 4).map((req, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-3 py-1 rounded-lg">{req}</Badge>
                ))}
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-base mb-4">About this Role</h2>
                <p className="text-muted-foreground text-sm leading-[1.75] whitespace-pre-wrap">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-bold text-base mb-4">Requirements & Skills</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply CTA */}
              {user?.id !== job.employerId && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-2">Interested in this job?</h3>
                  <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                    Apply now and the employer will review your profile and resume.
                  </p>
                  <Button onClick={handleApply} className="w-full gradient-secondary rounded-xl font-semibold text-sm h-11 shadow-sm">
                    <Send className="h-4 w-4 mr-2" /> Apply Now
                  </Button>
                </div>
              )}

              {/* Job Quick Info */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-bold text-sm mb-4">Job Overview</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Briefcase className="h-4 w-4" />, label: "Type", value: job.type },
                    { icon: <MapPin className="h-4 w-4" />, label: "Location", value: job.location },
                    ...(job.salary ? [{ icon: <IndianRupee className="h-4 w-4" />, label: "Salary", value: job.salary }] : []),
                    { icon: <Calendar className="h-4 w-4" />, label: "Posted", value: formatDate(job.createdAt) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employer Card */}
              {employer && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-4">About the Company</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {employer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{employer.profile?.companyName || employer.name}</p>
                      {employer.profile?.industry && (
                        <p className="text-xs text-muted-foreground">{employer.profile.industry}</p>
                      )}
                    </div>
                  </div>
                  {employer.profile?.companyDescription && (
                    <p className="text-muted-foreground text-xs leading-relaxed">{employer.profile.companyDescription}</p>
                  )}
                  {employer.profile?.location && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {employer.profile.location}
                    </p>
                  )}
                  {employer.profile?.website && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <Globe className="h-3 w-3" /> {employer.profile.website}
                    </p>
                  )}
                  {employer.profile?.employeeCount && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <Users className="h-3 w-3" /> {employer.profile.employeeCount} employees
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Apply for {job.title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">at {job.company} · {job.location}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-xs font-semibold">Why should we hire you?</Label>
              <Textarea id="coverLetter" placeholder="Tell the employer what makes you a great fit for this role..." value={applicationData.coverLetter} onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })} rows={4} className="resize-none text-sm rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary" className="text-xs font-semibold">Expected Salary</Label>
                <Input id="expectedSalary" placeholder="₹20,000/month" value={applicationData.expectedSalary} onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })} className="text-sm rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableFrom" className="text-xs font-semibold">Available From</Label>
                <Input id="availableFrom" type="date" value={applicationData.availableFrom} onChange={(e) => setApplicationData({ ...applicationData, availableFrom: e.target.value })} className="text-sm rounded-xl" />
              </div>
            </div>
            <div className="bg-secondary/5 border border-secondary/10 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                Your profile and resume will be shared with the employer
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={() => setShowApplyModal(false)} className="flex-1 rounded-xl text-sm h-11">Cancel</Button>
            <Button onClick={submitApplication} className="flex-1 gradient-secondary rounded-xl text-sm font-semibold h-11 shadow-sm" disabled={applying}>
              {applying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Send className="mr-2 h-4 w-4" />Submit Application</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobDetails;
