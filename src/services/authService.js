import { 
  db, 
  isFirebaseConfigured,
  setFirebaseConfigured
} from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where 
} from "firebase/firestore";

// Helper utilities for secure UTF-8 Base64 encoding/decoding
const b64Encode = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

const b64Decode = (str) => {
  try {
    return decodeURIComponent(atob(str).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return atob(str);
  }
};

// Generate custom JWT token
const generateJWT = (payload) => {
  const header = b64Encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64Encode(JSON.stringify(payload));
  const signature = b64Encode("paytrack-secret-key");
  return `${header}.${body}.${signature}`;
};

// Decode custom JWT token
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(b64Decode(parts[1]));
  } catch (e) {
    return null;
  }
};

const JWT_TOKEN_KEY = "paytrack_jwt_token";
const MOCK_USERS_KEY = "paytrack_mock_users";

const getMockUsers = () => JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "[]");
const saveMockUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

const mockCallbacks = [];

export const authService = {
  // Register a new user using local JWT and direct collection save
  register: async (email, password, name, mobile) => {
    const normalizedEmail = email.toLowerCase();
    
    if (isFirebaseConfigured) {
      const usersColl = collection(db, "users");
      const q = query(usersColl, where("email", "==", normalizedEmail));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        throw new Error("Email already registered");
      }
      
      const uid = "user_" + Math.random().toString(36).substr(2, 9);
      const userData = {
        uid,
        name,
        mobile,
        email: normalizedEmail,
        password, // Saved directly to Firestore in JWT flow
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", uid), userData);
      
      const { password: _, ...payload } = userData;
      const token = generateJWT(payload);
      localStorage.setItem(JWT_TOKEN_KEY, token);
      
      mockCallbacks.forEach(cb => cb(payload));
      return payload;
    } else {
      const users = getMockUsers();
      if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
        throw new Error("Email already registered");
      }
      
      const newUser = {
        uid: "mock_uid_" + Math.random().toString(36).substr(2, 9),
        name,
        mobile,
        email: normalizedEmail,
        password,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      saveMockUsers(users);
      
      const { password: _, ...payload } = newUser;
      const token = generateJWT(payload);
      localStorage.setItem(JWT_TOKEN_KEY, token);
      
      mockCallbacks.forEach(cb => cb(payload));
      return payload;
    }
  },

  // Login user using custom verification and JWT signature
  login: async (email, password, rememberMe) => {
    const normalizedEmail = email.toLowerCase();
    
    if (isFirebaseConfigured) {
      const usersColl = collection(db, "users");
      const q = query(usersColl, where("email", "==", normalizedEmail));
      const querySnap = await getDocs(q);
      
      if (querySnap.empty) {
        throw new Error("Invalid email or password");
      }
      
      const userData = querySnap.docs[0].data();
      if (userData.password !== password) {
        throw new Error("Invalid email or password");
      }
      
      const { password: _, ...payload } = userData;
      const token = generateJWT(payload);
      localStorage.setItem(JWT_TOKEN_KEY, token);
      
      mockCallbacks.forEach(cb => cb(payload));
      return payload;
    } else {
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
      
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      const { password: _, ...payload } = user;
      const token = generateJWT(payload);
      localStorage.setItem(JWT_TOKEN_KEY, token);
      
      mockCallbacks.forEach(cb => cb(payload));
      return payload;
    }
  },

  // Logout user and clear JWT token
  logout: async () => {
    localStorage.removeItem(JWT_TOKEN_KEY);
    mockCallbacks.forEach(cb => cb(null));
  },

  // Reset password (DB search fallback)
  forgotPassword: async (email) => {
    const normalizedEmail = email.toLowerCase();
    
    if (isFirebaseConfigured) {
      const usersColl = collection(db, "users");
      const q = query(usersColl, where("email", "==", normalizedEmail));
      const querySnap = await getDocs(q);
      if (querySnap.empty) {
        throw new Error("Email not found");
      }
      console.log(`Password reset link requested for ${normalizedEmail}`);
    } else {
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        throw new Error("Email not found");
      }
      console.log(`Password reset link sent to ${normalizedEmail} (Mock)`);
    }
  },

  // Update profile data in DB and local JWT
  updateProfile: async (uid, data) => {
    if (isFirebaseConfigured) {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, data);
      
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const { password: _, ...payload } = userData;
      
      const token = generateJWT(payload);
      localStorage.setItem(JWT_TOKEN_KEY, token);
      
      mockCallbacks.forEach(cb => cb(payload));
      return payload;
    } else {
      const users = getMockUsers();
      const userIdx = users.findIndex(u => u.uid === uid);
      
      if (userIdx === -1) {
        throw new Error("User not found");
      }
      
      users[userIdx] = { ...users[userIdx], ...data };
      saveMockUsers(users);
      
      const { password: _, ...payload } = users[userIdx];
      const token = generateJWT(payload);
      localStorage.setItem(JWT_TOKEN_KEY, token);
      
      mockCallbacks.forEach(cb => cb(payload));
      return payload;
    }
  },

  // Update password in DB
  updatePassword: async (newPassword) => {
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    const currentUser = decodeJWT(token);
    if (!currentUser) {
      throw new Error("No user currently logged in");
    }
    
    if (isFirebaseConfigured) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { password: newPassword });
    } else {
      const users = getMockUsers();
      const userIdx = users.findIndex(u => u.uid === currentUser.uid);
      if (userIdx !== -1) {
        users[userIdx].password = newPassword;
        saveMockUsers(users);
      }
    }
  },

  // Subscribe to JWT state observer
  onAuthStateChanged: (callback) => {
    mockCallbacks.push(callback);
    
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    const currentUser = decodeJWT(token);
    
    if (currentUser) {
      callback(currentUser);
    } else {
      callback(null);
    }
    
    return () => {
      const index = mockCallbacks.indexOf(callback);
      if (index !== -1) {
        mockCallbacks.splice(index, 1);
      }
    };
  }
};
