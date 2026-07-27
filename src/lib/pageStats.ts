// Einfacher, cookieloser eigener Seitenzähler (aggregiert & anonym).
// Zählt pro Bereich/URL die Aufrufe hoch – ohne Cookies, ohne personenbezogene
// Daten – daher DSGVO-unkritisch und unabhängig vom Cookie-Consent.
// Firebase wird dynamisch geladen (nicht im kritischen Startpfad).

// IP-Adressen, deren Aufrufe NICHT gezählt werden (eigene/Büro-Besuche).
// Die statische Büro-IP von IT-Service Rettenegger – weitere per Komma ergänzbar.
const EXCLUDED_IPS = ["81.189.181.80"];

// Entscheidung (zählen / nicht zählen) einmal pro Besuch ermitteln und cachen,
// damit die IP-Abfrage nicht bei jedem Seitenwechsel erneut passiert.
let skipDecision: Promise<boolean> | null = null;

async function shouldSkipTracking(): Promise<boolean> {
  // Innerhalb desselben Tabs bereits entschieden?
  try {
    const cached = sessionStorage.getItem("pv_skip");
    if (cached === "1") return true;
    if (cached === "0") return false;
  } catch {
    /* sessionStorage evtl. blockiert – ignorieren */
  }

  if (!skipDecision) {
    skipDecision = (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        // Nur IPv4 abfragen; die eigene öffentliche IP wird ausschließlich
        // lokal verglichen und nirgends gespeichert.
        const res = await fetch("https://api4.ipify.org?format=json", {
          signal: controller.signal,
        });
        clearTimeout(timer);
        const data = await res.json();
        const ip = String(data?.ip || "").trim();
        const skip = EXCLUDED_IPS.includes(ip);
        try {
          sessionStorage.setItem("pv_skip", skip ? "1" : "0");
        } catch {
          /* ignorieren */
        }
        return skip;
      } catch {
        // Bei Fehler/Timeout im Zweifel normal zählen (kein Datenverlust).
        return false;
      }
    })();
  }
  return skipDecision;
}

export async function recordPageView(routeKey: string): Promise<void> {
  try {
    if (await shouldSkipTracking()) return; // eigene/Büro-Besuche nicht zählen
    const [{ db }, { doc, setDoc, increment }] = await Promise.all([
      import("./firebase"),
      import("firebase/firestore"),
    ]);
    await setDoc(
      doc(db, "analytics", "pageviews"),
      {
        counts: { [routeKey]: increment(1) },
        total: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    // Zählen ist unkritisch – Fehler still ignorieren
  }
}

export async function fetchPageStats(): Promise<{ counts: Record<string, number>; total: number; updatedAt?: string }> {
  try {
    const [{ db }, { doc, getDoc }] = await Promise.all([
      import("./firebase"),
      import("firebase/firestore"),
    ]);
    const snap = await getDoc(doc(db, "analytics", "pageviews"));
    const d: any = snap.exists() ? snap.data() : {};
    return { counts: d.counts || {}, total: d.total || 0, updatedAt: d.updatedAt };
  } catch (e) {
    return { counts: {}, total: 0 };
  }
}

export async function resetPageStats(): Promise<void> {
  try {
    const [{ db }, { doc, setDoc }] = await Promise.all([
      import("./firebase"),
      import("firebase/firestore"),
    ]);
    await setDoc(doc(db, "analytics", "pageviews"), {
      counts: {},
      total: 0,
      resetAt: new Date().toISOString(),
    });
  } catch (e) {}
}
