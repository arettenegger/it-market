# IT-MARKET · Go-Live auf Hostinger

Diese Anleitung bringt die Website **it-market.at** live auf Hostinger.
Die Seite selbst ist fertig – es sind nur noch ein paar einmalige Einstellungen nötig.

## Wie funktioniert die Seite (Kurzüberblick)

- **Statische Website** (React/Vite) → wird zu einfachen HTML/JS/CSS-Dateien gebaut. Kein Server nötig.
- **Shop = Angebotsanfrage**: Kunden legen Produkte in den Warenkorb und fordern per Formular ein
  **unverbindliches Angebot per E-Mail** an (kein Direktkauf).
- **Bestellungen/Anfragen** kommen per **Formspree** als E-Mail an dich und erscheinen zusätzlich im Admin.
- **Produkte, Kategorien, Blog, Bewertungen** werden in **Firebase (Firestore)** gespeichert und im
  **Admin-Bereich** bearbeitet.
- **Deployment über GitHub**: GitHub Actions **baut** die Seite bei jedem Push und legt das fertige
  Ergebnis in den Branch **`hostinger`**. Hostinger ist mit genau diesem Branch verbunden und holt sich
  die fertigen Dateien automatisch.

> **Wichtig zu verstehen:** Hostingers Git-Verbindung *baut nicht selbst*. Deshalb darfst du in Hostinger
> **nicht den `main`-Branch** verbinden (der enthält nur Quellcode), sondern den **`hostinger`-Branch**
> mit dem fertigen Build. Um den kümmert sich GitHub Actions automatisch.

---

## Schritt 1 – Hostinger mit dem GitHub-Repo verbinden

1. **`hostinger`-Branch erzeugen lassen**: Er entsteht automatisch beim ersten GitHub-Actions-Lauf
   (nach einem Push auf `main`). Prüfen: Repo → *Branches* → dort sollte `hostinger` erscheinen,
   bzw. Repo → *Actions* → Lauf „Build & Publish" grün.
2. **In Hostinger verbinden**: hPanel → *Fortgeschritten* → **GIT** → *Repository erstellen*:
   - **Repository-Adresse**: `https://github.com/arettenegger/it-market.git`
   - **Branch**: **`hostinger`**  ← nicht `main`!
   - **Verzeichnis**: `public_html` (bzw. das Web-Root deiner Domain)
   - Repo ist öffentlich → kein Deploy-Key/Passwort nötig.
3. **Automatisches Deployment (empfohlen)**: In der GIT-Sektion die **Webhook-URL** kopieren und in
   GitHub eintragen: Repo → *Settings* → *Webhooks* → *Add webhook* → URL einfügen, Content-Type
   `application/json`, „Just the push event", *Active* → speichern. Danach zieht Hostinger nach jedem
   Build automatisch die neue Version. (Ohne Webhook: in hPanel manuell auf *Deploy* klicken.)

> **Falls der erste Actions-Lauf mit „permission denied"/403 fehlschlägt:** Repo → *Settings* →
> *Actions* → *General* → *Workflow permissions* → **„Read and write permissions"** aktivieren und den
> Lauf erneut starten. (Nötig, damit GitHub Actions in den `hostinger`-Branch schreiben darf.)

---

## Schritt 2 – Admin-Login einrichten (Firebase E-Mail/Passwort)

Der Admin-Bereich wird über ein Firebase-Konto geschützt.

1. **Firebase Console** öffnen: <https://console.firebase.google.com> →
   Projekt **`gen-lang-client-0171145532`** (das aktuelle Projekt der Seite).
2. *Authentication* → *Sign-in method* → **E-Mail/Passwort aktivieren**.
3. *Authentication* → *Users* → *Add user*: z. B. `doris@it-market.at` + sicheres Passwort.

> **Kein Zugriff auf dieses Firebase-Projekt?** Dann eine dieser Varianten:
> - Eigenes Firebase-Projekt (kostenlos) anlegen und die Werte in `firebase-applet-config.json` ersetzen, **oder**
> - vorerst den einfacheren **PIN-Login** im Admin nutzen (bitte die Standard-PIN „1234" sofort ändern).

---

## Schritt 3 – Sicherheitsregeln veröffentlichen (Firestore **und** Storage)

Damit nur eingeloggte Admins Daten/Bilder ändern können (Besucher können nur lesen).

1. **Firestore-Regeln**: Firebase Console → *Firestore Database* → *Rules* → kompletten Inhalt von
   **`firestore.rules`** (im Repo) einfügen → **Veröffentlichen**.
   (Enthält jetzt auch die Kunden-Collections `inquiries` und `callbacks`.)
2. **Storage aktivieren & Regeln**: Firebase Console → *Storage* → einmalig *Get started* (Bucket anlegen).
   Dann *Rules* → kompletten Inhalt von **`storage.rules`** (im Repo) einfügen → **Veröffentlichen**.
   (Bilder/Videos werden jetzt in Firebase Storage gespeichert – Upload nur für eingeloggte Admins.)

> **Wichtig – „nichts lokal / alles in der Cloud":** Produkte, Bilder, Anfragen, Rückrufe und Newsletter
> werden jetzt ausschließlich in Firebase gespeichert (kein Browser-Speicher mehr). Deshalb **muss der
> Admin sich per Firebase-Login (E-Mail/Passwort) anmelden** – nur dann funktionieren Speichern und
> Bild-Upload. Der einfache PIN-Login allein reicht dafür nicht mehr aus.

> **Wichtig – Firestore-Kontingent / eigenes Firebase-Projekt:** Das aktuell hinterlegte Projekt
> (`gen-lang-client-0171145532`) stammt aus Google AI Studio und ist auf das **kostenlose Tageslimit**
> begrenzt (aktuell durch die Entwicklung teils aufgebraucht → Besucher sehen dann vorübergehend nur den
> Standard-Katalog; das Limit setzt sich täglich zurück). **Empfehlung für den echten Betrieb:** ein
> **eigenes Firebase-Projekt** anlegen (kostenloser Spark-Tarif; bei mehr Traffic Blaze/Pay-as-you-go) und
> die Werte in `firebase-applet-config.json` ersetzen. Dann hast du volle Kontrolle über Kontingente,
> Login und Speicher.

---

## Schritt 4 – E-Mail-Empfang prüfen (Formspree)

Alle Anfragen (Angebot, Kontakt, Rückruf, Newsletter) laufen über das Formspree-Formular `mpqvkzkr`.

1. Bei <https://formspree.io> einloggen und prüfen, ob das Formular `mpqvkzkr` als Empfänger
   **doris@it-market.at** hat und **aktiv/verifiziert** ist.
2. **Gehört dir das Formular nicht?** Neues Formspree-Formular (kostenlos) unter deiner Adresse anlegen
   und die neue Formular-ID an diesen **5 Stellen** ersetzen:
   - `src/components/CartDrawer.tsx`
   - `src/components/ContactPage.tsx`
   - `src/components/CallbackModal.tsx`
   - `src/lib/newsletterService.ts` (2×)
3. Hinweis: Gratis-Tarif ≈ 50 Anfragen/Monat. Bei mehr → Formspree-Upgrade oder später auf ein
   Hostinger-PHP-Mailskript umstellen.

---

## Schritt 5 – Domain it-market.at & SSL

1. hPanel → Domain **it-market.at** mit dem Hosting verbinden (DNS/Nameserver auf Hostinger).
2. hPanel → *Sicherheit* → *SSL* → kostenloses SSL-Zertifikat aktivieren.
   **Wichtig:** Erst SSL aktivieren, dann live gehen – die Seite leitet automatisch auf `https://` um.
3. Sobald die Domain auf Hostinger zeigt und die Dateien hochgeladen sind, ist die Seite live.

---

## Admin-Bereich öffnen

Auf der Live-Seite eine dieser Möglichkeiten:
- URL: `https://it-market.at/?admin=1`  (oder `…/#admin`)
- Tastenkürzel: **Strg + Shift + A**
- Der kleine Admin-Button unten auf der Seite

Dann mit deiner **Firebase-E-Mail + Passwort** einloggen → Produkte, Preise, Blog etc. bearbeiten.
Änderungen werden in Firestore gespeichert und erscheinen nach einem Reload auf der Live-Seite.

---

## Wie künftige Änderungen live gehen

1. Änderung am Code (oder über den Admin bei reinen Inhalten).
2. `git push` auf `main` → GitHub Actions **baut** und aktualisiert den **`hostinger`-Branch**.
3. Hostinger zieht die neue Version automatisch (per Webhook) – oder du klickst in hPanel → GIT auf *Deploy*.
4. Fortschritt sichtbar unter Repo → *Actions*.

**Reihenfolge beim ersten Mal:** erst `main` pushen → warten bis der Actions-Lauf „Build & Publish" grün
ist und den `hostinger`-Branch erzeugt hat → dann Hostinger mit dem `hostinger`-Branch verbinden (Schritt 1).
