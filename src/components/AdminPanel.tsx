import React, { useState, useEffect } from "react";
import { VideoBackground } from "./VideoBackground";
import { FirebaseStorageManager } from "./FirebaseStorageManager";
import { uploadImageToStorage, uploadFileToStorage, uploadDataUrlToStorage, uploadImageUrlToStorage } from "../lib/storageService";
import { fetchInquiries, fetchCallbacks, deleteInquiry, deleteCallback, updateCallbackStatus } from "../lib/leadsService";
import { fetchPageStats, resetPageStats } from "../lib/pageStats";
import { 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  ClipboardList, 
  PhoneCall, 
  Check, 
  X, 
  RefreshCw, 
  Sliders, 
  Search, 
  Sparkles, 
  Euro, 
  Package, 
  FolderPlus, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  Layers,
  Heart,
  Calendar,
  User,
  Mail,
  Phone,
  Tag,
  Eye,
  Upload,
  Video,
  BookOpen,
  FileText,
  FileEdit,
  Globe,
  Clock,
  CheckCircle,
  Cpu,
  HardDrive,
  Server,
  Zap,
  MessageSquare,
  Grid,
  Shield,
  Lock,
  Key,
  LogOut,
  LogIn,
  UserCheck,
  ExternalLink,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileJson,
  FileUp,
  FileDown,
  AlertCircle,
  Info,
  Cloud
} from "lucide-react";
import { auth, firebaseConfig } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  multiFactor,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  User as FirebaseUser,
  MultiFactorResolver,
  TotpSecret,
} from "firebase/auth";
import { Product, BlogPost, ConfiguratorData, ConfiguratorOption, Review, Category, PageSeo, getSpecLabels } from "../types";
import { PRODUCTS, INITIAL_BLOG_POSTS, DEFAULT_CONFIGURATOR_DATA, CATEGORIES } from "../data";
import { 
  fetchAllSubscribers, 
  deleteSubscriber, 
  manualConfirmSubscriber, 
  NewsletterSubscriber 
} from "../lib/newsletterService";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
  blogPosts: BlogPost[];
  onUpdateBlogPosts: (updatedPosts: BlogPost[]) => void;
  reviews: Review[];
  onUpdateReviews: (updatedReviews: Review[]) => void;
  categories?: Category[];
  onUpdateCategories?: (updatedCategories: Category[]) => void;
  configuratorData?: ConfiguratorData;
  onUpdateConfiguratorData?: (updatedConfig: ConfiguratorData) => void;
  logoImage?: string;
  onUpdateLogoImage?: (url: string) => void;
  pageSeo?: Record<string, PageSeo>;
  onUpdatePageSeo?: (updated: Record<string, PageSeo>) => void;
  lastSyncedAt?: Date | null;
  onRefreshFromCloud?: () => Promise<void>;
}

export default function AdminPanel({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  blogPosts,
  onUpdateBlogPosts,
  reviews,
  onUpdateReviews,
  categories = CATEGORIES,
  onUpdateCategories,
  configuratorData,
  onUpdateConfiguratorData,
  logoImage,
  onUpdateLogoImage,
  pageSeo = {},
  onUpdatePageSeo,
  lastSyncedAt,
  onRefreshFromCloud
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"products" | "configurator" | "inquiries" | "callbacks" | "newsletter" | "analytics" | "blog" | "reviews" | "categories" | "logo" | "storage" | "seo">("products");
  const [searchQuery, setSearchQuery] = useState("");

  // --- SEO-Manager: Unterseiten-Routen + lokale Entwürfe ---
  const SEO_ROUTES: { key: string; label: string }[] = [
    { key: "/", label: "Startseite" },
    { key: "/blog", label: "Blog / Ratgeber" },
    { key: "/kategorie/kameras", label: "Kategorie: IP-Kameras" },
    { key: "/kategorie/netzwerke", label: "Kategorie: Netzwerke" },
    { key: "/kategorie/hotspot", label: "Kategorie: Hotspot" },
    { key: "/kategorie/nas", label: "Kategorie: NAS" },
    { key: "/kategorie/pc-hardware", label: "Kategorie: PC-Hardware" },
    { key: "/kategorie/smarthome", label: "Kategorie: Smart-Home" },
    { key: "/kontakt", label: "Kontakt" },
    { key: "/ueber-uns", label: "Über uns" },
    { key: "/impressum", label: "Impressum" },
    { key: "/datenschutz", label: "Datenschutz" },
  ];
  const [seoSection, setSeoSection] = useState<"pages" | "blog" | "products">("pages");
  const [seoPageDraft, setSeoPageDraft] = useState<Record<string, PageSeo>>({});
  const [seoBlogDraft, setSeoBlogDraft] = useState<BlogPost[]>([]);
  const [seoProductDraft, setSeoProductDraft] = useState<Product[]>([]);
  const [seoSavedMsg, setSeoSavedMsg] = useState<string | null>(null);

  // --- Eigener Seitenzähler ---
  const [pageStats, setPageStats] = useState<{ counts: Record<string, number>; total: number; updatedAt?: string }>({ counts: {}, total: 0 });
  const [pageStatsLoading, setPageStatsLoading] = useState(false);
  const loadPageStats = async () => {
    setPageStatsLoading(true);
    try { setPageStats(await fetchPageStats()); } catch (e) {} finally { setPageStatsLoading(false); }
  };
  useEffect(() => {
    if (activeTab === "analytics") loadPageStats();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "seo") {
      setSeoPageDraft({ ...pageSeo });
      setSeoBlogDraft(blogPosts.map((p) => ({ ...p })));
      setSeoProductDraft(products.map((p) => ({ ...p })));
      setSeoSavedMsg(null);
    }
  }, [activeTab]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Product Export / Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreviewProducts, setImportedPreviewProducts] = useState<Product[]>([]);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [isImportingToStorage, setIsImportingToStorage] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const productFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Firebase Auth & PIN Security State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [authMethod, setAuthMethod] = useState<"firebase" | "pin">("firebase");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [fbAuthLoading, setFbAuthLoading] = useState(false);
  const [fbAuthError, setFbAuthError] = useState<string | null>(null);

  // 2FA (TOTP / Authenticator-App)
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [totpUri, setTotpUri] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [enrollCode, setEnrollCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<string | null>(null);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem("bewacht_vernetzt_admin_pin") || "1234";
  });
  const [enteredPin, setEnteredPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("bewacht_vernetzt_admin_auth") === "true";
  });
  const [pinError, setPinError] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");

  const [customFirebaseJson, setCustomFirebaseJson] = useState(() => {
    return localStorage.getItem("custom_firebase_config") || "";
  });
  const [showCustomFirebase, setShowCustomFirebase] = useState(false);

  const handleSaveCustomFirebase = () => {
    try {
      let text = customFirebaseJson.trim();
      if (!text) {
        localStorage.removeItem("custom_firebase_config");
        alert("Standard Firebase-Konfiguration wiederhergestellt. Seite wird neu geladen.");
        window.location.reload();
        return;
      }
      // Remove const/let/var declarations if pasted from Firebase Console
      text = text.replace(/^(const|let|var)\s+[\w$]+\s*=\s*/, '');
      text = text.replace(/;\s*$/, '');

      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch (e1) {
        try {
          parsed = (new Function(`return (${text});`))();
        } catch (e2) {
          throw new Error("Konnte weder als JSON noch als JavaScript-Objekt geparst werden. Bitte kopieren Sie das Objekt { apiKey: '...', ... } korrekt.");
        }
      }

      if (!parsed || !parsed.apiKey || !parsed.projectId) {
        alert("Ungültige Konfiguration: apiKey und projectId werden benötigt.");
        return;
      }
      localStorage.setItem("custom_firebase_config", JSON.stringify(parsed));
      alert("Eigenes Firebase-Projekt erfolgreich gespeichert! Die Seite wird neu geladen.");
      window.location.reload();
    } catch (err: any) {
      alert("Fehler beim Parsen der Konfiguration: " + err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      try {
        setMfaEnrolled(!!user && multiFactor(user).enrolledFactors.length > 0);
      } catch (e) {
        setMfaEnrolled(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFirebaseAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbAuthError(null);
    setFbAuthLoading(true);

    try {
      // Nur Login – keine Selbst-Registrierung mehr (Sicherheit).
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      setEmailInput("");
      setPasswordInput("");
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      // 2FA erforderlich -> zur Code-Eingabe wechseln
      if (err.code === "auth/multi-factor-auth-required") {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          setMfaResolver(resolver);
          setPasswordInput("");
          setFbAuthError(null);
        } catch (e) {
          setFbAuthError("Zwei-Faktor-Anmeldung konnte nicht gestartet werden.");
        }
        setFbAuthLoading(false);
        return;
      }
      let errMsg = err?.message || "Anmeldung fehlgeschlagen.";
      if (err.code === "auth/operation-not-allowed") {
        errMsg = "OPERATION_NOT_ALLOWED";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errMsg = "Ungültige E-Mail-Adresse oder falsches Passwort.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Diese E-Mail-Adresse wird bereits verwendet.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Das Passwort muss mindestens 6 Zeichen lang sein.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Bitte eine gültige E-Mail-Adresse eingeben.";
      }
      setFbAuthError(errMsg);
    } finally {
      setFbAuthLoading(false);
    }
  };

  // 2FA: Anmeldung mit dem 6-stelligen Code abschließen
  const handleMfaSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaResolver) return;
    setFbAuthLoading(true);
    setFbAuthError(null);
    try {
      const hint = mfaResolver.hints[0];
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, mfaCode.trim());
      await mfaResolver.resolveSignIn(assertion);
      setMfaResolver(null);
      setMfaCode("");
      setEmailInput("");
    } catch (err: any) {
      console.error("MFA sign-in error:", err);
      setFbAuthError("Ungültiger Code. Bitte den aktuellen 6-stelligen Code aus deiner Authenticator-App eingeben.");
    } finally {
      setFbAuthLoading(false);
    }
  };

  // 2FA einrichten: Secret + QR-Code erzeugen
  const handleStartEnroll = async () => {
    if (!auth.currentUser) return;
    setMfaBusy(true);
    setMfaMsg(null);
    try {
      const session = await multiFactor(auth.currentUser).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      setTotpSecret(secret);
      const uri = secret.generateQrCodeUrl(auth.currentUser.email || "IT-MARKET Admin", "IT-MARKET");
      setTotpUri(uri);
      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(uri, { width: 210, margin: 1 });
        setQrDataUrl(dataUrl);
      } catch (qrErr) {
        console.warn("QR konnte nicht erzeugt werden, Schlüssel manuell eingeben:", qrErr);
      }
    } catch (err: any) {
      console.error("MFA enroll start error:", err);
      if (err.code === "auth/requires-recent-login") {
        setMfaMsg("Bitte kurz abmelden und wieder anmelden, dann 2FA aktivieren (Sicherheitsanforderung von Firebase).");
      } else if (err.code === "auth/operation-not-allowed" || err.code === "auth/unsupported-first-factor" || /mfa|multi|totp|identity/i.test(err?.message || "")) {
        setMfaMsg("2FA ist im Firebase-Projekt noch nicht freigeschaltet. Bitte in der Console: Authentication → auf Identity Platform upgraden und MFA (Authenticator-App/TOTP) aktivieren.");
      } else {
        setMfaMsg("2FA konnte nicht gestartet werden: " + (err?.message || "Unbekannter Fehler"));
      }
    } finally {
      setMfaBusy(false);
    }
  };

  // 2FA-Einrichtung mit Code bestätigen
  const handleFinishEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpSecret || !auth.currentUser) return;
    setMfaBusy(true);
    setMfaMsg(null);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, enrollCode.trim());
      await multiFactor(auth.currentUser).enroll(assertion, "Authenticator App");
      setTotpSecret(null);
      setTotpUri("");
      setQrDataUrl("");
      setEnrollCode("");
      setMfaEnrolled(true);
      setMfaMsg("✅ 2-Faktor-Authentifizierung ist jetzt aktiv.");
    } catch (err: any) {
      console.error("MFA enroll finish error:", err);
      setMfaMsg("Code ungültig. Bitte den aktuellen 6-stelligen Code aus der App eingeben.");
    } finally {
      setMfaBusy(false);
    }
  };

  // 2FA deaktivieren
  const handleDisableMfa = async () => {
    if (!auth.currentUser) return;
    if (!window.confirm("2-Faktor-Authentifizierung wirklich deaktivieren?")) return;
    setMfaBusy(true);
    setMfaMsg(null);
    try {
      const factors = multiFactor(auth.currentUser).enrolledFactors;
      for (const f of factors) {
        await multiFactor(auth.currentUser).unenroll(f);
      }
      setMfaEnrolled(false);
      setMfaMsg("2FA wurde deaktiviert.");
    } catch (err: any) {
      console.error("MFA disable error:", err);
      if (err.code === "auth/requires-recent-login") {
        setMfaMsg("Bitte kurz abmelden und wieder anmelden, dann erneut versuchen.");
      } else {
        setMfaMsg("Konnte nicht deaktiviert werden: " + (err?.message || ""));
      }
    } finally {
      setMfaBusy(false);
    }
  };


  const handleFirebaseSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      sessionStorage.removeItem("bewacht_vernetzt_admin_auth");
    } catch (err) {
      console.error("SignOut Error:", err);
    }
  };

  const handleLoginWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEntered = enteredPin.trim();
    const cleanTargetPin = (adminPin || "1234").trim();

    if (cleanEntered.length > 0 && cleanEntered === cleanTargetPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem("bewacht_vernetzt_admin_auth", "true");
      setPinError(false);
      setEnteredPin("");
    } else {
      setPinError(true);
      setEnteredPin("");
    }
  };

  const handleLogoutAdmin = () => {
    handleFirebaseSignOut();
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length >= 4) {
      setAdminPin(newPinInput.trim());
      localStorage.setItem("bewacht_vernetzt_admin_pin", newPinInput.trim());
      setNewPinInput("");
      alert(`Admin PIN erfolgreich aktualisiert! Ihr neuer PIN lautet: ${newPinInput.trim()}`);
    } else {
      alert("Der PIN muss mindestens 4 Zeichen lang sein.");
    }
  };

  // Logo management state
  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoImage || "");
  useEffect(() => {
    setCurrentLogoUrl(logoImage || "");
  }, [logoImage]);

  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToStorage(file, "logos", 500, 0.9);
      setCurrentLogoUrl(url);
    } catch (err) {
      console.error("Logo-Upload fehlgeschlagen:", err);
      alert("Logo-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    }
  };

  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateLogoImage) {
      onUpdateLogoImage(currentLogoUrl);
    }
  };

  // Categories management state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [catName, setCatName] = useState("");
  const [catTagline, setCatTagline] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catIconName, setCatIconName] = useState("Shield");

  const handleNewCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatTagline("");
    setCatDesc("");
    setCatImage("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop");
    setCatIconName("Shield");
    setIsAddingCategory(true);
  };

  const handleAddNewCategoryInline = () => {
    const name = prompt("Name der neuen Produktgruppe (z.B. Access Points, Alarmanlagen, Wärmepumpen):");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setFormCategory(trimmed);
      return;
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      tagline: "Neue Produktgruppe",
      description: "Individuelle Produktgruppe für professionelle Lösungen",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920",
      iconName: "Shield"
    };
    const updatedCategories = [...categories, newCat];
    if (onUpdateCategories) {
      onUpdateCategories(updatedCategories);
    }
    setFormCategory(trimmed);
  };

  const handleEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatTagline(c.tagline);
    setCatDesc(c.description);
    setCatImage(c.image);
    setCatIconName(c.iconName || "Shield");
    setIsAddingCategory(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catDesc.trim()) return;

    const updatedCat: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: catName,
      tagline: catTagline,
      description: catDesc,
      image: catImage || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop",
      iconName: catIconName
    };

    let updated: Category[];
    if (editingCategory) {
      updated = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    } else {
      updated = [...categories, updatedCat];
    }
    if (onUpdateCategories) {
      onUpdateCategories(updated);
    }
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    if (onUpdateCategories) {
      onUpdateCategories(updated);
    }
  };

  const compressAndSetImage = async (file: File, callback: (result: string) => void) => {
    try {
      const url = await uploadImageToStorage(file, "images", 1400, 0.85);
      callback(url);
    } catch (err) {
      console.error("Bild-Upload fehlgeschlagen:", err);
      alert("Bild-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    }
  };

  const handleUploadCategoryImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => setCatImage(result));
    }
  };

  // Reviews management state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [revName, setRevName] = useState("");
  const [revRole, setRevRole] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revAvatar, setRevAvatar] = useState("");
  const [revDate, setRevDate] = useState("");

  const handleNewReview = () => {
    setEditingReview(null);
    setRevName("");
    setRevRole("");
    setRevRating(5);
    setRevComment("");
    setRevAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop");
    setRevDate(new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }));
    setIsAddingReview(true);
  };

  const handleEditReview = (r: Review) => {
    setEditingReview(r);
    setRevName(r.name);
    setRevRole(r.role);
    setRevRating(r.rating);
    setRevComment(r.comment);
    setRevAvatar(r.avatar);
    setRevDate(r.date);
    setIsAddingReview(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;

    const newRev: Review = {
      id: editingReview ? editingReview.id : `rev-${Date.now()}`,
      name: revName,
      role: revRole || "Kunde",
      rating: Number(revRating),
      comment: revComment,
      avatar: revAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
      date: revDate || new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })
    };

    let updated: Review[];
    if (editingReview) {
      updated = reviews.map(r => r.id === newRev.id ? newRev : r);
    } else {
      updated = [newRev, ...reviews];
    }
    onUpdateReviews(updated);
    setIsAddingReview(false);
    setEditingReview(null);
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    onUpdateReviews(updated);
  };

  const handleUploadReviewAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToStorage(file, "avatars", 300, 0.85);
      setRevAvatar(url);
    } catch (err) {
      console.error("Avatar-Upload fehlgeschlagen:", err);
      alert("Avatar-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    }
  };

  // Configurator management state
  const [localConfig, setLocalConfig] = useState<ConfiguratorData>(configuratorData || DEFAULT_CONFIGURATOR_DATA);
  const [configSection, setConfigSection] = useState<"cpuOptions" | "gpuOptions" | "ramOptions" | "ssdOptions" | "networkOptions" | "chassisOptions" | "serviceOptions">("cpuOptions");
  const [editingOption, setEditingOption] = useState<{ section: string; option: ConfiguratorOption } | null>(null);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [optName, setOptName] = useState("");
  const [optPrice, setOptPrice] = useState(0);
  const [optSpec, setOptSpec] = useState("");
  const [optRecommended, setOptRecommended] = useState(false);

  useEffect(() => {
    if (configuratorData) {
      setLocalConfig(configuratorData);
    }
  }, [configuratorData]);

  const handleSaveOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optName.trim()) return;

    const newOpt: ConfiguratorOption = {
      id: editingOption ? editingOption.option.id : `${configSection}-${Date.now()}`,
      name: optName,
      price: Number(optPrice),
      spec: optSpec,
      recommended: optRecommended
    };

    const currentList = (localConfig[configSection] as ConfiguratorOption[]) || [];
    let updatedList: ConfiguratorOption[];

    if (editingOption) {
      updatedList = currentList.map(o => o.id === newOpt.id ? newOpt : o);
    } else {
      updatedList = [...currentList, newOpt];
    }

    const updatedConfig = {
      ...localConfig,
      [configSection]: updatedList
    };

    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) {
      onUpdateConfiguratorData(updatedConfig);
    }

    setEditingOption(null);
    setIsAddingOption(false);
    setOptName("");
    setOptPrice(0);
    setOptSpec("");
    setOptRecommended(false);
  };

  const handleDeleteOption = (section: keyof ConfiguratorData, id: string) => {
    if (section === "baseBoardPrice") return;
    const currentList = (localConfig[section] as ConfiguratorOption[]) || [];
    const updatedList = currentList.filter(o => o.id !== id);
    const updatedConfig = {
      ...localConfig,
      [section]: updatedList
    };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) {
      onUpdateConfiguratorData(updatedConfig);
    }
  };

  const handleUpdateBaseBoardPrice = (newPrice: number) => {
    const updatedConfig = {
      ...localConfig,
      baseBoardPrice: newPrice
    };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) {
      onUpdateConfiguratorData(updatedConfig);
    }
  };

  const handleUpdateNetzwerkeBannerImage = (url: string) => {
    const updatedConfig = {
      ...localConfig,
      netzwerkeBannerImage: url
    };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) {
      onUpdateConfiguratorData(updatedConfig);
    }
  };

  const handleUploadNetzwerkeBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => handleUpdateNetzwerkeBannerImage(result));
    }
  };

  const handleUpdateHotspotBannerImage = (url: string) => {
    const updatedConfig = { ...localConfig, hotspotBannerImage: url };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) onUpdateConfiguratorData(updatedConfig);
  };
  const handleUploadHotspotBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => handleUpdateHotspotBannerImage(result));
    }
  };

  const handleUpdateNasBannerImage = (url: string) => {
    const updatedConfig = { ...localConfig, nasBannerImage: url };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) onUpdateConfiguratorData(updatedConfig);
  };
  const handleUploadNasBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => handleUpdateNasBannerImage(result));
    }
  };

  const handleUpdateCamerasBannerImage = (url: string) => {
    const updatedConfig = { ...localConfig, camerasBannerImage: url };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) onUpdateConfiguratorData(updatedConfig);
  };
  const handleUploadCamerasBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => handleUpdateCamerasBannerImage(result));
    }
  };

  const handleUpdateHardwareBannerImage = (url: string) => {
    const updatedConfig = { ...localConfig, hardwareBannerImage: url };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) onUpdateConfiguratorData(updatedConfig);
  };
  const handleUploadHardwareBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => handleUpdateHardwareBannerImage(result));
    }
  };

  const handleUpdateSmartHomeBannerImage = (url: string) => {
    const updatedConfig = { ...localConfig, smartHomeBannerImage: url };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) onUpdateConfiguratorData(updatedConfig);
  };
  const handleUploadSmartHomeBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, (result) => handleUpdateSmartHomeBannerImage(result));
    }
  };

  const handleUpdateSmartHomeBannerVideo = (url: string) => {
    const updatedConfig = { ...localConfig, smartHomeBannerVideo: url };
    setLocalConfig(updatedConfig);
    if (onUpdateConfiguratorData) onUpdateConfiguratorData(updatedConfig);
  };
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const handleUploadSmartHomeVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("Die Videodatei ist größer als 50 MB. Bitte eine kleinere MP4-Datei verwenden oder eine direkte MP4-Video-URL einfügen.");
      return;
    }
    setIsUploadingVideo(true);
    try {
      const url = await uploadFileToStorage(file, "videos");
      handleUpdateSmartHomeBannerVideo(url);
    } catch (err) {
      console.error("Video-Upload fehlgeschlagen:", err);
      alert("Video-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    } finally {
      setIsUploadingVideo(false);
    }
  };
  
  // Local states for forms
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("IP-Kameras");
  const [formPrice, setFormPrice] = useState(199);
  const [formOldPrice, setFormOldPrice] = useState(249);
  const [formDescription, setFormDescription] = useState("");
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formInStock, setFormInStock] = useState(true);
  const [formShippingStatus, setFormShippingStatus] = useState("5-7 Werktage");
  const [formColors, setFormColors] = useState<string[]>(["Polar Weiß", "Space Grau"]);
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Specifications
  const [specResolution, setSpecResolution] = useState("3840 x 2160 (8 Megapixel)");
  const [specViewAngle, setSpecViewAngle] = useState("105° Horizontal");
  const [specNightVision, setSpecNightVision] = useState("Farb-Nachtsicht bis 30m");
  const [specStorage, setSpecStorage] = useState("MicroSD (bis 256GB) / NVR");
  const [specPower, setSpecPower] = useState("Power over Ethernet (PoE)");

  // Blog Management State
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [deletingBlogPost, setDeletingBlogPost] = useState<BlogPost | null>(null);
  const [isAddingNewBlog, setIsAddingNewBlog] = useState(false);
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("Alle");

  // Blog Form States
  const getTodayFormattedDate = () => {
    const now = new Date();
    return `${now.getDate()}. ${["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][now.getMonth()]} ${now.getFullYear()}`;
  };

  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Technik-Guides");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [blogExcerpt, setBlogExcerpt] = useState("");

  // Available categories calculated dynamically
  const availableCategories = Array.from(
    new Set([
      "Technik-Guides",
      "Sicherheitstipps",
      "Rechtliches",
      "Smart Home",
      ...blogPosts.map((p) => p.category).filter(Boolean),
    ])
  );
  const [blogContent, setBlogContent] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("Andreas Rettenegger (Technik & Sales)");
  const [blogDate, setBlogDate] = useState(getTodayFormattedDate());
  const [blogReadTime, setBlogReadTime] = useState("5 min Lesezeit");
  const [blogTags, setBlogTags] = useState("Überwachung, Kamera, Sicherheit");
  const [blogImage, setBlogImage] = useState("");
  const [blogIsPublished, setBlogIsPublished] = useState(true);
  const [blogIsFeatured, setBlogIsFeatured] = useState(false);
  const [isUploadingBlogImage, setIsUploadingBlogImage] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // WordRocket Quick Import State
  const [isWordRocketImportOpen, setIsWordRocketImportOpen] = useState(false);
  const [wordRocketInput, setWordRocketInput] = useState("");

  const handleImportFromWordRocket = (rawText: string) => {
    if (!rawText.trim()) return;

    // Try parsing JSON if exported from WordRocket / webhook as JSON
    try {
      const json = JSON.parse(rawText);
      if (json.title || json.headline) setBlogTitle(json.title || json.headline);
      if (json.excerpt || json.description || json.summary) setBlogExcerpt(json.excerpt || json.description || json.summary);
      if (json.content || json.body || json.markdown) setBlogContent(json.content || json.body || json.markdown);
      if (json.image || json.coverImage || json.imageUrl) setBlogImage(json.image || json.coverImage || json.imageUrl);
      if (json.category) {
        setBlogCategory(json.category);
        if (!["Technik-Guides", "Sicherheitstipps", "Rechtliches", "Smart Home"].includes(json.category)) {
          setIsCustomCategory(true);
        } else {
          setIsCustomCategory(false);
        }
      }
      if (json.author) setBlogAuthor(json.author);
      if (json.date || json.publishedAt || json.published_at || json.created_at) setBlogDate(json.date || json.publishedAt || json.published_at || json.created_at);
      if (json.keywords || json.tags) {
        const kw = json.keywords || json.tags;
        setBlogTags(Array.isArray(kw) ? kw.join(", ") : kw);
      }
      setIsWordRocketImportOpen(false);
      setWordRocketInput("");
      alert("WordRocket Artikel (JSON) erfolgreich in den Editor übernommen!");
      return;
    } catch (e) {
      // Parse Markdown / Text
    }

    const lines = rawText.split("\n");
    let title = "";
    let imageUrl = "";
    let contentLines: string[] = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!title && trimmed.startsWith("# ")) {
        title = trimmed.replace(/^#\s+/, "");
        continue;
      }
      const imgMatch = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
      if (!imageUrl && imgMatch) {
        imageUrl = imgMatch[1];
      }
      if (!imageUrl && (trimmed.startsWith("http://") || trimmed.startsWith("https://")) && (trimmed.endsWith(".jpg") || trimmed.endsWith(".png") || trimmed.endsWith(".webp") || trimmed.includes("unsplash") || trimmed.includes("firebasestorage"))) {
        imageUrl = trimmed;
      }
      contentLines.push(line);
    }

    const cleanContent = contentLines.join("\n").trim();
    if (title) setBlogTitle(title);
    if (imageUrl) setBlogImage(imageUrl);
    
    if (cleanContent) {
      setBlogContent(cleanContent);
      const firstPara = contentLines.find(l => l.trim().length > 25 && !l.trim().startsWith("#"));
      if (firstPara) {
        setBlogExcerpt(firstPara.trim().substring(0, 175) + "...");
      }
    }

    setIsWordRocketImportOpen(false);
    setWordRocketInput("");
    alert("WordRocket Markdown-Inhalt wurde erfolgreich geparst!");
  };

  // Inbound log lists fetched from localStorage
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [callbacks, setCallbacks] = useState<any[]>([]);

  useEffect(() => {
    // Anfragen & Rückrufe live aus Firestore laden (cloud-only, kein localStorage)
    const loadLogs = async () => {
      try {
        const [inq, cbs] = await Promise.all([fetchInquiries(), fetchCallbacks()]);
        setInquiries(inq);
        setCallbacks(cbs);
      } catch (e) {
        console.error("Anfragen/Rückrufe konnten nicht geladen werden:", e);
      }
    };

    if (isOpen) {
      loadLogs();
      loadSubscribers();
    }
  }, [isOpen]);

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  const loadSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const subs = await fetchAllSubscribers();
      setSubscribers(subs);
    } catch (e) {
      console.error(e);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const handleConfirmSubscriber = async (id: string) => {
    await manualConfirmSubscriber(id);
    await loadSubscribers();
  };

  const handleDeleteSub = async (id: string) => {
    await deleteSubscriber(id);
    await loadSubscribers();
  };

  // Handle Edit click
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddingNew(false);
    
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormOldPrice(product.oldPrice || product.price + 50);
    setFormDescription(product.description);
    setFormIsBestseller(!!product.isBestseller);
    setFormInStock(product.inStock);
    setFormShippingStatus(product.shippingStatus || "5-7 Werktage");
    setFormColors(product.colors);
    setFormFeatures(product.features);
    setFormImage(product.image);
    
    setSpecResolution(product.specs.resolution);
    setSpecViewAngle(product.specs.viewAngle);
    setSpecNightVision(product.specs.nightVision);
    setSpecStorage(product.specs.storage);
    setSpecPower(product.specs.power);
  };

  // Handle click to create a new empty form
  const handleStartAdd = () => {
    setEditingProduct(null);
    setIsAddingNew(true);
    
    setFormName("");
    setFormCategory("IP-Kameras");
    setFormPrice(150);
    setFormOldPrice(199);
    setFormDescription("");
    setFormIsBestseller(false);
    setFormInStock(true);
    setFormShippingStatus("5-7 Werktage");
    setFormColors(["Polar Weiß", "Space Grau"]);
    setFormFeatures([
      "Smart-AI Objekterkennung",
      "Wetterfestes IP67-Gehäuse",
      "Deutsche Steuerungs-App"
    ]);
    setFormImage("");
    
    setSpecResolution("2560 x 1440 (4 Megapixel)");
    setSpecViewAngle("110° Horizontal");
    setSpecNightVision("Smart IR-Sicht bis 25m");
    setSpecStorage("MicroSD & FTP-Backup");
    setSpecPower("PoE (802.3af)");
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFormFeatures([...formFeatures, newFeatureText.trim()]);
      setNewFeatureText("");
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== idx));
  };

  const handleToggleColor = (colorName: string) => {
    if (formColors.includes(colorName)) {
      if (formColors.length > 1) {
        setFormColors(formColors.filter(c => c !== colorName));
      }
    } else {
      setFormColors([...formColors, colorName]);
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // Produktbilder als echte Datei nach Firebase Storage; gespeichert wird nur die URL.
      const url = await uploadImageToStorage(file, "products", 800, 0.85);
      setFormImage(url);
    } catch (err) {
      console.error("Produktbild-Upload fehlgeschlagen:", err);
      alert("Produktbild-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save changes
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    if (!trimmedName) {
      alert("Bitte geben Sie einen Produktnamen ein.");
      return;
    }

    const categoryToSave = (!formCategory || formCategory === "__new__") ? "IP-Kameras" : formCategory.trim();
    const sanitizedPrice = isNaN(Number(formPrice)) ? 0 : Number(formPrice);
    const sanitizedOldPrice = isNaN(Number(formOldPrice)) ? sanitizedPrice : Number(formOldPrice);

    if (isAddingNew) {
      // Create new with robust unique ID
      const baseId = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const newId = baseId ? `prod-${Date.now()}-${baseId}` : `prod-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        name: trimmedName,
        category: categoryToSave,
        description: formDescription ? formDescription.trim() : "Professionelle Lösung von Bewacht & Vernetzt.",
        price: sanitizedPrice,
        oldPrice: sanitizedOldPrice,
        rating: 5.0,
        reviewsCount: 1,
        image: formImage ? formImage.trim() : (categoryToSave === "IP-Kameras" ? "bullet" : categoryToSave === "Smart Home" ? "smarthome" : categoryToSave === "NAS-Systeme" ? "nas" : "netzwerk"),
        features: Array.isArray(formFeatures) && formFeatures.length > 0 ? formFeatures : ["Smart AI-Erkennung", "Wetterfest IP67"],
        isBestseller: Boolean(formIsBestseller),
        discount: sanitizedOldPrice > sanitizedPrice && sanitizedOldPrice > 0 ? `-${Math.round((1 - sanitizedPrice / sanitizedOldPrice) * 100)}%` : "0%",
        inStock: Boolean(formInStock),
        shippingStatus: formShippingStatus || "5-7 Werktage",
        colors: Array.isArray(formColors) && formColors.length > 0 ? formColors : ["Polar Weiß", "Space Grau"],
        specs: {
          resolution: specResolution || "4K Ultra HD",
          viewAngle: specViewAngle || "110° Wide Angle",
          nightVision: specNightVision || "25m Smart IR",
          storage: specStorage || "MicroSD & Cloud",
          power: specPower || "PoE / Netzteil"
        }
      };

      const updated = [newProduct, ...products];
      onUpdateProducts(updated);
      setIsAddingNew(false);
      setEditingProduct(newProduct);
    } else if (editingProduct) {
      // Edit existing
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: trimmedName,
            category: categoryToSave,
            description: formDescription ? formDescription.trim() : p.description,
            price: sanitizedPrice,
            oldPrice: sanitizedOldPrice,
            image: formImage ? formImage.trim() : p.image,
            features: formFeatures,
            isBestseller: Boolean(formIsBestseller),
            inStock: Boolean(formInStock),
            shippingStatus: formShippingStatus || p.shippingStatus,
            colors: formColors,
            discount: sanitizedOldPrice > sanitizedPrice && sanitizedOldPrice > 0 ? `-${Math.round((1 - sanitizedPrice / sanitizedOldPrice) * 100)}%` : "0%",
            specs: {
              resolution: specResolution || p.specs?.resolution || "4K Ultra HD",
              viewAngle: specViewAngle || p.specs?.viewAngle || "110° Wide Angle",
              nightVision: specNightVision || p.specs?.nightVision || "25m Smart IR",
              storage: specStorage || p.specs?.storage || "MicroSD & Cloud",
              power: specPower || p.specs?.power || "PoE / Netzteil"
            }
          };
        }
        return p;
      });
      onUpdateProducts(updated);
      setEditingProduct(null);
      setIsAddingNew(false);
    }
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    onUpdateProducts(updated);
    if (editingProduct?.id === productId) {
      setEditingProduct(null);
    }
  };

  // Reset to initial master PRODUCTS list
  const handleResetToDefaults = () => {
    if (window.confirm("Möchten Sie den Produktkatalog wirklich auf die Standardeinstellungen zurücksetzen?")) {
      onUpdateProducts(PRODUCTS);
      setEditingProduct(null);
      setIsAddingNew(false);
      setImportSuccessMsg("Produktkatalog auf Standardwerte zurückgesetzt.");
    }
  };

  // EXPORT PRODUCTS TO JSON FILE
  const handleExportProductsJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `produkte_export_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setImportSuccessMsg(`Export erfolgreich: ${products.length} Produkte als JSON heruntergeladen.`);
    } catch (err) {
      console.error("Export JSON error:", err);
      setImportError("Fehler beim Exportieren der JSON-Datei.");
    }
  };

  // EXPORT PRODUCTS TO CSV FILE
  const handleExportProductsCSV = () => {
    try {
      const headers = [
        "id",
        "name",
        "category",
        "price",
        "oldPrice",
        "description",
        "image",
        "video",
        "isBestseller",
        "inStock",
        "shippingStatus",
        "rating",
        "reviewsCount",
        "features",
        "resolution",
        "viewAngle",
        "nightVision",
        "storage",
        "power"
      ];

      const escapeCSV = (val: any) => {
        if (val === undefined || val === null) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = products.map((p) => {
        const featuresStr = Array.isArray(p.features) ? p.features.join(" | ") : "";
        return [
          escapeCSV(p.id),
          escapeCSV(p.name),
          escapeCSV(p.category),
          escapeCSV(p.price),
          escapeCSV(p.oldPrice || p.price),
          escapeCSV(p.description),
          escapeCSV(p.image),
          escapeCSV(p.video || ""),
          escapeCSV(p.isBestseller ? "true" : "false"),
          escapeCSV(p.inStock !== false ? "true" : "false"),
          escapeCSV(p.shippingStatus || "5-7 Werktage"),
          escapeCSV(p.rating || 5.0),
          escapeCSV(p.reviewsCount || 1),
          escapeCSV(featuresStr),
          escapeCSV(p.specs?.resolution || ""),
          escapeCSV(p.specs?.viewAngle || ""),
          escapeCSV(p.specs?.nightVision || ""),
          escapeCSV(p.specs?.storage || ""),
          escapeCSV(p.specs?.power || "")
        ].join(";"); // German Semicolon CSV format for Excel
      });

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `produkte_export_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportSuccessMsg(`Export erfolgreich: ${products.length} Produkte als CSV heruntergeladen.`);
    } catch (err) {
      console.error("Export CSV error:", err);
      setImportError("Fehler beim Exportieren der CSV-Datei.");
    }
  };

  // CSV PARSING HELPER
  const parseCSVText = (text: string): Product[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error("Die CSV-Datei enthält keine Datenzeilen.");
    }

    const headerLine = lines[0];
    const delimiter = headerLine.includes(";") ? ";" : ",";

    const splitRow = (rowStr: string) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"') {
          if (inQuotes && rowStr[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.replace(/^"|"$/g, "").trim());
    };

    const headers = splitRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
    const getIndex = (key: string) => headers.findIndex(h => h.includes(key));

    const idIdx = getIndex("id");
    const nameIdx = headers.findIndex(h => h === "name" || h === "title" || h === "produkt" || h === "produktname");
    const catIdx = getIndex("category") !== -1 ? getIndex("category") : getIndex("kategorie");
    const priceIdx = getIndex("price") !== -1 ? getIndex("price") : getIndex("preis");
    const oldPriceIdx = getIndex("oldprice") !== -1 ? getIndex("oldprice") : getIndex("alterpreis");
    const descIdx = getIndex("description") !== -1 ? getIndex("description") : getIndex("beschreibung");
    const imgIdx = getIndex("image") !== -1 ? getIndex("image") : getIndex("bild");
    const videoIdx = getIndex("video");
    const bestsellerIdx = getIndex("bestseller");
    const inStockIdx = getIndex("stock") !== -1 ? getIndex("stock") : getIndex("lager");
    const featuresIdx = getIndex("feature") !== -1 ? getIndex("feature") : getIndex("eigenschaften");

    const specResIdx = getIndex("resolution");
    const specViewIdx = getIndex("viewangle");
    const specNightIdx = getIndex("nightvision");
    const specStorageIdx = getIndex("storage");
    const specPowerIdx = getIndex("power");

    const parsedProducts: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = splitRow(lines[i]);
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const pName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Importiertes Produkt ${i}`;
      const pPrice = priceIdx !== -1 && row[priceIdx] ? parseFloat(row[priceIdx].replace(",", ".")) || 0 : 0;
      const pOldPrice = oldPriceIdx !== -1 && row[oldPriceIdx] ? parseFloat(row[oldPriceIdx].replace(",", ".")) || pPrice : pPrice;
      const pCategory = catIdx !== -1 && row[catIdx] ? row[catIdx] : "IP-Kameras";
      const pId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `prod-imp-${Date.now()}-${i}`;
      const pDesc = descIdx !== -1 && row[descIdx] ? row[descIdx] : "Professionelles System von Bewacht & Vernetzt";
      const pImg = imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : "bullet";
      const pVideo = videoIdx !== -1 && row[videoIdx] ? row[videoIdx] : undefined;
      const pBestseller = bestsellerIdx !== -1 ? (row[bestsellerIdx].toLowerCase() === "true" || row[bestsellerIdx] === "1" || row[bestsellerIdx].toLowerCase() === "ja") : false;
      const pInStock = inStockIdx !== -1 ? (row[inStockIdx].toLowerCase() !== "false" && row[inStockIdx] !== "0" && row[inStockIdx].toLowerCase() !== "nein") : true;

      const featuresRaw = featuresIdx !== -1 && row[featuresIdx] ? row[featuresIdx] : "";
      const featuresArr = featuresRaw ? featuresRaw.split("|").map(f => f.trim()).filter(Boolean) : ["Smart AI-Erkennung", "Wetterfest IP67"];

      parsedProducts.push({
        id: pId,
        name: pName,
        category: pCategory,
        price: pPrice,
        oldPrice: pOldPrice,
        description: pDesc,
        image: pImg,
        video: pVideo,
        isBestseller: pBestseller,
        inStock: pInStock,
        shippingStatus: "5-7 Werktage",
        colors: ["Polar Weiß", "Space Grau"],
        rating: 5.0,
        reviewsCount: 1,
        features: featuresArr,
        specs: {
          resolution: specResIdx !== -1 && row[specResIdx] ? row[specResIdx] : "4K Ultra HD",
          viewAngle: specViewIdx !== -1 && row[specViewIdx] ? row[specViewIdx] : "110° Wide Angle",
          nightVision: specNightIdx !== -1 && row[specNightIdx] ? row[specNightIdx] : "25m Smart IR",
          storage: specStorageIdx !== -1 && row[specStorageIdx] ? row[specStorageIdx] : "MicroSD & Cloud",
          power: specPowerIdx !== -1 && row[specPowerIdx] ? row[specPowerIdx] : "PoE / Netzteil"
        }
      });
    }

    return parsedProducts;
  };

  // HANDLE FILE SELECTION FOR IMPORT
  const handleProductFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("Die gewählte Datei ist leer.");

        let parsedList: Product[] = [];

        if (file.name.endsWith(".json") || content.trim().startsWith("[") || content.trim().startsWith("{")) {
          const rawObj = JSON.parse(content);
          const rawArr = Array.isArray(rawObj) ? rawObj : (rawObj.products && Array.isArray(rawObj.products)) ? rawObj.products : null;
          
          if (!rawArr || !Array.isArray(rawArr)) {
            throw new Error("Ungültiges JSON-Format. Es konnte kein Produkt-Array in der Datei gefunden werden.");
          }

          parsedList = rawArr.map((item: any, idx: number) => ({
            id: item.id || `prod-imp-${Date.now()}-${idx}`,
            name: item.name || item.title || `Importiertes Produkt ${idx + 1}`,
            category: item.category || "IP-Kameras",
            price: typeof item.price === "number" ? item.price : parseFloat(String(item.price || 0)) || 0,
            oldPrice: typeof item.oldPrice === "number" ? item.oldPrice : (item.price || 0),
            description: item.description || "Professionelles System",
            image: item.image || "bullet",
            video: item.video,
            isBestseller: Boolean(item.isBestseller),
            inStock: item.inStock !== false,
            shippingStatus: item.shippingStatus || "5-7 Werktage",
            colors: Array.isArray(item.colors) && item.colors.length > 0 ? item.colors : ["Polar Weiß", "Space Grau"],
            rating: item.rating || 5.0,
            reviewsCount: item.reviewsCount || 1,
            features: Array.isArray(item.features) ? item.features : ["Smart AI-Erkennung"],
            specs: item.specs || {
              resolution: "4K Ultra HD",
              viewAngle: "110° Wide Angle",
              nightVision: "25m Smart IR",
              storage: "MicroSD & Cloud",
              power: "PoE / Netzteil"
            }
          }));
        } else {
          parsedList = parseCSVText(content);
        }

        if (parsedList.length === 0) {
          throw new Error("Keine gültigen Produkte in der Datei gefunden.");
        }

        setImportedPreviewProducts(parsedList);
        setIsImportModalOpen(true);
      } catch (err: any) {
        console.error("Import error:", err);
        setImportError(err.message || "Fehler beim Verarbeiten der Datei.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // CONFIRM IMPORT
  const handleConfirmProductImport = async () => {
    if (importedPreviewProducts.length === 0) return;

    setIsImportingToStorage(true);
    try {
      // Base64-Bilder aus der CSV nach Firebase Storage auslagern (nur URL speichern),
      // damit das Firestore-Dokument klein bleibt.
      const migrated: Product[] = await Promise.all(
        importedPreviewProducts.map(async (p) => {
          if (p.image && p.image.startsWith("data:")) {
            try {
              const url = await uploadDataUrlToStorage(p.image, "products");
              return { ...p, image: url };
            } catch (err) {
              console.error("Bild-Upload beim Import fehlgeschlagen für", p.name, err);
              return p; // im Zweifel Base64 behalten, damit kein Bild verloren geht
            }
          }
          return p;
        })
      );

      let updatedList: Product[] = [];
      if (importMode === "replace") {
        updatedList = migrated;
      } else {
        // Merge mode
        const map = new Map(products.map(p => [p.id, p]));
        migrated.forEach(p => {
          map.set(p.id, p);
        });
        updatedList = Array.from(map.values());
      }

      onUpdateProducts(updatedList);
      setImportSuccessMsg(`Erfolgreich! ${migrated.length} Produkte wurden ${importMode === "replace" ? "ersetzt" : "aktualisiert / hinzugefügt"}. Bilder wurden nach Firebase Storage ausgelagert.`);
      setIsImportModalOpen(false);
      setImportedPreviewProducts([]);
    } catch (err: any) {
      console.error("Import fehlgeschlagen:", err);
      setImportError("Import fehlgeschlagen: " + (err?.message || "Unbekannter Fehler"));
    } finally {
      setIsImportingToStorage(false);
    }
  };

  // DOWNLOAD CSV SAMPLE TEMPLATE
  const handleDownloadSampleCSV = () => {
    const sampleHeaders = "id;name;category;price;oldPrice;description;image;isBestseller;inStock;features;resolution;viewAngle;nightVision";
    const sampleRow1 = "prod-sample-1;4K Dome Überwachungskamera;IP-Kameras;189.90;229.90;4K Vandalismussichere Dome-Kamera für Innen & Außen;dome;true;true;4K Ultra HD | IP67 Wetterfest | Nachtsicht 30m;4K (3840x2160);110° Weitwinkel;30m IR-Nachtsicht";
    const sampleRow2 = "prod-sample-2;16-Kanal PoE NVR Rekorder;NVR-Systeme;499.00;599.00;Zentraler Rekorder mit 4TB Überwachungs-Festplatte;nas;false;true;4TB HDD inklusive | Plug & Play PoE | Fernzugriff App;4K Decoding;Multi-View 16 Kanäle;Smart AI Playback";
    
    const content = "\uFEFF" + [sampleHeaders, sampleRow1, sampleRow2].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "muster_produkte_import.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Full Shop Export / Import State & Handlers
  const fullShopFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleExportFullShop = () => {
    const fullBackup = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      products,
      blogPosts,
      reviews,
      categories,
      configuratorData,
      logoImage
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bewacht_vernetzt_komplett_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFullShop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("Die Datei ist leer.");
        const backup = JSON.parse(content);

        if (!backup.products && !backup.blogPosts) {
          throw new Error("Ungültiges Backup-Format.");
        }

        if (backup.products && Array.isArray(backup.products)) {
          onUpdateProducts(backup.products);
        }
        if (backup.blogPosts && Array.isArray(backup.blogPosts) && onUpdateBlogPosts) {
          onUpdateBlogPosts(backup.blogPosts);
        }
        if (backup.reviews && Array.isArray(backup.reviews) && onUpdateReviews) {
          onUpdateReviews(backup.reviews);
        }
        if (backup.categories && Array.isArray(backup.categories) && onUpdateCategories) {
          onUpdateCategories(backup.categories);
        }
        if (backup.configuratorData && onUpdateConfiguratorData) {
          onUpdateConfiguratorData(backup.configuratorData);
        }
        if (backup.logoImage !== undefined && onUpdateLogoImage) {
          onUpdateLogoImage(backup.logoImage);
        }

        alert("Komplettes Shop-Backup erfolgreich importiert! Alle Daten (Produkte, Blog, Konfigurator, Kategorien) wurden aktualisiert.");
      } catch (err: any) {
        alert("Fehler beim Importieren des Backups: " + (err.message || "Unbekannter Fehler"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Start editing blog post
  const handleEditBlogPost = (post: BlogPost) => {
    setEditingBlogPost(post);
    setIsAddingNewBlog(false);
    setBlogTitle(post.title);
    setBlogCategory(post.category);
    if (!["Technik-Guides", "Sicherheitstipps", "Rechtliches", "Smart Home"].includes(post.category)) {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogAuthor(post.author);
    setBlogDate(post.date || getTodayFormattedDate());
    setBlogReadTime(post.readTime);
    setBlogTags(post.tags.join(", "));
    setBlogImage(post.image);
    setBlogIsPublished(post.isPublished);
    setBlogIsFeatured(post.featured || false);
  };

  // Start creating new blog post
  const handleNewBlogPost = () => {
    setEditingBlogPost(null);
    setIsAddingNewBlog(true);
    setBlogTitle("");
    setBlogCategory("Technik-Guides");
    setIsCustomCategory(false);
    setBlogExcerpt("");
    setBlogContent("");
    setBlogAuthor("Andreas Rettenegger (Technik & Sales)");
    setBlogDate(getTodayFormattedDate());
    setBlogReadTime("4 min Lesezeit");
    setBlogTags("Sicherheit, IP-Kameras, Netzwerke");
    setBlogImage("https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop");
    setBlogIsPublished(true);
    setBlogIsFeatured(false);
  };

  // Upload blog cover image
  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBlogImage(true);
    try {
      // Blog-Titelbild als echte Datei nach Firebase Storage; gespeichert wird nur die URL.
      const url = await uploadImageToStorage(file, "blog", 1200, 0.82);
      setBlogImage(url);
    } catch (err) {
      console.error("Blogbild-Upload fehlgeschlagen:", err);
      alert("Blogbild-Upload fehlgeschlagen. Bitte stellen Sie sicher, dass Sie als Admin eingeloggt sind, und versuchen Sie es erneut.");
    } finally {
      setIsUploadingBlogImage(false);
    }
  };

  // Save Blog Post
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      alert("Bitte geben Sie einen Titel ein.");
      return;
    }

    // Blogbild nach Firebase Storage übernehmen (falls externe URL, z. B. von
    // WorkRocket) – komprimiert und unabhängig vom Drittanbieter. Bei Fehler
    // (z. B. kein CORS) bleibt die Original-URL erhalten, kein Bild geht verloren.
    let finalImage = blogImage;
    if (blogImage && !blogImage.includes("firebasestorage.googleapis.com")) {
      setIsSavingBlog(true);
      try {
        finalImage = await uploadImageUrlToStorage(blogImage, "blog", 1200, 0.82);
      } catch (err) {
        console.warn("Blogbild konnte nicht nach Storage kopiert werden – Original-URL bleibt erhalten:", err);
        finalImage = blogImage;
      } finally {
        setIsSavingBlog(false);
      }
    }

    const tagsArray = blogTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const now = new Date();
    const formattedDate = `${now.getDate()}. ${["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][now.getMonth()]} ${now.getFullYear()}`;

    if (isAddingNewBlog) {
      const newPost: BlogPost = {
        id: "blog-" + Date.now(),
        title: blogTitle,
        slug: blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        excerpt: blogExcerpt,
        content: blogContent,
        category: blogCategory,
        author: blogAuthor,
        date: blogDate.trim() || formattedDate,
        readTime: blogReadTime,
        image: finalImage || "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop",
        tags: tagsArray,
        isPublished: blogIsPublished,
        featured: blogIsFeatured
      };
      onUpdateBlogPosts([newPost, ...blogPosts]);
    } else if (editingBlogPost) {
      const updated = blogPosts.map(post => {
        if (post.id === editingBlogPost.id) {
          return {
            ...post,
            title: blogTitle,
            category: blogCategory,
            excerpt: blogExcerpt,
            content: blogContent,
            author: blogAuthor,
            date: blogDate.trim() || post.date,
            readTime: blogReadTime,
            tags: tagsArray,
            image: finalImage || post.image,
            isPublished: blogIsPublished,
            featured: blogIsFeatured
          };
        }
        return post;
      });
      onUpdateBlogPosts(updated);
    }

    setIsAddingNewBlog(false);
    setEditingBlogPost(null);
  };

  // Toggle Publish Status
  const handleTogglePublishPost = (postId: string) => {
    const updated = blogPosts.map(p => {
      if (p.id === postId) {
        return { ...p, isPublished: !p.isPublished };
      }
      return p;
    });
    onUpdateBlogPosts(updated);
  };

  // Delete Blog Post Trigger
  const handleDeleteBlogPost = (post: BlogPost) => {
    setDeletingBlogPost(post);
  };

  // Confirm Blog Post Deletion
  const confirmDeleteBlogPost = (postId: string) => {
    const updated = blogPosts.filter(p => p.id !== postId);
    onUpdateBlogPosts(updated);
    if (editingBlogPost?.id === postId) {
      setEditingBlogPost(null);
    }
    setDeletingBlogPost(null);
  };

  // Callback resolve toggle (in Firestore)
  const handleToggleCallbackStatus = (callId: string) => {
    const target = callbacks.find(c => c.id === callId);
    if (!target) return;
    const newStatus = target.status === "Offen" ? "Erledigt" : "Offen";
    setCallbacks(callbacks.map(c => (c.id === callId ? { ...c, status: newStatus } : c)));
    updateCallbackStatus(callId, newStatus).catch(err => {
      console.error("Rückruf-Status konnte nicht gespeichert werden:", err);
    });
  };

  // Delete callback (in Firestore)
  const handleDeleteCallback = (callId: string) => {
    setCallbacks(callbacks.filter(c => c.id !== callId));
    deleteCallback(callId).catch(err => {
      console.error("Rückruf konnte nicht gelöscht werden:", err);
    });
  };

  // Delete inquiry (in Firestore)
  const handleDeleteInquiry = (inqId: string) => {
    setInquiries(inquiries.filter(i => i.id !== inqId));
    deleteInquiry(inqId).catch(err => {
      console.error("Anfrage konnte nicht gelöscht werden:", err);
    });
  };

  // Filter products by query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalInquiriesVal = inquiries.reduce((sum, item) => sum + (item.total || 0), 0);
  const openCallbacksCount = callbacks.filter(c => c.status === "Offen").length;

  // Access check
  const isAccessAllowed = firebaseUser !== null || isAuthenticated;

  if (!isOpen) return null;

  if (!isAccessAllowed) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5E2E] via-amber-500 to-cyan-500" />
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#FF5E2E]/10 border border-[#FF5E2E]/20 flex items-center justify-center text-[#FF5E2E] mx-auto mb-3 shadow-lg shadow-[#FF5E2E]/10">
              <Shield className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              Firebase Auth geschützt
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Admin-Bereich Authentifizierung</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bitte melden Sie sich an, um auf die Admin-Verwaltung zuzugreifen.
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMethod("firebase")}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "firebase" ? "bg-[#FF5E2E] text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Firebase Auth
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("pin")}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "pin" ? "bg-[#FF5E2E] text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Admin PIN
            </button>
          </div>

          {authMethod === "firebase" ? (
            <div className="space-y-4">
              <div className="text-center border-b border-slate-800 pb-2">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">{mfaResolver ? "Zwei-Faktor-Bestätigung" : "Admin-Anmeldung"}</span>
              </div>

              {mfaResolver ? (
                <form onSubmit={handleMfaSignIn} className="space-y-3.5">
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Gib den aktuellen 6-stelligen Code aus deiner Authenticator-App ein.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#FF5E2E] rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.4em] text-white outline-none transition-all"
                  />
                  {fbAuthError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">{fbAuthError}</div>
                  )}
                  <button
                    type="submit"
                    disabled={fbAuthLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#FF5E2E] to-amber-500 hover:from-[#ff4d17] hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {fbAuthLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <LogIn className="w-4 h-4" />}
                    <span>Bestätigen & anmelden</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMfaResolver(null); setMfaCode(""); setFbAuthError(null); }}
                    className="w-full text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    Abbrechen
                  </button>
                </form>
              ) : (
              <form onSubmit={handleFirebaseAuthSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    E-Mail Adresse
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="admin@ihredomaene.de"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#FF5E2E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Passwort
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#FF5E2E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none transition-all"
                    />
                  </div>
                </div>

                {fbAuthError && (
                  fbAuthError === "OPERATION_NOT_ALLOWED" ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-slate-200 text-xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-amber-300 text-xs">
                            E-Mail / Passwort in Firebase deaktiviert
                          </p>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            Aktivieren Sie die E-Mail/Passwort-Anmeldung mit 2 Klicks in Ihrer Google Firebase Console:
                          </p>
                        </div>
                      </div>

                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono">
                        <li>Auf button unten klicken (Firebase Console)</li>
                        <li>Unter <b>Sign-in method</b> auf <b>E-Mail/Passwort</b> klicken</li>
                        <li>Schalter <b>Aktivieren</b> & <b>Speichern</b></li>
                      </ol>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Firebase Console Öffnen</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => { setAuthMethod("pin"); setFbAuthError(null); }}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-xl transition-all cursor-pointer text-center"
                        >
                          Mit PIN (1234) anmelden
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold leading-relaxed">
                      {fbAuthError}
                    </div>
                  )
                )}

                <button
                  type="submit"
                  disabled={fbAuthLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#FF5E2E] to-amber-500 hover:from-[#ff4d17] hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#FF5E2E]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {fbAuthLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>Anmelden</span>
                </button>
              </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleLoginWithPin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Admin PIN / Passwort
                </label>
                <input
                  type="password"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Standard-PIN: 1234"
                  autoFocus
                  className={`w-full bg-slate-950 border ${
                    pinError ? "border-rose-500 text-rose-300" : "border-slate-800 focus:border-[#FF5E2E]"
                  } rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none transition-all shadow-inner`}
                />
                {pinError && (
                  <p className="text-[11px] text-rose-400 font-bold text-center mt-1">
                    Ungültiger PIN! Bitte überprüfen Sie Ihre Eingabe.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#FF5E2E] to-amber-500 hover:from-[#ff4d17] hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#FF5E2E]/20 transition-all cursor-pointer"
              >
                Anmelden & Admin Freischalten
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Zurück zur Hauptseite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5E2E]/10 flex items-center justify-center text-[#FF5E2E] border border-[#FF5E2E]/20">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold font-display tracking-tight text-white">Administration</span>
              <span className="bg-[#FF5E2E]/20 text-[#FF5E2E] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#FF5E2E]/20">
                Live Backend
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Verwalten Sie Produkte, Kundenanfragen und Rückrufe</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {firebaseUser && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-300 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[180px]">{firebaseUser.email || "Firebase Admin"}</span>
            </div>
          )}

          {lastSyncedAt && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zuletzt synchronisiert: {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          )}

          <button
            onClick={handleLogoutAdmin}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-500/30 cursor-pointer flex items-center gap-1.5"
            title="Abmelden & Admin-Bereich sperren"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Abmelden</span>
          </button>

          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF5E2E]" />
            Zurück zum Shop
          </button>
        </div>
      </div>

      {/* Main body with sidebar and container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Nav */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-1 hidden md:block shrink-0">
          <div className="px-3 pb-3 mb-4 border-b border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Dashboard Menü</span>
          </div>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "products" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            Produkte pflegen
            <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("configurator")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "configurator" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0 text-cyan-400" />
            PC-Konfigurator
            <span className="ml-auto bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Neu
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "inquiries" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            Angebots-Anfragen
            {inquiries.length > 0 && (
              <span className="ml-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("callbacks")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "callbacks" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            Rückrufwünsche
            {openCallbacksCount > 0 && (
              <span className="ml-auto bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {openCallbacksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("newsletter")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "newsletter" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            Newsletter (DOI)
            {subscribers.length > 0 && (
              <span className="ml-auto bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {subscribers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "analytics" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            Statistiken
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "seo"
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            SEO &amp; Meta
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "blog" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Blog & Magazin
            <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {blogPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "reviews" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0 text-amber-400" />
            Testimonials & Bewertungen
            <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {reviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "categories" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Grid className="w-4 h-4 shrink-0 text-cyan-400" />
            Startseiten-Kategorien
            <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("logo")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "logo" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            Logo & Branding
          </button>

          <button
            onClick={() => setActiveTab("storage")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === "storage" 
                ? "bg-[#FF5E2E] text-white shadow-lg shadow-[#FF5E2E]/10 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <HardDrive className="w-4 h-4 shrink-0 text-cyan-400" />
            Firebase Storage
            <span className="ml-auto bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Cloud
            </span>
          </button>


          <div className="pt-8 border-t border-slate-800 mt-8 space-y-3 px-2">
            <button
              onClick={handleResetToDefaults}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FF5E2E]" />
              Katalog zurücksetzen
            </button>
            <div className="text-[10px] text-slate-600 font-mono text-center leading-relaxed">
              Daten werden live im lokalen Browser-Speicher synchronisiert.
            </div>
          </div>
        </aside>

        {/* Mobile quick tab select */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950 border-t border-slate-800 grid grid-cols-4 p-2 z-40 text-center">
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex flex-col items-center py-2 text-[10px] font-bold ${activeTab === "products" ? "text-[#FF5E2E]" : "text-slate-400"}`}
          >
            <Database className="w-4 h-4 mb-1" />
            Produkte
          </button>
          <button 
            onClick={() => setActiveTab("inquiries")}
            className={`flex flex-col items-center py-2 text-[10px] font-bold relative ${activeTab === "inquiries" ? "text-[#FF5E2E]" : "text-slate-400"}`}
          >
            <ClipboardList className="w-4 h-4 mb-1" />
            Anfragen
            {inquiries.length > 0 && (
              <span className="absolute top-1.5 right-4 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab("callbacks")}
            className={`flex flex-col items-center py-2 text-[10px] font-bold relative ${activeTab === "callbacks" ? "text-[#FF5E2E]" : "text-slate-400"}`}
          >
            <PhoneCall className="w-4 h-4 mb-1" />
            Rückrufe
            {openCallbacksCount > 0 && (
              <span className="absolute top-1.5 right-4 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center py-2 text-[10px] font-bold ${activeTab === "analytics" ? "text-[#FF5E2E]" : "text-slate-400"}`}
          >
            <TrendingUp className="w-4 h-4 mb-1" />
            Statistik
          </button>
        </div>

        {/* Content Panel Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 bg-slate-900">
          
          {/* Mobile Top Horizontal Tab Bar (allows accessing all 13 Admin Tabs) */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800 scrollbar-none">
            {[
              { id: "products", label: "Produkte", count: products.length },
              { id: "configurator", label: "Konfigurator", badge: "Neu" },
              { id: "inquiries", label: "Anfragen", count: inquiries.length },
              { id: "callbacks", label: "Rückrufe", count: openCallbacksCount },
              { id: "hero", label: "Hero Slider" },
              { id: "shopconfig", label: "Shop-Texte" },
              { id: "subscribers", label: "Newsletter", count: subscribers.length },
              { id: "analytics", label: "Statistiken" },
              { id: "seo", label: "SEO & Meta" },
              { id: "blog", label: "Blog", count: blogPosts.length },
              { id: "reviews", label: "Bewertungen", count: reviews.length },
              { id: "categories", label: "Kategorien", count: categories.length },
              { id: "logo", label: "Logo" },
              { id: "storage", label: "Firebase Storage" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#FF5E2E] text-white shadow-md shadow-[#FF5E2E]/20"
                    : "bg-slate-800 text-slate-300 border border-slate-700/60"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? "bg-white text-[#FF5E2E]" : "bg-slate-700 text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500 text-slate-950 font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: MANAGE PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-6">
              
              {/* Hostinger & Multi-Device Sync Banner */}
              <div className="bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-900 border border-blue-800/60 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl shrink-0 mt-0.5">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white font-display">
                        Multi-Device Synchronisation (Hostinger: it-market.at, PC, Laptop & Handy)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Wegen des erreichten Firebase Free-Tier Quota-Limits läuft die Live-Cloud-Synchronisation im Sparmodus. Um neue Blog-Artikel auf dem <strong>Laptop</strong> zu sehen:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    {onRefreshFromCloud && (
                      <button
                        type="button"
                        onClick={onRefreshFromCloud}
                        className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                        title="Alle aktuellen Daten (Produkte, Header, Logos, Blog, etc.) direkt aus der Firestore Cloud laden"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>☁️ Cloud-Sync Laden</span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fullShopFileInputRef}
                      accept=".json"
                      onChange={handleImportFullShop}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fullShopFileInputRef.current?.click()}
                      className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Vollständiges Shop-Backup auf diesem Gerät einspielen"
                    >
                      <FileUp className="w-4 h-4 text-cyan-400" />
                      <span>Backup importieren</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportFullShop}
                      className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                      title="Gesamten Shop als JSON-Datei exportieren"
                    >
                      <Download className="w-4 h-4" />
                      <span>Gesamter Shop Backup</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>💡 Anleitung für Laptop & andere Geräte:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Klicken Sie auf <strong>&quot;Gesamter Shop Backup&quot;</strong> auf dem Gerät (z.B. Hostinger it-market.at), auf dem Sie die neuen Blog-Artikel erstellt haben.</li>
                    <li>Öffnen Sie die Website auf Ihrem <strong>Laptop</strong>.</li>
                    <li>Gehen Sie dort in den Admin-Bereich und klicken Sie auf <strong>&quot;Backup importieren&quot;</strong>, um die heruntergeladene JSON-Datei einzuspielen. Sofort sind alle neuen Blog-Artikel und Einstellungen auch auf dem Laptop sichtbar!</li>
                  </ol>
                </div>
              </div>

              {/* Controls bar with Search, Export, Import and Create */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Produkte durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-[#FF5E2E] transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Hidden File Input for Import */}
                  <input
                    type="file"
                    ref={productFileInputRef}
                    accept=".json,.csv"
                    onChange={handleProductFileSelect}
                    className="hidden"
                  />

                  {/* Import Button */}
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer hover:border-slate-600 active:scale-95"
                    title="Produkte aus JSON oder CSV Datei importieren"
                  >
                    <FileUp className="w-4 h-4 text-emerald-400" />
                    <span>Import (JSON / CSV)</span>
                  </button>

                  {/* Export JSON Button */}
                  <button
                    type="button"
                    onClick={handleExportProductsJSON}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer hover:border-slate-600 active:scale-95"
                    title="Alle Produkte als JSON exportieren"
                  >
                    <FileJson className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Export (JSON)</span>
                  </button>

                  {/* Export CSV Button */}
                  <button
                    type="button"
                    onClick={handleExportProductsCSV}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer hover:border-slate-600 active:scale-95"
                    title="Alle Produkte als CSV (Excel) exportieren"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Export (CSV)</span>
                  </button>

                  {/* Add Product Button */}
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="bg-[#FF5E2E] hover:bg-[#ff7347] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FF5E2E]/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Produkt anlegen</span>
                  </button>

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 py-2.5 rounded-xl text-xs font-bold border border-slate-800 cursor-pointer"
                    title="Produktkatalog auf Standard zurücksetzen"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Success / Error Banners for Export / Import */}
              {importSuccessMsg && (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{importSuccessMsg}</span>
                  </div>
                  <button onClick={() => setImportSuccessMsg(null)} className="text-emerald-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {importError && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{importError}</span>
                  </div>
                  <button onClick={() => setImportError(null)} className="text-rose-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Side: Product List Table/Grid */}
                <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-sm font-extrabold text-white font-display">Produktkatalog ({filteredProducts.length})</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Änderungen sind sofort aktiv</span>
                  </div>

                  <div className="divide-y divide-slate-800/60 overflow-x-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-12 text-center text-slate-500">
                        <Package className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                        <p className="text-sm font-semibold">Keine Produkte gefunden</p>
                        <p className="text-xs mt-1">Passen Sie Ihre Suche an oder legen Sie ein neues an.</p>
                      </div>
                    ) : (
                      filteredProducts.map((prod) => (
                        <div 
                          key={prod.id} 
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-900/40 text-left ${
                            editingProduct?.id === prod.id ? "bg-[#FF5E2E]/5 border-l-2 border-[#FF5E2E]" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-[#FF5E2E] font-mono border border-slate-800 shrink-0">
                              {prod.category.substring(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white font-display leading-snug">{prod.name}</h4>
                                {prod.isBestseller && (
                                  <span className="bg-[#FF5E2E]/10 text-[#FF5E2E] text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-[#FF5E2E]/20">
                                    Bestseller
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span>{prod.category}</span>
                                <span>•</span>
                                <span className={`font-medium ${prod.inStock ? "text-emerald-400" : "text-rose-400"}`}>
                                  {prod.inStock ? "Auf Lager" : "Ausverkauft"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-white font-mono">{prod.price}€</span>
                              {prod.oldPrice && (
                                <span className="text-[10px] text-slate-500 line-through font-mono block">{prod.oldPrice}€</span>
                              )}
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleStartEdit(prod)}
                                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                                title="Produkt bearbeiten"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 bg-rose-950/30 hover:bg-rose-950/80 text-rose-400 rounded-lg border border-rose-900/20 transition-colors cursor-pointer"
                                title="Produkt löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Side: Add / Edit Panel Form */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl text-left">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-[#FF5E2E]" />
                    <h3 className="text-sm font-extrabold text-white font-display">
                      {isAddingNew ? "Neues Produkt erstellen" : editingProduct ? "Produkt bearbeiten" : "Produktpflege-Assistent"}
                    </h3>
                  </div>

                  {!isAddingNew && !editingProduct ? (
                    <div className="p-8 text-center text-slate-500">
                      <Sliders className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                      <p className="text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                        Wählen Sie ein Produkt links zum Editieren aus, oder klicken Sie auf <strong>"Produkt anlegen"</strong>, um ein neues hinzuzufügen.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
                      
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Produktname</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="z.B. Pro Dome 4K"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Category */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategorie</label>
                            <button
                              type="button"
                              onClick={handleAddNewCategoryInline}
                              className="text-[10px] text-[#FF5E2E] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Neue Gruppe
                            </button>
                          </div>
                          <select
                            value={formCategory}
                            onChange={(e) => {
                              if (e.target.value === "__new__") {
                                handleAddNewCategoryInline();
                              } else {
                                setFormCategory(e.target.value);
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all"
                          >
                            {Array.from(new Set([
                              ...categories.map(c => c.name),
                              ...products.map(p => p.category),
                              "IP-Kameras",
                              "Smart Home",
                              "NAS-Systeme",
                              "Heimnetzwerke"
                            ])).filter(Boolean).map((catName) => (
                              <option key={catName} value={catName}>
                                {catName}
                              </option>
                            ))}
                            <option value="__new__" className="text-[#FF5E2E] font-bold">+ Neue Produktgruppe anlegen...</option>
                          </select>
                        </div>

                        {/* In Stock */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lagerbestand</label>
                          <select
                            value={formInStock ? "yes" : "no"}
                            onChange={(e) => setFormInStock(e.target.value === "yes")}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all"
                          >
                            <option value="yes">Auf Lager</option>
                            <option value="no">Ausverkauft</option>
                          </select>
                        </div>
                      </div>

                      {/* Shipping Status Selection */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lieferstatus / Status (z.B. 5-7 Werktage)</label>
                        <select
                          value={formShippingStatus}
                          onChange={(e) => setFormShippingStatus(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all"
                        >
                          <option value="5-7 Werktage">5-7 Werktage</option>
                          <option value="Sofort lieferbar (1-2 Werktage)">Sofort lieferbar (1-2 Werktage)</option>
                          <option value="3-5 Werktage">3-5 Werktage</option>
                          <option value="Auf Lager">Auf Lager</option>
                          <option value="Auf Bestellung">Auf Bestellung</option>
                          <option value="Ausverkauft">Ausverkauft</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Price */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aktionspreis (€)</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            min={0}
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all font-mono"
                          />
                        </div>

                        {/* Old Price */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UVP Preis (€)</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            min={0}
                            value={formOldPrice}
                            onChange={(e) => setFormOldPrice(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Beschreibung</label>
                        <textarea
                          rows={2.5}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Kurze werbewirksame Produktbeschreibung..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-[#FF5E2E] transition-all resize-none"
                        />
                      </div>

                      {/* Produktbild */}
                      <div className="border-t border-slate-800 pt-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Produktbild</label>
                        <div className="space-y-2">
                          
                          {/* Choose file / Drag & drop */}
                          <div className="flex gap-2">
                            <label className="flex-grow flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 p-2 rounded-lg cursor-pointer transition-all">
                              <Upload className="w-3.5 h-3.5 text-[#FF5E2E]" />
                              <span className="text-[11px] font-semibold">Bild hochladen / komprimieren</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleProductImageUpload} 
                                className="hidden" 
                              />
                            </label>
                            
                            {formImage && (
                              <button
                                type="button"
                                onClick={() => setFormImage("")}
                                className="px-3 bg-rose-950/40 hover:bg-rose-950 border border-rose-900/30 text-rose-400 rounded-lg text-[11px] font-semibold"
                                title="Bild entfernen (Standard-Vektorgrafik nutzen)"
                              >
                                Entfernen
                              </button>
                            )}
                          </div>

                          {isUploadingImage && (
                            <div className="text-[9px] text-[#FF5E2E] animate-pulse">
                              Bild wird optimiert (maximal 500x500px, JPEG-Komprimierung)...
                            </div>
                          )}

                          {/* Image URL Input */}
                          <div className="space-y-1">
                            <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Oder Bild-URL einfügen</span>
                            <input
                              type="text"
                              value={formImage.startsWith("data:") ? "" : formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              placeholder="https://images.unsplash.com/... oder leer lassen"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-[#FF5E2E] transition-all font-mono text-[11px]"
                            />
                          </div>

                          {/* Preview container */}
                          {formImage && (
                            <div className="bg-slate-900/40 border border-slate-850 p-2 rounded-xl flex items-center gap-3">
                              <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0 flex items-center justify-center">
                                {formImage.startsWith("data:") || formImage.startsWith("http") ? (
                                  <img 
                                    src={formImage} 
                                    alt="Product Preview" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=200";
                                    }}
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">{formImage}</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                <span className="font-bold text-slate-300 block">Bild-Vorschau aktiv</span>
                                {formImage.startsWith("data:") ? "Als komprimierte Datei gespeichert" : formImage.startsWith("http") ? "Über externe URL verknüpft" : `Standard-Vektortyp: ${formImage}`}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Specs */}
                      <div className="border-t border-slate-800 pt-3 mt-1 space-y-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Spezifikationen</span>
                        {(() => {
                          const labels = getSpecLabels(formCategory);
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[9px] text-slate-400 block mb-0.5">{labels.resolution}</span>
                                  <input type="text" value={specResolution} onChange={(e) => setSpecResolution(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-[11px]" />
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block mb-0.5">{labels.viewAngle}</span>
                                  <input type="text" value={specViewAngle} onChange={(e) => setSpecViewAngle(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-[11px]" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[9px] text-slate-400 block mb-0.5">{labels.nightVision}</span>
                                  <input type="text" value={specNightVision} onChange={(e) => setSpecNightVision(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-[11px]" />
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block mb-0.5">{labels.storage}</span>
                                  <input type="text" value={specStorage} onChange={(e) => setSpecStorage(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-[11px]" />
                                </div>
                              </div>

                              <div>
                                <span className="text-[9px] text-slate-400 block mb-0.5">{labels.power}</span>
                                <input type="text" value={specPower} onChange={(e) => setSpecPower(e.target.value)} className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-[11px]" />
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Toggle Bestseller Option */}
                      <div className="border-t border-slate-800 pt-3">
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={formIsBestseller}
                            onChange={(e) => setFormIsBestseller(e.target.checked)}
                            className="rounded border-slate-700 text-[#FF5E2E] focus:ring-0 bg-slate-950 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs text-white font-bold block">Bestseller (im Bestseller-Bereich anzeigen)</span>
                            <span className="text-[10px] text-slate-400 block">Wenn angewählt, wird dieses Produkt auf der Startseite im Bereich "Unsere Bestseller" aufgeführt.</span>
                          </div>
                        </label>
                      </div>

                      {/* Product features tags list */}
                      <div className="border-t border-slate-800 pt-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Produkt-Highlights / Features</label>
                        <div className="flex gap-1.5 mb-2">
                          <input
                            type="text"
                            placeholder="Neues Feature eingeben"
                            value={newFeatureText}
                            onChange={(e) => setNewFeatureText(e.target.value)}
                            className="flex-grow bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] outline-none focus:border-[#FF5E2E]"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
                          >
                            Hinzufügen
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                          {formFeatures.map((feat, idx) => (
                            <span 
                              key={idx}
                              className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded flex items-center gap-1.5"
                            >
                              {feat}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveFeature(idx)}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-2 pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(null);
                            setIsAddingNew(false);
                          }}
                          className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-300 py-2.5 rounded-xl font-bold border border-slate-800 transition-all cursor-pointer text-center"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-[#FF5E2E] hover:bg-[#ff7347] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Speichern
                        </button>
                      </div>

                    </form>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INBOUND QUOTATION REQUESTS LOG */}
          {activeTab === "inquiries" && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-white font-display">Inbound Angebotsanfragen</h3>
                  <p className="text-xs text-slate-400 mt-1">Hier laufen alle Bestellungs- & Angebotseinreichungen aus dem Warenkorb ein</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Kalkulierter Gesamtwert</span>
                  <span className="text-lg font-extrabold text-[#FF5E2E] font-mono">{totalInquiriesVal}€</span>
                </div>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
                  <ClipboardList className="w-12 h-12 text-slate-750 mx-auto mb-3" />
                  <p className="text-sm font-bold">Noch keine Anfragen vorliegend</p>
                  <p className="text-xs text-slate-400 mt-1">Kunden können im Warenkorb unverbindliche Angebote für ihre zusammengestellten Kameras anfordern.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      className="bg-slate-950 rounded-2xl border border-slate-850 p-5 hover:border-slate-800 transition-all shadow-lg relative group"
                    >
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eintrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Header line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-850">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-[#FF5E2E]/10 text-[#FF5E2E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FF5E2E]/20">
                            ID: {inq.id}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {inq.date}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Berechneter Wert</span>
                          <span className="text-base font-extrabold text-emerald-400 font-mono">{inq.total} €</span>
                        </div>
                      </div>

                      {/* Customer Info Box */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
                        {/* Name & Type */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Kunde</span>
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold">{inq.name}</span>
                          </div>
                          <span className="inline-block bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {inq.clientType}
                          </span>
                        </div>

                        {/* Contacts */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Kontaktkanäle</span>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <a href={`mailto:${inq.email}`} className="hover:text-white underline">{inq.email}</a>
                          </div>
                          {inq.phone && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <a href={`tel:${inq.phone}`} className="hover:text-white">{inq.phone}</a>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Anmerkungen des Kunden</span>
                          <p className="text-slate-300 leading-relaxed italic bg-slate-900 p-2 rounded-xl border border-slate-850">
                            {inq.notes || "Keine Anmerkungen hinterlassen."}
                          </p>
                        </div>
                      </div>

                      {/* Requested Items Box */}
                      <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-850 space-y-2 mt-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Angeforderte Komponenten</span>
                        <div className="divide-y divide-slate-850/50">
                          {inq.items.map((item: any, idx: number) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                  {item.qty}x
                                </span>
                                <span className="font-semibold text-slate-200">{item.name}</span>
                                <span className="text-[10px] text-slate-500">({item.color})</span>
                              </div>
                              <span className="font-mono text-slate-300">{item.price * item.qty}€</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALLBACK REQUESTS LOG */}
          {activeTab === "callbacks" && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-white font-display">Telefonische Rückrufwünsche</h3>
                  <p className="text-xs text-slate-400 mt-1">Ausgefüllte Formulare zur Expertenberatung für die Sicherheitsplanung</p>
                </div>
                <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                  <span>{openCallbacksCount} Offen</span>
                </div>
              </div>

              {callbacks.length === 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
                  <PhoneCall className="w-12 h-12 text-slate-750 mx-auto mb-3 animate-ping" />
                  <p className="text-sm font-bold">Keine Rückrufe vermerkt</p>
                  <p className="text-xs text-slate-400 mt-1">Kunden können über den "Rückruf anfordern" Button persönliche Termine buchen.</p>
                </div>
              ) : (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kundenliste</span>
                    <span className="text-[10px] text-slate-500 font-mono">Nach Datum sortiert</span>
                  </div>

                  <div className="divide-y divide-slate-850">
                    {callbacks.map((call) => (
                      <div key={call.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                        
                        {/* Caller details */}
                        <div className="flex items-start gap-3 text-left">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                            call.status === "Offen" 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" 
                              : "bg-slate-900 text-slate-500 border-slate-800"
                          }`}>
                            <PhoneCall className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white font-display">{call.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono">{call.date}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-mono mt-1 font-bold">Tel: {call.phone}</p>
                            <p className="text-xs text-slate-400 mt-1 leading-snug">Thema: <span className="italic">"{call.topic}"</span></p>
                          </div>
                        </div>

                        {/* Status controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          
                          {/* Status Badge Toggle button */}
                          <button
                            onClick={() => handleToggleCallbackStatus(call.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              call.status === "Offen"
                                ? "bg-[#FF5E2E]/10 text-[#FF5E2E] border-[#FF5E2E]/20 hover:bg-[#FF5E2E]/25"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                            }`}
                          >
                            {call.status === "Offen" ? (
                              <>
                                <span className="w-1.5 h-1.5 bg-[#FF5E2E] rounded-full animate-ping"></span>
                                <span>Offen (Als Erledigt markieren)</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Erledigt (Erneut öffnen)</span>
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteCallback(call.id)}
                            className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-900/20 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: NEWSLETTER DOUBLE OPT-IN LOG */}
          {activeTab === "newsletter" && (
            <div className="space-y-6 text-left animate-fadeIn">
              
              {/* Header card */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white font-display">
                      Newsletter Abonnenten (Double Opt-In)
                    </h3>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      DSGVO-Konform
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Echtzeit-Synchronisierung mit Firestore. E-Mail-Adressen werden erst nach verifiziertem Double-Opt-In im System freigeschaltet.
                  </p>
                </div>

                <button
                  onClick={loadSubscribers}
                  disabled={subscribersLoading}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${subscribersLoading ? "animate-spin text-blue-400" : ""}`} />
                  <span>Aktualisieren</span>
                </button>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-lg">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gesamt Anmeldungen</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">{subscribers.length}</div>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-emerald-500/20 p-4 shadow-lg">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Bestätigt (Double Opt-In)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {subscribers.filter(s => s.status === "confirmed").length}
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-amber-500/20 p-4 shadow-lg">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Ausstehend (Pending DOI)</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {subscribers.filter(s => s.status === "pending").length}
                  </div>
                </div>
              </div>

              {/* Table / List */}
              {subscribers.length === 0 ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
                  <Mail className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">Keine Newsletter-Anmeldungen vorhanden</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Sobald Besucher das Newsletter-Formular ausfüllen, werden die Double-Opt-In-Einträge hier in Firestore gelistet.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5">E-Mail Adresse</th>
                          <th className="px-5 py-3.5">DOI Status</th>
                          <th className="px-5 py-3.5">Quelle</th>
                          <th className="px-5 py-3.5">Datum (Anfrage)</th>
                          <th className="px-5 py-3.5">Datum (Bestätigt)</th>
                          <th className="px-5 py-3.5 text-right">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-white">
                              {sub.email}
                            </td>
                            <td className="px-5 py-4">
                              {sub.status === "confirmed" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                  <Check className="w-3 h-3" />
                                  Bestätigt (DOI)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                                  <Clock className="w-3 h-3" />
                                  Ausstehend
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-slate-400">
                              {sub.source || "Website"}
                            </td>
                            <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                              {new Date(sub.createdAt).toLocaleString("de-DE")}
                            </td>
                            <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                              {sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleString("de-DE") : "-"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {sub.status !== "confirmed" && (
                                  <button
                                    onClick={() => handleConfirmSubscriber(sub.id)}
                                    title="Manuell als verifiziert markieren"
                                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Verifizieren</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteSub(sub.id)}
                                  title="Eintrag löschen"
                                  className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-lg border border-slate-800 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM STATISTICS */}
          {activeTab === "seo" && (
            <div className="space-y-6 animate-fadeIn pb-12 text-left">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-[#FF5E2E]" />
                  <h3 className="text-lg font-extrabold text-white font-display">SEO &amp; Meta-Daten</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Titel und Beschreibung bestimmen, wie deine Seiten bei Google erscheinen. Keywords sind ergänzend (Google gewichtet vor allem Titel, Beschreibung &amp; Inhalt).
                </p>
                <div className="flex gap-2 flex-wrap">
                  {([["pages", "Unterseiten"], ["blog", "Blog-Artikel"], ["products", "Produkte"]] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setSeoSection(id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${seoSection === id ? "bg-[#FF5E2E] text-white" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}>{label}</button>
                  ))}
                </div>
              </div>

              {seoSection === "pages" && (
                <div className="space-y-4">
                  {SEO_ROUTES.map((r) => {
                    const v = seoPageDraft[r.key] || {};
                    return (
                      <div key={r.key} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white">{r.label}</span>
                          <code className="text-[10px] text-slate-500 font-mono">it-market.at{r.key}</code>
                        </div>
                        <div className="grid gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO-Titel</label>
                            <input value={v.title || ""} onChange={(e) => setSeoPageDraft((d) => ({ ...d, [r.key]: { ...d[r.key], title: e.target.value } }))} placeholder="Wird sonst automatisch gesetzt" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1" />
                            <span className={`text-[10px] ${(v.title || "").length > 60 ? "text-amber-400" : "text-slate-500"}`}>{(v.title || "").length}/60 Zeichen</span>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta-Beschreibung</label>
                            <textarea value={v.description || ""} onChange={(e) => setSeoPageDraft((d) => ({ ...d, [r.key]: { ...d[r.key], description: e.target.value } }))} rows={2} placeholder="1–2 Sätze, die bei Google unter dem Titel erscheinen" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1 resize-none" />
                            <span className={`text-[10px] ${(v.description || "").length > 160 ? "text-amber-400" : "text-slate-500"}`}>{(v.description || "").length}/160 Zeichen</span>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Keywords (kommagetrennt)</label>
                            <input value={v.keywords || ""} onChange={(e) => setSeoPageDraft((d) => ({ ...d, [r.key]: { ...d[r.key], keywords: e.target.value } }))} placeholder="z. B. IP-Kamera, Überwachung, Netzwerk" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => { onUpdatePageSeo?.(seoPageDraft); setSeoSavedMsg("Unterseiten-SEO gespeichert. Für das vorgerenderte HTML einmal neu deployen (Hostinger → GIT/Deploy)."); }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all">Unterseiten-SEO speichern</button>
                </div>
              )}

              {seoSection === "blog" && (
                <div className="space-y-4">
                  {seoBlogDraft.length === 0 && <p className="text-xs text-slate-500">Keine Blog-Artikel vorhanden.</p>}
                  {seoBlogDraft.map((p, i) => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-white block mb-3">{p.title}</span>
                      <div className="grid gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO-Titel</label>
                          <input value={p.seoTitle || ""} onChange={(e) => setSeoBlogDraft((d) => d.map((x, xi) => (xi === i ? { ...x, seoTitle: e.target.value } : x)))} placeholder={p.title} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta-Beschreibung</label>
                          <textarea value={p.metaDescription || ""} onChange={(e) => setSeoBlogDraft((d) => d.map((x, xi) => (xi === i ? { ...x, metaDescription: e.target.value } : x)))} rows={2} placeholder={p.excerpt} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1 resize-none" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Keywords / Tags (kommagetrennt)</label>
                          <input value={(p.tags || []).join(", ")} onChange={(e) => setSeoBlogDraft((d) => d.map((x, xi) => (xi === i ? { ...x, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) } : x)))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {seoBlogDraft.length > 0 && <button onClick={() => { onUpdateBlogPosts(seoBlogDraft); setSeoSavedMsg("Blog-SEO gespeichert."); }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all">Blog-SEO speichern</button>}
                </div>
              )}

              {seoSection === "products" && (
                <div className="space-y-4">
                  {seoProductDraft.length === 0 && <p className="text-xs text-slate-500">Keine Produkte vorhanden.</p>}
                  {seoProductDraft.map((p, i) => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-white block mb-3">{p.name}</span>
                      <div className="grid gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO-Titel</label>
                          <input value={p.seoTitle || ""} onChange={(e) => setSeoProductDraft((d) => d.map((x, xi) => (xi === i ? { ...x, seoTitle: e.target.value } : x)))} placeholder={p.name} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta-Beschreibung</label>
                          <textarea value={p.metaDescription || ""} onChange={(e) => setSeoProductDraft((d) => d.map((x, xi) => (xi === i ? { ...x, metaDescription: e.target.value } : x)))} rows={2} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1 resize-none" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Keywords (kommagetrennt)</label>
                          <input value={p.keywords || ""} onChange={(e) => setSeoProductDraft((d) => d.map((x, xi) => (xi === i ? { ...x, keywords: e.target.value } : x)))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E2E] mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {seoProductDraft.length > 0 && <button onClick={() => { onUpdateProducts(seoProductDraft); setSeoSavedMsg("Produkt-SEO gespeichert."); }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all">Produkt-SEO speichern</button>}
                </div>
              )}

              {seoSavedMsg && <p className="text-xs text-emerald-400 font-semibold">{seoSavedMsg}</p>}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6 text-left">

              {/* Eigener Seitenzähler + Google Analytics */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#FF5E2E]" />
                    <h3 className="text-base font-extrabold text-white">Website-Aufrufe je Bereich</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://analytics.google.com/analytics/web/#/p547144659/reports/reportinghub"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Google Analytics öffnen
                    </a>
                    <button onClick={loadPageStats} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all">Aktualisieren</button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-4">
                  Eigener, cookieloser Zähler (anonym, DSGVO-unkritisch). Gesamtaufrufe: <strong className="text-white">{pageStats.total}</strong>
                  {pageStats.updatedAt ? ` · zuletzt: ${new Date(pageStats.updatedAt).toLocaleString("de-DE")}` : ""}
                </p>
                {pageStatsLoading ? (
                  <p className="text-xs text-slate-500">Lädt…</p>
                ) : Object.keys(pageStats.counts).length === 0 ? (
                  <p className="text-xs text-slate-500">Noch keine Aufrufe erfasst. (Hinweis: Zum Anzeigen musst du per Firebase eingeloggt sein.)</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(pageStats.counts).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([route, count]) => {
                      const max = Math.max(...Object.values(pageStats.counts).map((n) => Number(n) || 0), 1);
                      return (
                        <div key={route} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-300 w-32 sm:w-44 truncate" title={route}>{route}</span>
                          <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                            <div className="h-full bg-[#FF5E2E] rounded-full" style={{ width: `${(Number(count) / max) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-white w-12 text-right">{count as number}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={async () => { if (window.confirm("Zähler wirklich auf 0 zurücksetzen?")) { await resetPageStats(); loadPageStats(); } }}
                  className="mt-4 text-[11px] text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  Zähler zurücksetzen
                </button>
              </div>

              {/* Analytics card metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Products */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Produkte im Katalog</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FF5E2E]/10 flex items-center justify-center text-[#FF5E2E]">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{products.length}</span>
                    <span className="text-xs text-slate-500">Artikel</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                    Mit {products.filter(p => p.isBestseller).length} Bestsellern im Shop.
                  </div>
                </div>

                {/* 2. Total value inquiries */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inquiries Pipeline</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Euro className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{totalInquiriesVal}€</span>
                    <span className="text-xs text-emerald-400 font-bold font-mono">Brutto</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                    Aus {inquiries.length} eingegangenen Web-Quotationen.
                  </div>
                </div>

                {/* 3. Average product price */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ø Artikel-Preis</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {Math.round(products.reduce((s, p) => s + p.price, 0) / (products.length || 1))}€
                    </span>
                    <span className="text-xs text-slate-500">Mittelwert</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                    Günstigster Artikel: {Math.min(...products.map(p => p.price))}€
                  </div>
                </div>

                {/* 4. Pending callbacks */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Beratungswünsche</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{openCallbacksCount}</span>
                    <span className="text-xs text-rose-400 font-bold">Offen</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                    Insgesamt {callbacks.length} Einträge in der Rückrufliste.
                  </div>
                </div>

              </div>

              {/* Conversion and Category distribution analysis charts simulated with beautifully crafted CSS bars */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                
                {/* Categories distribution bar counts */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-850 pb-2.5">
                    Produkt-Verteilung nach Kategorien
                  </h4>
                  
                  <div className="space-y-4">
                    {["IP-Kameras", "Smart Home", "NAS-Systeme", "Heimnetzwerke"].map((cat) => {
                      const count = products.filter(p => p.category === cat || (p.category && p.category.toLowerCase().replace(/[\s_-]+/g, "") === cat.toLowerCase().replace(/[\s_-]+/g, ""))).length;
                      const percentage = Math.round((count / (products.length || 1)) * 100);
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span className="font-semibold">{cat}</span>
                            <span className="font-mono text-slate-400">{count} Produkte ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                            <div 
                              className="bg-[#FF5E2E] h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated CRM funnel conversions */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-850 pb-2.5">
                    Konvertierungs-Schnittstellen
                  </h4>

                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-slate-200">Warenkorb-Anfragen</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Zusammenfassung als PDF/E-Mail</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-100 font-mono bg-slate-950 px-2 py-1 rounded text-[11px] border border-slate-800">
                        100% DSGVO-konform
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-slate-200">Schnittstellen-Erreichbarkeit</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Live Callback Simulation</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-100 font-mono bg-slate-950 px-2 py-1 rounded text-[11px] border border-slate-800">
                        Aktiv & Verschlüsselt
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-slate-200">Katalog-Synchronisation</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Dynamic Client State</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-100 font-mono bg-slate-950 px-2 py-1 rounded text-[11px] border border-slate-800">
                        Sofort synchron
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= BLOG & MAGAZINE MANAGEMENT TAB ================= */}
          {activeTab === "blog" && (
            <div className="space-y-6 animate-fadeIn pb-12">
              
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FF5E2E]" />
                    <h3 className="text-lg font-extrabold text-white font-display">
                      Blog & Magazin Verwaltung
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Erstellen, bearbeiten und veröffentlichen Sie Fachbeiträge, Anleitungen und Sicherheitstipps.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      handleNewBlogPost();
                      setIsWordRocketImportOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>WordRocket Express-Import</span>
                  </button>

                  <button
                    onClick={handleNewBlogPost}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-[#FF5E2E]/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Neuer Artikel
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gesamt Artikel</span>
                    <span className="text-lg font-bold text-white font-mono">{blogPosts.length}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Veröffentlicht</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {blogPosts.filter(p => p.isPublished).length}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Entwürfe</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {blogPosts.filter(p => !p.isPublished).length}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hervorgehoben</span>
                    <span className="text-lg font-bold text-purple-400 font-mono">
                      {blogPosts.filter(p => p.featured).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Titel, Tags oder Schlagwort..."
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-[#FF5E2E]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Kategorie:</span>
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#FF5E2E]"
                  >
                    <option value="Alle">Alle Kategorien</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Blog Posts List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts
                  .filter(post => {
                    const matchesCategory = blogCategoryFilter === "Alle" || post.category === blogCategoryFilter;
                    const matchesSearch = !blogSearchQuery.trim() || 
                      post.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                      post.tags.some(t => t.toLowerCase().includes(blogSearchQuery.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  })
                  .map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-all"
                    >
                      {/* Image Preview & Status Badges */}
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-80"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            post.isPublished 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}>
                            {post.isPublished ? "Veröffentlicht" : "Entwurf"}
                          </span>
                          {post.featured && (
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Hero
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800">
                          {post.readTime}
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                            <span className="font-bold text-blue-400">{post.category}</span>
                            <span>{post.date}</span>
                          </div>

                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug pt-0.5 mb-2 group-hover:text-[#FF5E2E] transition-colors">
                            {post.title}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author & Actions */}
                        <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {post.author}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTogglePublishPost(post.id)}
                              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                post.isPublished 
                                  ? "bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-850" 
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              }`}
                              title={post.isPublished ? "Auf Entwurf setzen" : "Veröffentlichen"}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleEditBlogPost(post)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-all cursor-pointer"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteBlogPost(post)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                              title="Löschen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
              </div>

              {/* Custom Delete Confirmation Modal */}
              {deletingBlogPost && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-100">
                    <div className="flex items-center gap-3.5 text-rose-400">
                      <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-display">
                          Blogartikel löschen?
                        </h3>
                        <p className="text-xs text-slate-400">
                          Möchten Sie diesen Beitrag wirklich unwiderruflich entfernen?
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 font-medium line-clamp-2">
                      "{deletingBlogPost.title}"
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => setDeletingBlogPost(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => confirmDeleteBlogPost(deletingBlogPost.id)}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
                      >
                        Ja, löschen
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================= BLOG EDITOR MODAL OVERLAY ================= */}
          {(isAddingNewBlog || editingBlogPost) && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-slate-100">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5E2E]/10 text-[#FF5E2E] flex items-center justify-center border border-[#FF5E2E]/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">
                        {isAddingNewBlog ? "Neuen Blogartikel erstellen" : "Blogartikel bearbeiten"}
                      </h3>
                      <p className="text-xs text-slate-400">Geben Sie Titel, Inhalt und Bildeigenschaften ein.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWordRocketImportOpen(!isWordRocketImportOpen)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="WordRocket / Markdown Import"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>WordRocket Import</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsAddingNewBlog(false); setEditingBlogPost(null); }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* WordRocket Quick Import Expandable Box */}
                {isWordRocketImportOpen && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-bold text-purple-200">WordRocket / AI-Text Schnell-Import</h4>
                      </div>
                      <span className="text-[10px] text-slate-400">Unterstützt Markdown & JSON Format</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Fügen Sie den von WordRocket generierten Text (mit # Überschrift, Bild-URLs und Text) oder JSON-Export hier ein. Der Parser fügt Titel, Cover-Bild und Inhalt automatisch ein:
                    </p>

                    <textarea
                      rows={5}
                      value={wordRocketInput}
                      onChange={(e) => setWordRocketInput(e.target.value)}
                      placeholder="# 4K Überwachungskamera Guide&#10;![Cover](https://firebasestorage.googleapis.com/.../image.png)&#10;Hier steht der Text aus WordRocket..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-purple-500 font-mono resize-none"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWordRocketImportOpen(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImportFromWordRocket(wordRocketInput)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                      >
                        Daten übernehmen
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveBlogPost} className="space-y-5">
                  
                  {/* Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Artikel Titel *</label>
                      <input
                        type="text"
                        required
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder="z.B. 4K IP-Kamera vs. Full HD im Vergleich..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF5E2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300 block">Kategorie *</label>
                        {!isCustomCategory ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(true);
                              setBlogCategory("");
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                          >
                            + Eigene Kategorie eingeben
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setBlogCategory(availableCategories[0] || "Technik-Guides");
                            }}
                            className="text-[10px] text-slate-400 hover:text-slate-300 font-semibold underline cursor-pointer"
                          >
                            Aus Liste wählen
                          </button>
                        )}
                      </div>

                      {isCustomCategory ? (
                        <input
                          type="text"
                          required
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          placeholder="z.B. Netzwerk, IP-Kameras, KI-Analyse..."
                          className="w-full bg-slate-950 border border-purple-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400"
                        />
                      ) : (
                        <select
                          value={blogCategory}
                          onChange={(e) => {
                            if (e.target.value === "NEW_CUSTOM_CATEGORY") {
                              setIsCustomCategory(true);
                              setBlogCategory("");
                            } else {
                              setBlogCategory(e.target.value);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF5E2E]"
                        >
                          {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                          <option value="NEW_CUSTOM_CATEGORY">+ Neue eigene Kategorie...</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Kurzbeschreibung / Excerpt *</label>
                    <textarea
                      rows={2}
                      required
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      placeholder="Eine prägnante Zusammenfassung für die Vorschaukarte..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#FF5E2E] resize-none"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300 block">Hauptinhalt (Text / Markdown formatierbar)</label>
                      <span className="text-[10px] text-slate-500">Formate: Nutze '### Überschrift' für Abschnitte</span>
                    </div>
                    <textarea
                      rows={8}
                      required
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      placeholder="Geben Sie hier den vollständigen Artikeltext ein..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-[#FF5E2E] font-mono leading-relaxed resize-y"
                    />
                  </div>

                  {/* Author, Date, Read Time, Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Autor</label>
                      <input
                        type="text"
                        value={blogAuthor}
                        onChange={(e) => setBlogAuthor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#FF5E2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Veröffentlichungsdatum</label>
                      <input
                        type="text"
                        value={blogDate}
                        onChange={(e) => setBlogDate(e.target.value)}
                        placeholder="z.B. 24. Juli 2026"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#FF5E2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Lesezeit</label>
                      <input
                        type="text"
                        value={blogReadTime}
                        onChange={(e) => setBlogReadTime(e.target.value)}
                        placeholder="z.B. 5 min Lesezeit"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#FF5E2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Keywords & Tags (kommagetrennt)</label>
                      <input
                        type="text"
                        value={blogTags}
                        onChange={(e) => setBlogTags(e.target.value)}
                        placeholder="z.B. IP-Kamera, DSGVO, Überwachung, 4K, Smart Home"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#FF5E2E]"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">SEO-Keywords & Schlüsselwörter für Suche & Google</span>
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 block">Titelbild / Cover Upload</label>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {blogImage && (
                        <div className="w-24 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                          <img src={blogImage} alt="Cover Preview" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                        </div>
                      )}

                      <div className="flex-1 w-full space-y-2">
                        <label className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-950 border border-dashed border-slate-700 hover:border-[#FF5E2E] rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer">
                          <Upload className="w-4 h-4 text-[#FF5E2E]" />
                          <span>{isUploadingBlogImage ? "Bild wird verarbeitet..." : "Titelbild hochladen"}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleBlogImageUpload} 
                            className="hidden" 
                          />
                        </label>
                        <input
                          type="text"
                          value={blogImage}
                          onChange={(e) => setBlogImage(e.target.value)}
                          placeholder="Oder Bild-URL direkt eingeben (http/https)..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-[11px] text-slate-400 outline-none focus:border-[#FF5E2E]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blogIsPublished}
                          onChange={(e) => setBlogIsPublished(e.target.checked)}
                          className="w-4 h-4 rounded text-[#FF5E2E] focus:ring-0 bg-slate-950 border-slate-800"
                        />
                        <span>Sofort veröffentlichen</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blogIsFeatured}
                          onChange={(e) => setBlogIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-[#FF5E2E] focus:ring-0 bg-slate-950 border-slate-800"
                        />
                        <span>Als Hero-Beitrag hervorheben</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsAddingNewBlog(false); setEditingBlogPost(null); }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Abbrechen
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingBlog}
                        className="px-6 py-2 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-[#FF5E2E]/20 cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSavingBlog && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {isSavingBlog ? "Speichere & lade Bild…" : (isAddingNewBlog ? "Artikel erstellen" : "Änderungen speichern")}
                      </button>
                    </div>
                  </div>

                </form>

              </div>
            </div>
          )}

          {/* TAB 6: PC-KONFIGURATOR PFLEGEN */}
          {activeTab === "configurator" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* Header card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-extrabold text-white">PC- & Workstation-Konfigurator verwalten</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Passen Sie hier die verfügbaren Prozessoren, Grafikkarten, Arbeitsspeicher, SSDs, Netzwerkkarten & Aufpreise des Konfigurators an.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Sockel-Basispreis:</span>
                    <input
                      type="number"
                      value={localConfig.baseBoardPrice ?? 349}
                      onChange={(e) => handleUpdateBaseBoardPrice(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold px-2 py-1 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-extrabold">€</span>
                  </div>
                </div>
              </div>

              {/* Banner Image Customization Card - Netzwerke */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Netzwerke Kategorie-Hero Hintergrundbild verwalten & hochladen</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live-Admin & Upload
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Geben Sie eine Bild-URL ein oder laden Sie ein eigenes Bild (PNG, JPG) direkt von Ihrem Gerät hoch. Das Bild wird sofort im Frontend als Hintergrund übernommen.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.netzwerkeBannerImage || ""}
                      onChange={(e) => handleUpdateNetzwerkeBannerImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... oder Bild-URL"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Bild von Gerät hochladen</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUploadNetzwerkeBanner} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {localConfig.netzwerkeBannerImage && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                          <img 
                            src={localConfig.netzwerkeBannerImage} 
                            alt="Aktives Banner" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Aktives Banner-Hintergrundbild</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Eingebunden & live im Frontend</span>
                        </div>
                      </div>
                      <button
                        onClick={() => alert("Hintergrundbild erfolgreich gespeichert und aktualisiert!")}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-extrabold transition-all cursor-pointer shadow-md"
                      >
                        Übernehmen
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image Customization Card - Hotspot */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Hotspot-Lösungen Kategorie-Hero Hintergrundbild</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live-Admin & Upload
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.hotspotBannerImage || ""}
                      onChange={(e) => handleUpdateHotspotBannerImage(e.target.value)}
                      placeholder="Bild-URL eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Hochladen</span>
                      <input type="file" accept="image/*" onChange={handleUploadHotspotBanner} className="hidden" />
                    </label>
                  </div>
                  {localConfig.hotspotBannerImage && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                        <img src={localConfig.hotspotBannerImage} alt="Hotspot Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button onClick={() => alert("Gespeichert!")} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold">Übernehmen</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image Customization Card - NAS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>NAS-Systeme Kategorie-Hero Hintergrundbild</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live-Admin & Upload
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.nasBannerImage || ""}
                      onChange={(e) => handleUpdateNasBannerImage(e.target.value)}
                      placeholder="Bild-URL eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Hochladen</span>
                      <input type="file" accept="image/*" onChange={handleUploadNasBanner} className="hidden" />
                    </label>
                  </div>
                  {localConfig.nasBannerImage && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                        <img src={localConfig.nasBannerImage} alt="NAS Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button onClick={() => alert("Gespeichert!")} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold">Übernehmen</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image Customization Card - IP-Kameras */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>IP-Kameras Kategorie-Hero Hintergrundbild</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live-Admin & Upload
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.camerasBannerImage || ""}
                      onChange={(e) => handleUpdateCamerasBannerImage(e.target.value)}
                      placeholder="Bild-URL eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Hochladen</span>
                      <input type="file" accept="image/*" onChange={handleUploadCamerasBanner} className="hidden" />
                    </label>
                  </div>
                  {localConfig.camerasBannerImage && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                        <img src={localConfig.camerasBannerImage} alt="Cameras Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button onClick={() => alert("Gespeichert!")} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold">Übernehmen</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image Customization Card - PC-Hardware */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>PC-Hardware Kategorie-Hero Hintergrundbild</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live-Admin & Upload
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.hardwareBannerImage || ""}
                      onChange={(e) => handleUpdateHardwareBannerImage(e.target.value)}
                      placeholder="Bild-URL eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Hochladen</span>
                      <input type="file" accept="image/*" onChange={handleUploadHardwareBanner} className="hidden" />
                    </label>
                  </div>
                  {localConfig.hardwareBannerImage && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                        <img src={localConfig.hardwareBannerImage} alt="Hardware Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button onClick={() => alert("Gespeichert!")} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold">Übernehmen</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image Customization Card - Smart-Home */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Smart-Home Kategorie-Hero Hintergrundbild</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live-Admin & Upload
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.smartHomeBannerImage || ""}
                      onChange={(e) => handleUpdateSmartHomeBannerImage(e.target.value)}
                      placeholder="Bild-URL eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Hochladen</span>
                      <input type="file" accept="image/*" onChange={handleUploadSmartHomeBanner} className="hidden" />
                    </label>
                  </div>
                  {localConfig.smartHomeBannerImage && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                        <img src={localConfig.smartHomeBannerImage} alt="Smart Home Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button onClick={() => alert("Gespeichert!")} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold">Übernehmen</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Video Customization Card - Smart-Home MP4 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span>Smart-Home Kategorie-Hero Hintergrundvideo (MP4)</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    YouTube / MP4
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={localConfig.smartHomeBannerVideo || ""}
                      onChange={(e) => handleUpdateSmartHomeBannerVideo(e.target.value)}
                      placeholder="YouTube-URL oder MP4 Video-URL eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-700 shadow-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Video Hochladen</span>
                      <input type="file" accept="video/mp4,video/webm" onChange={handleUploadSmartHomeVideo} className="hidden" />
                    </label>
                  </div>
                  {localConfig.smartHomeBannerVideo && (
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 relative">
                        <VideoBackground src={localConfig.smartHomeBannerVideo} className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => alert("Video erfolgreich übernommen!")} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold">Übernehmen</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Category Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
                {[
                  { key: "cpuOptions", label: "Prozessor (CPU)", count: localConfig.cpuOptions.length, icon: Cpu },
                  { key: "gpuOptions", label: "Grafikkarte (GPU)", count: localConfig.gpuOptions.length, icon: Zap },
                  { key: "ramOptions", label: "Arbeitsspeicher (RAM)", count: localConfig.ramOptions.length, icon: Layers },
                  { key: "ssdOptions", label: "Speicher (SSD / NVMe)", count: localConfig.ssdOptions.length, icon: HardDrive },
                  { key: "networkOptions", label: "Netzwerkkarte", count: localConfig.networkOptions.length, icon: Globe },
                  { key: "chassisOptions", label: "Gehäuse", count: localConfig.chassisOptions.length, icon: Server },
                  { key: "serviceOptions", label: "Service & Montage", count: localConfig.serviceOptions.length, icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = configSection === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setConfigSection(tab.key as any);
                        setIsAddingOption(false);
                        setEditingOption(null);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                          : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? "bg-slate-950 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Options Table & Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {configSection === "cpuOptions" && "Verfügbare Prozessoren"}
                    {configSection === "gpuOptions" && "Verfügbare Grafikkarten"}
                    {configSection === "ramOptions" && "Verfügbare RAM-Module"}
                    {configSection === "ssdOptions" && "Verfügbare SSD-Laufwerke"}
                    {configSection === "networkOptions" && "Verfügbare Netzwerkkarten"}
                    {configSection === "chassisOptions" && "Verfügbare Gehäuse"}
                    {configSection === "serviceOptions" && "Verfügbare Service-Pakete"}
                  </span>

                  <button
                    onClick={() => {
                      setIsAddingOption(true);
                      setEditingOption(null);
                      setOptName("");
                      setOptPrice(0);
                      setOptSpec("");
                      setOptRecommended(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Neue Option hinzufügen</span>
                  </button>
                </div>

                {/* Adding / Editing Form */}
                {(isAddingOption || editingOption) && (
                  <form onSubmit={handleSaveOption} className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        {editingOption ? "Komponente bearbeiten" : "Neue Komponente hinzufügen"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => { setIsAddingOption(false); setEditingOption(null); }}
                        className="text-slate-500 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Bezeichnung / Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="z.B. Intel Core i9-14900KS"
                          value={optName}
                          onChange={(e) => setOptName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Aufpreis in Euro (€) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={optPrice}
                          onChange={(e) => setOptPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-400 mb-1">Spezifikation / Kurz-Info *</label>
                        <input
                          type="text"
                          required
                          placeholder="z.B. 24 Cores, 6.2 GHz, 36MB Cache"
                          value={optSpec}
                          onChange={(e) => setOptSpec(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optRecommended}
                          onChange={(e) => setOptRecommended(e.target.checked)}
                          className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-800"
                        />
                        <span>Als "Empfohlen" kennzeichnen (Badge)</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsAddingOption(false); setEditingOption(null); }}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                        >
                          {editingOption ? "Speichern" : "Hinzufügen"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Table list of options */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Komponente</th>
                        <th className="py-3 px-4">Spezifikation</th>
                        <th className="py-3 px-4 text-right">Aufpreis (€)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {((localConfig[configSection] as ConfiguratorOption[]) || []).map((opt) => (
                        <tr key={opt.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <span>{opt.name}</span>
                            {opt.recommended && (
                              <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">
                                Empfohlen
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{opt.spec}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400">
                            {opt.price === 0 ? "Inklusive" : `+${opt.price} €`}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Aktiv
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingOption({ section: configSection, option: opt });
                                  setIsAddingOption(false);
                                  setOptName(opt.name);
                                  setOptPrice(opt.price);
                                  setOptSpec(opt.spec);
                                  setOptRecommended(!!opt.recommended);
                                }}
                                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOption(configSection, opt.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB: REVIEWS / TESTIMONIALS */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-fadeIn pb-12">
              
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-extrabold text-white font-display">
                      Testimonials & Kundenstimmen Verwaltung
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pflegen und moderieren Sie Kundenbewertungen und Testimonials für die Startseite.
                  </p>
                </div>

                <button
                  onClick={handleNewReview}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-[#FF5E2E]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Neue Bewertung hinzufügen
                </button>
              </div>

              {/* Add/Edit Review Modal Form */}
              {isAddingReview && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h4 className="text-sm font-extrabold text-white">
                      {editingReview ? "Kundenbewertung bearbeiten" : "Neue Kundenbewertung erstellen"}
                    </h4>
                    <button
                      onClick={() => setIsAddingReview(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Abbrechen
                    </button>
                  </div>

                  <form onSubmit={handleSaveReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Kundenname *</label>
                        <input
                          type="text"
                          required
                          value={revName}
                          onChange={(e) => setRevName(e.target.value)}
                          placeholder="z.B. Dr. Thomas Weber"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Rolle / Position</label>
                        <input
                          type="text"
                          value={revRole}
                          onChange={(e) => setRevRole(e.target.value)}
                          placeholder="z.B. Zahnarztpraxis"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Sterne-Bewertung (1-5)</label>
                        <select
                          value={revRating}
                          onChange={(e) => setRevRating(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        >
                          <option value={5}>★★★★★ (5 Sterne)</option>
                          <option value={4}>★★★★☆ (4 Sterne)</option>
                          <option value={3}>★★★☆☆ (3 Sterne)</option>
                          <option value={2}>★★☆☆☆ (2 Sterne)</option>
                          <option value={1}>★☆☆☆☆ (1 Stern)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Datum</label>
                        <input
                          type="text"
                          value={revDate}
                          onChange={(e) => setRevDate(e.target.value)}
                          placeholder="z.B. 14. Mai 2026"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Avatar Bild-URL oder Upload</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={revAvatar}
                            onChange={(e) => setRevAvatar(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E] font-mono"
                          />
                          <label className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Bild</span>
                            <input type="file" accept="image/*" onChange={handleUploadReviewAvatar} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Bewertungstext / Zitat *</label>
                      <textarea
                        required
                        rows={3}
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        placeholder="Erfahrungsbericht des Kunden..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingReview(false)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#FF5E2E]/20 cursor-pointer"
                      >
                        Bewertung speichern
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                          <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">{r.name}</h4>
                          <span className="text-xs text-amber-400 font-semibold">{r.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      "{r.comment}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>Datum: {r.date}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditReview(r)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3 text-cyan-400" />
                          <span>Bearbeiten</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Löschen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-fadeIn pb-12">
              
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Grid className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-extrabold text-white font-display">
                      Startseiten-Kategorien verwalten
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Bearbeiten Sie die Titel, Untertitel, Beschreibungen und Vorschaubilder der Startseiten-Kategorien.
                  </p>
                </div>

                <button
                  onClick={handleNewCategory}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-[#FF5E2E]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Kategorie hinzufügen
                </button>
              </div>

              {/* Add/Edit Category Modal Form */}
              {isAddingCategory && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h4 className="text-sm font-extrabold text-white">
                      {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}
                    </h4>
                    <button
                      onClick={() => setIsAddingCategory(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Abbrechen
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Kategoriename *</label>
                        <input
                          type="text"
                          required
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          placeholder="z.B. PC-Hardware"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Badge / Untertitel</label>
                        <input
                          type="text"
                          value={catTagline}
                          onChange={(e) => setCatTagline(e.target.value)}
                          placeholder="z.B. Performance & Server-Hardware"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Icon-Typ</label>
                        <select
                          value={catIconName}
                          onChange={(e) => setCatIconName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                        >
                          <option value="Shield">Schild (Shield)</option>
                          <option value="Eye">Auge (Eye)</option>
                          <option value="RotateCw">Drehung (RotateCw)</option>
                          <option value="Cpu">Prozessor (Cpu)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Vorschaubild (Bild-URL oder Upload)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={catImage}
                            onChange={(e) => setCatImage(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E] font-mono"
                          />
                          <label className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0">
                            <Upload className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Bild</span>
                            <input type="file" accept="image/*" onChange={handleUploadCategoryImg} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Beschreibung *</label>
                      <textarea
                        required
                        rows={2}
                        value={catDesc}
                        onChange={(e) => setCatDesc(e.target.value)}
                        placeholder="Kurze Beschreibung der Kategorie..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E]"
                      />
                    </div>

                    {catImage && (
                      <div className="w-32 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 relative">
                        <img src={catImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="px-4 py-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#FF5E2E]/20 cursor-pointer"
                      >
                        Kategorie speichern
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories Grid Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase bg-slate-900/50">
                        <th className="py-3.5 px-6">Bild & Name</th>
                        <th className="py-3.5 px-6">Tagline / Badge</th>
                        <th className="py-3.5 px-6">Beschreibung</th>
                        <th className="py-3.5 px-6 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{c.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-blue-950 text-blue-400 border border-blue-950 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono">
                              {c.tagline}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                            {c.description}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditCategory(c)}
                                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: FIREBASE STORAGE */}
          {activeTab === "storage" && (
            <div className="space-y-6 animate-fadeIn pb-12">
              {/* Full Shop Backup & Sync Card (Bypasses Quota Limits for Hostinger / Other Devices) */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-cyan-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white font-display">
                        Komplettes Shop-Backup & Geräte-Sync (JSON)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Exportieren Sie alle Blog-Artikel, Produkte, Kategorien und Einstellungen in eine JSON-Datei, um sie auf anderen Geräten oder Ihrer Hostinger-Domain (it-market.at) zu importieren.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    100% Zuverlässig (Quota-Unabhängig)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={handleExportFullShop}
                    className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left"
                  >
                    <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Backup Herunterladen</span>
                      <span className="text-[10px] text-slate-400">Speichert alle Daten (inkl. neuer Blog-Artikel) als JSON</span>
                    </div>
                  </button>

                  <label className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Backup Einspielen / Hochladen</span>
                      <span className="text-[10px] text-slate-400">Importiert JSON-Datei auf dieser Domain (Hostinger)</span>
                    </div>
                    <input 
                      type="file" 
                      accept=".json" 
                      ref={fullShopFileInputRef}
                      onChange={handleImportFullShop} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Custom Firebase Project Configuration for Unlimited Quota / Realtime */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white font-display">
                        Echtes Live-Realtime für alle Internet-Besucher (Eigenes Firebase-Projekt)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Um die Quota-Limits des Standard-Sandboxes zu umgehen und weltweites Realtime für alle Besucher auf <strong className="text-indigo-300">it-market.at</strong> zu ermöglichen, können Sie hier Ihre eigene <code className="text-cyan-400">firebaseConfig</code> eintragen.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomFirebase(!showCustomFirebase)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {showCustomFirebase ? "Ausblenden" : "Eigenes Firebase verbinden"}
                  </button>
                </div>

                {showCustomFirebase && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                      <p className="font-bold text-indigo-300">So erhalten Sie Ihre eigene Firebase-Konfiguration (kostenlos & unbegrenzt):</p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                        <li>Gehen Sie zu <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">console.firebase.google.com</a> und erstellen Sie ein neues Projekt.</li>
                        <li>Fügen Sie eine Web-App hinzu und kopieren Sie das <code className="text-amber-400">firebaseConfig</code> Objekt.</li>
                        <li>Fügen Sie das JSON hier ein und klicken Sie auf Speichern.</li>
                      </ol>
                    </div>

                    <textarea
                      value={customFirebaseJson}
                      onChange={(e) => setCustomFirebaseJson(e.target.value)}
                      placeholder={'{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "...",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}'}
                      rows={6}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none"
                    />

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleSaveCustomFirebase}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Speichern & Neu Laden
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <FirebaseStorageManager
                onSelectUrlForLogo={(url) => {
                  setCurrentLogoUrl(url);
                  if (onUpdateLogoImage) onUpdateLogoImage(url);
                  alert("URL wurde als neues Logo übernommen!");
                }}
                onSelectUrlForHeroVideo={(url) => {
                  alert(`URL wurde kopiert: ${url}\nSie können diese in den Hero-Einstellungen einfügen.`);
                }}
              />
            </div>
          )}
          {activeTab === "logo" && (
            <div className="space-y-6 animate-fadeIn pb-12">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-extrabold text-white font-display">
                    Logo & Branding verwalten
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Laden Sie Ihr eigenes Firmenlogo hoch oder hinterlegen Sie eine Bild-URL. Das Logo wird automatisch in der Header-Navigation und im Footer angezeigt.
                </p>

                <form onSubmit={handleSaveLogo} className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">Logo Bild-URL oder Upload</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentLogoUrl}
                        onChange={(e) => setCurrentLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E] font-mono"
                      />
                      <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Datei hochladen</span>
                        <input type="file" accept="image/*" onChange={handleUploadLogoFile} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("storage")}
                        className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0"
                      >
                        <HardDrive className="w-4 h-4" />
                        <span>Firebase Storage</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vorschau (Hell & Dunkel):</span>
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-bold">Header (Hell):</span>
                        {currentLogoUrl ? (
                          <img src={currentLogoUrl} alt="Logo Preview" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Kein Logo (Standard-Emblem)</span>
                        )}
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 shadow-sm flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">Footer (Dunkel):</span>
                        {currentLogoUrl ? (
                          <img src={currentLogoUrl} alt="Logo Preview" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xs text-slate-500 italic">Kein Logo (Standard-Emblem)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#FF5E2E] hover:bg-[#e04e22] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#FF5E2E]/20 cursor-pointer"
                    >
                      Logo speichern
                    </button>
                    {currentLogoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentLogoUrl("");
                          if (onUpdateLogoImage) onUpdateLogoImage("");
                        }}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Logo zurücksetzen
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Admin Access PIN Settings */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-extrabold text-white font-display">
                    Admin-Sicherheit & Zugriffs-PIN
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Schützen Sie Ihr Admin-Interface bei der Bereitstellung über Hostinger oder andere Webhoster mit einem individuellen PIN / Passwort.
                </p>

                <form onSubmit={handleChangePin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">Neuer Admin PIN / Passwort</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Z.B. 8972 oder MeinGeheimerPin2026"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E2E] font-mono"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        PIN Ändern
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Aktueller PIN im System hinterlegt. Standard bei Erstnutzung: <code className="bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded font-mono">1234</code>
                  </p>
                </form>
              </div>

              {/* Zwei-Faktor-Authentifizierung (2FA / TOTP) */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-extrabold text-white font-display">
                    Zwei-Faktor-Authentifizierung (2FA)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Zusätzlicher Schutz: Nach dem Passwort wird ein 6-stelliger Code aus deiner Authenticator-App (z. B. Google Authenticator) verlangt. Pro Admin-Konto einmal einrichten.
                </p>

                {!firebaseUser ? (
                  <p className="text-xs text-amber-400">Bitte zuerst per Firebase (E-Mail/Passwort) anmelden, um 2FA einzurichten.</p>
                ) : mfaEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" /> 2FA ist für dieses Konto aktiv
                    </div>
                    <button
                      onClick={handleDisableMfa}
                      disabled={mfaBusy}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                    >
                      2FA deaktivieren
                    </button>
                  </div>
                ) : totpSecret ? (
                  <form onSubmit={handleFinishEnroll} className="space-y-4">
                    <p className="text-xs text-slate-300"><strong>1.</strong> QR-Code mit der Authenticator-App scannen (oder Schlüssel manuell eingeben):</p>
                    {qrDataUrl && <img src={qrDataUrl} alt="2FA QR-Code" className="w-44 h-44 bg-white p-2 rounded-xl" />}
                    {totpSecret.secretKey && (
                      <div className="text-[11px] text-slate-400">Manueller Schlüssel: <code className="bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded font-mono break-all">{totpSecret.secretKey}</code></div>
                    )}
                    <p className="text-xs text-slate-300"><strong>2.</strong> Aktuellen 6-stelligen Code aus der App eingeben:</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={enrollCode}
                      onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full max-w-[220px] bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-center font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={mfaBusy} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {mfaBusy && <RefreshCw className="w-4 h-4 animate-spin" />} 2FA aktivieren
                      </button>
                      <button type="button" onClick={() => { setTotpSecret(null); setTotpUri(""); setQrDataUrl(""); setEnrollCode(""); }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer">
                        Abbrechen
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={handleStartEnroll}
                    disabled={mfaBusy}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  >
                    {mfaBusy && <RefreshCw className="w-4 h-4 animate-spin" />}
                    2FA einrichten
                  </button>
                )}

                {mfaMsg && <p className="text-xs text-slate-300 mt-3 leading-relaxed">{mfaMsg}</p>}
              </div>

              {/* GitHub-Repository */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="w-5 h-5 text-sky-400" />
                  <h3 className="text-lg font-extrabold text-white font-display">
                    GitHub-Repository
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Quellcode der Website und automatischer Deploy. Ein Push auf <code className="bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded font-mono">main</code> wird gebaut und automatisch auf Hostinger veröffentlicht.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://github.com/arettenegger/it-market"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Repository öffnen</span>
                  </a>
                  <a
                    href="https://github.com/arettenegger/it-market/actions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Deploy-Status (Actions)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* IMPORT PREVIEW MODAL */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <FileUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-display">
                      Produkt-Import Vorschau
                    </h3>
                    <p className="text-xs text-slate-400">
                      {importedPreviewProducts.length} Produkte in der Datei gefunden
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportedPreviewProducts([]);
                  }}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                
                {/* Import Strategy Options */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Import-Methode wählen:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label 
                      onClick={() => setImportMode("merge")}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        importMode === "merge" 
                          ? "bg-[#FF5E2E]/10 border-[#FF5E2E] text-white" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === "merge"} 
                        onChange={() => setImportMode("merge")}
                        className="mt-1 text-[#FF5E2E] focus:ring-0" 
                      />
                      <div>
                        <span className="text-xs font-bold block text-white">Bestehende ergänzen / aktualisieren (Empfohlen)</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Aktualisiert existierende Produkte anhand der ID und fügt neue hinzu.
                        </span>
                      </div>
                    </label>

                    <label 
                      onClick={() => setImportMode("replace")}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        importMode === "replace" 
                          ? "bg-rose-500/10 border-rose-500 text-white" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === "replace"} 
                        onChange={() => setImportMode("replace")}
                        className="mt-1 text-rose-500 focus:ring-0" 
                      />
                      <div>
                        <span className="text-xs font-bold block text-rose-300">Alle bestehenden Produkte ersetzen</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Löscht den bisherigen Katalog vollständig und ersetzt ihn durch die Importdatei.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Sample Download Prompt */}
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Format-Hilfe: Sie können eine CSV-Musterdatei als Vorlage herunterladen.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-bold underline shrink-0 cursor-pointer"
                  >
                    CSV-Vorlage laden
                  </button>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Erkannte Produkte ({importedPreviewProducts.length})</span>
                    <span>Preis</span>
                  </div>
                  <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                    {importedPreviewProducts.map((p, idx) => (
                      <div key={p.id || idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/40 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-200 truncate">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{p.category}</span>
                            <span className="font-mono text-slate-500">ID: {p.id}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-emerald-400 font-mono">{p.price.toFixed(2)} €</p>
                          {p.oldPrice && p.oldPrice > p.price && (
                            <p className="line-through text-[10px] text-slate-500 font-mono">{p.oldPrice.toFixed(2)} €</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportedPreviewProducts([]);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Abbrechen
                </button>

                <button
                  type="button"
                  onClick={handleConfirmProductImport}
                  disabled={isImportingToStorage}
                  className="px-5 py-2.5 bg-[#FF5E2E] hover:bg-[#ff7347] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FF5E2E]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isImportingToStorage ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importiere & lade Bilder hoch…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Jetzt {importedPreviewProducts.length} Produkte importieren</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
