import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <img src={logo} alt="KaamNearby" className="h-10 w-auto brightness-0 invert" />
            <p className="text-primary-foreground/75 text-sm leading-relaxed">
              Find your next opportunity nearby. Connect with local employers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/employer/dashboard" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/75">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>ayaanayaangrade5@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/75">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 9723426889</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/75">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} KaamNearby. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
