import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth } from './config';
import { User, Employee, Branch, Incident, BonusTemplate } from '../../types';

// Authentication Services
export const authService = {
  async signUp(email: string, password: string, userData: Omit<User, 'id'>) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user data to Firestore
    const userDoc = await addDoc(collection(db, 'users'), {
      ...userData,
      firebaseUid: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { user, userDoc };
  },

  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async signOut() {
    await signOut(auth);
  },

  async getCurrentUser(): Promise<FirebaseUser | null> {
    return auth.currentUser;
  }
};

// User Management Services
export const userService = {
  async getUsers(): Promise<User[]> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  },

  async getUserById(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  },

  async createUser(userData: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
  },

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(doc(db, 'users', id));
  }
};

// Employee Management Services
export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    return employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Employee[];
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const employeeDoc = await getDoc(doc(db, 'employees', id));
    if (employeeDoc.exists()) {
      return { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
    }
    return null;
  },

  async createEmployee(employeeData: Omit<Employee, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'employees'), {
      ...employeeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateEmployee(id: string, employeeData: Partial<Employee>): Promise<void> {
    const employeeRef = doc(db, 'employees', id);
    await updateDoc(employeeRef, {
      ...employeeData,
      updatedAt: Timestamp.now()
    });
  },

  async deleteEmployee(id: string): Promise<void> {
    await deleteDoc(doc(db, 'employees', id));
  }
};

// Branch Management Services
export const branchService = {
  async getBranches(): Promise<Branch[]> {
    const branchesSnapshot = await getDocs(collection(db, 'branches'));
    return branchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Branch[];
  },

  async createBranch(branchData: Omit<Branch, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'branches'), {
      ...branchData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }
};

// Incident Management Services
export const incidentService = {
  async getIncidents(): Promise<Incident[]> {
    const incidentsSnapshot = await getDocs(collection(db, 'incidents'));
    return incidentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Incident[];
  },

  async createIncident(incidentData: Omit<Incident, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }
};

// Bonus Template Services
export const bonusTemplateService = {
  async getBonusTemplates(): Promise<BonusTemplate[]> {
    const templatesSnapshot = await getDocs(collection(db, 'bonusTemplates'));
    return templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BonusTemplate[];
  },

  async createBonusTemplate(templateData: Omit<BonusTemplate, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'bonusTemplates'), {
      ...templateData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }
};
