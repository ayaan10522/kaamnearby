import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, get, update, onValue, query, orderByChild, equalTo, child } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5bHaN2VjB9HurLgexTDDkR2inKQjYyQw",
  authDomain: "project-1586620449518527571.firebaseapp.com",
  databaseURL: "https://project-1586620449518527571-default-rtdb.firebaseio.com",
  projectId: "project-1586620449518527571",
  storageBucket: "project-1586620449518527571.firebasestorage.app",
  messagingSenderId: "108934293167",
  appId: "1:108934293167:web:6e53a1b4375050d6bd565a",
  measurementId: "G-4PSEQX2MTC"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Database helper functions
export const dbRef = (path: string) => ref(database, path);

// User functions
export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  userType: 'employer' | 'jobseeker';
  phone?: string;
}) => {
  const usersRef = ref(database, 'users');
  const newUserRef = push(usersRef);
  const userId = newUserRef.key;
  
  await set(newUserRef, {
    ...userData,
    id: userId,
    createdAt: Date.now(),
    profile: null
  });
  
  return { id: userId, ...userData };
};

export const loginUser = async (email: string, password: string) => {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    const users = snapshot.val();
    for (const userId in users) {
      if (users[userId].email === email && users[userId].password === password) {
        return { id: userId, ...users[userId] };
      }
    }
  }
  
  throw new Error('Invalid email or password');
};

export const getUserById = async (userId: string) => {
  const userRef = ref(database, `users/${userId}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  
  return null;
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const userRef = ref(database, `users/${userId}`);
  await update(userRef, { profile: profileData });
};

// Job functions
export const createJob = async (jobData: {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  requirements: string[];
  employerId: string;
}) => {
  const jobsRef = ref(database, 'jobs');
  const newJobRef = push(jobsRef);
  const jobId = newJobRef.key;
  
  await set(newJobRef, {
    ...jobData,
    id: jobId,
    createdAt: Date.now(),
    status: 'active'
  });
  
  return { id: jobId, ...jobData };
};

export const getJobs = async () => {
  const jobsRef = ref(database, 'jobs');
  const snapshot = await get(jobsRef);
  
  if (snapshot.exists()) {
    const jobs = snapshot.val();
    return Object.keys(jobs).map(key => ({ id: key, ...jobs[key] }));
  }
  
  return [];
};

export const getJobById = async (jobId: string) => {
  const jobRef = ref(database, `jobs/${jobId}`);
  const snapshot = await get(jobRef);
  
  if (snapshot.exists()) {
    return { id: jobId, ...snapshot.val() };
  }
  
  return null;
};

export const getJobsByEmployer = async (employerId: string) => {
  const jobsRef = ref(database, 'jobs');
  const snapshot = await get(jobsRef);
  
  if (snapshot.exists()) {
    const jobs = snapshot.val();
    return Object.keys(jobs)
      .filter(key => jobs[key].employerId === employerId)
      .map(key => ({ id: key, ...jobs[key] }));
  }
  
  return [];
};

// Get all users
export const getUsers = async () => {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    const users = snapshot.val();
    return Object.keys(users).map(key => ({ id: key, ...users[key] }));
  }
  
  return [];
};

// Application functions
export const createApplication = async (applicationData: {
  jobId: string;
  jobTitle: string;
  userId: string;
  userName: string;
  coverLetter: string;
  expectedSalary: string;
  availableFrom: string;
  employerId: string;
}) => {
  const applicationsRef = ref(database, 'applications');
  const newAppRef = push(applicationsRef);
  const appId = newAppRef.key;
  
  await set(newAppRef, {
    ...applicationData,
    id: appId,
    createdAt: Date.now(),
    status: 'pending'
  });
  
  return { id: appId, ...applicationData };
};

export const getApplicationsByJob = async (jobId: string) => {
  const appsRef = ref(database, 'applications');
  const snapshot = await get(appsRef);
  
  if (snapshot.exists()) {
    const apps = snapshot.val();
    return Object.keys(apps)
      .filter(key => apps[key].jobId === jobId)
      .map(key => ({ id: key, ...apps[key] }));
  }
  
  return [];
};

export const getApplicationsByUser = async (userId: string) => {
  const appsRef = ref(database, 'applications');
  const snapshot = await get(appsRef);
  
  if (snapshot.exists()) {
    const apps = snapshot.val();
    return Object.keys(apps)
      .filter(key => apps[key].userId === userId)
      .map(key => ({ id: key, ...apps[key] }));
  }
  
  return [];
};

export const getApplicationsByEmployer = async (employerId: string) => {
  const appsRef = ref(database, 'applications');
  const snapshot = await get(appsRef);
  
  if (snapshot.exists()) {
    const apps = snapshot.val();
    return Object.keys(apps)
      .filter(key => apps[key].employerId === employerId)
      .map(key => ({ id: key, ...apps[key] }));
  }
  
  return [];
};

export const updateApplicationStatus = async (appId: string, status: string) => {
  const appRef = ref(database, `applications/${appId}`);
  await update(appRef, { status });
};

// Get all applications
export const getApplications = async () => {
  const appsRef = ref(database, 'applications');
  const snapshot = await get(appsRef);
  
  if (snapshot.exists()) {
    const apps = snapshot.val();
    return Object.keys(apps).map(key => ({ id: key, ...apps[key] }));
  }
  
  return [];
};

// Chat functions
export const createChat = async (user1Id: string, user2Id: string, applicationId: string) => {
  const chatsRef = ref(database, 'chats');
  const chatId = [user1Id, user2Id].sort().join('_') + '_' + applicationId;
  const chatRef = ref(database, `chats/${chatId}`);
  
  const snapshot = await get(chatRef);
  if (!snapshot.exists()) {
    await set(chatRef, {
      id: chatId,
      participants: [user1Id, user2Id],
      applicationId,
      createdAt: Date.now(),
      messages: []
    });
  }
  
  return chatId;
};

export const sendMessage = async (chatId: string, senderId: string, senderName: string, message: string) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);
  
  await set(newMessageRef, {
    id: newMessageRef.key,
    senderId,
    senderName,
    message,
    timestamp: Date.now()
  });
};

export const getChatMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messages = snapshot.val();
      callback(Object.values(messages));
    } else {
      callback([]);
    }
  });
};

export const getUserChats = async (userId: string) => {
  const chatsRef = ref(database, 'chats');
  const snapshot = await get(chatsRef);
  
  if (snapshot.exists()) {
    const chats = snapshot.val();
    return Object.keys(chats)
      .filter(key => chats[key].participants?.includes(userId))
      .map(key => ({ id: key, ...chats[key] }));
  }
  
  return [];
};
