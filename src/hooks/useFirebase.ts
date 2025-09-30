import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { userService } from '../firebase/services';
import { User } from '../../types';

export const useFirebase = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Get user data from Firestore
        try {
          const users = await userService.getUsers();
          const userData = users.find(u => u.email === user.email);
          setAppUser(userData || null);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    firebaseUser,
    appUser,
    loading,
    isAuthenticated: !!firebaseUser && !!appUser
  };
};
