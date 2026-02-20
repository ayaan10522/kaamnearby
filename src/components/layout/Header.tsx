import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, MessageSquare, User, LogOut, Briefcase, FileText, Home } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => 
    `text-sm font-semibold transition-colors ${isActive(path) ? 'text-secondary' : 'text-foreground/60 hover:text-foreground'}`;

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="KaamNearby" className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className={navLinkClass('/jobs')}>Jobs</Link>
            {user && user.userType === 'employer' && (
              <Link to="/employer/dashboard" className={navLinkClass('/employer/dashboard')}>Dashboard</Link>
            )}
            {user && (
              <>
                <Link to="/messages" className={navLinkClass('/messages')}>Messages</Link>
                <Link to="/profile" className={navLinkClass('/profile')}>Profile</Link>
                {user.userType === 'jobseeker' && (
                  <Link to="/my-applications" className={navLinkClass('/my-applications')}>Applications</Link>
                )}
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs h-9 rounded-xl font-medium text-muted-foreground hover:text-destructive">
                  <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-xs h-9 rounded-xl font-semibold" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="gradient-secondary text-xs h-9 rounded-xl font-bold shadow-sm px-5" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <nav className="flex flex-col gap-1">
              <Link to="/jobs" className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${isActive('/jobs') ? 'bg-secondary/10 text-secondary' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                <Briefcase className="h-4 w-4 inline mr-2.5" />Jobs
              </Link>
              {user && user.userType === 'employer' && (
                <Link to="/employer/dashboard" className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${isActive('/employer/dashboard') ? 'bg-secondary/10 text-secondary' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                  <Home className="h-4 w-4 inline mr-2.5" />Dashboard
                </Link>
              )}
              {user && (
                <>
                  <Link to="/messages" className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${isActive('/messages') ? 'bg-secondary/10 text-secondary' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                    <MessageSquare className="h-4 w-4 inline mr-2.5" />Messages
                  </Link>
                  <Link to="/profile" className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${isActive('/profile') ? 'bg-secondary/10 text-secondary' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4 inline mr-2.5" />Profile
                  </Link>
                  {user.userType === 'jobseeker' && (
                    <Link to="/my-applications" className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${isActive('/my-applications') ? 'bg-secondary/10 text-secondary' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                      <FileText className="h-4 w-4 inline mr-2.5" />Applications
                    </Link>
                  )}
                </>
              )}
              <div className="border-t border-border/50 mt-2 pt-2">
                {user ? (
                  <button onClick={handleLogout} className="w-full px-4 py-2.5 text-sm text-left rounded-xl font-medium hover:bg-muted transition-colors text-destructive">
                    <LogOut className="h-4 w-4 inline mr-2.5" />Logout
                  </button>
                ) : (
                  <div className="flex gap-2.5 px-4">
                    <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl h-10 font-semibold" asChild>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1 gradient-secondary text-xs rounded-xl h-10 font-bold" asChild>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
