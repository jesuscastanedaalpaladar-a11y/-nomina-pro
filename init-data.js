// Script para inicializar datos en Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBKwJeYdmymvuAqTuVTE8_Mlc0D18bDC_8",
  authDomain: "nomina-pro.firebaseapp.com",
  projectId: "nomina-pro",
  storageBucket: "nomina-pro.firebasestorage.app",
  messagingSenderId: "542069260503",
  appId: "1:542069260503:web:2044f09f09966ec1493092"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos iniciales
const initialData = {
  users: [
    {
      name: "Admin Nómina",
      email: "admin@nomina.pro",
      role: "super_admin",
      avatarUrl: "https://picsum.photos/seed/admin/200",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  branches: [
    { name: "Corporativo CDMX", code: "CDMX-CORP" },
    { name: "Sucursal Monterrey", code: "MTY-NORTE" },
    { name: "Sucursal Guadalajara", code: "GDL-OCC" }
  ]
};

async function initData() {
  try {
    console.log("Inicializando datos...");
    
    // Agregar usuarios
    for (const user of initialData.users) {
      await addDoc(collection(db, 'users'), user);
      console.log("Usuario agregado:", user.name);
    }
    
    // Agregar sucursales
    for (const branch of initialData.branches) {
      await addDoc(collection(db, 'branches'), branch);
      console.log("Sucursal agregada:", branch.name);
    }
    
    console.log("✅ Datos inicializados correctamente");
  } catch (error) {
    console.error("❌ Error inicializando datos:", error);
  }
}

initData();


