import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getApplicationsByUser } from '@/lib/firebase';
import { Loader2, FileText, Building2, Clock, CheckCircle, XCircle, HourglassIcon, ArrowRight, Briefcase } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Application {
  id: string; jobId: string; jobTitle: string; coverLetter: string;
  expectedSalary: string; availableFrom: string; status: string; createdAt: number;
}

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!user) { navigate('/login'); return; } fetchApplications(); }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const apps = await getApplicationsByUser(user.id);
      setApplications(apps.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const statusConfig: Record<string, { icon: React.ReactNode; variant: "default" | "secondary" | "destructive"; label: string; bg: string }> = {
    accepted: { icon: <CheckCircle className="h-4 w-4" />, variant: 'default', label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { icon: <XCircle className="h-4 w-4" />, variant: 'destructive', label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200' },
    pending: { icon: <HourglassIcon className="h-4 w-4" />, variant: 'secondary', label: 'Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  };

  if (!user) return null;

  const pending = applications.filter(a => a.status === 'pending');
  const accepted = applications.filter(a => a.status === 'accepted');
  const rejected = applications.filter(a => a.status === 'rejected');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold">My Applications</h1>
            <p className="text-muted-foreground text-sm mt-1">Track the status of your job applications</p>
          </div>

          {/* Status Summary */}
          {applications.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Under Review", count: pending.length, color: "text-amber-600" },
                { label: "Accepted", count: accepted.length, color: "text-emerald-600" },
                { label: "Rejected", count: rejected.length, color: "text-red-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-extrabold tabular-nums ${stat.color}`}>{stat.count}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-secondary mb-3" />
              <p className="text-muted-foreground text-sm">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/80 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-1">No Applications Yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Start applying to jobs and track your progress here</p>
              <Button asChild className="gradient-secondary rounded-xl font-semibold h-11 px-6">
                <Link to="/jobs"><Briefcase className="h-4 w-4 mr-2" /> Browse Jobs</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const config = statusConfig[app.status] || statusConfig.pending;
                return (
                  <Link key={app.id} to={`/jobs/${app.jobId}`} className="block group">
                    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-elevated transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm group-hover:text-secondary transition-colors truncate">
                            {app.jobTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> Applied {formatDate(app.createdAt)}
                          </p>
                          {app.expectedSalary && (
                            <p className="text-xs text-muted-foreground mt-0.5">Expected: {app.expectedSalary}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${config.bg}`}>
                            {config.icon}
                            {config.label}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-secondary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyApplications;
