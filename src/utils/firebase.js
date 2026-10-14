import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// undefined 제거 후 저장
export async function saveProject(data) {
  const id = `project-${Date.now()}`
  const clean = JSON.parse(JSON.stringify(data)) // undefined 제거
  await setDoc(doc(db, 'projects', id), {
    ...clean,
    createdAt: new Date().toISOString(),
  })
  return id
}

// 불러오기
export async function loadProject(id) {
  const snap = await getDoc(doc(db, 'projects', id))
  if (!snap.exists()) throw new Error('프로젝트를 찾을 수 없어요')
  return snap.data()
}