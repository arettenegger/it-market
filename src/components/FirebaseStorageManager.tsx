import React, { useState, useEffect } from "react";
import { storage, firebaseConfig } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata, deleteObject } from "firebase/storage";
import { 
  Folder, 
  Upload, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  HardDrive, 
  RefreshCw, 
  AlertCircle,
  Sparkles,
  Link2,
  Trash2,
  Search,
  Grid,
  List,
  Info
} from "lucide-react";

interface StorageFile {
  name: string;
  path: string;
  url: string;
  size?: number;
  updatedAt?: string;
  type?: string;
}

interface FirebaseStorageManagerProps {
  onSelectUrlForLogo?: (url: string) => void;
  onSelectUrlForHeroVideo?: (url: string) => void;
  onSelectUrlForProduct?: (url: string) => void;
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "Größe n.a.";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function FirebaseStorageManager({
  onSelectUrlForLogo,
  onSelectUrlForHeroVideo,
  onSelectUrlForProduct
}: FirebaseStorageManagerProps) {
  const [folder, setFolder] = useState("uploads");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Local list of files
  const [files, setFiles] = useState<StorageFile[]>(() => {
    const saved = localStorage.getItem("bewacht_vernetzt_firebase_storage_files");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("bewacht_vernetzt_firebase_storage_files", JSON.stringify(files));
  }, [files]);

  // Load files from storage folder using Firebase Storage SDK
  const fetchStorageFiles = async () => {
    setIsLoadingFiles(true);
    setUploadError(null);
    try {
      const targetFolders = folder === "all" 
        ? ["", "uploads", "products", "hero", "logos", "blog"]
        : [folder];

      const allFetchedFiles: StorageFile[] = [];

      for (const targetPath of targetFolders) {
        try {
          const folderRef = ref(storage, targetPath);
          const res = await listAll(folderRef);

          // List direct files in folder
          const filePromises = res.items.map(async (itemRef) => {
            try {
              const url = await getDownloadURL(itemRef);
              let size: number | undefined;
              let contentType: string | undefined;
              let timeCreated: string | undefined;

              try {
                const meta = await getMetadata(itemRef);
                size = meta.size;
                contentType = meta.contentType;
                timeCreated = meta.timeCreated;
              } catch (mErr) {
                // Metadata fetch optional
              }

              return {
                name: itemRef.name,
                path: itemRef.fullPath,
                url: url,
                size: size,
                type: contentType,
                updatedAt: timeCreated
              } as StorageFile;
            } catch (e) {
              return null;
            }
          });

          const fetchedResults = await Promise.all(filePromises);
          const valid = fetchedResults.filter((f): f is StorageFile => f !== null);
          allFetchedFiles.push(...valid);

          // Also check subprefixes if any
          for (const prefixRef of res.prefixes) {
            try {
              const subRes = await listAll(prefixRef);
              const subPromises = subRes.items.map(async (itemRef) => {
                try {
                  const url = await getDownloadURL(itemRef);
                  let size: number | undefined;
                  let contentType: string | undefined;
                  let timeCreated: string | undefined;
                  try {
                    const meta = await getMetadata(itemRef);
                    size = meta.size;
                    contentType = meta.contentType;
                    timeCreated = meta.timeCreated;
                  } catch (mErr) {}

                  return {
                    name: itemRef.name,
                    path: itemRef.fullPath,
                    url: url,
                    size: size,
                    type: contentType,
                    updatedAt: timeCreated
                  } as StorageFile;
                } catch (e) { return null; }
              });
              const subFetched = await Promise.all(subPromises);
              allFetchedFiles.push(...subFetched.filter((f): f is StorageFile => f !== null));
            } catch (e) {}
          }
        } catch (e) {
          // Folder may not exist yet in Firebase Storage, which is normal
        }
      }
      
      // Merge with existing state without duplicates
      setFiles((prev) => {
        const map = new Map<string, StorageFile>();
        prev.forEach((f) => map.set(f.path, f));
        allFetchedFiles.forEach((f) => map.set(f.path, f));
        return Array.from(map.values());
      });
    } catch (err: any) {
      console.warn("Could not list Firebase Storage files:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchStorageFiles();
  }, [folder]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setLastUploadedUrl(null);

    // Create unique filename to prevent overwrites
    const sanitizeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}_${sanitizeName}`;
    const filePath = `${folder}/${filename}`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        setUploading(false);
        setUploadError(`Upload-Fehler: ${error.message || "Überprüfen Sie Ihre Firebase Storage Rules."}`);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          let size = selectedFile.size;
          let type = selectedFile.type;

          try {
            const meta = await getMetadata(uploadTask.snapshot.ref);
            size = meta.size || size;
            type = meta.contentType || type;
          } catch (mErr) {}

          const newFile: StorageFile = {
            name: selectedFile.name,
            path: filePath,
            url: downloadUrl,
            size: size,
            type: type,
            updatedAt: new Date().toISOString()
          };

          setFiles((prev) => [newFile, ...prev.filter((f) => f.path !== filePath)]);
          setLastUploadedUrl(downloadUrl);
          setUploading(false);
        } catch (err: any) {
          setUploading(false);
          setUploadError(`Fehler beim Abrufen der Download-URL: ${err.message}`);
        }
      }
    );
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDeleteFile = async (file: StorageFile) => {
    if (window.confirm(`Möchten Sie die Datei "${file.name}" wirklich aus Firebase Storage löschen?`)) {
      try {
        const fileRef = ref(storage, file.path);
        await deleteObject(fileRef);
      } catch (err: any) {
        console.warn("Löschen auf Server nicht möglich:", err?.message);
      } finally {
        setFiles((prev) => prev.filter((f) => f.path !== file.path));
      }
    }
  };

  const filteredFiles = files.filter((f) => {
    const isFolderMatch = folder === "all" || f.path.startsWith(folder + "/") || f.path === folder || f.path.startsWith(folder);
    const isSearchMatch = searchQuery === "" || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.path.toLowerCase().includes(searchQuery.toLowerCase());
    return isFolderMatch && isSearchMatch;
  });

  const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/files`;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <HardDrive className="w-48 h-48 text-[#FF5E2E]" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E2E]/10 border border-[#FF5E2E]/30 text-[#FF5E2E] text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Firebase Storage SDK
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                Aktiv Verbunden
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Firebase Storage File Browser & Manager
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Verwalten und durchsuchen Sie Ihre in der Firebase Cloud abgelegten Dateien, Bilder und Videos. Rufen Sie Dateinamen, Dateigrößen und direkte HTTPS CDN-URLs zur Nutzung im Shop ab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-gradient-to-r from-[#FF5E2E] to-amber-500 hover:from-[#ff4d17] hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#FF5E2E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Google Firebase Console</span>
            </a>
          </div>
        </div>

        {/* Bucket Info Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Storage Bucket:</span>
            <span className="text-slate-200 font-bold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
              {firebaseConfig.storageBucket || "Standard Storage Bucket"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Projekt ID:</span>
            <span className="text-slate-200 font-bold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
              {firebaseConfig.projectId}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500">Dateien gelistet:</span>
            <span className="text-cyan-400 font-bold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
              {filteredFiles.length} Objekte
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#FF5E2E]" />
              Neue Datei hochladen
            </h3>
          </div>

          {/* Folder selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Zielordner im Storage
            </label>
            <div className="relative">
              <Folder className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-[#FF5E2E] transition-all cursor-pointer font-bold"
              >
                <option value="all">📁 Alle Ordner anzeigen (Gesamter Storage)</option>
                <option value="uploads">uploads / (Allgemein)</option>
                <option value="products">products / (Produktfotos)</option>
                <option value="hero">hero / (Hintergrundvideos & Banner)</option>
                <option value="logos">logos / (Logos & Grafiken)</option>
                <option value="blog">blog / (Magazin-Bilder)</option>
              </select>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-[#FF5E2E] rounded-2xl p-6 text-center transition-all bg-slate-950/50 group relative cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#FF5E2E]/10 flex items-center justify-center text-[#FF5E2E] group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Datei auswählen oder hier ablegen
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Unterstützt Bilder (JPG, PNG, WebP), Videos (MP4, WebM) & Dokumente
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 font-bold">
                <span>Wird in Firebase hochgeladen...</span>
                <span className="text-[#FF5E2E]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5E2E] to-amber-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Notice */}
          {uploadError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-bold">Firebase Storage Hinweis</p>
                <p className="text-[11px] opacity-90 mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Success Box */}
          {lastUploadedUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Erfolgreich in Firebase hochgeladen!
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={lastUploadedUrl}
                  className="bg-transparent text-[10px] font-mono text-slate-300 flex-1 outline-none truncate"
                />
                <button
                  onClick={() => copyToClipboard(lastUploadedUrl)}
                  className="px-2.5 py-1 bg-[#FF5E2E] hover:bg-[#ff4d17] text-white rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedUrl === lastUploadedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedUrl === lastUploadedUrl ? "Kopiert" : "URL kopieren"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Browser & List Area */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-sm font-bold text-white">Dateibrowser</span>
              <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {folder}/
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dateien filtern..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded text-xs transition-all ${
                    viewMode === "list" ? "bg-slate-800 text-white font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Listenansicht"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded text-xs transition-all ${
                    viewMode === "grid" ? "bg-slate-800 text-white font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Rasteransicht"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchStorageFiles}
                disabled={isLoadingFiles}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? "animate-spin text-cyan-400" : ""}`} />
                <span className="hidden sm:inline">Aktualisieren</span>
              </button>
            </div>
          </div>

          {/* File Content Listing */}
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl">
                <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold">Keine Dateien im Ordner "{folder}" gefunden</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Laden Sie links eine Datei hoch oder wechseln Sie den Ordner, um Firebase Storage Inhalte anzuzeigen.
                </p>
              </div>
            ) : viewMode === "list" ? (
              /* LIST VIEW */
              <div className="space-y-2">
                {filteredFiles.map((file) => {
                  const isMediaVideo = file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.type?.startsWith("video/");
                  const isMediaImage = file.name.endsWith(".jpg") || file.name.endsWith(".png") || file.name.endsWith(".webp") || file.type?.startsWith("image/");

                  return (
                    <div
                      key={file.path}
                      className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      {/* Media Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {isMediaImage ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          ) : isMediaVideo ? (
                            <Film className="w-5 h-5 text-amber-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-slate-200 truncate max-w-xs" title={file.name}>
                              {file.name}
                            </p>
                            {/* FILE SIZE DISPLAY */}
                            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                              {formatBytes(file.size)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                            {file.path}
                          </p>
                        </div>
                      </div>

                      {/* Direct URL & Quick Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                          title="Vorschau im Browser öffnen"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {copiedUrl === file.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUrl === file.url ? "Kopiert" : "URL Kopieren"}</span>
                        </button>

                        {/* Direct application placement buttons */}
                        {onSelectUrlForLogo && (
                          <button
                            onClick={() => onSelectUrlForLogo(file.url)}
                            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Als Logo
                          </button>
                        )}

                        {onSelectUrlForHeroVideo && isMediaVideo && (
                          <button
                            onClick={() => onSelectUrlForHeroVideo(file.url)}
                            className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Als Hero Video
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                          title="Aus Storage löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredFiles.map((file) => {
                  const isMediaVideo = file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.type?.startsWith("video/");
                  const isMediaImage = file.name.endsWith(".jpg") || file.name.endsWith(".png") || file.name.endsWith(".webp") || file.type?.startsWith("image/");

                  return (
                    <div
                      key={file.path}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-3 group hover:border-slate-700 transition-all"
                    >
                      <div className="aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden relative">
                        {isMediaImage ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : isMediaVideo ? (
                          <Film className="w-8 h-8 text-amber-400" />
                        ) : (
                          <FileText className="w-8 h-8 text-cyan-400" />
                        )}
                        <span className="absolute bottom-1 right-1 bg-slate-950/90 text-cyan-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-800">
                          {formatBytes(file.size)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {file.path}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 pt-1 border-t border-slate-900">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          {copiedUrl === file.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUrl === file.url ? "Kopiert" : "URL"}</span>
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[11px]"
                          title="Öffnen"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

