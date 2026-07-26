import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface NewsletterSubscriber {
  id: string; // Token
  email: string;
  status: "pending" | "confirmed";
  token: string;
  createdAt: string;
  confirmedAt?: string | null;
  source?: string;
}

const LOCAL_STORAGE_KEY = "bewacht_vernetzt_subscribers";

// Get cached subscribers from localStorage
export function getLocalSubscribers(): NewsletterSubscriber[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to parse local newsletter subscribers:", e);
    return [];
  }
}

// Save subscribers to localStorage
export function saveLocalSubscribers(subscribers: NewsletterSubscriber[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscribers));
  } catch (e) {
    console.error("Failed to save local newsletter subscribers:", e);
  }
}

// Step 1: Request Double Opt-In
export async function requestDoubleOptIn(
  email: string,
  source: string = "Website Newsletter"
): Promise<{ success: boolean; token: string; confirmUrl: string; isAlreadyConfirmed?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Check if already registered
  const existingList = getLocalSubscribers();
  const existing = existingList.find(s => s.email.toLowerCase() === cleanEmail);
  if (existing && existing.status === "confirmed") {
    return {
      success: true,
      token: existing.token,
      confirmUrl: "",
      isAlreadyConfirmed: true
    };
  }

  const token = "doi_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  const confirmUrl = `${window.location.origin}?confirm_newsletter=${token}&email=${encodeURIComponent(cleanEmail)}`;

  const subscriber: NewsletterSubscriber = {
    id: token,
    email: cleanEmail,
    status: "pending",
    token,
    createdAt: new Date().toISOString(),
    confirmedAt: null,
    source
  };

  // 1. Save to Firestore
  try {
    await setDoc(doc(db, "newsletter_subscribers", token), subscriber);
  } catch (err) {
    console.warn("Firestore save pending subscriber warning:", err);
  }

  // 2. Save to localStorage
  const updatedList = [subscriber, ...existingList.filter(s => s.email.toLowerCase() !== cleanEmail)];
  saveLocalSubscribers(updatedList);

  // 3. Send Formspree request (Double Opt-In email trigger)
  try {
    await fetch("https://formspree.io/f/mpqvkzkr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: `Double Opt-In Anmeldung: ${cleanEmail}`,
        Formular: "Newsletter Double Opt-In (Schritt 1 - Anforderung)",
        Email: cleanEmail,
        Status: "Ausstehend (Pending Double Opt-In)",
        Bestaetigungs_Link: confirmUrl,
        Token: token,
        Hinweis: "Der Kunde hat den Newsletter angefordert. Bitte senden Sie die Bestätigungs-E-Mail oder nutzen Sie die automatische Bestätigung."
      })
    });
  } catch (err) {
    console.error("Formspree DOI notification error:", err);
  }

  return { success: true, token, confirmUrl };
}

// Step 2: Confirm Double Opt-In via Token
export async function confirmDoubleOptIn(
  token: string,
  providedEmail?: string
): Promise<{ success: boolean; email: string; message: string }> {
  let subscriber: NewsletterSubscriber | null = null;

  // 1. Try fetching from Firestore
  try {
    const docRef = doc(db, "newsletter_subscribers", token);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      subscriber = docSnap.data() as NewsletterSubscriber;
    }
  } catch (err) {
    console.warn("Firestore fetch token error:", err);
  }

  // 2. Fallback to localStorage
  const localList = getLocalSubscribers();
  if (!subscriber) {
    const foundLocal = localList.find(s => s.token === token || (providedEmail && s.email.toLowerCase() === providedEmail.toLowerCase()));
    if (foundLocal) {
      subscriber = foundLocal;
    }
  }

  const confirmedEmail = subscriber?.email || providedEmail || "Abonnent";
  const now = new Date().toISOString();

  const updatedSubscriber: NewsletterSubscriber = {
    id: subscriber?.id || token,
    email: confirmedEmail,
    status: "confirmed",
    token: subscriber?.token || token,
    createdAt: subscriber?.createdAt || now,
    confirmedAt: now,
    source: subscriber?.source || "Double Opt-In Link"
  };

  // Update Firestore
  try {
    await setDoc(doc(db, "newsletter_subscribers", updatedSubscriber.id), updatedSubscriber, { merge: true });
  } catch (err) {
    console.warn("Firestore update confirmed subscriber warning:", err);
  }

  // Update Local Storage
  const filteredLocal = localList.filter(s => s.id !== updatedSubscriber.id && s.email.toLowerCase() !== confirmedEmail.toLowerCase());
  saveLocalSubscribers([updatedSubscriber, ...filteredLocal]);

  // Notify Formspree about successful confirmation
  try {
    await fetch("https://formspree.io/f/mpqvkzkr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: `Double Opt-In ERFOLGREICH BESTÄTIGT: ${confirmedEmail}`,
        Formular: "Newsletter Double Opt-In (Schritt 2 - Verifiziert)",
        Email: confirmedEmail,
        Status: "BESTÄTIGT (Confirmed)",
        Bestaetigungszeitpunkt: now,
        Token: token
      })
    });
  } catch (err) {
    console.error("Formspree confirmation notification error:", err);
  }

  return {
    success: true,
    email: confirmedEmail,
    message: "Newsletter-Anmeldung wurde erfolgreich im Double-Opt-In-Verfahren verifiziert!"
  };
}

// Fetch all subscribers (for Admin Panel)
export async function fetchAllSubscribers(): Promise<NewsletterSubscriber[]> {
  const localList = getLocalSubscribers();
  try {
    const querySnap = await getDocs(collection(db, "newsletter_subscribers"));
    const firestoreSubscribers: NewsletterSubscriber[] = [];
    querySnap.forEach(docSnap => {
      firestoreSubscribers.push(docSnap.data() as NewsletterSubscriber);
    });

    if (firestoreSubscribers.length > 0) {
      // Merge local and firestore
      const map = new Map<string, NewsletterSubscriber>();
      [...localList, ...firestoreSubscribers].forEach(sub => {
        const existing = map.get(sub.email.toLowerCase());
        if (!existing || sub.status === "confirmed") {
          map.set(sub.email.toLowerCase(), sub);
        }
      });
      const merged = Array.from(map.values());
      saveLocalSubscribers(merged);
      return merged;
    }
  } catch (err) {
    console.warn("Firestore fetch subscribers warning:", err);
  }

  return localList;
}

// Admin: Delete subscriber
export async function deleteSubscriber(idOrToken: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "newsletter_subscribers", idOrToken));
  } catch (e) {
    console.warn("Firestore delete subscriber warning:", e);
  }
  const localList = getLocalSubscribers().filter(s => s.id !== idOrToken && s.token !== idOrToken);
  saveLocalSubscribers(localList);
}

// Admin: Manually confirm subscriber
export async function manualConfirmSubscriber(idOrToken: string): Promise<void> {
  const localList = getLocalSubscribers();
  const target = localList.find(s => s.id === idOrToken || s.token === idOrToken);
  if (target) {
    target.status = "confirmed";
    target.confirmedAt = new Date().toISOString();
    try {
      await setDoc(doc(db, "newsletter_subscribers", target.id), target, { merge: true });
    } catch (e) {
      console.warn("Firestore manual confirm warning:", e);
    }
    saveLocalSubscribers([...localList]);
  }
}
