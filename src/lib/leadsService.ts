import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

/**
 * Kundendaten (Angebotsanfragen & Rückruf-Wünsche) werden ausschließlich in
 * Firestore gespeichert – nichts landet mehr im Browser (localStorage).
 * So sieht die Inhaberin alle Anfragen geräteübergreifend im Admin-Bereich.
 */

// ---------------- Angebotsanfragen (inquiries) ----------------

export async function saveInquiry(inquiry: Record<string, any>): Promise<string> {
  const ref = await addDoc(collection(db, "inquiries"), {
    ...inquiry,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function fetchInquiries(): Promise<any[]> {
  const snap = await getDocs(
    query(collection(db, "inquiries"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function deleteInquiry(id: string): Promise<void> {
  await deleteDoc(doc(db, "inquiries", id));
}

// ---------------- Rückruf-Wünsche (callbacks) ----------------

export async function saveCallback(callback: Record<string, any>): Promise<string> {
  const ref = await addDoc(collection(db, "callbacks"), {
    ...callback,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function fetchCallbacks(): Promise<any[]> {
  const snap = await getDocs(
    query(collection(db, "callbacks"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function updateCallbackStatus(
  id: string,
  status: string
): Promise<void> {
  await updateDoc(doc(db, "callbacks", id), { status });
}

export async function deleteCallback(id: string): Promise<void> {
  await deleteDoc(doc(db, "callbacks", id));
}
