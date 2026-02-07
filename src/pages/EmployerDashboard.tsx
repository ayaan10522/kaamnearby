import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { createJob, getJobsByEmployer, getApplicationsByEmployer, getUserById, updateApplicationStatus, createChat } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Briefcase, Users, Eye, Loader2, MapPin, IndianRupee, Clock, MessageSquare, CheckCircle, XCircle, Building2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  createdAt: number;
  status: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  userId: string;
  userName: string;
  coverLetter: string;
  expectedSalary: string;
  availableFrom: string;
  status: string;
  createdAt: number;
}

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applicantProfile, setApplicantProfile] = useState<any>(null);
  const [newRequirement, setNewRequirement] = useState('');

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    requirements: [] as string[]
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.userType !== 'employer') {
      navigate('/jobs');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedJobs, fetchedApps] = await Promise.all([
        getJobsByEmployer(user.id),
        getApplicationsByEmployer(user.id)
      ]);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async () => {
    if (!user) return;
    
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setPosting(true);
    try {
      await createJob({
        ...jobForm,
        employerId: user.id
      });

      toast({
        title: "Job Posted!",
        description: "Your job is now live and visible to job seekers",
      });

      setShowPostModal(false);
      setJobForm({
        title: '',
        company: '',
        location: '',
        salary: '',
        type: 'Full-time',
        description: '',
        requirements: []
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !jobForm.requirements.includes(newRequirement.trim())) {
      setJobForm({ ...jobForm, requirements: [...jobForm.requirements, newRequirement.trim()] });
      setNewRequirement('');
    }
  };

  const removeRequirement = (req: string) => {
    setJobForm({ ...jobForm, requirements: jobForm.requirements.filter(r => r !== req) });
  };

  const viewApplicant = async (app: Application) => {
    setSelectedApp(app);
    try {
      const profile = await getUserById(app.userId);
      setApplicantProfile(profile);
    } catch (error) {
      console.error('Error fetching applicant:', error);
    }
  };

  const handleApplicationStatus = async (appId: string, status: string) => {
    try {
      await updateApplicationStatus(appId, status);
      toast({
        title: status === 'accepted' ? "Application Accepted" : "Application Rejected",
        description: status === 'accepted' ? "You can now message the applicant" : "The applicant has been notified",
      });
      fetchData();
      setSelectedApp(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const startChat = async (app: Application) => {
    if (!user) return;
    try {
      const chatId = await createChat(user.id, app.userId, app.id);
      navigate(`/messages?chat=${chatId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (!user || user.userType !== 'employer') return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage jobs and applications</p>
            </div>
            <Button onClick={() => setShowPostModal(true)} className="gradient-secondary shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="jobs" className="space-y-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="jobs" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Jobs ({jobs.length})
                </TabsTrigger>
                <TabsTrigger value="applications" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Applications ({applications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="mt-4">
                {jobs.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Briefcase className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">No Jobs Posted</h3>
                      <p className="text-sm text-muted-foreground mb-4">Post your first job to get started</p>
                      <Button onClick={() => setShowPostModal(true)} className="gradient-secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Post Job
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <Card key={job.id} className="border-border/50 hover:border-primary/20 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">{job.company}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IndianRupee className="h-3 w-3" />
                                    {job.salary}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(job.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:flex-shrink-0">
                              <Badge 
                                variant={job.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {job.status}
                              </Badge>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/jobs/${job.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="mt-4">
                {applications.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Users className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">No Applications Yet</h3>
                      <p className="text-sm text-muted-foreground">Applications will appear here when people apply</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <Card key={app.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                                {app.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold">{app.userName}</h3>
                                <p className="text-sm text-muted-foreground">Applied for: {app.jobTitle}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {app.expectedSalary} • Available: {app.availableFrom || 'Immediate'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:flex-shrink-0">
                              <Badge 
                                variant={
                                  app.status === 'accepted' ? 'default' :
                                  app.status === 'rejected' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {app.status}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => viewApplicant(app)}>
                                View
                              </Button>
                              {app.status === 'accepted' && (
                                <Button size="sm" onClick={() => startChat(app)} className="gradient-primary">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                  Chat
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Post Job Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Job</DialogTitle>
            <DialogDescription>
              Fill in the details to create a job listing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Driver, Cook"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm">Company *</Label>
                <Input
                  id="company"
                  placeholder="Your company"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm">Location *</Label>
                <Input
                  id="location"
                  placeholder="Mumbai, Delhi"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary" className="text-sm">Salary</Label>
                <Input
                  id="salary"
                  placeholder="₹15,000/month"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm">Job Type</Label>
              <Select value={jobForm.type} onValueChange={(value) => setJobForm({ ...jobForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Daily Wage">Daily Wage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm">Description *</Label>
              <Textarea
                id="description"
                placeholder="Job responsibilities, hours, benefits..."
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Requirements</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="icon" variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {jobForm.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {jobForm.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="text-xs gap-1 pr-1">
                      {req}
                      <button onClick={() => removeRequirement(req)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowPostModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePostJob} className="flex-1 gradient-secondary" disabled={posting}>
              {posting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Job'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Applicant Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
          </DialogHeader>
          
          {selectedApp && applicantProfile && (
            <div className="space-y-4 py-2">
              {/* Applicant Header */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {applicantProfile.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{applicantProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{applicantProfile.email}</p>
                </div>
              </div>

              {applicantProfile.profile && (
                <div className="space-y-3">
                  {applicantProfile.profile.headline && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Headline</p>
                      <p className="text-sm font-medium">{applicantProfile.profile.headline}</p>
                    </div>
                  )}

                  {applicantProfile.profile.bio && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">About</p>
                      <p className="text-sm">{applicantProfile.profile.bio}</p>
                    </div>
                  )}

                  {applicantProfile.profile.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {applicantProfile.profile.skills.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {applicantProfile.profile.experience?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Experience</p>
                      <div className="space-y-2">
                        {applicantProfile.profile.experience.map((exp: any, i: number) => (
                          <div key={i} className="bg-muted/50 p-2.5 rounded-lg">
                            <p className="text-sm font-medium">{exp.title}</p>
                            <p className="text-xs text-muted-foreground">{exp.company} • {exp.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Cover Letter</p>
                <p className="text-sm">{selectedApp.coverLetter || 'No cover letter provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-2.5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Expected Salary</p>
                  <p className="text-sm font-medium">{selectedApp.expectedSalary || 'Not specified'}</p>
                </div>
                <div className="bg-muted/50 p-2.5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Available From</p>
                  <p className="text-sm font-medium">{selectedApp.availableFrom || 'Immediate'}</p>
                </div>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleApplicationStatus(selectedApp.id, 'rejected')}
                    className="flex-1 text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApplicationStatus(selectedApp.id, 'accepted')}
                    className="flex-1 gradient-secondary"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Accept
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EmployerDashboard;
