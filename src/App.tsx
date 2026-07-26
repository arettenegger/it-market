import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Bestsellers from "./components/Bestsellers";
import WhyUs from "./components/WhyUs";
import Brands from "./components/Brands";
import Applications from "./components/Applications";
import NvrHighlight from "./components/NvrHighlight";
import Reviews from "./components/Reviews";
import Faq from "./components/Faq";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Configurator from "./components/Configurator";
import CallbackModal from "./components/CallbackModal";
import AdminPanel from "./components/AdminPanel";
import BlogSection from "./components/BlogSection";
import BlogTeaser from "./components/BlogTeaser";
import CategoryPage from "./components/CategoryPage";
import ImpressumModal from "./components/ImpressumModal";
import DatenschutzModal from "./components/DatenschutzModal";
import AboutUsModal from "./components/AboutUsModal";
import ContactPage from "./components/ContactPage";
import { Product, CartItem, BlogPost, ConfiguratorData, Review, Category, formatPrice } from "./types";
import { PRODUCTS, INITIAL_BLOG_POSTS, DEFAULT_CONFIGURATOR_DATA, REVIEWS, CATEGORIES } from "./data";
import { SHOP_DOC_REF, HERO_DOC_REF, CONFIG_DOC_REF, CATEGORY_DOC_REF, PRODUCT_DOC_REF, BLOG_DOC_REF, REVIEW_DOC_REF, LOGO_DOC_REF } from "./lib/firebase";
import { setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { ShoppingBag, ChevronRight, Shield, Check, Settings, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { confirmDoubleOptIn } from "./lib/newsletterService";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "blog" | "category" | "impressum" | "datenschutz" | "about" | "kontakt">("home");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("pc-hardware");
  const [callbackTopic, setCallbackTopic] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>(DEFAULT_CONFIGURATOR_DATA);
  const [logoImage, setLogoImage] = useState<string>("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [heroImages, setHeroImages] = useState<Record<string, string>>(() => {
    const defaults = {
      kameras: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1920",
      smarthome: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1920",
      nas: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1920",
      netzwerk: "/netzwerk-hero-section.jpg"
    };
    const saved = localStorage.getItem("bewacht_vernetzt_hero_images");
    if (saved) {
      try { return { ...defaults, ...JSON.parse(saved) }; } catch (e) {}
    }
    return defaults;
  });

  const [heroVideos, setHeroVideos] = useState<Record<string, string>>(() => {
    const defaults = {
      smarthome: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4"
    };
    const saved = localStorage.getItem("bewacht_vernetzt_hero_videos");
    if (saved) {
      try { return { ...defaults, ...JSON.parse(saved) }; } catch (e) {}
    }
    return defaults;
  });

  const [doiConfirmedInfo, setDoiConfirmedInfo] = useState<{ email: string; message: string } | null>(null);

  // Initialize and persist state with localStorage
  useEffect(() => {
    // Check for Double Opt-In confirmation URL parameter (?confirm_newsletter=<token>&email=<email>)
    const urlParams = new URLSearchParams(window.location.search);
    const confirmToken = urlParams.get("confirm_newsletter") || urlParams.get("doi_token");
    const confirmEmail = urlParams.get("email");

    if (confirmToken) {
      confirmDoubleOptIn(confirmToken, confirmEmail || undefined)
        .then((res) => {
          setDoiConfirmedInfo({
            email: res.email,
            message: res.message
          });
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        })
        .catch((err) => {
          console.error("DOI confirmation error:", err);
        });
    }

    // Check if URL has #admin or ?admin=1 for easy access on static hosting like Hostinger
    if (window.location.hash === "#admin" || window.location.search.includes("admin")) {
      setIsAdminOpen(true);
    }

    // Keyboard shortcut Ctrl + Shift + A to open admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) {
      return "";
    }
    if (obj === null) {
      return null;
    }
    if (typeof obj === 'string') {
      if (obj.startsWith('data:') && obj.length > 800000) {
        return "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800";
      }
      return obj;
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeForFirestore(item));
    }
    const cleanObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleanObj[key] = sanitizeForFirestore(val);
      }
    }
    return cleanObj;
  };

  const syncToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(SHOP_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/main_config");
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("bewacht_vernetzt_cart");
    const savedWishlist = localStorage.getItem("bewacht_vernetzt_wishlist");
    const savedProducts = localStorage.getItem("bewacht_vernetzt_products");
    const savedBlog = localStorage.getItem("bewacht_vernetzt_blog");
    const savedReviews = localStorage.getItem("bewacht_vernetzt_reviews");
    const savedCategories = localStorage.getItem("bewacht_vernetzt_categories");
    const savedConfig = localStorage.getItem("bewacht_vernetzt_configurator");
    const savedLogo = localStorage.getItem("bewacht_vernetzt_logo_image");
    const savedHeroImages = localStorage.getItem("bewacht_vernetzt_hero_images");
    const savedHeroVideos = localStorage.getItem("bewacht_vernetzt_hero_videos");

    if (savedLogo) {
      setLogoImage(savedLogo);
    }
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error reading cart", e);
      }
    }
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error reading wishlist", e);
      }
    }
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Error reading products", e);
        setProducts(PRODUCTS);
      }
    } else {
      setProducts(PRODUCTS);
    }

    if (savedBlog) {
      try {
        setBlogPosts(JSON.parse(savedBlog));
      } catch (e) {
        console.error("Error reading blog posts", e);
        setBlogPosts(INITIAL_BLOG_POSTS);
      }
    } else {
      setBlogPosts(INITIAL_BLOG_POSTS);
    }

    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Error reading reviews", e);
        setReviews(REVIEWS);
      }
    } else {
      setReviews(REVIEWS);
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error("Error reading categories", e);
        setCategories(CATEGORIES);
      }
    } else {
      setCategories(CATEGORIES);
    }

    if (savedConfig) {
      try {
        setConfiguratorData(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error reading configurator data", e);
        setConfiguratorData(DEFAULT_CONFIGURATOR_DATA);
      }
    } else {
      setConfiguratorData(DEFAULT_CONFIGURATOR_DATA);
    }

    // Fetch product config from dedicated Firestore document
    getDoc(PRODUCT_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.products) {
          setProducts(data.products);
          try {
            localStorage.setItem("bewacht_vernetzt_products", JSON.stringify(data.products));
          } catch (e) {}
        }
      } else {
        const initialProductPayload = {
          products: savedProducts ? JSON.parse(savedProducts) : PRODUCTS
        };
        setDoc(PRODUCT_DOC_REF, initialProductPayload, { merge: true }).catch((err) => {
          console.error("Firestore product initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore product initial fetch warning:", err);
    });

    // Fetch blog config from dedicated Firestore document
    getDoc(BLOG_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.blogPosts) {
          setBlogPosts(data.blogPosts);
          try {
            localStorage.setItem("bewacht_vernetzt_blog", JSON.stringify(data.blogPosts));
          } catch (e) {}
        }
      } else {
        const initialBlogPayload = {
          blogPosts: savedBlog ? JSON.parse(savedBlog) : INITIAL_BLOG_POSTS
        };
        setDoc(BLOG_DOC_REF, initialBlogPayload, { merge: true }).catch((err) => {
          console.error("Firestore blog initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore blog initial fetch warning:", err);
    });

    // Fetch review config from dedicated Firestore document
    getDoc(REVIEW_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.reviews) {
          setReviews(data.reviews);
          try {
            localStorage.setItem("bewacht_vernetzt_reviews", JSON.stringify(data.reviews));
          } catch (e) {}
        }
      } else {
        const initialReviewPayload = {
          reviews: savedReviews ? JSON.parse(savedReviews) : REVIEWS
        };
        setDoc(REVIEW_DOC_REF, initialReviewPayload, { merge: true }).catch((err) => {
          console.error("Firestore review initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore review initial fetch warning:", err);
    });

    // Fetch logo config from dedicated Firestore document
    getDoc(LOGO_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logoImage !== undefined) {
          setLogoImage(data.logoImage);
          try {
            localStorage.setItem("bewacht_vernetzt_logo_image", data.logoImage);
          } catch (e) {}
        }
      } else {
        const initialLogoPayload = {
          logoImage: savedLogo || ""
        };
        setDoc(LOGO_DOC_REF, initialLogoPayload, { merge: true }).catch((err) => {
          console.error("Firestore logo initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore logo initial fetch warning:", err);
    });

    // Fetch hero config from dedicated Firestore document
    getDoc(HERO_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.heroImages) {
          setHeroImages(data.heroImages);
          try {
            localStorage.setItem("bewacht_vernetzt_hero_images", JSON.stringify(data.heroImages));
          } catch (e) {}
        }
        if (data.heroVideos) {
          setHeroVideos(data.heroVideos);
          try {
            localStorage.setItem("bewacht_vernetzt_hero_videos", JSON.stringify(data.heroVideos));
          } catch (e) {}
        }
      } else {
        const initialHeroPayload = {
          heroImages: savedHeroImages ? JSON.parse(savedHeroImages) : heroImages,
          heroVideos: savedHeroVideos ? JSON.parse(savedHeroVideos) : heroVideos
        };
        setDoc(HERO_DOC_REF, initialHeroPayload, { merge: true }).catch((err) => {
          console.error("Firestore hero initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore hero initial fetch warning:", err);
    });

    // Fetch configurator config from dedicated Firestore document
    getDoc(CONFIG_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.configuratorData) {
          setConfiguratorData(data.configuratorData);
          try {
            localStorage.setItem("bewacht_vernetzt_configurator", JSON.stringify(data.configuratorData));
          } catch (e) {}
        }
      } else {
        const initialConfigPayload = {
          configuratorData: savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIGURATOR_DATA
        };
        setDoc(CONFIG_DOC_REF, initialConfigPayload, { merge: true }).catch((err) => {
          console.error("Firestore config initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore config initial fetch warning:", err);
    });

    // Fetch category config from dedicated Firestore document
    getDoc(CATEGORY_DOC_REF).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.categories) {
          setCategories(data.categories);
          try {
            localStorage.setItem("bewacht_vernetzt_categories", JSON.stringify(data.categories));
          } catch (e) {}
        }
      } else {
        const initialCategoryPayload = {
          categories: savedCategories ? JSON.parse(savedCategories) : CATEGORIES
        };
        setDoc(CATEGORY_DOC_REF, initialCategoryPayload, { merge: true }).catch((err) => {
          console.error("Firestore category initial seed error:", err);
        });
      }
    }).catch((err) => {
      console.warn("Firestore category initial fetch warning:", err);
    });

    // Real-time synchronization across multiple devices via Firestore
    const unsubscribeProduct = onSnapshot(PRODUCT_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.products) {
          setProducts(data.products);
          try {
            localStorage.setItem("bewacht_vernetzt_products", JSON.stringify(data.products));
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore product sync warning:", err);
    });

    const unsubscribeBlog = onSnapshot(BLOG_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.blogPosts) {
          setBlogPosts(data.blogPosts);
          try {
            localStorage.setItem("bewacht_vernetzt_blog", JSON.stringify(data.blogPosts));
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore blog sync warning:", err);
    });

    const unsubscribeReview = onSnapshot(REVIEW_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.reviews) {
          setReviews(data.reviews);
          try {
            localStorage.setItem("bewacht_vernetzt_reviews", JSON.stringify(data.reviews));
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore review sync warning:", err);
    });

    const unsubscribeLogo = onSnapshot(LOGO_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logoImage !== undefined) {
          setLogoImage(data.logoImage);
          try {
            localStorage.setItem("bewacht_vernetzt_logo_image", data.logoImage);
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore logo sync warning:", err);
    });

    const unsubscribeHero = onSnapshot(HERO_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.heroImages) {
          setHeroImages(data.heroImages);
          try {
            localStorage.setItem("bewacht_vernetzt_hero_images", JSON.stringify(data.heroImages));
          } catch (e) {}
        }
        if (data.heroVideos) {
          setHeroVideos(data.heroVideos);
          try {
            localStorage.setItem("bewacht_vernetzt_hero_videos", JSON.stringify(data.heroVideos));
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore hero sync warning:", err);
    });

    const unsubscribeConfig = onSnapshot(CONFIG_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.configuratorData) {
          setConfiguratorData(data.configuratorData);
          try {
            localStorage.setItem("bewacht_vernetzt_configurator", JSON.stringify(data.configuratorData));
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore config sync warning:", err);
    });

    const unsubscribeCategory = onSnapshot(CATEGORY_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.categories) {
          setCategories(data.categories);
          try {
            localStorage.setItem("bewacht_vernetzt_categories", JSON.stringify(data.categories));
          } catch (e) {}
        }
      }
    }, (err) => {
      console.warn("Firestore category sync warning:", err);
    });

    return () => {
      unsubscribeProduct();
      unsubscribeBlog();
      unsubscribeReview();
      unsubscribeLogo();
      unsubscribeHero();
      unsubscribeConfig();
      unsubscribeCategory();
    };
  }, []);

  const syncProductToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(PRODUCT_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/product_config");
    }
  };

  const syncBlogToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(BLOG_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/blog_config");
    }
  };

  const syncReviewToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(REVIEW_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/review_config");
    }
  };

  const syncLogoToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(LOGO_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/logo_config");
    }
  };

  const syncHeroToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(HERO_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/hero_config");
    }
  };

  const syncConfigToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(CONFIG_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/configurator_config");
    }
  };

  const syncCategoryToFirestore = async (newData: Record<string, any>) => {
    try {
      const cleanData = sanitizeForFirestore(newData);
      await setDoc(CATEGORY_DOC_REF, cleanData, { merge: true });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "shop_data/category_config");
    }
  };

  const handleUpdateHeroImages = (updated: Record<string, string>) => {
    setHeroImages(updated);
    try {
      localStorage.setItem("bewacht_vernetzt_hero_images", JSON.stringify(updated));
    } catch (e) {}
    syncHeroToFirestore({ heroImages: updated });
    triggerToast("Hero-Bilder aktualisiert & synchronisiert!");
  };

  const handleUpdateHeroVideos = (updated: Record<string, string>) => {
    setHeroVideos(updated);
    try {
      localStorage.setItem("bewacht_vernetzt_hero_videos", JSON.stringify(updated));
    } catch (e) {}
    syncHeroToFirestore({ heroVideos: updated });
    triggerToast("Hero-Videos aktualisiert & synchronisiert!");
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem("bewacht_vernetzt_products", JSON.stringify(updatedProducts));
    } catch (e) {}
    syncProductToFirestore({ products: updatedProducts });
    triggerToast("Produktkatalog aktualisiert & synchronisiert!");
  };

  const handleUpdateBlogPosts = (updatedPosts: BlogPost[]) => {
    setBlogPosts(updatedPosts);
    try {
      localStorage.setItem("bewacht_vernetzt_blog", JSON.stringify(updatedPosts));
    } catch (e) {}
    syncBlogToFirestore({ blogPosts: updatedPosts });
    triggerToast("Blogartikel synchronisiert!");
  };

  const handleUpdateReviews = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
    try {
      localStorage.setItem("bewacht_vernetzt_reviews", JSON.stringify(updatedReviews));
    } catch (e) {}
    syncReviewToFirestore({ reviews: updatedReviews });
    triggerToast("Kundenstimmen synchronisiert!");
  };

  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    try {
      localStorage.setItem("bewacht_vernetzt_categories", JSON.stringify(updatedCategories));
    } catch (e) {}
    syncCategoryToFirestore({ categories: updatedCategories });
    triggerToast("Kategorien synchronisiert!");
  };

  const handleUpdateConfiguratorData = (updatedConfig: ConfiguratorData) => {
    setConfiguratorData(updatedConfig);
    try {
      localStorage.setItem("bewacht_vernetzt_configurator", JSON.stringify(updatedConfig));
    } catch (err) {}
    syncConfigToFirestore({ configuratorData: updatedConfig });
    triggerToast("Konfiguration synchronisiert!");
  };

  const handleUpdateLogoImage = (url: string) => {
    setLogoImage(url);
    try {
      localStorage.setItem("bewacht_vernetzt_logo_image", url);
    } catch (e) {}
    syncLogoToFirestore({ logoImage: url });
    triggerToast("Logo Branding synchronisiert!");
  };

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    try {
      localStorage.setItem("bewacht_vernetzt_cart", JSON.stringify(updatedCart));
    } catch (e) {}
  };

  const saveWishlistToStorage = (updatedWishlist: string[]) => {
    try {
      localStorage.setItem("bewacht_vernetzt_wishlist", JSON.stringify(updatedWishlist));
    } catch (e) {}
  };

  // Add to cart helper
  const handleAddToCart = (product: Product, colorOrQuantity?: string | number) => {
    const chosenColor = typeof colorOrQuantity === "string" 
      ? colorOrQuantity 
      : ((product.colors && product.colors[0]) || "Standard");
    const quantityToAdd = typeof colorOrQuantity === "number" ? colorOrQuantity : 1;

    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.product.id === product.id && item.selectedColor === chosenColor
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantityToAdd;
    } else {
      updatedCart.push({
        product,
        quantity: quantityToAdd,
        selectedColor: chosenColor
      });
    }

    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    triggerToast(`${product.name} im Warenkorb!`);
  };

  // Update cart quantity
  const handleUpdateQuantity = (productId: string, change: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + change;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  // Remove single item from cart
  const handleRemoveItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    triggerToast("Artikel entfernt.");
  };

  // Clear cart completely upon checkout success
  const handleClearCart = () => {
    setCart([]);
    saveCartToStorage([]);
  };

  // Toggle wishlist item
  const handleToggleWishlist = (id: string) => {
    let updatedWishlist = [...wishlist];
    const index = updatedWishlist.indexOf(id);
    const prod = products.find((p) => p.id === id);

    if (index > -1) {
      updatedWishlist.splice(index, 1);
      triggerToast(`${prod?.name || "Kamera"} von Wunschliste entfernt.`);
    } else {
      updatedWishlist.push(id);
      triggerToast(`${prod?.name || "Kamera"} auf Wunschliste gemerkt!`);
    }

    setWishlist(updatedWishlist);
    saveWishlistToStorage(updatedWishlist);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Category selection navigation logic
  const getCategoryId = (name: string): string => {
    const norm = name.toLowerCase();
    if (norm.includes("hardware") || norm.includes("pc")) return "pc-hardware";
    if (norm.includes("netzwerk")) return "netzwerke";
    if (norm.includes("hotspot")) return "hotspot";
    if (norm.includes("nas")) return "nas";
    if (norm.includes("kamera")) return "kameras";
    if (norm.includes("smart")) return "smarthome";
    return "pc-hardware";
  };

  const handleSelectCategory = (catName: string) => {
    const catId = getCategoryId(catName);
    setActiveCategoryId(catId);
    setSelectedCategory(catName);
    setCurrentPage("category");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCallbackWithTopic = (topicMsg?: string) => {
    if (topicMsg) {
      setCallbackTopic(topicMsg);
    }
    setIsCallbackOpen(true);
  };

  // Page navigation logic
  const handleNavigatePage = (page: "home" | "blog" | "category" | "impressum" | "datenschutz" | "about" | "kontakt", sectionId?: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (page === "home" && sectionId && sectionId !== "hero") {
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 150);
    }
  };

  // Smooth scroll logic to anchor targets
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600/10 selection:text-blue-600 flex flex-col justify-between">
      
      {/* Sticky Header with integrated Search, Cart and Callback triggers */}
      <Header
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onAddToCart={handleAddToCart}
        scrollToSection={scrollToSection}
        onOpenCallback={() => handleOpenCallbackWithTopic()}
        products={products}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentPage={currentPage}
        onNavigatePage={handleNavigatePage}
        onSelectCategory={handleSelectCategory}
        selectedCategory={selectedCategory}
        logoImage={logoImage}
      />

      {/* Main Page Content */}
      <main className="flex-grow">
        {currentPage === "category" ? (
          <CategoryPage
            categoryId={activeCategoryId}
            products={products}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBackToHome={() => handleNavigatePage("home")}
            onOpenCallback={handleOpenCallbackWithTopic}
            onSelectCategory={handleSelectCategory}
            configuratorData={configuratorData}
          />
        ) : currentPage === "impressum" ? (
          <ImpressumModal onBackToHome={() => handleNavigatePage("home")} />
        ) : currentPage === "datenschutz" ? (
          <DatenschutzModal onBackToHome={() => handleNavigatePage("home")} />
        ) : currentPage === "about" ? (
          <AboutUsModal onBackToHome={() => handleNavigatePage("home")} onOpenCallback={() => handleOpenCallbackWithTopic("Über uns - Beratung")} />
        ) : currentPage === "kontakt" ? (
          <ContactPage onBackToHome={() => handleNavigatePage("home")} onOpenCallback={() => handleOpenCallbackWithTopic("Kontaktseite - Beratung")} />
        ) : currentPage === "home" ? (
          <>
            {/* Hero Banner with live stateful simulator */}
            <Hero
              heroImages={heroImages}
              heroVideos={heroVideos}
              onUpdateHeroImages={handleUpdateHeroImages}
              onUpdateHeroVideos={handleUpdateHeroVideos}
              onDiscoverClick={() => scrollToSection("kategorien")}
              onOpenCallback={() => handleOpenCallbackWithTopic()}
              onSelectCategory={handleSelectCategory}
              scrollToSection={scrollToSection}
            />

            {/* Categories Section with vector illustrations */}
            <Categories
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              categories={categories}
            />

            {/* Smart Interactive Kamera-Konfigurator (conversion asset) */}
            <Configurator onAddToCart={handleAddToCart} />

            {/* Dynamic Bestsellers list */}
            <Bestsellers
              products={products}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              selectedCategory={selectedCategory}
            />

            {/* Why Us section explaining features with high trust */}
            <WhyUs />

            {/* Brand partners endless logoband + advantages trust row */}
            <Brands />

            {/* Areas of application grid containing safety tips */}
            <Applications />

            {/* Highlight Komplettsystem packages selector */}
            <NvrHighlight 
              onAddToCart={handleAddToCart} 
              scrollToBestsellers={() => scrollToSection("bestseller")}
            />

            {/* Slideable customer reviews list */}
            <Reviews reviews={reviews} />

            {/* Blog Teaser Section on Homepage linking to full page */}
            <BlogTeaser 
              blogPosts={blogPosts}
              onOpenBlogPage={() => handleNavigatePage("blog")}
            />

            {/* FAQ Accordion list */}
            <Faq />

            {/* High-converting Newsletter CTA with input verification */}
            <Newsletter />
          </>
        ) : (
          <>
            {/* Dedicated Standalone Blog Page */}
            <BlogSection 
              blogPosts={blogPosts} 
              onOpenCallback={() => handleOpenCallbackWithTopic()}
              onBackToHome={() => handleNavigatePage("home")}
            />

            {/* High-converting Newsletter CTA */}
            <Newsletter />
          </>
        )}
      </main>

      {/* Solid footer links columns */}
      <Footer 
        scrollToSection={scrollToSection} 
        onNavigatePage={handleNavigatePage} 
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenImpressum={() => handleNavigatePage("impressum")}
        onOpenDatenschutz={() => handleNavigatePage("datenschutz")}
        onOpenAbout={() => handleNavigatePage("about")}
        onOpenKontakt={() => handleNavigatePage("kontakt")}
        logoImage={logoImage}
      />

      {/* Slideable Checkout / Cart drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Consultant callback form pop-up */}
      <CallbackModal
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        initialTopic={callbackTopic}
      />

      {/* Admin Panel Overlay Dashboard */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={handleUpdateProducts}
        blogPosts={blogPosts}
        onUpdateBlogPosts={handleUpdateBlogPosts}
        reviews={reviews}
        onUpdateReviews={handleUpdateReviews}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        configuratorData={configuratorData}
        onUpdateConfiguratorData={handleUpdateConfiguratorData}
        logoImage={logoImage}
        onUpdateLogoImage={handleUpdateLogoImage}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Sticky Bottom Mobile Cart Floating Bar */}
      {cartTotalItems > 0 && (
        <div className="xl:hidden fixed bottom-6 left-4 right-4 bg-slate-950/95 backdrop-blur-md text-white py-3.5 px-4 rounded-2xl shadow-2xl border border-white/10 z-30 flex items-center justify-between animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartTotalItems}
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Mein Warenkorb</span>
              <span className="text-sm font-extrabold font-mono mt-1 text-blue-400">{formatPrice(cartTotalPrice)} €</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-blue-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            Ansehen
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Admin Button for Hostinger / Static Deployments */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-6 left-6 z-30 bg-slate-900 text-white hover:bg-slate-800 p-3.5 rounded-full shadow-2xl border border-slate-700 flex items-center justify-center group cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Admin-Bereich öffnen (Ctrl+Shift+A)"
        aria-label="Admin Panel öffnen"
      >
        <Settings className="w-5 h-5 text-orange-400 group-hover:rotate-45 transition-transform" />
      </button>

      {/* Double Opt-In Confirmation Modal */}
      {doiConfirmedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Double Opt-In Erfolgreich</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display">
              E-Mail-Adresse verifiziert!
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ihre E-Mail-Adresse <strong className="text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{doiConfirmedInfo.email}</strong> wurde im DSGVO-konformen Double-Opt-In-Verfahren verifiziert.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              Ihre Anmeldung wurde ordnungsgemäß in unserer Firestore-Datenbank aktiviert. Ab sofort erhalten Sie exklusive Angebote und Sicherheits-Tipps.
            </div>

            <button
              onClick={() => setDoiConfirmedInfo(null)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Verstanden & schließen
            </button>
          </div>
        </div>
      )}

      {/* Mini Applet Float Toast Alerts */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-900 text-white py-3 px-5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
