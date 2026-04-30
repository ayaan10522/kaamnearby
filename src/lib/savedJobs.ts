// Bookmark/Saved jobs (localStorage based, per-user)

const KEY = (userId: string) => `kn_saved_jobs_${userId}`;

export const getSavedJobs = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isJobSaved = (userId: string, jobId: string): boolean =>
  getSavedJobs(userId).includes(jobId);

export const toggleSavedJob = (userId: string, jobId: string): boolean => {
  const list = getSavedJobs(userId);
  const idx = list.indexOf(jobId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(jobId);
  localStorage.setItem(KEY(userId), JSON.stringify(list));
  return idx < 0; // true if now saved
};

// Recent searches
const RECENT_KEY = 'kn_recent_searches';
export const getRecentSearches = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
export const addRecentSearch = (term: string) => {
  if (!term.trim()) return;
  const list = getRecentSearches().filter((t) => t !== term);
  list.unshift(term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
};
export const clearRecentSearches = () => localStorage.removeItem(RECENT_KEY);
