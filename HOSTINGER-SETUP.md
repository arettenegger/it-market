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
- **Automatisches Deployment**: Jede Änderung im GitHub-Repo wird gebaut und automatisch per FTP auf
  Hostinger hochgeladen.

---

## Schritt 1 – FTP-Zugangsdaten als GitHub-Secrets hinterlegen

Damit GitHub die Seite automatisch auf Hostinger hochladen kann.

1. **FTP-Konto in Hostinger holen**: hPanel → *Dateien* → *FTP-Konten*. Dort findest/erstellst du:
   - **FTP-Hostname/IP** (z. B. `ftp.it-market.at` oder eine IP)
   - **FTP-Benutzername**
   - **FTP-Passwort**
2. **In GitHub eintragen**: Repo `arettenegger/it-market` → *Settings* → *Secrets and variables* →
   *Actions* → *New repository secret*. Lege **drei** Secrets an (Namen exakt so):
   | Secret-Name    | Wert                          |
   |----------------|-------------------------------|
   | `FTP_SERVER`   | dein FTP-Hostname/IP          |
   | `FTP_USERNAME` | dein FTP-Benutzername         |
   | `FTP_PASSWORD` | dein FTP-Passwort            |
3. **Zielordner prüfen**: Der Workflow lädt nach `/public_html/`. Falls dein Web-Root anders heißt
   (manche Hostinger-Setups: `/domains/it-market.at/public_html/`), passe `server-dir` in
   `.github/workflows/deploy.yml` an.

> Ich (Claude) trage niemals Zugangsdaten selbst ein – die Secrets kennst nur du.

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

## Schritt 3 – Firestore-Sicherheitsregeln veröffentlichen

Damit nur eingeloggte Admins Produkte ändern können (Besucher können nur lesen).

1. Firebase Console → *Firestore Database* → *Rules*.
2. Den kompletten Inhalt der Datei **`firestore.rules`** (im Repo) einfügen und **Veröffentlichen**.

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
2. `git push` auf `main` → GitHub Actions baut und lädt automatisch auf Hostinger hoch.
3. Fortschritt sichtbar unter Repo → *Actions*.

**Erster Deploy:** Läuft erst grün durch, sobald die FTP-Secrets aus Schritt 1 gesetzt sind.
Danach den Workflow unter *Actions* → *Re-run jobs* neu starten (oder einfach erneut pushen).
