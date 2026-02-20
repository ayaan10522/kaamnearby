// Smart Job Feed Algorithm
// Scores jobs based on how well they match a jobseeker's profile

interface UserProfile {
  skills?: string[];
  location?: string;
  expectedSalary?: string;
  headline?: string;
  experience?: { title: string; company: string; duration: string; description: string }[];
  languages?: string[];
}

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  requirements: string[];
  employerId: string;
  createdAt: number;
  status: string;
}

interface ScoredJob extends Job {
  matchScore: number;
  matchReasons: string[];
}

// Normalize text for comparison
const normalize = (text: string) => text.toLowerCase().trim();

// Calculate similarity between two strings (fuzzy)
const fuzzyMatch = (a: string, b: string): number => {
  const aNorm = normalize(a);
  const bNorm = normalize(b);
  if (aNorm === bNorm) return 1;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.8;
  // Word-level overlap
  const aWords = aNorm.split(/\s+/);
  const bWords = bNorm.split(/\s+/);
  const overlap = aWords.filter(w => bWords.some(bw => bw.includes(w) || w.includes(bw))).length;
  return overlap / Math.max(aWords.length, bWords.length);
};

// Parse salary range to get midpoint number
const parseSalary = (salary: string): number => {
  if (!salary) return 0;
  const numbers = salary.match(/[\d,]+/g);
  if (!numbers) return 0;
  const parsed = numbers.map(n => parseInt(n.replace(/,/g, '')));
  return parsed.reduce((a, b) => a + b, 0) / parsed.length;
};

export const rankJobsForUser = (jobs: Job[], userProfile: UserProfile | null): ScoredJob[] => {
  if (!userProfile) {
    // No profile - sort by recency only
    return jobs
      .map(job => ({ ...job, matchScore: 0, matchReasons: [] }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  const scoredJobs: ScoredJob[] = jobs.map(job => {
    let score = 0;
    const reasons: string[] = [];

    // 1. SKILL MATCH (0-40 points) — Highest weight
    if (userProfile.skills?.length && job.requirements?.length) {
      let skillMatches = 0;
      for (const skill of userProfile.skills) {
        for (const req of job.requirements) {
          if (fuzzyMatch(skill, req) >= 0.6) {
            skillMatches++;
            break;
          }
        }
      }
      // Also check against title and description
      for (const skill of userProfile.skills) {
        if (fuzzyMatch(skill, job.title) >= 0.5) {
          skillMatches += 0.5;
        }
        if (normalize(job.description).includes(normalize(skill))) {
          skillMatches += 0.3;
        }
      }
      const skillScore = Math.min((skillMatches / Math.max(job.requirements.length, 1)) * 40, 40);
      score += skillScore;
      if (skillScore >= 15) reasons.push('Skills match');
    }

    // 2. LOCATION MATCH (0-25 points)
    if (userProfile.location && job.location) {
      const locMatch = fuzzyMatch(userProfile.location, job.location);
      const locScore = locMatch * 25;
      score += locScore;
      if (locScore >= 10) reasons.push('Near you');
    }

    // 3. HEADLINE/TITLE RELEVANCE (0-20 points)
    if (userProfile.headline) {
      const headlineMatch = fuzzyMatch(userProfile.headline, job.title);
      const descMatch = fuzzyMatch(userProfile.headline, job.description.substring(0, 200));
      const relevanceScore = Math.max(headlineMatch, descMatch) * 20;
      score += relevanceScore;
      if (relevanceScore >= 8) reasons.push('Matches your profile');
    }

    // 4. EXPERIENCE RELEVANCE (0-10 points)
    if (userProfile.experience?.length) {
      let expScore = 0;
      for (const exp of userProfile.experience) {
        const titleMatch = fuzzyMatch(exp.title, job.title);
        if (titleMatch >= 0.5) expScore = Math.max(expScore, titleMatch * 10);
        const descMatch = fuzzyMatch(exp.title, job.description.substring(0, 200));
        if (descMatch >= 0.3) expScore = Math.max(expScore, descMatch * 8);
      }
      score += expScore;
      if (expScore >= 4) reasons.push('Related experience');
    }

    // 5. SALARY ALIGNMENT (0-5 points)
    if (userProfile.expectedSalary && job.salary) {
      const userSal = parseSalary(userProfile.expectedSalary);
      const jobSal = parseSalary(job.salary);
      if (userSal > 0 && jobSal > 0) {
        const ratio = Math.min(userSal, jobSal) / Math.max(userSal, jobSal);
        const salScore = ratio * 5;
        score += salScore;
        if (salScore >= 3) reasons.push('Salary match');
      }
    }

    // 6. RECENCY BONUS (0-5 points) — Fresh jobs get a small boost
    const daysSincePosted = (Date.now() - job.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSincePosted < 1) score += 5;
    else if (daysSincePosted < 3) score += 3;
    else if (daysSincePosted < 7) score += 1;

    return { ...job, matchScore: Math.round(score), matchReasons: reasons };
  });

  // Sort: highest score first, then by recency for same scores
  return scoredJobs.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.createdAt - a.createdAt;
  });
};
