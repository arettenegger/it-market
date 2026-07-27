// Einfacher, cookieloser eigener Seitenzähler (aggregiert & anonym).
// Zählt pro Bereich/URL die Aufrufe hoch – ohne Cookies, ohne personenbezogene
// Daten – daher DSGVO-unkritisch und unabhängig vom Cookie-Consent.
// Firebase wird dynamisch geladen (nicht im kritischen Startpfad).

export async function recordPageView(routeKey: string): Promise<void> {
  try {
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
