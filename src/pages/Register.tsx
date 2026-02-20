import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { createUser } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Phone, Loader2, Briefcase, UserCircle, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', userType: 'jobseeker' as 'employer' | 'jobseeker' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" }); return; }
    if (formData.password !== formData.confirmPassword) { toast({ title: "Error", description: "Passwords do not match", variant: "destructive" }); return; }
    if (formData.password.length < 6) { toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const user = await createUser({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, userType: formData.userType });
      login(user as any);
      toast({ title: "Account Created!", description: "Welcome to KaamNearby" });
      navigate('/profile');
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message || "Something went wrong", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Brand Panel (desktop only) */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-primary-foreground max-w-sm">
          <img src={logo} alt="KaamNearby" className="h-16 mx-auto mb-8 brightness-0 invert" />
          <h2 className="text-2xl font-extrabold mb-3">Join KaamNearby</h2>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            Whether you're hiring or looking for work, KaamNearby makes it simple. 
            Smart matching, direct chat, zero hassle.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-6">
            <img src={logo} alt="KaamNearby" className="h-10 mb-6 lg:hidden" />
            <h1 className="text-3xl font-extrabold">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-2">Get started with your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">I am a</Label>
              <RadioGroup value={formData.userType} onValueChange={(v) => setFormData({ ...formData, userType: v as 'employer' | 'jobseeker' })} className="grid grid-cols-2 gap-3">
                <div>
                  <RadioGroupItem value="jobseeker" id="jobseeker" className="peer sr-only" />
                  <Label htmlFor="jobseeker" className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 hover:bg-muted/50 peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 [&:has([data-state=checked])]:border-secondary [&:has([data-state=checked])]:bg-secondary/5 cursor-pointer transition-all">
                    <UserCircle className="h-6 w-6" />
                    <span className="text-xs font-bold">Job Seeker</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="employer" id="employer" className="peer sr-only" />
                  <Label htmlFor="employer" className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 hover:bg-muted/50 peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 [&:has([data-state=checked])]:border-secondary [&:has([data-state=checked])]:bg-secondary/5 cursor-pointer transition-all">
                    <Briefcase className="h-6 w-6" />
                    <span className="text-xs font-bold">Employer</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} className="pl-10 h-11 rounded-xl text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="pl-10 h-11 rounded-xl text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" placeholder="+91 1234567890" value={formData.phone} onChange={handleChange} className="pl-10 h-11 rounded-xl text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" name="password" type="password" placeholder="••••••" value={formData.password} onChange={handleChange} className="pl-10 h-11 rounded-xl text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} className="pl-10 h-11 rounded-xl text-sm" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 gradient-secondary rounded-xl font-bold text-sm shadow-sm" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
