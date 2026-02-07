import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getApplicationsByUser } from '@/lib/firebase';
import { Loader2, FileText, Building2, MapPin, Clock, CheckCircle, XCircle, HourglassIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  coverLetter: string;
  expectedSalary: string;
  availableFrom: string;
  status: string;
  createdAt: number;
}

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const apps = await getApplicationsByUser(user.id);
      setApplications(apps.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <HourglassIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">Track the status of your job applications</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-4">Start applying to jobs to track them here</p>
                <Link
                  to="/jobs"
                  className="text-primary font-semibold hover:underline"
                >
                  Browse Jobs
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <Link to={`/jobs/${app.jobId}`} className="text-lg font-semibold hover:text-primary transition-colors">
                              {app.jobTitle}
                            </Link>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Applied {formatDate(app.createdAt)}
                              </span>
                            </div>

                            {app.coverLetter && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {app.coverLetter}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusIcon(app.status)}
                        <Badge variant={getStatusVariant(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyApplications;
