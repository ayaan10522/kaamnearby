import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, User, Briefcase, GraduationCap, Award, MapPin, Building2, Globe, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface JobseekerProfile {
  bio: string;
  headline: string;
  location: string;
  phone: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  languages: string[];
  expectedSalary: string;
  availability: string;
}

interface EmployerProfile {
  companyName: string;
  companyDescription: string;
  industry: string;
  location: string;
  website: string;
  employeeCount: string;
  foundedYear: string;
  contactEmail: string;
  contactPhone: string;
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newLang, setNewLang] = useState('');

  const [jobseekerProfile, setJobseekerProfile] = useState<JobseekerProfile>({
    bio: '',
    headline: '',
    location: '',
    phone: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    expectedSalary: '',
    availability: ''
  });

  const [employerProfile, setEmployerProfile] = useState<EmployerProfile>({
    companyName: '',
    companyDescription: '',
    industry: '',
    location: '',
    website: '',
    employeeCount: '',
    foundedYear: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.profile) {
      if (user.userType === 'employer') {
        setEmployerProfile({ ...employerProfile, ...user.profile });
      } else {
        setJobseekerProfile({ ...jobseekerProfile, ...user.profile });
      }
    }
  }, [user]);

  const handleJobseekerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobseekerProfile({ ...jobseekerProfile, [e.target.name]: e.target.value });
  };

  const handleEmployerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmployerProfile({ ...employerProfile, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (newSkill.trim() && !jobseekerProfile.skills.includes(newSkill.trim())) {
      setJobseekerProfile({ ...jobseekerProfile, skills: [...jobseekerProfile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setJobseekerProfile({ ...jobseekerProfile, skills: jobseekerProfile.skills.filter(s => s !== skill) });
  };

  const addCertification = () => {
    if (newCert.trim() && !jobseekerProfile.certifications.includes(newCert.trim())) {
      setJobseekerProfile({ ...jobseekerProfile, certifications: [...jobseekerProfile.certifications, newCert.trim()] });
      setNewCert('');
    }
  };

  const removeCertification = (cert: string) => {
    setJobseekerProfile({ ...jobseekerProfile, certifications: jobseekerProfile.certifications.filter(c => c !== cert) });
  };

  const addLanguage = () => {
    if (newLang.trim() && !jobseekerProfile.languages.includes(newLang.trim())) {
      setJobseekerProfile({ ...jobseekerProfile, languages: [...jobseekerProfile.languages, newLang.trim()] });
      setNewLang('');
    }
  };

  const removeLanguage = (lang: string) => {
    setJobseekerProfile({ ...jobseekerProfile, languages: jobseekerProfile.languages.filter(l => l !== lang) });
  };

  const addExperience = () => {
    setJobseekerProfile({
      ...jobseekerProfile,
      experience: [...jobseekerProfile.experience, { title: '', company: '', duration: '', description: '' }]
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...jobseekerProfile.experience];
    updated[index] = { ...updated[index], [field]: value };
    setJobseekerProfile({ ...jobseekerProfile, experience: updated });
  };

  const removeExperience = (index: number) => {
    setJobseekerProfile({ ...jobseekerProfile, experience: jobseekerProfile.experience.filter((_, i) => i !== index) });
  };

  const addEducation = () => {
    setJobseekerProfile({
      ...jobseekerProfile,
      education: [...jobseekerProfile.education, { degree: '', institution: '', year: '' }]
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...jobseekerProfile.education];
    updated[index] = { ...updated[index], [field]: value };
    setJobseekerProfile({ ...jobseekerProfile, education: updated });
  };

  const removeEducation = (index: number) => {
    setJobseekerProfile({ ...jobseekerProfile, education: jobseekerProfile.education.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData = user.userType === 'employer' ? employerProfile : jobseekerProfile;
      await updateUserProfile(user.id, profileData);
      updateUser({ profile: profileData });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Employer Profile Form
  if (user.userType === 'employer') {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        
        <main className="flex-1 py-6 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Company Profile</h1>
              <p className="text-muted-foreground text-sm">Tell job seekers about your company</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Info */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Your company name"
                        value={employerProfile.companyName}
                        onChange={handleEmployerChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        placeholder="e.g., Manufacturing, Retail"
                        value={employerProfile.industry}
                        onChange={handleEmployerChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">About Company</Label>
                    <Textarea
                      id="companyDescription"
                      name="companyDescription"
                      placeholder="Describe your company, what you do, and your work culture..."
                      value={employerProfile.companyDescription}
                      onChange={handleEmployerChange}
                      rows={4}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="City, State"
                          value={employerProfile.location}
                          onChange={handleEmployerChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          name="website"
                          placeholder="www.company.com"
                          value={employerProfile.website}
                          onChange={handleEmployerChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Number of Employees</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="employeeCount"
                          name="employeeCount"
                          placeholder="e.g., 10-50"
                          value={employerProfile.employeeCount}
                          onChange={handleEmployerChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        name="foundedYear"
                        placeholder="e.g., 2010"
                        value={employerProfile.foundedYear}
                        onChange={handleEmployerChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        placeholder="contact@company.com"
                        value={employerProfile.contactEmail}
                        onChange={handleEmployerChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        placeholder="+91 9876543210"
                        value={employerProfile.contactPhone}
                        onChange={handleEmployerChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg" className="gradient-primary px-8" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Jobseeker Profile Form
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-muted-foreground text-sm">Build your profile to attract employers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      name="headline"
                      placeholder="e.g., Experienced Driver | 5+ Years"
                      value={jobseekerProfile.headline}
                      onChange={handleJobseekerChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, State"
                        value={jobseekerProfile.location}
                        onChange={handleJobseekerChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Write a brief summary about yourself..."
                    value={jobseekerProfile.bio}
                    onChange={handleJobseekerChange}
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary">Expected Salary</Label>
                    <Input
                      id="expectedSalary"
                      name="expectedSalary"
                      placeholder="e.g., ₹15,000 - ₹20,000/month"
                      value={jobseekerProfile.expectedSalary}
                      onChange={handleJobseekerChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      id="availability"
                      name="availability"
                      placeholder="e.g., Immediate"
                      value={jobseekerProfile.availability}
                      onChange={handleJobseekerChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-primary" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., Driving, Cooking)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="icon" variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {jobseekerProfile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {jobseekerProfile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {jobseekerProfile.experience.map((exp, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-background">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Experience {index + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)} className="h-7 px-2 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    />
                    <Textarea
                      placeholder="Brief description..."
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addExperience} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {jobseekerProfile.education.map((edu, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-background">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Education {index + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)} className="h-7 px-2 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Input
                        placeholder="Degree/Certificate"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      />
                      <Input
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      />
                      <Input
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addEducation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            </Card>

            {/* Certifications & Languages */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add certification"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" onClick={addCertification} size="icon" variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {jobseekerProfile.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {jobseekerProfile.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="bg-secondary/10 text-secondary-foreground px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5"
                        >
                          {cert}
                          <button type="button" onClick={() => removeCertification(cert)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add language"
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    />
                    <Button type="button" onClick={addLanguage} size="icon" variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {jobseekerProfile.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {jobseekerProfile.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="bg-muted text-foreground px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5"
                        >
                          {lang}
                          <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg" className="gradient-primary px-8" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
