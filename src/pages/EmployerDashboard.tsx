import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { createJob, getJobsByEmployer, getApplicationsByEmployer, getUserById, updateApplicationStatus, createChat } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Briefcase, Users, Eye, Loader2, MapPin, IndianRupee, Clock, MessageSquare, CheckCircle, XCircle, Building2, TrendingUp, FileText } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Job { id: string; title: string; company: string; location: string; salary: string; type: string; createdAt: number; status: string; }
interface Application { id: string; jobId: string; jobTitle: string; userId: string; userName: string; coverLetter: string; expectedSalary: string; availableFrom: string; status: string; createdAt: number; }

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
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', salary: '', type: 'Full-time', description: '', requirements: [] as string[] });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.userType !== 'employer') { navigate('/jobs'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedJobs, fetchedApps] = await Promise.all([getJobsByEmployer(user.id), getApplicationsByEmployer(user.id)]);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handlePostJob = async () => {
    if (!user) return;
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" }); return;
    }
    setPosting(true);
    try {
      await createJob({ ...jobForm, employerId: user.id });
      toast({ title: "Job Posted!", description: "Your job listing is now live" });
      setShowPostModal(false);
      setJobForm({ title: '', company: '', location: '', salary: '', type: 'Full-time', description: '', requirements: [] });
      fetchData();
    } catch (error: any) { toast({ title: "Error", description: error.message || "Failed to post job", variant: "destructive" }); }
    finally { setPosting(false); }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !jobForm.requirements.includes(newRequirement.trim())) {
      setJobForm({ ...jobForm, requirements: [...jobForm.requirements, newRequirement.trim()] });
      setNewRequirement('');
    }
  };

  const viewApplicant = async (app: Application) => {
    setSelectedApp(app);
    try { const profile = await getUserById(app.userId); setApplicantProfile(profile); }
    catch (error) { console.error('Error:', error); }
  };

  const handleApplicationStatus = async (appId: string, status: string) => {
    try {
      await updateApplicationStatus(appId, status);
      toast({ title: status === 'accepted' ? "Accepted" : "Rejected", description: status === 'accepted' ? "You can now message the applicant" : "The applicant has been notified" });
      fetchData();
      setSelectedApp(null);
    } catch (error) { toast({ title: "Error", description: "Failed to update", variant: "destructive" }); }
  };

  const startChat = async (app: Application) => {
    if (!user) return;
    try { const chatId = await createChat(user.id, app.userId, app.id); navigate(`/messages?chat=${chatId}`); }
    catch (error) { toast({ title: "Error", description: "Failed to start chat", variant: "destructive" }); }
  };

  const formatDate = (ts: number) => {
    const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (!user || user.userType !== 'employer') return null;

  const pendingApps = applications.filter(a => a.status === 'pending');
  const acceptedApps = applications.filter(a => a.status === 'accepted');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome back, {user.profile?.companyName || user.name}
              </p>
            </div>
            <Button onClick={() => setShowPostModal(true)} className="gradient-secondary rounded-xl text-sm font-semibold h-11 px-6 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Post New Job
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[
              { label: "Active Jobs", value: jobs.filter(j => j.status === 'active').length, icon: <Briefcase className="h-5 w-5" />, color: "text-primary" },
              { label: "Total Applications", value: applications.length, icon: <FileText className="h-5 w-5" />, color: "text-secondary" },
              { label: "Pending Review", value: pendingApps.length, icon: <Clock className="h-5 w-5" />, color: "text-yellow-600" },
              { label: "Accepted", value: acceptedApps.length, icon: <CheckCircle className="h-5 w-5" />, color: "text-emerald-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 md:p-5">
                <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                <p className="text-2xl md:text-3xl font-extrabold tabular-nums">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
          ) : (
            <Tabs defaultValue="jobs" className="space-y-5">
              <TabsList className="bg-muted/50 p-1 rounded-xl h-11">
                <TabsTrigger value="jobs" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-lg h-9 px-5 font-semibold">
                  <Briefcase className="h-4 w-4 mr-2" /> My Jobs ({jobs.length})
                </TabsTrigger>
                <TabsTrigger value="applications" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft rounded-lg h-9 px-5 font-semibold">
                  <Users className="h-4 w-4 mr-2" /> Applications ({applications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="mt-5">
                {jobs.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">No Jobs Posted Yet</h3>
                    <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">Post your first job to start receiving applications from qualified candidates</p>
                    <Button onClick={() => setShowPostModal(true)} className="gradient-secondary text-sm rounded-xl h-10 px-5 font-semibold">
                      <Plus className="h-4 w-4 mr-2" /> Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map(job => (
                      <div key={job.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card transition-all duration-200 group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/10 transition-colors">
                              <Building2 className="h-5 w-5 text-primary group-hover:text-secondary transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm group-hover:text-secondary transition-colors truncate">{job.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                                {job.salary && <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{job.salary}</span>}
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(job.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="text-[10px] font-semibold rounded-lg px-2.5">{job.status}</Badge>
                            <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl font-medium" asChild>
                              <Link to={`/jobs/${job.id}`}><Eye className="h-3.5 w-3.5 mr-1.5" />View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="mt-5">
                {applications.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">No Applications Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">Applications will appear here once people start applying to your jobs</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                              {app.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm truncate">{app.userName}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Applied for <span className="font-medium text-foreground">{app.jobTitle}</span> · {formatDate(app.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <Badge 
                              variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} 
                              className="text-[10px] font-semibold rounded-lg px-2.5"
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => viewApplicant(app)} className="h-8 text-xs rounded-xl font-medium">
                              Review
                            </Button>
                            {app.status === 'accepted' && (
                              <Button size="sm" onClick={() => startChat(app)} className="h-8 text-xs gradient-primary rounded-xl font-medium">
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
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
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Post a New Job</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Fill in the details below to create your job listing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Job Title *</Label><Input placeholder="e.g., Delivery Driver, Cook" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className="text-sm rounded-xl h-10" /></div>
              <div className="space-y-2"><Label className="text-xs font-semibold">Company *</Label><Input placeholder="Your company name" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} className="text-sm rounded-xl h-10" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Location *</Label><Input placeholder="City, Area" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="text-sm rounded-xl h-10" /></div>
              <div className="space-y-2"><Label className="text-xs font-semibold">Salary</Label><Input placeholder="₹15,000/month" value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} className="text-sm rounded-xl h-10" /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Job Type</Label>
              <Select value={jobForm.type} onValueChange={(v) => setJobForm({ ...jobForm, type: v })}>
                <SelectTrigger className="text-sm rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Full-time', 'Part-time', 'Contract', 'Temporary', 'Daily Wage'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Description *</Label><Textarea placeholder="Describe the job responsibilities, working hours, benefits..." value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4} className="text-sm rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Requirements / Skills Needed</Label>
              <p className="text-[10px] text-muted-foreground">Add skills the ideal candidate should have — this helps our algorithm match the right people</p>
              <div className="flex gap-2">
                <Input placeholder="e.g., Driving License, Cooking" value={newRequirement} onChange={(e) => setNewRequirement(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())} className="text-sm rounded-xl h-10" />
                <Button type="button" onClick={addRequirement} size="icon" variant="secondary" className="h-10 w-10 rounded-xl"><Plus className="h-4 w-4" /></Button>
              </div>
              {jobForm.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {jobForm.requirements.map((req, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1.5 pr-1.5 rounded-lg py-1">
                      {req}<button onClick={() => setJobForm({ ...jobForm, requirements: jobForm.requirements.filter(r => r !== req) })}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={() => setShowPostModal(false)} className="flex-1 rounded-xl text-sm h-11">Cancel</Button>
            <Button onClick={handlePostJob} className="flex-1 gradient-secondary rounded-xl text-sm font-semibold h-11 shadow-sm" disabled={posting}>
              {posting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</> : 'Post Job'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Applicant Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle className="text-lg font-bold">Applicant Review</DialogTitle></DialogHeader>
          {selectedApp && applicantProfile && (
            <div className="space-y-5 py-2">
              {/* Applicant Header */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {applicantProfile.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base">{applicantProfile.name}</h3>
                  <p className="text-xs text-muted-foreground">{applicantProfile.email}</p>
                  {applicantProfile.profile?.headline && (
                    <p className="text-xs text-secondary font-medium mt-0.5">{applicantProfile.profile.headline}</p>
                  )}
                </div>
              </div>

              {/* Applied For */}
              <div className="bg-secondary/5 border border-secondary/10 p-3 rounded-xl">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Applied For</p>
                <p className="text-sm font-bold">{selectedApp.jobTitle}</p>
              </div>

              {applicantProfile.profile && (
                <div className="space-y-4">
                  {applicantProfile.profile.bio && (
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">About</p><p className="text-sm leading-relaxed">{applicantProfile.profile.bio}</p></div>
                  )}
                  {applicantProfile.profile.skills?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1.5">{applicantProfile.profile.skills.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs rounded-lg">{s}</Badge>)}</div>
                    </div>
                  )}
                  {applicantProfile.profile.experience?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Experience</p>
                      {applicantProfile.profile.experience.map((exp: any, i: number) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-xl mb-1.5">
                          <p className="text-sm font-semibold">{exp.title}</p>
                          <p className="text-xs text-muted-foreground">{exp.company} · {exp.duration}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Cover Letter</p>
                <p className="text-sm leading-relaxed">{selectedApp.coverLetter || 'No cover letter provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-xl"><p className="text-[10px] text-muted-foreground font-semibold">Expected Salary</p><p className="text-sm font-bold mt-0.5">{selectedApp.expectedSalary || 'Not specified'}</p></div>
                <div className="bg-muted/50 p-3 rounded-xl"><p className="text-[10px] text-muted-foreground font-semibold">Available From</p><p className="text-sm font-bold mt-0.5">{selectedApp.availableFrom || 'Immediate'}</p></div>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-2.5 pt-2 border-t">
                  <Button variant="outline" onClick={() => handleApplicationStatus(selectedApp.id, 'rejected')} className="flex-1 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground rounded-xl text-sm h-11 font-semibold">
                    <XCircle className="h-4 w-4 mr-1.5" />Reject
                  </Button>
                  <Button onClick={() => handleApplicationStatus(selectedApp.id, 'accepted')} className="flex-1 gradient-secondary rounded-xl text-sm h-11 font-semibold shadow-sm">
                    <CheckCircle className="h-4 w-4 mr-1.5" />Accept
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
