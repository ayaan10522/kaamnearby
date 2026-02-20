import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      login(user);
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      navigate(user.userType === 'employer' ? '/employer/dashboard' : '/jobs');
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid email or password", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <img src={logo} alt="KaamNearby" className="h-10 mb-6" />
            <h1 className="text-3xl font-extrabold">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl text-sm" />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 gradient-secondary rounded-xl font-bold text-sm shadow-sm" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </div>

      {/* Right: Brand Panel (desktop only) */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-primary-foreground max-w-sm">
          <img src={logo} alt="KaamNearby" className="h-16 mx-auto mb-8 brightness-0 invert" />
          <h2 className="text-2xl font-extrabold mb-3">Find Work Near You</h2>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            KaamNearby connects you with local employers using smart matching. 
            Your skills, your area, your opportunity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
