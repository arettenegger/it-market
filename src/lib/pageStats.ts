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

// Tages-Aufschlüsselung: pro Tag (YYYY-MM-DD, Zeitzone Wien) Gesamt + je Bereich.
export type DayEntry = { total: number; counts: Record<string, number> };
export type PageStats = {
  counts: Record<string, number>;
  total: number;
  updatedAt?: string;
  days: Record<string, DayEntry>;
};

// Tages-Schlüssel (YYYY-MM-DD) in Europe/Vienna – damit die Tagesgrenzen
// unabhängig von der Zeitzone des Besuchers einheitlich sind.
export function viennaDayKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Die letzten n Tages-Schlüssel (inkl. heute).
export function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    keys.push(viennaDayKey(new Date(now - i * 86400000)));
  }
  return keys;
}

// Aufrufe der angegebenen Tage aufsummieren (je Bereich + Gesamt).
export function aggregateDays(
  days: Record<string, DayEntry> | undefined,
  dayKeys: string[]
): { counts: Record<string, number>; total: number } {
  const counts: Record<string, number> = {};
  let total = 0;
  const wanted = new Set(dayKeys);
  for (const [day, entry] of Object.entries(days || {})) {
    if (!wanted.has(day)) continue;
    total += Number(entry?.total || 0);
    for (const [route, n] of Object.entries(entry?.counts || {})) {
      counts[route] = (counts[route] || 0) + (Number(n) || 0);
    }
  }
  return { counts, total };
}

export async function recordPageView(routeKey: string): Promise<void> {
  try {
    if (await shouldSkipTracking()) return; // eigene/Büro-Besuche nicht zählen
    const [{ db }, { doc, setDoc, increment }] = await Promise.all([
      import("./firebase"),
      import("firebase/firestore"),
    ]);
    const today = viennaDayKey();
    await setDoc(
      doc(db, "analytics", "pageviews"),
      {
        counts: { [routeKey]: increment(1) },
        total: increment(1),
        updatedAt: new Date().toISOString(),
        days: {
          [today]: {
            total: increment(1),
            counts: { [routeKey]: increment(1) },
          },
        },
      },
      { merge: true }
    );
  } catch (e) {
    // Zählen ist unkritisch – Fehler still ignorieren
  }
}

export async function fetchPageStats(): Promise<PageStats> {
  try {
    const [{ db }, { doc, getDoc }] = await Promise.all([
      import("./firebase"),
      import("firebase/firestore"),
    ]);
    const snap = await getDoc(doc(db, "analytics", "pageviews"));
    const d: any = snap.exists() ? snap.data() : {};
    return { counts: d.counts || {}, total: d.total || 0, updatedAt: d.updatedAt, days: d.days || {} };
  } catch (e) {
    return { counts: {}, total: 0, days: {} };
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
      days: {},
      resetAt: new Date().toISOString(),
    });
  } catch (e) {}
}
