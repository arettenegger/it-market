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

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mpqvkzkr";

// Step 1: Request Double Opt-In
// Legt einen "pending"-Abonnenten in Firestore an und stößt die
// Bestätigungs-E-Mail (via Formspree) an. Kein localStorage.
export async function requestDoubleOptIn(
  email: string,
  source: string = "Website Newsletter"
): Promise<{ success: boolean; token: string; confirmUrl: string; isAlreadyConfirmed?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

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

  // In Firestore speichern
  try {
    await setDoc(doc(db, "newsletter_subscribers", token), subscriber);
  } catch (err) {
    console.warn("Firestore save pending subscriber warning:", err);
  }

  // Formspree-Benachrichtigung (Double-Opt-In-Trigger)
  try {
    await fetch(FORMSPREE_ENDPOINT, {
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

  // Aus Firestore laden
  try {
    const docRef = doc(db, "newsletter_subscribers", token);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      subscriber = docSnap.data() as NewsletterSubscriber;
    }
  } catch (err) {
    console.warn("Firestore fetch token error:", err);
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

  // In Firestore aktualisieren
  try {
    await setDoc(doc(db, "newsletter_subscribers", updatedSubscriber.id), updatedSubscriber, { merge: true });
  } catch (err) {
    console.warn("Firestore update confirmed subscriber warning:", err);
  }

  // Formspree über erfolgreiche Bestätigung informieren
  try {
    await fetch(FORMSPREE_ENDPOINT, {
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

// Alle Abonnenten laden (für das Admin-Panel; erfordert Admin-Login)
export async function fetchAllSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const querySnap = await getDocs(collection(db, "newsletter_subscribers"));
    const subscribers: NewsletterSubscriber[] = [];
    querySnap.forEach((docSnap) => {
      subscribers.push(docSnap.data() as NewsletterSubscriber);
    });
    return subscribers;
  } catch (err) {
    console.warn("Firestore fetch subscribers warning:", err);
    return [];
  }
}

// Admin: Abonnent löschen
export async function deleteSubscriber(idOrToken: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "newsletter_subscribers", idOrToken));
  } catch (e) {
    console.warn("Firestore delete subscriber warning:", e);
  }
}

// Admin: Abonnent manuell bestätigen
export async function manualConfirmSubscriber(idOrToken: string): Promise<void> {
  try {
    await setDoc(
      doc(db, "newsletter_subscribers", idOrToken),
      { status: "confirmed", confirmedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (e) {
    console.warn("Firestore manual confirm warning:", e);
  }
}
