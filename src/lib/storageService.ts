import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Zentrale Upload-Helfer für Firebase Storage.
 *
 * Bilder werden als echte Dateien in Firebase Storage gespeichert; in
 * Firestore / im Shop landet nur noch die zurückgegebene Download-URL.
 * Dadurch bleibt das Firestore-Dokument klein (kein Base64) und es wird
 * nichts mehr lokal im Browser gespeichert.
 */

function randomId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/**
 * Verkleinert & komprimiert ein Bild im Browser zu einem WebP-Blob
 * (Fallback JPEG). Gibt bei Vektor-/Nicht-Rasterformaten die Originaldatei
 * zurück (z. B. SVG).
 */
export async function compressImageToBlob(
  file: Blob,
  maxSize = 1000,
  quality = 0.85
): Promise<Blob> {
  // SVGs / GIFs nicht durch die Canvas jagen (würde Animation/Vektor zerstören)
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let width = img.width;
  let height = img.height;
  if (width > height) {
    if (width > maxSize) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    }
  } else {
    if (height > maxSize) {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", quality);
  });
  if (blob) return blob;

  const jpegBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", Math.min(quality, 0.82));
  });
  return jpegBlob || file;
}

/**
 * Lädt ein Bild (komprimiert) nach Firebase Storage hoch und gibt die
 * öffentliche Download-URL zurück.
 */
export async function uploadImageToStorage(
  file: File,
  folder = "uploads",
  maxSize = 1000,
  quality = 0.85
): Promise<string> {
  const blob = await compressImageToBlob(file, maxSize, quality);
  const ext =
    blob.type === "image/webp"
      ? "webp"
      : blob.type === "image/jpeg"
      ? "jpg"
      : blob.type === "image/svg+xml"
      ? "svg"
      : blob.type === "image/gif"
      ? "gif"
      : "img";
  const path = `${folder}/${randomId()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: blob.type || "image/webp" });
  return await getDownloadURL(storageRef);
}

/**
 * Lädt eine beliebige Datei (z. B. Video) unverändert nach Firebase Storage
 * hoch und gibt die Download-URL zurück.
 */
export async function uploadFileToStorage(
  file: File,
  folder = "uploads"
): Promise<string> {
  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "bin";
  const path = `${folder}/${randomId()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || undefined });
  return await getDownloadURL(storageRef);
}

/**
 * Lädt ein bereits als Base64-Data-URL vorliegendes Bild nach Firebase Storage
 * hoch und gibt die Download-URL zurück. Ist der Wert keine data:-URL (z. B.
 * schon eine http-URL oder leer), wird er unverändert zurückgegeben.
 *
 * Wird u. a. beim CSV-Import verwendet: Produkte, deren Bild als Base64 in der
 * Datei steckt, werden so nach Storage ausgelagert (nur die URL landet in
 * Firestore) – damit bleibt das Firestore-Dokument klein.
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder = "products"
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:")) return dataUrl;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const type = blob.type || "image/webp";
  const ext = type.includes("webp")
    ? "webp"
    : type.includes("png")
    ? "png"
    : type.includes("jpeg") || type.includes("jpg")
    ? "jpg"
    : type.includes("gif")
    ? "gif"
    : "img";
  const path = `${folder}/${randomId()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: type });
  return await getDownloadURL(storageRef);
}

/**
 * Kopiert ein Bild von einer beliebigen (externen) URL nach Firebase Storage,
 * komprimiert es dabei und gibt die neue Storage-URL zurück.
 *
 * Wird u. a. für Blogbilder genutzt, die von Drittanbietern (z. B. WorkRocket)
 * kommen – so werden sie unabhängig vom externen Anbieter und klein gerechnet.
 * - Leere Werte / bereits-Storage-URLs werden unverändert zurückgegeben.
 * - Base64-Data-URLs werden an uploadDataUrlToStorage weitergereicht.
 * - Schlägt der Download fehl (z. B. fehlendes CORS), wirft die Funktion –
 *   der Aufrufer soll dann die Original-URL behalten.
 */
export async function uploadImageUrlToStorage(
  url: string,
  folder = "blog",
  maxSize = 1200,
  quality = 0.82
): Promise<string> {
  if (!url) return url;
  if (url.startsWith("data:")) return uploadDataUrlToStorage(url, folder);
  if (url.includes("firebasestorage.googleapis.com")) return url;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Download fehlgeschlagen: HTTP " + res.status);
  const raw = await res.blob();
  const blob = await compressImageToBlob(raw, maxSize, quality);
  const type = blob.type || "image/webp";
  const ext = type.includes("webp")
    ? "webp"
    : type.includes("png")
    ? "png"
    : type.includes("jpeg") || type.includes("jpg")
    ? "jpg"
    : type.includes("svg")
    ? "svg"
    : type.includes("gif")
    ? "gif"
    : "img";
  const path = `${folder}/${randomId()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: type });
  return await getDownloadURL(storageRef);
}

/**
 * Löscht eine zuvor hochgeladene Datei anhand ihrer Download-URL.
 * Fehler werden geschluckt (z. B. wenn die Datei bereits weg ist oder es
 * sich um eine externe URL handelt).
 */
export async function deleteFromStorageByUrl(url: string): Promise<void> {
  if (!url || !url.includes("firebasestorage.googleapis.com")) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (e) {
    // ignorieren – nicht kritisch
  }
}
