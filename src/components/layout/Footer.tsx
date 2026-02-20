import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="KaamNearby" className="h-9 w-auto brightness-0 invert mb-4" />
            <p className="text-primary-foreground/50 text-xs leading-relaxed max-w-[200px]">
              Connecting local talent with opportunities. Smart matching, direct communication, zero hassle.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-xs uppercase tracking-widest text-primary-foreground/70">For Job Seekers</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">Create Profile</Link></li>
              <li><Link to="/my-applications" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">My Applications</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-xs uppercase tracking-widest text-primary-foreground/70">For Employers</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">Post a Job</Link></li>
              <li><Link to="/employer/dashboard" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/messages" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">Messages</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-xs uppercase tracking-widest text-primary-foreground/70">Contact Us</h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-primary-foreground/50">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span>ayaanayaangrade5@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/50">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>+91 9723426889</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/50">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[11px] text-primary-foreground/35">
            &copy; {new Date().getFullYear()} KaamNearby. All rights reserved.
          </p>
          <p className="text-[11px] text-primary-foreground/35">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
