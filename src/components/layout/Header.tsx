import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, MessageSquare, User, LogOut, Briefcase, FileText } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link 
        to="/jobs" 
        className="text-foreground/80 hover:text-primary transition-colors font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Find Jobs
      </Link>
      {user && user.userType === 'employer' && (
        <Link 
          to="/employer/dashboard" 
          className="text-foreground/80 hover:text-primary transition-colors font-medium"
          onClick={() => setMobileMenuOpen(false)}
        >
          Post Jobs
        </Link>
      )}
      {user && (
        <>
          <Link 
            to="/messages" 
            className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
          <Link 
            to="/profile" 
            className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          {user.userType === 'jobseeker' && (
            <Link 
              to="/my-applications" 
              className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              My Applications
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="KaamNearby" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Hi, <span className="font-semibold text-foreground">{user.name}</span>
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" className="gradient-primary" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-4">
              <NavLinks />
              {user ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Logged in as <span className="font-semibold text-foreground">{user.name}</span>
                  </span>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button variant="ghost" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button variant="default" className="gradient-primary" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
