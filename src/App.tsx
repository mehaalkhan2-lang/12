/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bottle3D } from "./components/Bottle3D";
import { motion, AnimatePresence, Variants, useScroll, useTransform } from "motion/react";
import { Droplet, Sparkles, Sprout, ShieldCheck, Zap, Scissors, Leaf, Asterisk, ChevronRight, MessageSquare, HelpCircle, User, Calendar, Quote, X, MapPin, Phone, Package, CheckCircle2, Lock, LogOut, MessageCircle, Star, MoreHorizontal, Twitter, Facebook, Instagram, Share2, Send, Cpu, Bot, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { auth, loginWithGoogle, createOrder, db, checkIfAdmin, createReview, logEvent, deleteOrder } from "./lib/firebase";
import { getAIConciergeResponse } from "./lib/ai";
import ReactMarkdown from 'react-markdown';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, limit } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

const ingredients = [
  { 
    name: "Rosemary", 
    role: "Growth & Anti-Fall", 
    desc: "Blocks DHT pathways to significantly reduce shedding and awaken follicles.",
    insight: "Rosemary extract acts as a natural alternative to Minoxidil, stimulating blood circulation in the scalp and preventing hair follicles from being starved of blood supply.",
    stats: [
      { label: "Bio-Activity", value: 98 },
      { label: "Oxygenation", value: 85 }
    ]
  },
  { 
    name: "Kalwanji", 
    role: "Follicle Strength", 
    desc: "Rich in Nigellone, a potent anti-hair loss compound that anchors roots.",
    insight: "Black Seed oil contains thymoquinone, a powerful antihistamine. It reduces inflammation, a leading cause of thinning, and creates an optimal environment for thick growth.",
    stats: [
      { label: "Purity", value: 94 },
      { label: "Anchoring", value: 96 }
    ]
  },
  { 
    name: "Flax Seeds", 
    role: "Core Vitality", 
    desc: "Rich in Alpha-Linolenic Acid (ALA) to nourish follicles and prevent inflammatory loss.",
    insight: "Flax seeds contain high concentrations of Omega-3 and Vitamin E. These nutrients reinforce the hair shaft's structural integrity, providing a natural antioxidant shield against environmental degradation.",
    stats: [
      { label: "Synthesis", value: 92 },
      { label: "Density", value: 89 }
    ]
  },
];

const totalIngredients = [
  "Pure Coconut Oil",
  "Cold-pressed Almond Oil",
  "Rosemary Essential Extract",
  "Kalwanji Extract (Black Seed)",
  "Organic Flax Seed Oil",
  "Anti-Hair Loss Complex",
  "Vitamin E",
  "Argan Oil",
  "Jojoba Oil",
  "Hibiscus Infusion"
];

const advantages = [
  { title: "Anti-Hair Loss", icon: <ShieldCheck className="w-5 h-5" />, desc: "Formulated with clinical-grade DHT blockers to minimize daily shedding." },
  { title: "Rapid Growth", icon: <Zap className="w-5 h-5" />, desc: "Clinically focuses on extending the anagen phase of hair growth." },
  { title: "Zero Breakage", icon: <Scissors className="w-5 h-5" />, desc: "Strengthens the hair shaft from cortex to cuticle to prevent fallout." },
  { title: "Scalp Health", icon: <Sprout className="w-5 h-5" />, desc: "Eliminates inflammation-driven hair loss at the root level." },
];

const ritualSteps = [
  { step: "01", title: "Activation", desc: "Warm 3-5 drops between palms to activate the cold-pressed essences." },
  { step: "02", title: "Inversion", desc: "Massage into scalp for 5 minutes using the inversion method for maximum blood flow." },
  { step: "03", title: "Synthesis", desc: "Leave for at least 2 hours or overnight to allow deep follicular penetration." },
];

const galleryResults = [
  { label: "Week 04", focus: "Retention", desc: "Significant reduction in terminal hair shedding." },
  { label: "Week 08", focus: "Activation", desc: "New baby hair growth visible in clinical dormant areas." },
  { label: "Week 12", focus: "Density", desc: "Overall hair volume increased by a projected 40%." },
];

const testimonials = [
  { name: "Saira K.", role: "Early Adopter", quote: "The only oil that actually stopped my postpartum hair fall. It feels like liquid gold." },
  { name: "Ahmed R.", role: "VIP Member", quote: "My barber asked what I'm using. My crown area is finally filling back in. Remarkable." },
  { name: "Zawiyaar K.", role: "Elite Patron", quote: "The texture is non-greasy but so potent. It's now my absolute Sunday ritual." },
];

const faqs = [
  { q: "Is it suitable for chemical treated hair?", a: "Yes, X LUXE is free from sulfates and parabens, making it safe for colored or keratin-treated hair." },
  { q: "How quickly can I see results?", a: "Most users notice reduced shedding within 3 weeks. Visible growth usually occurs after 8-10 weeks of consistent use." },
  { q: "Is it effective for genetic hair loss?", a: "X LUXE contains potent DHT blockers like Rosemary and Kalwanji, which are key for managing genetic thinning." },
];

const mockSales = [
  { name: "Fatima S.", location: "Lahore", item: "Essential Grandeur 100ML", time: "2 mins ago" },
  { name: "Zubair A.", location: "Karachi", item: "Standard Reserve 50ML", time: "15 mins ago" },
  { name: "Mariam J.", location: "Islamabad", item: "Essential Grandeur 100ML", time: "1 hour ago" },
  { name: "Hamza D.", location: "Peshawar", item: "Standard Reserve 50ML", time: "5 mins ago" },
  { name: "Ayesha O.", location: "Multan", item: "Essential Grandeur 100ML", time: "32 mins ago" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

export default function App() {
  const { scrollYProgress } = useScroll();
  const [scrollY, setScrollY] = useState(0);
  const [currentSale, setCurrentSale] = useState(0);
  const [showSale, setShowSale] = useState(false);

  useEffect(() => {
    // Show a "Recent Acquisition" notification every 15-20 seconds
    const interval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * mockSales.length);
      setCurrentSale(nextIndex);
      setShowSale(true);
      
      // Hide after 5 seconds
      setTimeout(() => setShowSale(false), 5000);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  // --- NEW STATE FOR COMMERCE ---
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // AI CONCIERGE STATE
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatHistory, setAIChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([
    { 
      role: 'model', 
      parts: [{ text: "Greetings. I am the X LUXE Clinical Concierge. How may I refine your ritual today?" }] 
    }
  ]);
  const [aiInput, setAIInput] = useState("");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const ritualsRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);

  const { scrollYProgress: ritualsProgress } = useScroll({
    target: ritualsRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: benefitsProgress } = useScroll({
    target: benefitsRef,
    offset: ["start end", "end start"]
  });

  const [showAcquisitionPop, setShowAcquisitionPop] = useState(false);
  const [recentAcquisition, setRecentAcquisition] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAdminPortalTrigger, setShowAdminPortalTrigger] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [visitorStats, setVisitorStats] = useState({ totalViews: 0, totalClicks: 0 });

  // Checkout Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: ""
  });

  useEffect(() => {
    document.title = "X LUXE Boutique";
    // Basic hit-counter analytics
    logEvent('view', { page: 'home' });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'sync') {
      setShowAdminPortalTrigger(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminStatus = await checkIfAdmin(user.uid);
        setIsAdmin(adminStatus || user.email === 'mehaalkhan.2@gmail.com');
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Public query restricted to approved reviews by security rules
    const q = query(
      collection(db, "reviews"), 
      where("isApproved", "==", true),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const mockAcquisitions = [
      { name: "Ali R.", city: "Karachi", product: "Essential Grandeur" },
      { name: "Ahmed S.", city: "Lahore", product: "Standard Reserve" },
      { name: "Zainab A.", city: "Islamabad", product: "Essential Grandeur" },
      { name: "Fatima Q.", city: "Faisalabad", product: "Standard Reserve" },
      { name: "Omar H.", city: "Rawalpindi", product: "Essential Grandeur" },
      { name: "Sana M.", city: "Multan", product: "Standard Reserve" }
    ];

    const interval = setInterval(() => {
      const random = mockAcquisitions[Math.floor(Math.random() * mockAcquisitions.length)];
      setRecentAcquisition(random);
      setShowAcquisitionPop(true);
      setTimeout(() => setShowAcquisitionPop(false), 6000);
    }, 43000); // 43 Seconds recurrence
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(orderData);
      });

      // Track relative activity
      const vq = query(collection(db, "visitors"));
      const vUnsubscribe = onSnapshot(vq, (snapshot) => {
        const stats = { totalViews: 0, totalClicks: 0 };
        snapshot.docs.forEach(doc => {
          const type = doc.data().eventType;
          if (type === 'view') stats.totalViews++;
          if (type === 'click') stats.totalClicks++;
        });
        setVisitorStats(stats);
      });

      return () => {
        unsubscribe();
        vUnsubscribe();
      };
    }
  }, [isAdmin]);

  const handleCheckout = (product: string) => {
    logEvent('click', { page: 'home', product });
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
    setCheckoutStep('form');
  };

  const shareProduct = (platform: 'twitter' | 'facebook' | 'instagram', product: string) => {
    const url = window.location.href;
    const text = `Experience the clinical luxury of X LUXE: ${product}. Calibrated for results. 🧪✨`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'instagram':
        alert("Instagram sharing: Capture the clinical essence and tag @X_LUXE in your stories!");
        break;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createReview({
        productName: selectedProduct || "General Inquiry",
        userName: formData.name || "Anonymous Patron",
        rating: reviewRating,
        comment: reviewComment
      });
      setIsReviewModalOpen(false);
      setReviewComment("");
      setReviewRating(5);
      alert("Your clinical feedback has been recorded. Thank you for your contribution to the X LUXE collective.");
    } catch (err) {
      alert("Submission error. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrder({
        customerName: formData.name,
        phone: formData.phone,
        shippingAddress: formData.address,
        productName: selectedProduct,
        email: formData.email
      });
      setCheckoutStep('success');
      // Trigger WhatsApp automated concierge sync
      const waMessage = `*X LUXE PRIVATE ACQUISITION*%0A%0A*Product:* ${selectedProduct}%0A*Customer:* ${formData.name}%0A*WhatsApp:* ${formData.phone}%0A*Shipping Address:* ${formData.address}${formData.email ? `%0A*Email:* ${formData.email}` : ''}%0A%0A_Please verify this allotment._`;
      
      setTimeout(() => {
        window.open(`https://wa.me/message/NTQFXNGJYKC5J1`, '_blank');
      }, 2000);
    } catch (err) {
      alert("System overload. Please retry or contact concierge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { orderStatus: status, updatedAt: new Date() });
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Permanently remove this record from the archive?")) {
      try {
        await deleteOrder(orderId);
        alert("Record successfully purged from the ledger.");
      } catch (err) {
        console.error("Deletion error:", err);
        alert("The system was unable to delete this record. Please verify admin privileges.");
      }
    }
  };

  const handleAdminAuth = async () => {
    if (isAuthenticating) return;
    
    if (currentUser) {
      setIsDashboardOpen(true);
    } else {
      setIsAuthenticating(true);
      try {
        await loginWithGoogle();
        setIsDashboardOpen(true);
      } catch (err: any) {
        if (err.code === 'auth/popup-blocked') {
          // Alert already handled in service, but we can add UI state here if needed
        }
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const handleAISubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const queryText = overrideInput || aiInput;
    if (!queryText.trim() || isAIThinking) return;

    setAIInput("");
    setIsAIThinking(true);

    const newHistory: any = [...aiChatHistory, { role: 'user', parts: [{ text: queryText }] }];
    setAIChatHistory(newHistory);

    const response = await getAIConciergeResponse(newHistory);
    setAIChatHistory([...newHistory, { role: 'model', parts: [{ text: response.text }] }]);
    
    if (response.functionCalls) {
      response.functionCalls.forEach((call: any) => {
        if (call.name === 'scrollToSection') {
          const id = call.args.sectionId;
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else if (call.name === 'toggleAcquisitionPortal') {
          if (call.args.open) handleCheckout("Concierge Allotment");
          else setIsCheckoutOpen(false);
        }
      });
    }

    setIsAIThinking(false);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatHistory]);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-brand-gold/30">
      {/* Fixed Atmospheric Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Viscous Oil Blobs */}
        <motion.div 
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, -400]),
            x: useTransform(scrollYProgress, [0, 1], [0, 200]),
            rotate: useTransform(scrollYProgress, [0, 1], [0, 45])
          }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-gold/5 rounded-full blur-[120px] opacity-40 mix-blend-screen"
        />
        <motion.div 
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, 400]),
            x: useTransform(scrollYProgress, [0, 1], [0, -300]),
            rotate: useTransform(scrollYProgress, [0, 1], [0, -45])
          }}
          className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-brand-gold/3 rounded-full blur-[100px] opacity-30 mix-blend-screen"
        />
        <motion.div 
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, -800]),
            opacity: useTransform(scrollYProgress, [0.5, 0.8], [0, 0.1])
          }}
          className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-white/2 rounded-full blur-[150px] mix-blend-overlay"
        />
        
        {/* Film Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      </div>

      {/* Top Announcement Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="w-full bg-brand-gold text-black py-2.5 text-center text-[9px] uppercase tracking-[0.5em] font-bold z-[60] relative overflow-hidden"
      >
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap opacity-20 absolute inset-0 flex items-center pointer-events-none"
        >
          {Array(10).fill("NATIONWIDE DELIVERY • PRIVATE RESERVE • ").join("") }
        </motion.div>
        <span className="relative z-10">Introductory Offer: 30% Off • Delivering All Over Pakistan</span>
      </motion.div>

      {/* Sale Notification Pop */}
      <AnimatePresence>
        {showSale && (
          <motion.div
            key={`sale-notification-${currentSale}`}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className="fixed bottom-10 left-10 z-[100] glass-card gold-border p-5 rounded-sm flex items-center gap-4 max-w-[300px] shadow-2xl vip-glow"
          >
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 flex-shrink-0">
              <Droplet className="w-6 h-6 text-brand-gold" strokeWidth={1} />
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Recent Acquisition</div>
              <p className="text-xs font-serif italic text-white/90 leading-tight">
                <span className="text-brand-gold font-bold not-italic">{mockSales[currentSale].name}</span> from {mockSales[currentSale].location} secured the {mockSales[currentSale].item}.
              </p>
              <div className="mt-2 text-[8px] uppercase tracking-widest text-brand-gold/40">{mockSales[currentSale].time}</div>
            </div>
            <button 
              onClick={() => setShowSale(false)}
              className="absolute top-2 right-2 text-white/10 hover:text-white/40 transition-colors p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center border-b border-white/5 bg-[#030303]/40 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl md:text-2xl font-medium tracking-[0.2em] font-serif"
        >
          X<span className="text-brand-gold text-[0.6em] align-baseline ml-1">LUXE</span>
        </motion.div>
        <div className="hidden md:flex items-center gap-12 text-[10px] uppercase tracking-[0.4em] font-semibold text-white/40">
          <a href="#essences" className="hover:text-brand-gold transition-colors">Apothecary</a>
          <a href="#alchemy" className="hover:text-brand-gold transition-colors">Science</a>
          <a href="#benefits" className="hover:text-brand-gold transition-colors">Results</a>
          <a href="#pricing" className="hover:text-brand-gold transition-colors">Reserve</a>
          <a href="https://wa.me/message/NTQFXNGJYKC5J1" target="_blank" rel="noreferrer" className="hover:text-[#25D366] transition-colors flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <a href="https://www.instagram.com/x.4.mv?igsh=YmVhYmswaWVmM2Ux" target="_blank" rel="noreferrer" className="hover:text-[#E1306C] transition-colors flex items-center gap-2">
            <Instagram className="w-3.5 h-3.5" />
            Instagram
          </a>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212, 175, 55, 0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-brand-gold text-black px-10 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#E5C352] transition-all rounded-sm"
        >
          Acquire
        </motion.button>
      </nav>

      {/* Hero Section - VIP Edit */}
      <main className="pt-24 md:pt-32 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen border-b border-white/5 relative overflow-hidden">
        <section className="lg:col-span-5 p-8 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/5 bg-[#030303] z-10">
            <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-6 md:mb-8 flex items-center space-x-4">
                <span className="h-[1px] w-12 md:w-16 bg-brand-gold/40" />
                <span className="text-[9px] md:text-[11px] uppercase tracking-[0.6em] text-brand-gold font-bold">The Private Reserve</span>
              </motion.div>
              <motion.h1 
                style={{ 
                  scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.1]),
                  opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0.5])
                }}
                variants={itemVariants}
                className="text-6xl md:text-8xl lg:text-[140px] font-serif font-light mb-8 md:mb-12 tracking-tighter leading-none"
              >
                X<span className="text-brand-gold text-[0.4em] align-baseline ml-2">LUXE</span>
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-white/40 leading-relaxed mb-10 md:mb-16 max-w-sm font-serif italic font-light"
              >
                A clinical Anti-Hair Loss synthesis. Reserved for those who demand unparalleled anchor and obsidian vitality.
              </motion.p>
              
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="glass-card gold-border p-6 md:p-8 rounded-sm vip-glow group hover:bg-white/[0.03] transition-colors cursor-default">
                  <div className="text-brand-gold text-[9px] md:text-[11px] uppercase tracking-[0.4em] mb-2 md:mb-3 font-bold">Root Anchor</div>
                  <div className="text-sm md:text-base font-serif italic text-white/70">DHT Blocking Matrix</div>
                </div>
                <div className="glass-card gold-border p-6 md:p-8 rounded-sm group hover:bg-white/[0.03] transition-colors cursor-default">
                  <div className="text-white/20 text-[9px] md:text-[11px] uppercase tracking-[0.4em] mb-2 md:mb-3 font-bold group-hover:text-white/40 transition-colors">Strength</div>
                  <div className="text-sm md:text-base font-serif italic text-white/70">Cuticle Repair</div>
                </div>
              </motion.div>
            </motion.div>
        </section>

        <section id="essences" className="lg:col-span-7 p-8 md:p-16 min-h-[500px] lg:min-h-0 flex flex-col justify-between oil-gradient relative overflow-hidden">
          {/* REFINED SERUM DROPPER SYSTEM */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
             {/* Dropper Assembly */}
             <motion.div 
                initial={{ y: -500 }}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 0.5, -0.5, 0]
                }}
                transition={{ 
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative flex flex-col items-center"
             >
                {/* The Bulb (Top Part) */}
                <div className="w-10 h-14 bg-[#111] rounded-t-[20px] rounded-b-[5px] border-x border-t border-white/5 shadow-2xl relative">
                   <div className="absolute inset-x-2 top-2 h-6 bg-gradient-to-b from-white/10 to-transparent rounded-t-[15px] opacity-40" />
                </div>
                
                {/* The Tube Body (Glassy SVG) */}
                <div className="relative w-8 h-80 flex flex-col items-center">
                   {/* Gold Cap/Collar */}
                   <div className="w-12 h-6 bg-brand-gold rounded-sm shadow-[0_0_30px_rgba(212,175,55,0.3)] z-10" />
                   
                   {/* Glass Stem */}
                   <div className="w-5 h-64 bg-white/5 backdrop-blur-md border-x border-white/10 relative flex flex-col justify-end p-[px] overflow-hidden">
                      {/* Internal Liquid level (Dynamic) */}
                      <motion.div 
                         animate={{ 
                           height: ["75%", "73%", "75%"],
                           y: [0, 2, 0]
                         }}
                         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                         className="w-full bg-gradient-to-t from-brand-gold via-brand-gold/60 to-transparent opacity-90 blur-[0.5px] relative"
                      >
                         {/* Liquid Surface Shine */}
                         <div className="absolute top-0 inset-x-0 h-[1.5px] bg-white/40 blur-[0.5px]" />
                         {/* Internal Bubbles (Subtle) */}
                         <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-white/20 rounded-full" />
                         <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/10 rounded-full" />
                      </motion.div>
                      
                      {/* High Specular Shine (Glassy look) */}
                      <div className="absolute left-1 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-white/30 via-white/5 to-white/30 opacity-60" />
                      <div className="absolute right-1 top-0 bottom-0 w-[0.5px] bg-white/10" />
                      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.05)_55%,transparent_60%)] pointer-events-none" />
                   </div>

                   {/* Tapered Nozzle */}
                   <div className="w-5 h-12 relative flex justify-center">
                      <div className="w-1.5 h-10 bg-white/10 border-x border-b border-white/20 rounded-b-full overflow-hidden relative">
                         <div className="absolute inset-x-0 bottom-0 h-4 bg-brand-gold/40" />
                      </div>
                   </div>
                </div>

                {/* The Golden Drop Logic */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ 
                    y: [-2, 5, 600],
                    opacity: [0, 1, 1, 0],
                    scale: [0.3, 0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: [0.45, 0, 1, 1], // Custom slow to fast curve
                    times: [0, 0.1, 0.3, 1]
                  }}
                  className="absolute bottom-[-10px]"
                >
                  <div className="relative">
                    {/* The Droplet */}
                    <div className="w-4 h-6 bg-brand-gold rounded-full relative shadow-[0_0_40px_rgba(212,175,55,0.8)]">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-brand-gold -mt-2" />
                       <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/40 rounded-full" />
                       <div className="absolute top-1 left-1.5 w-1 h-1 bg-white/40 rounded-full blur-[0.5px]" />
                    </div>
                    {/* Viscous Trail */}
                    <motion.div 
                      animate={{ height: [0, 100, 0], opacity: [0, 0.2, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-[1.5px] bg-gradient-to-t from-brand-gold to-transparent"
                    />
                  </div>
                </motion.div>
             </motion.div>

             {/* Background Aura */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] animate-pulse" />
          </div>

          <div className="space-y-16 z-10">
            <div className="flex justify-between items-end">
              <h2 className="text-[11px] uppercase tracking-[0.5em] text-brand-gold font-bold">The Triad</h2>
              <div className="h-[1px] flex-1 mx-16 mb-1 bg-brand-gold/10 hidden md:block"></div>
              <div className="text-white/10 text-[11px] italic font-serif tracking-[0.2em]">Signature Formula No. 03</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {ingredients.map((ing, idx) => (
                <motion.div 
                  key={`${ing.name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center group cursor-pointer"
                  onClick={() => setSelectedIngredient(ing)}
                >
                  <div className="w-full aspect-square glass-card rounded-full flex items-center justify-center mb-6 border-white/10 transition-all group-hover:border-brand-gold/40 group-hover:vip-glow">
                    <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/5 group-hover:border-brand-gold/20">
                       {idx === 0 && <Leaf className="w-8 h-8 text-white/10 group-hover:text-brand-gold transition-colors" strokeWidth={1} />}
                       {idx === 1 && <Droplet className="w-8 h-8 text-white/10 group-hover:text-brand-gold transition-colors" strokeWidth={1} />}
                       {idx === 2 && <Sprout className="w-8 h-8 text-white/10 group-hover:text-brand-gold transition-colors" strokeWidth={1} />}
                    </div>
                  </div>
                  <h3 className="text-lg font-serif italic text-white/90 mb-2">{ing.name}</h3>
                  <p className="text-[10px] text-brand-gold/60 uppercase tracking-widest leading-tight mb-8">{ing.role}</p>
                  
                  {/* Scientific Potency Bars */}
                  <div className="space-y-4 px-4 text-left">
                    {ing.stats?.map((stat, sIdx) => (
                      <div key={`${ing.name}-stat-${sIdx}`} className="space-y-1.5">
                        <div className="flex justify-between text-[8px] uppercase tracking-[0.3em] font-bold">
                          <span className="text-white/20">{stat.label}</span>
                          <span className="text-brand-gold/40">{stat.value}%</span>
                        </div>
                        <div className="h-[1px] w-full bg-white/[0.05] relative overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stat.value}%` }}
                            transition={{ duration: 2, delay: (idx * 0.2) + (sIdx * 0.1), ease: "circOut" }}
                            viewport={{ once: true }}
                            className="absolute top-0 left-0 h-full bg-brand-gold/40"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-16 border-t border-white/5">
              <div className="text-[11px] uppercase tracking-[0.5em] text-white/10 mb-8 font-bold">Physiological Composition</div>
              <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm font-light text-white/40 italic font-serif">
                {totalIngredients.map((item, idx) => (
                  <span key={`${item}-${idx}`} className="flex items-center gap-12 hover:text-brand-gold transition-colors duration-500 cursor-default">
                    {item}
                    {idx < totalIngredients.length - 1 && <span className="not-italic text-brand-gold/10 font-sans">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-auto gap-8 z-10">
            <div className="glass-card gold-border px-8 py-5 flex items-center gap-5 rounded-sm bg-black/40">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold">VIP Certified Ritual</div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 55, 0.1)" }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-brand-gold transition-all w-full sm:w-auto shadow-2xl"
            >
              Secure Batch
            </motion.button>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-[0.03]">
            <span className="text-stroke text-[25vw] font-serif select-none tracking-tighter">ELITE</span>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20 pointer-events-none"
          >
            <div className="text-[9px] uppercase tracking-[0.5em]">Scroll to Synthesis</div>
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-[1px] h-10 bg-brand-gold/40"
            />
          </motion.div>
        </section>
      </main>

      {/* Advantages Section - VIP Styling */}
      <section id="benefits" ref={benefitsRef} className="py-20 md:py-40 px-6 md:px-24 bg-[#030303] relative border-b border-white/5 overflow-hidden">
        {/* Parallax Background Text */}
        <motion.div 
          style={{ x: useTransform(benefitsProgress, [0, 1], ["10%", "-30%"]) }}
          className="absolute top-1/2 left-0 text-[30vw] font-serif font-bold text-white/[0.02] whitespace-nowrap pointer-events-none select-none italic"
        >
          RESULTS
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-4 md:mb-6">The Legacy</p>
              <h3 className="text-4xl md:text-7xl font-serif font-light tracking-tight pr-12">Clinical Provenance</h3>
            </div>
            <p className="max-w-xs text-sm text-white/30 font-light font-serif italic mt-8 md:mt-0 leading-loose">
              Performance metrics derived from years of apothecary research and root anchoring studies.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0"
          >
             {advantages.map((adv, idx) => (
               <motion.div 
                 key={`${adv.title}-${idx}`}
                 variants={itemVariants}
                 className="p-12 border border-white/5 hover:bg-white/[0.01] hover:border-brand-gold/10 transition-all group h-full flex flex-col"
               >
                 <div className="mb-10 text-brand-gold/20 group-hover:text-brand-gold transition-colors duration-500">
                    {adv.icon}
                 </div>
                 <h4 className="text-2xl font-serif italic mb-5 tracking-tight group-hover:text-brand-gold transition-colors">{adv.title}</h4>
                 <p className="text-[13px] text-white/30 leading-relaxed font-light group-hover:text-white/60 transition-colors uppercase tracking-[0.05em]">{adv.desc}</p>
                 <div className="mt-auto pt-10">
                    <ChevronRight className="w-5 h-5 text-white/[0.05] group-hover:text-brand-gold transition-all group-hover:translate-x-2" />
                 </div>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* The Ritual Section */}
      <section id="alchemy" ref={ritualsRef} className="py-20 md:py-40 px-6 md:px-24 bg-[#030303] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 md:mb-32">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-6 md:mb-8">The Method</p>
            <h2 className="text-4xl md:text-8xl font-serif font-light tracking-tight mb-8 md:mb-10">Apothecary Ritual</h2>
            <div className="h-[1px] w-20 md:w-24 bg-brand-gold/20 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {ritualSteps.map((step, idx) => (
              <motion.div 
                key={`${step.title}-${idx}`}
                style={{ 
                  y: useTransform(ritualsProgress, [0.1 + (idx * 0.1), 0.5 + (idx * 0.1)], [100, 0]),
                  opacity: useTransform(ritualsProgress, [0.1 + (idx * 0.1), 0.4 + (idx * 0.1)], [0, 1])
                }}
                whileHover={{ y: -10 }}
                className="glass-card gold-border p-12 rounded-sm text-center relative overflow-hidden group hover:bg-white/[0.02] transition-all"
              >
                <span className="absolute -top-4 -left-4 text-9xl font-serif italic text-white/[0.02] select-none leading-none group-hover:text-brand-gold/[0.03] transition-colors">{step.step}</span>
                <div className="text-brand-gold text-[11px] uppercase tracking-[0.5em] mb-8 font-bold relative z-10">{step.title}</div>
                <p className="text-base text-white/40 font-serif italic leading-[2] relative z-10 group-hover:text-white/60 transition-colors">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After / Results Text Only */}
      <section className="py-20 md:py-40 px-6 md:px-24 bg-[#030303] border-y border-white/5 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-6 md:mb-8">Clinical Timeline</p>
          <h2 className="text-5xl md:text-8xl font-serif font-light tracking-tighter mb-12 md:mb-20 uppercase leading-none">Clinical<br/><span className="italic text-brand-gold">Density</span></h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12"
          >
            {galleryResults.map((res, idx) => (
              <motion.div 
                key={`${res.label}-${idx}`}
                variants={itemVariants}
                className="flex flex-col items-center group cursor-default"
              >
                <div className="text-5xl font-serif italic text-brand-gold/30 group-hover:text-brand-gold transition-all duration-700 group-hover:scale-110 mb-8">{res.label}</div>
                <div className="text-[11px] uppercase tracking-[0.4em] font-bold text-white/50 mb-3">{res.focus} Phase</div>
                <p className="text-sm text-white/20 leading-relaxed font-serif italic group-hover:text-white/40 transition-colors">{res.desc}</p>
                <div className="mt-8 w-8 h-[1px] bg-brand-gold/10 group-hover:w-24 transition-all duration-700" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-40 px-6 md:px-24 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-20 md:mb-32">
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
            <h2 className="text-[9px] md:text-[10px] uppercase tracking-[1em] text-white/20 font-bold mx-8 md:mx-12">The VIP Circle</h2>
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24"
          >
            {testimonials.map((test, idx) => (
              <motion.div 
                key={`${test.name}-${idx}`}
                variants={itemVariants}
                className="flex flex-col items-center text-center group"
              >
                <Quote className="w-6 h-6 text-brand-gold/10 mb-12 group-hover:text-brand-gold/40 transition-all duration-500 transform group-hover:-rotate-12" strokeWidth={1} />
                <p className="text-2xl font-serif italic text-white/60 leading-relaxed mb-12 group-hover:text-white/90 transition-colors duration-500">"{test.quote}"</p>
                <div className="mt-auto">
                  <div className="text-[11px] font-bold tracking-[0.4em] text-white mb-2 uppercase">{test.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-brand-gold/40 italic font-serif">Member • {test.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Client Feedback Section - COMBINED LEDGER EDIT */}
      <section id="feedback" className="py-24 md:py-48 px-6 md:px-24 bg-[#030303] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 md:mb-36 gap-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="h-[1px] w-8 bg-brand-gold/40" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold">Patron Records</p>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-light tracking-tight italic leading-tight text-white uppercase tracking-tighter">Clinical<br/>Testimonials</h2>
            </div>
            
            <div className="flex items-center gap-6 p-8 glass-card bg-white/[0.01] rounded-sm gold-border">
               <div className="flex flex-col">
                 <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-2">Synthesis Accuracy</span>
                 <div className="flex items-center gap-3">
                   <div className="flex gap-0.5">
                     {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-brand-gold fill-brand-gold" />)}
                   </div>
                   <span className="text-2xl font-serif italic text-white leading-none">4.9</span>
                 </div>
               </div>
               <div className="w-[1px] h-10 bg-white/5 mx-4" />
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 onClick={() => setIsReviewModalOpen(true)}
                 className="text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold"
               >
                 Add Record
               </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev, idx) => (
              <motion.div 
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card gold-border p-10 rounded-sm relative group hover:bg-white/[0.02] transition-all"
              >
                <div className="flex justify-between items-start mb-8">
                   <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-brand-gold fill-brand-gold' : 'text-white/5'}`} />
                      ))}
                   </div>
                   <ShieldCheck className="w-4 h-4 text-brand-gold/20 group-hover:text-brand-gold/40 transition-colors" />
                </div>
                <p className="text-xl font-serif italic text-white/50 mb-10 leading-relaxed italic group-hover:text-white/80 transition-colors">"{rev.comment}"</p>
                <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold/60">{rev.userName}</div>
                <div className="text-[8px] uppercase tracking-[0.3em] text-white/10 mt-1">{rev.productName}</div>
              </motion.div>
            ))}
          </div>

          {reviews.length > 3 && (
            <div className="mt-20 flex flex-col items-center">
               <motion.button 
                 onClick={() => setShowAllReviews(!showAllReviews)}
                 whileHover={{ letterSpacing: '0.8em' }}
                 className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/30 hover:text-brand-gold transition-all flex items-center gap-4"
               >
                 <div className="h-[1px] w-8 bg-white/10" />
                 {showAllReviews ? "Compress Archives" : `View Full Ledger (${reviews.length})`}
                 <div className="h-[1px] w-8 bg-white/10" />
               </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 md:py-40 px-6 md:px-10 md:px-24 bg-[#030303] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 md:gap-8 mb-16 md:mb-24">
            <HelpCircle className="w-10 h-10 md:w-12 md:h-12 text-brand-gold/20" strokeWidth={1} />
            <h2 className="text-3xl md:text-6xl font-serif font-light tracking-tight italic">Technical Inquiry</h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {faqs.map((faq, idx) => (
              <motion.div 
                key={`${faq.q}-${idx}`}
                variants={itemVariants}
                className="glass-card gold-border p-10 rounded-sm group hover:bg-white/[0.02] transition-colors"
              >
                <h4 className="text-xl font-serif italic text-white/90 mb-4 flex items-center gap-6 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-brand-gold/20 group-hover:bg-brand-gold animate-pulse" />
                  {faq.q}
                </h4>
                <p className="text-[13px] text-white/30 leading-loose font-light pl-8 group-hover:text-white/60 transition-colors uppercase tracking-[0.1em]">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing - VIP Acquisition */}
      <section id="pricing" className="py-20 md:py-40 px-6 md:px-24 border-t border-white/5 bg-gradient-to-b from-[#030303] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto text-center mb-20 md:mb-32">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-6 md:mb-8">Limited Allocation</p>
          <h2 className="text-4xl md:text-8xl font-serif font-light tracking-tight mb-8 md:mb-10">Private Collection</h2>
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="h-[1px] w-20 md:w-24 bg-brand-gold/40" />
            <div className="flex items-center gap-2 md:gap-3 text-brand-gold/60 text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              Secure Delivery All Over Pakistan
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-5xl mx-auto items-end">
          {/* 50ml VIP */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -10 }}
             className="glass-card gold-border p-16 rounded-sm bg-black/20 flex flex-col items-center text-center group relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.02] to-transparent pointer-events-none" />
             <div className="mb-14 p-10 bg-white/[0.02] rounded-full border border-white/5 group-hover:border-brand-gold/20 transition-all duration-700">
                <Droplet className="w-12 h-12 text-brand-gold/40 transition-all duration-700 group-hover:text-brand-gold group-hover:scale-110" strokeWidth={0.5} />
             </div>
             <h3 className="text-3xl md:text-4xl font-serif mb-4 md:mb-6 italic tracking-tight">Standard Reserve</h3>
             <span className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-brand-gold/40 mb-10 md:mb-12 font-bold tracking-widest leading-none">50 ML Allotment</span>
             <div className="flex flex-col items-center mb-12 md:mb-16">
               <span className="text-[9px] md:text-[10px] text-white/10 line-through tracking-[0.4em] mb-3 md:mb-4 uppercase font-bold">PKR 750</span>
               <div className="text-4xl md:text-5xl font-serif font-light tracking-tight gold-text-gradient uppercase">PKR 500</div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => handleCheckout("Standard Reserve")}
               className="w-full bg-transparent border border-brand-gold/40 text-brand-gold py-6 text-[11px] uppercase tracking-[0.5em] font-bold hover:bg-brand-gold hover:text-black transition-all rounded-sm duration-500"
             >
               Acquire
             </motion.button>

             <div className="mt-8 flex items-center justify-center gap-6 border-t border-white/5 pt-8 w-full">
               <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-bold">Share Essence:</span>
               <div className="flex gap-4">
                 <button onClick={() => shareProduct('twitter', 'Standard Reserve')} className="text-white/20 hover:text-[#1DA1F2] transition-colors">
                   <Twitter className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={() => shareProduct('facebook', 'Standard Reserve')} className="text-white/20 hover:text-[#4267B2] transition-colors">
                   <Facebook className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={() => shareProduct('instagram', 'Standard Reserve')} className="text-white/20 hover:text-[#E1306C] transition-colors">
                   <Instagram className="w-3.5 h-3.5" />
                 </button>
               </div>
             </div>
          </motion.div>
 
          {/* 100ml VIP */}
          <motion.div 
             initial={{ opacity: 0, y: 60 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -10 }}
             className="glass-card gold-border p-20 rounded-sm bg-black/40 flex flex-col items-center text-center group relative overflow-hidden border-brand-gold/30 shadow-[0_40px_100px_-20px_rgba(212,175,55,0.15)]"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/[0.05] via-transparent to-transparent pointer-events-none" />
             <div className="absolute top-0 right-0 bg-brand-gold text-black text-[9px] uppercase tracking-[0.6em] font-bold px-10 py-4 shadow-xl">Premier Choice</div>
             <div className="mb-14 p-12 bg-brand-gold/[0.05] rounded-full gold-border group-hover:bg-brand-gold/20 transition-all duration-700">
                <Droplet className="w-16 h-16 text-brand-gold transition-all duration-700 group-hover:scale-110" strokeWidth={0.5} />
             </div>
             <h3 className="text-4xl md:text-5xl font-serif mb-4 md:mb-6 italic tracking-tight">Essential Grandeur</h3>
             <span className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-brand-gold/40 mb-10 md:mb-12 font-bold tracking-widest leading-none">100 ML Allotment</span>
             <div className="flex flex-col items-center mb-12 md:mb-16">
               <span className="text-[9px] md:text-[10px] text-white/20 line-through tracking-[0.4em] mb-3 md:mb-4 uppercase font-bold">PKR 1,400</span>
               <div className="text-5xl md:text-6xl font-serif font-light tracking-tight gold-text-gradient uppercase">PKR 950</div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => handleCheckout("Essential Grandeur")}
               className="w-full bg-brand-gold text-black py-7 text-[11px] uppercase tracking-[0.5em] font-bold hover:bg-[#E5C352] transition-all rounded-sm shadow-2xl"
             >
               Acquire
             </motion.button>

             <div className="mt-8 flex items-center justify-center gap-6 border-t border-brand-gold/10 pt-8 w-full">
               <span className="text-[8px] uppercase tracking-[0.4em] text-brand-gold/40 font-bold">Share Essence:</span>
               <div className="flex gap-4">
                 <button onClick={() => shareProduct('twitter', 'Essential Grandeur')} className="text-brand-gold/40 hover:text-[#1DA1F2] transition-colors">
                   <Twitter className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={() => shareProduct('facebook', 'Essential Grandeur')} className="text-brand-gold/40 hover:text-[#4267B2] transition-colors">
                   <Facebook className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={() => shareProduct('instagram', 'Essential Grandeur')} className="text-brand-gold/40 hover:text-[#E1306C] transition-colors">
                   <Instagram className="w-3.5 h-3.5" />
                 </button>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* VIP Footer */}
      <footer className="py-20 md:py-32 px-6 md:px-10 border-t border-white/5 bg-[#030303] flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        
        <div className="text-3xl md:text-4xl font-serif tracking-[0.4em] font-light text-white mb-12 md:mb-16 relative group cursor-default">
          X<span className="text-brand-gold text-[0.55em] align-baseline ml-1">LUXE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24 mb-16 md:mb-24 max-w-4xl w-full">
           <div className="flex flex-col gap-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Navigation</span>
              <a href="#essences" className="text-[11px] uppercase tracking-[0.2em] hover:text-brand-gold transition-colors">Apothecary</a>
              <a href="#alchemy" className="text-[11px] uppercase tracking-[0.2em] hover:text-brand-gold transition-colors">Lab Results</a>
              <a href="#pricing" className="text-[11px] uppercase tracking-[0.2em] hover:text-brand-gold transition-colors">Allocations</a>
           </div>
              <div className="flex flex-col gap-6">
                 <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Logistics</span>
                 <span className="text-[11px] uppercase tracking-[0.2em]">Shipping Policy</span>
                 <span className="text-[11px] uppercase tracking-[0.2em]">Returns & Exchanges</span>
                 <a href="https://wa.me/message/NTQFXNGJYKC5J1" target="_blank" rel="noreferrer" className="text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-[#25D366] transition-colors">
                   <MessageCircle className="w-3 h-3" />
                   WhatsApp Concierge
                 </a>
                 <a href="https://www.instagram.com/x.4.mv?igsh=YmVhYmswaWVmM2Ux" target="_blank" rel="noreferrer" className="text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-[#E1306C] transition-colors">
                   <Instagram className="w-3 h-3" />
                   Official Instagram
                 </a>
              </div>
           <div className="flex flex-col gap-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Protocol</span>
              <span className="text-[11px] uppercase tracking-[0.2em]">Terms of Service</span>
              <span className="text-[11px] uppercase tracking-[0.2em]">Privacy Protocol</span>
              <span className="text-[11px] uppercase tracking-[0.2em]">Clinical Ethics</span>
           </div>
        </div>

        <p className="font-serif italic text-sm text-white/10 uppercase tracking-[0.6em] mb-4">Apothecary Excellence Since MMXXVI</p>
        <div className="text-[9px] uppercase tracking-[0.5em] text-brand-gold/20 mb-4 font-bold flex items-center gap-4">
          Owner • Mehaal Khan Khattak
          <button 
            onClick={handleAdminAuth}
            className="opacity-40 hover:opacity-100 transition-opacity text-[8px] text-white/30 underline cursor-pointer"
          >
            Terminal Access
          </button>
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/5 font-bold">© {new Date().getFullYear()} X LUXE. All Rights Reserved.</div>
      </footer>

      {/* Acquisition Overlay / Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div 
            key="checkout-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card gold-border w-full max-w-xl p-8 md:p-12 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors z-[60] p-2"
              >
                <X className="w-8 h-8 md:w-6 md:h-6" />
              </button>

              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-40" />

              {checkoutStep === 'form' ? (
                <>
                  <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-4">Acquisition Portal</p>
                    <h3 className="text-4xl font-serif italic text-white leading-tight">Secure your<br/>{selectedProduct}</h3>
                  </div>

                  <form onSubmit={handleOrderSubmit} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 ml-2 font-bold">Full Name</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-5 focus:border-brand-gold/40 focus:bg-white/[0.05] transition-all outline-none italic font-serif"
                        placeholder="Clinical Registry Name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 ml-2 font-bold">WhatsApp Number</label>
                        <input 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-5 focus:border-brand-gold/40 outline-none transition-all italic font-serif"
                          placeholder="+92 XXX XXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 ml-2 font-bold">Email (Optional)</label>
                        <input 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-5 focus:border-brand-gold/40 outline-none transition-all italic font-serif"
                          placeholder="patron@reserve.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/20 ml-2 font-bold">Shipping Address</label>
                      <textarea 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-5 focus:border-brand-gold/40 outline-none transition-all italic font-serif resize-none"
                        placeholder="Dispatch coordinates..."
                      />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-gold text-black py-6 text-[12px] uppercase tracking-[0.5em] font-bold shadow-[0_0_40px_rgba(212,175,55,0.2)] disabled:opacity-50"
                    >
                      {isSubmitting ? "Syncing Logic..." : "Finalize Acquisition"}
                    </motion.button>
                  </form>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="mb-12 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 vip-glow">
                      <CheckCircle2 className="w-12 h-12 text-brand-gold" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-serif italic text-white mb-6 uppercase tracking-tight">Acquisition Recorded</h3>
                  <p className="text-white/40 leading-relaxed mb-12 max-w-sm mx-auto italic font-serif">
                    The ledger has been updated. Our concierge is performing a secondary verification on WhatsApp.
                  </p>
                  <div className="flex flex-col gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsCheckoutOpen(false)}
                      className="text-brand-gold text-[10px] uppercase tracking-[0.8em] font-bold hover:text-white transition-colors"
                    >
                      Return to Gallery
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setIsReviewModalOpen(true);
                      }}
                      className="text-white/20 text-[9px] uppercase tracking-[0.5em] font-bold hover:text-brand-gold transition-colors"
                    >
                      Share Your Experience
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Dashboard Overlay */}
      <AnimatePresence>
        {isDashboardOpen && isAdmin && (
          <motion.div 
            key="admin-dashboard-overlay"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[2000] bg-[#030303] pt-32 px-6 md:px-24 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-12">
              <div>
                <h2 className="text-5xl font-serif italic text-brand-gold mb-3 uppercase tracking-tighter">The Ledger</h2>
                <div className="flex items-center gap-4 text-white/20 text-[10px] uppercase tracking-[0.5em] font-bold">
                  <User className="w-4 h-4" />
                  {currentUser?.email}
                </div>
              </div>
              <div className="flex gap-8">
                <button 
                  onClick={() => setIsDashboardOpen(false)}
                  className="text-[10px] uppercase tracking-[0.5em] text-white/40 hover:text-white transition-colors"
                >
                  Exit Control
                </button>
                <button 
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-3 text-red-500/60 hover:text-red-500 text-[10px] uppercase tracking-[0.5em] font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              <div className="glass-card gold-border p-8 rounded-sm bg-white/[0.02]">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-4">Total Acquisitions</div>
                <div className="text-4xl font-serif text-brand-gold">{orders.length}</div>
              </div>
              <div className="glass-card gold-border p-8 rounded-sm bg-white/[0.02]">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-4">Catalog Views</div>
                <div className="text-4xl font-serif text-brand-gold">{visitorStats.totalViews}</div>
              </div>
              <div className="glass-card gold-border p-8 rounded-sm bg-white/[0.02]">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-4">Intent (Clicks)</div>
                <div className="text-4xl font-serif text-brand-gold">{visitorStats.totalClicks}</div>
              </div>
              <div className="glass-card gold-border p-8 rounded-sm bg-white/[0.02]">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-4">Ledger Records</div>
                <div className="text-4xl font-serif text-brand-gold">{reviews.length}</div>
              </div>
            </div>

            <div className="mb-20 space-y-8">
              {orders.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 bg-white/[0.01]">
                   <Package className="w-16 h-16 text-white/5 mb-8" />
                   <div className="text-[10px] uppercase tracking-[1em] text-white/20 font-bold">Awaiting Acquisitions</div>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    layoutId={order.id}
                    className="glass-card gold-border p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12 group hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-6">
                        <div className="text-xl font-serif text-white">{order.customerName}</div>
                        <span className={`px-4 py-1 text-[8px] uppercase tracking-widest font-bold rounded-full ${
                          order.orderStatus === 'pending' ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 
                          'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-10 gap-y-2 text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">
                        <span className="flex items-center gap-3"><Phone className="w-3 h-3" /> {order.phone}</span>
                        <span className="flex items-center gap-3"><MapPin className="w-3 h-3 text-brand-gold/40" /> {order.shippingAddress}</span>
                        <span className="text-brand-gold/60 italic font-serif">{order.productName}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      {order.orderStatus === 'pending' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="px-8 py-3 text-[9px] uppercase tracking-[0.4em] font-bold border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-all"
                        >
                          Confirm
                        </button>
                      )}
                      <button 
                         onClick={() => window.open(`https://wa.me/${order.phone.replace(/\+/g, '')}`, '_blank')}
                         className="px-8 py-3 bg-brand-gold/10 text-brand-gold text-[9px] uppercase tracking-[0.4em] font-bold border border-brand-gold/20 hover:bg-brand-gold hover:text-black transition-all"
                      >
                        Contact
                      </button>
                      <button 
                         onClick={() => handleDeleteOrder(order.id)}
                         className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center rounded-sm"
                         title="Purge Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Dashboard Access Denied Block */}
        {isDashboardOpen && !isAdmin && (
           <motion.div 
             key="access-denied-overlay"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="fixed inset-0 z-[2005] bg-black flex items-center justify-center p-12"
           >
              <div className="text-center">
                 <button 
                  onClick={() => setIsDashboardOpen(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-2"
                >
                  <X className="w-8 h-8" />
                </button>
                 <Lock className="w-16 h-16 text-red-500/40 mx-auto mb-12" strokeWidth={1} />
                 <h2 className="text-5xl font-serif italic text-white mb-6 uppercase tracking-tighter">Access Forbidden</h2>
                 <p className="text-white/20 text-[10px] uppercase tracking-[0.6em] font-bold mb-12">Only Authorized Patrons {currentUser?.email}</p>
                 <button 
                  onClick={() => setIsDashboardOpen(false)}
                  className="text-brand-gold text-[10px] uppercase tracking-[0.8em] font-bold hover:text-white transition-colors"
                 >
                   Exit
                 </button>
              </div>
           </motion.div>
        )}

        {/* Instagram Floating Link */}
        <div key="floating-instagram-trigger" className="fixed bottom-36 right-10 z-[50]">
          <motion.a 
            href="https://www.instagram.com/x.4.mv?igsh=YmVhYmswaWVmM2Ux"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(225, 48, 108, 0.2)" }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/20 hover:text-[#E1306C] hover:border-[#E1306C]/30 transition-all group relative"
          >
            <Instagram className="w-5 h-5" />
            <span className="absolute right-full mr-4 bg-[#E1306C] text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Instagram
            </span>
          </motion.a>
        </div>

        {/* WhatsApp Floating Contact */}
        <div key="floating-whatsapp-trigger" className="fixed bottom-24 right-10 z-[50]">
          <motion.button 
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.open('https://wa.me/message/NTQFXNGJYKC5J1', '_blank')}
            className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/20 hover:text-[#25D366] hover:border-[#25D366]/30 transition-all group relative"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute right-full mr-4 bg-[#25D366] text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Concierge
            </span>
            <div className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/10 pointer-events-none" />
          </motion.button>
        </div>

        {/* Clinical Insight Modal */}
        <AnimatePresence>
          {selectedIngredient && (
            <motion.div 
              key="ingredient-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="glass-card gold-border w-full max-w-lg p-8 md:p-16 relative overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setSelectedIngredient(null)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors z-[60] p-2"
                >
                  <X className="w-8 h-8 md:w-6 md:h-6" />
                </button>

                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-full glass-card gold-border flex items-center justify-center">
                    {selectedIngredient.name === "Rosemary" && <Leaf className="w-8 h-8 text-brand-gold" />}
                    {selectedIngredient.name === "Kalwanji" && <Droplet className="w-8 h-8 text-brand-gold" />}
                    {selectedIngredient.name === "Flax Seeds" && <Sprout className="w-8 h-8 text-brand-gold" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold mb-1">Clinical Insight</p>
                    <h3 className="text-4xl font-serif italic text-white">{selectedIngredient.name}</h3>
                  </div>
                </div>

                <div className="space-y-10 group/report">
                  <div className="p-6 bg-white/[0.02] border-l-2 border-brand-gold/40">
                    <p className="text-xl font-serif italic text-white/80 leading-relaxed">
                      "{selectedIngredient.insight}"
                    </p>
                  </div>

                  <div className="space-y-6">
                    {selectedIngredient.stats.map((stat: any, i: number) => (
                      <div key={`modal-stat-${i}`} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{stat.label}</span>
                          <span className="text-[12px] font-mono text-brand-gold">{stat.value}% Efficiency</span>
                        </div>
                        <div className="h-[2px] bg-white/5 w-full relative overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                            className="absolute inset-0 bg-brand-gold/60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] uppercase tracking-[0.5em] text-white/20 font-bold mb-8">Verified in Synthesis branch No. 03</p>
                    <button 
                      onClick={() => setSelectedIngredient(null)}
                      className="w-full py-5 bg-brand-gold text-black text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-white transition-all shadow-2xl"
                    >
                      Acknowledge Research
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Login Portal Overlay */}
        {(showAdminPortalTrigger || isAdmin) && (
          <div key="admin-portal-trigger" className="fixed bottom-10 right-10 z-[50]">
            <button 
              onClick={handleAdminAuth}
              disabled={isAuthenticating}
              className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/5 hover:text-brand-gold hover:border-brand-gold/20 transition-all group disabled:opacity-50"
            >
              {isAuthenticating ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Droplet className="w-4 h-4 text-brand-gold" />
                </motion.div>
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="absolute right-full mr-4 bg-brand-gold text-black text-[8px] uppercase tracking-widest font-bold px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {isAuthenticating ? 'Syncing...' : 'Control Panel'}
              </span>
            </button>
          </div>
        )}
      </AnimatePresence>
      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div 
            key="review-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card gold-border p-8 md:p-16 rounded-sm max-w-5xl w-full relative overflow-hidden flex flex-col md:flex-row gap-12 md:gap-20 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors z-[60] p-2"
              >
                <X className="w-10 h-10 md:w-8 md:h-8" />
              </button>

              {/* Left Column: Existing Records Ledger */}
              <div className="flex-1 space-y-12 pr-4 overflow-y-auto max-h-[60vh] md:max-h-none scrollbar-hide">
                <div>
                   <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-4">Official Ledger</p>
                   <h3 className="text-4xl font-serif italic text-white uppercase tracking-tighter">Recent<br/>Observations</h3>
                </div>
                
                <div className="space-y-8">
                  {reviews.slice(0, 5).map((rev, idx) => (
                    <motion.div 
                      key={`modal-rev-${rev.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-8 border border-white/5 bg-white/[0.01] rounded-sm group hover:border-brand-gold/20 transition-all"
                    >
                       <div className="flex gap-1 mb-4">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 text-brand-gold fill-brand-gold" />
                        ))}
                       </div>
                       <p className="text-sm font-serif italic text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">"{rev.comment}"</p>
                       <div className="mt-4 text-[9px] uppercase tracking-[0.3em] font-bold text-white/10 uppercase group-hover:text-brand-gold/30 transition-colors">— {rev.userName}</div>
                    </motion.div>
                  ))}
                  {reviews.length > 5 && (
                    <div className="text-[9px] uppercase tracking-[0.5em] text-white/10 text-center font-bold italic animate-pulse">And {reviews.length - 5} more records in the archive</div>
                  )}
                </div>
              </div>

              {/* Center Divider for Desktop */}
              <div className="hidden md:block w-[1px] bg-white/5 self-stretch" />

              {/* Right Column: Submission Form */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-12">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold mb-4">Verification Entry</p>
                  <h3 className="text-4xl font-serif italic text-brand-gold uppercase tracking-tighter">Submit Your<br/>Experience</h3>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-10">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold mb-6 block">Calibrated Rating</label>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="transition-all hover:scale-110"
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= reviewRating ? 'text-brand-gold fill-brand-gold' : 'text-white/5'}`} 
                            />
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold ml-1">Observational Details</label>
                    <textarea 
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={5}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-6 focus:border-brand-gold/40 outline-none transition-all italic font-serif resize-none text-lg leading-relaxed"
                      placeholder="Describe your ritual results..."
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-gold text-black py-6 text-[11px] uppercase tracking-[0.5em] font-bold shadow-[0_0_40px_rgba(212,175,55,0.2)] disabled:opacity-50"
                  >
                    {isSubmitting ? "Encoding Record..." : "Publish Insight"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Acquisition Social Proof Popup */}
      <AnimatePresence>
        {showAcquisitionPop && recentAcquisition && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-10 right-10 z-[3000] glass-card gold-border p-6 pr-10 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-brand-gold/20"
          >
            <div className="w-14 h-14 rounded-full bg-brand-gold/[0.05] border border-brand-gold/10 flex items-center justify-center relative">
              <Package className="w-6 h-6 text-brand-gold/60" strokeWidth={1} />
              <div className="absolute inset-0 rounded-full animate-ping bg-brand-gold/5 pointer-events-none" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-gold">New Acquisition</span>
                <div className="w-1 h-1 rounded-full bg-brand-gold animate-pulse" />
              </div>
              <h4 className="text-sm font-serif italic text-white/90">
                {recentAcquisition.name} from <span className="text-brand-gold/60">{recentAcquisition.city}</span>
              </h4>
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/20 mt-1 font-bold italic">
                Secured {recentAcquisition.product}
              </p>
            </div>

            <button 
              onClick={() => setShowAcquisitionPop(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-white/40 hover:text-white transition-colors p-2 z-[3001]"
            >
              <X className="w-5 h-5 md:w-3 md:h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI CLINICAL CONCIERGE CHAT */}
      <div className="fixed bottom-10 left-10 z-[5000]">
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 left-0 w-[350px] md:w-[400px] h-[500px] glass-card gold-border flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-brand-gold/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                    <Bot className="w-4 h-4 text-brand-gold" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold">Clinical Concierge</h5>
                    <p className="text-[8px] uppercase tracking-[0.1em] text-white/20">Active • Synthesis Engine 3.2</p>
                  </div>
                </div>
                <button onClick={() => setIsAIChatOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {aiChatHistory.length <= 1 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-8 pt-10">
                    <div className="space-y-4">
                      <Cpu className="w-12 h-12 text-brand-gold/10 mx-auto" strokeWidth={1} />
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 max-w-[220px] leading-relaxed mx-auto">
                        Consult the X LUXE brain for clinical insights, ritual guidance, or formulation data.
                      </p>
                    </div>

                    <div className="w-full space-y-3">
                      <p className="text-[8px] uppercase tracking-[0.4em] text-brand-gold/40 font-bold mb-4">Suggested Inquiries</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "What are the benefits?",
                          "Show me the prices",
                          "How to buy?",
                          "Is it safe?",
                          "How to use?"
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => handleAISubmit(undefined, q)}
                            className="px-4 py-2 border border-white/5 bg-white/[0.02] rounded-sm text-[9px] uppercase tracking-[0.2em] text-white/40 hover:border-brand-gold/40 hover:text-brand-gold transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {aiChatHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-sm text-[11px] leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-bold' 
                      : 'bg-white/[0.03] text-white/80 border border-white/5'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-li:my-1">
                          <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.parts[0].text
                      )}
                    </div>
                  </motion.div>
                ))}
                {isAIThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.03] p-4 rounded-sm border border-white/5 flex gap-1">
                      <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleAISubmit} className="p-4 bg-black/40 border-t border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAIInput(e.target.value)}
                    placeholder="Consult the Concierge..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-4 pl-5 pr-12 text-[11px] outline-none focus:border-brand-gold/40 transition-all font-serif italic"
                  />
                  <button 
                    type="submit"
                    disabled={isAIThinking || !aiInput.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold disabled:opacity-20 transition-all active:scale-90"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative ${
            isAIChatOpen ? 'bg-white text-black rotate-90' : 'bg-brand-gold text-black hover:shadow-[0_0_50px_rgba(212,175,55,0.4)]'
          }`}
        >
          {isAIChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
          
          {/* Subtle pulse for the AI button */}
          {!isAIChatOpen && (
            <div className="absolute inset-0 rounded-full animate-ping bg-brand-gold/20 pointer-events-none" />
          )}
        </motion.button>
      </div>

    </div>
  );
}
