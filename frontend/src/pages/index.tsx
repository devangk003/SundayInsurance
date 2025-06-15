import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, Star, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import QuoteResults from "@/components/QuoteResults";
import LoadingQuotes from "@/components/LoadingQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase-config";
import { fetchInsuranceQuotes, InsuranceQuote, QuoteResponse } from "@/services/api";

interface CarBrand {
  name: string;
  logo: string;
}

interface NavigationItem {
  label: string;
  href: string;
}

interface RegistrationPlace {
  code: string;
  name: string;
}

interface HeroInsuranceProvider {
  name: string;
  logo: string;
  logoColor: string;
  price: string;
  idv: string;
  coverage: string;
  features: string[];
}

const Index = () => {
  const { user, openLoginModal, openSignupModal } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    registrationNumber: ""
  });  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);  const [isQuotesSectionPassed, setIsQuotesSectionPassed] = useState(false);
  const quotesSectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [previousHoveredItem, setPreviousHoveredItem] = useState<string | null>(null);
  const [itemDimensions, setItemDimensions] = useState<Record<string, { width: number; x: number }>>({});
  const [isCarBrandDialogOpen, setIsCarBrandDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isFuelTypeDialogOpen, setIsFuelTypeDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedRegistrationPlace, setSelectedRegistrationPlace] = useState("");  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const [vehicleRegistration, setVehicleRegistration] = useState("");  // Hero section insurance providers state
  const [selectedProviderIndex, setSelectedProviderIndex] = useState(-1);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);  const [heroProviders, setHeroProviders] = useState<HeroInsuranceProvider[]>([]);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [heroVehicleData, setHeroVehicleData] = useState({
    brand: "Maruti",
    model: "Swift",
    year: "2022",
    registration: "MH12AB1234"
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Mock insurance providers data for hero section (fallback)
  const fallbackHeroProviders: HeroInsuranceProvider[] = [
    {
      name: "AI Recommendation",
      logo: "✨",
      logoColor: "bg-gradient-to-br from-blue-400 to-purple-500",
      price: "Best Match",
      idv: "Optimized",
      coverage: "AI Analyzed",
      features: ["Smart Analysis", "Best Value Detection", "Personalized Match"]
    },
    {
      name: "ICICI Lombard",
      logo: "IL",
      logoColor: "bg-blue-600",
      price: "₹3,200",
      idv: "₹5.2 Lakhs",
      coverage: "Comprehensive + Zero Dep",
      features: ["Zero Depreciation", "24x7 Roadside Assistance", "Engine Protection"]
    },
    {
      name: "Bajaj Allianz",
      logo: "BA",
      logoColor: "bg-orange-600",
      price: "₹3,450",
      idv: "₹5.1 Lakhs",
      coverage: "Comprehensive",
      features: ["Personal Accident Cover", "NCB Protection", "Key Replacement"]
    },
    {
      name: "HDFC Ergo",
      logo: "HE",
      logoColor: "bg-red-600",
      price: "₹3,680",
      idv: "₹5.0 Lakhs",
      coverage: "Comprehensive + Add-ons",
      features: ["Return to Invoice", "Consumable Cover", "Emergency Transport"]
    },
    {
      name: "Tata AIG",
      logo: "TA",
      logoColor: "bg-green-600",
      price: "₹3,850",
      idv: "₹4.9 Lakhs",
      coverage: "Third Party + Own Damage",
      features: ["Medical Expenses", "Legal Liability", "Theft Protection"]
    },
    {
      name: "New India Assurance",
      logo: "NI",
      logoColor: "bg-purple-600",
      price: "₹4,100",
      idv: "₹4.8 Lakhs",
      coverage: "Comprehensive",
      features: ["Cashless Claims", "Vehicle Tracking", "Driver Training"]
    }
  ];
  
  const navRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const navigationItems: NavigationItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" }
  ];

  const topCarBrands: CarBrand[] = [
    { name: "Honda", logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Honda_logo.svg" },
    { name: "Hyundai", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hyundai_logo.svg" },
    { name: "Mahindra", logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg" },
    { name: "Maruti", logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Maruti_Suzuki_logo.svg" },
    { name: "Mercedes-Benz", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" },
    { name: "Nissan", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Nissan_logo.svg" },
    { name: "Renault", logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/Renault_logo.svg" },
    { name: "Skoda", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Skoda_logo.svg" },
    { name: "Tata", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Tata_logo.svg" },
    { name: "Toyota", logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Toyota_logo.svg" },
    { name: "Volkswagen", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg" }  ];

  const allCarBrands: CarBrand[] = [
    { name: "Ashok Leyland", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzMzNzNkYyIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUw8L3RleHQ+Cjwvc3ZnPg==" },
    { name: "Aston Martin", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwNzUzMSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QU08L3RleHQ+Cjwvc3ZnPg==" },
    { name: "Audi", logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg" },
    { name: "Bentley", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+" },
    { name: "BMW", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg" },
    { name: "Bugatti", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+" },
    { name: "BYD", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwOGZmZiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QllEPC90ZXh0Pgo8L3N2Zz4=" },
    { name: "Chevrolet", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Chevrolet_logo.svg" },
    { name: "Citroen", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QzwvdGV4dD4KPC9zdmc+" },
    { name: "Datsun", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMzM5OSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RDwvdGV4dD4KPC9zdmc+" },
    { name: "Ferrari", logo: "https://upload.wikimedia.org/wikipedia/de/9/90/Ferrari_Logo.svg" },
    { name: "Fiat", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RjwvdGV4dD4KPC9zdmc+" },
    { name: "Force", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwNzUzMSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RjwvdGV4dD4KPC9zdmc+" },
    { name: "Ford", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg" },
    { name: "Honda", logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Honda_logo.svg" },
    { name: "Hop", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwYWE0NCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+" },
    { name: "Hummer", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzQ0NGQ1ZiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+" },
    { name: "Hyundai", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hyundai_logo.svg" },
    { name: "Isuzu", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmMzMwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+STwvdGV4dD4KPC9zdmc+" },
    { name: "Jaguar", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Jaguar_logo.svg" },
    { name: "Jeep", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMzMwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SjwvdGV4dD4KPC9zdmc+" },
    { name: "Kia", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Kia_logo2.svg" },
    { name: "Lamborghini", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmZDcwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TDwvdGV4dD4KPC9zdmc+" },
    { name: "Land Rover", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwNzUzMSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TFI8L3RleHQ+Cjwvc3ZnPg==" },
    { name: "Lexus", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzQ0NGQ1ZiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TDwvdGV4dD4KPC9zdmc+" },
    { name: "Mahindra", logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg" },
    { name: "Mahindra Renault", logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg" },
    { name: "Mahindra Ssangyong", logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg" },
    { name: "Maruti", logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Maruti_Suzuki_logo.svg" },
    { name: "Maserati", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMzM5OSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+" },
    { name: "McLaren", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmMzMwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+" },
    { name: "Mercedes-Benz", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" },
    { name: "MG", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUc8L3RleHQ+Cjwvc3ZnPg==" },
    { name: "Mini Cooper", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIiBmb250LWdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUlOSTwvdGV4dD4KPC9zdmc+" },
    { name: "Mitsubishi", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+" },
    { name: "Nissan", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Nissan_logo.svg" },
    { name: "Opel", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmZGQwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TzwvdGV4dD4KPC9zdmc+" },
    { name: "Porsche", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0itm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmZGQwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UDwvdGV4dD4KPC9zdmc+" },
    { name: "Premier", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzMzNzNkYyIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UDwvdGV4dD4KPC9zdmc+" },
    { name: "Renault", logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/Renault_logo.svg" },
    { name: "Rolls Royce", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0itm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UlI8L3RleHQ+Cjwvc3ZnPg==" },
    { name: "Skoda", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Skoda_logo.svg" },
    { name: "Ssangyong", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0itm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2QzMDAxYyIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1M8L3RleHQ+Cjwvc3ZnPg==" },
    { name: "Tata", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Tata_logo.svg" },
    { name: "Toyota", logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Toyota_logo.svg" },
    { name: "Volkswagen", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg" }
  ];
  const carModels: Record<string, string[]> = {
    Honda: ["Civic", "City", "Amaze", "CR-V", "Jazz"],
    Hyundai: ["Creta", "Venue", "i20", "Verna", "Tucson"],
    Mahindra: ["Scorpio", "XUV500", "Thar", "Bolero", "XUV300"],
    Maruti: ["Swift", "Baleno", "Dzire", "Ertiga", "Vitara Brezza"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLA", "GLE"],
    Nissan: ["Magnite", "Kicks", "Sunny", "Terrano", "GT-R"],
    Renault: ["Kwid", "Duster", "Triber", "Captur", "Fluence"],
    Skoda: ["Rapid", "Octavia", "Superb", "Kushaq", "Kodiaq"],
    Tata: ["Nexon", "Harrier", "Safari", "Tiago", "Altroz"],
    Toyota: ["Fortuner", "Innova Crysta", "Camry", "Urban Cruiser", "Glanza"],
    Volkswagen: ["Polo", "Vento", "Tiguan", "Taigun", "T-Roc"],
    // Add more brands and models as needed
  };

  const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
  const carVariants: Record<string, string[]> = {
    Civic: ["V", "VX", "ZX"],
    City: ["V", "VX", "ZX"],
    Amaze: ["E", "S", "VX"],
    "CR-V": ["Base", "Special Edition"],
    Jazz: ["V", "VX", "ZX"],
    Creta: ["E", "EX", "SX"],
    Venue: ["E", "S", "SX"],
    i20: ["Magna", "Sportz", "Asta"],
    Verna: ["E", "S", "SX"],
    Tucson: ["GLS", "GLX", "Signature"],
    Scorpio: ["S3", "S5", "S11"],
    XUV500: ["W5", "W7", "W9"],
    Thar: ["AX", "LX"],
    Bolero: ["B4", "B6", "B6 Opt"],
    XUV300: ["W4", "W6", "W8"],
    Swift: ["LXi", "VXi", "ZXi"],
    Baleno: ["Sigma", "Delta", "Zeta"],
    Dzire: ["LXi", "VXi", "ZXi"],
    Ertiga: ["LXi", "VXi", "ZXi"],
    "Vitara Brezza": ["LXi", "VXi", "ZXi"],
    "C-Class": ["C 200", "C 300", "AMG C 43"],
    "E-Class": ["E 200", "E 350", "AMG E 53"],
    "S-Class": ["S 350", "S 450", "AMG S 63"],
    GLA: ["GLA 200", "GLA 220d", "AMG GLA 35"],
    GLE: ["GLE 300d", "GLE 450", "AMG GLE 53"],
    Magnite: ["XE", "XL", "XV"],
    Kicks: ["XL", "XV", "XV Premium"],
    Sunny: ["XE", "XL", "XV"],
    Terrano: ["XL", "XV", "XV Premium"],
    "GT-R": ["Premium", "Black Edition"],
    Kwid: ["STD", "RXL", "RXT"],
    Duster: ["RXE", "RXS", "RXZ"],
    Triber: ["RXE", "RXL", "RXT"],
    Captur: ["RXE", "RXT", "Platine"],
    Fluence: ["E2", "E4"],
    Rapid: ["Rider", "Ambition", "Style"],
    Octavia: ["Active", "Ambition", "Style"],
    Superb: ["Sportline", "L&K"],
    Kushaq: ["Active", "Ambition", "Style"],
    Kodiaq: ["Style", "L&K"],
    Nexon: ["XE", "XM", "XZ"],
    Harrier: ["XE", "XM", "XZ"],
    Safari: ["XE", "XM", "XZ"],
    Tiago: ["XE", "XM", "XZ"],
    Altroz: ["XE", "XM", "XZ"],
    Fortuner: ["Base", "TRD Sportivo", "Legender"],
    "Innova Crysta": ["GX", "VX", "ZX"],
    Camry: ["Hybrid"],
    "Urban Cruiser": ["Mid", "High", "Premium"],
    Glanza: ["G", "V"],
    Polo: ["Trendline", "Comfortline", "Highline"],
    Vento: ["Trendline", "Comfortline", "Highline"],
    Tiguan: ["Comfortline", "Highline"],
    Taigun: ["Comfortline", "Highline", "Topline"],
    "T-Roc": ["Base"]
  };

  const registrationPlaces: RegistrationPlace[] = [
    { code: "MH", name: "Maharashtra" },    { code: "DL", name: "Delhi" },
    { code: "KA", name: "Karnataka" },
    { code: "TN", name: "Tamil Nadu" },
    { code: "GJ", name: "Gujarat" }
    // Add more as needed
  ];

  const companies: CarBrand[] = [
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    { name: "PayPal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "CHASE", logo: "/Chase-logo.png" },
    { name: "Walmart", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg" }
  ];

  const services = [
    {
      title: "Smart Car Insurance Quotes",
      description: "Get personalized, real-time quotes from top insurers in minutes—thanks to our advanced comparison engine.",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
      icon: "🤖"
    },
    {
      title: "Simplified Decision-Making",
      description: "Our platform reduces the time to choose the right coverage from hours to minutes, cutting through complexity for you.",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      icon: "⚡"
    },
    {
      title: "Smart Savings, Seamless Experience",
      description: "SundayInsurance partners with trusted providers to offer optimal coverage at the best prices—fast and hassle-free.",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
      icon: "🌐"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      company: "Marketing Director",
      text: "SundayInsurance made comparing car insurance quotes effortless. In just minutes, I had personalized results from multiple insurers—saved over $400 without any stress!",
      rating: 5,
      avatar: "SM"
    },
    {
      name: "David Chen",
      company: "Small Business Owner",
      text: "I used to spend hours calling around. SundayInsurance's smart platform gave me optimized quotes for my business vehicle in under 10 minutes. Total game changer!",
      rating: 5,
      avatar: "DC"
    },
    {
      name: "Emily Rodriguez",
      company: "Freelance Designer",
      text: "Their platform matched me with budget-friendly car insurance options instantly. For someone juggling gigs, this service saves time *and* money.",
      rating: 4,
      avatar: "ER"
    },
    {
      name: "Michael Thompson",
      company: "Family Man",
      text: "I was overwhelmed with choices—until SundayInsurance walked me through it. It narrowed down the best family coverage fast. Zero hassle.",
      rating: 5,
      avatar: "MT"
    },
    {
      name: "Lisa Park",
      company: "Healthcare Professional",
      text: "The comparison tool is amazing. It analyzed dozens of policies and helped me pick the best one in minutes. Saved $300 annually!",
      rating: 4,
      avatar: "LP"
    },
    {
      name: "James Wilson",
      company: "Retired Teacher",
      text: "I thought finding affordable coverage at my age would be tough. But SundayInsurance gave me tailored results quickly—and saved me hundreds.",
      rating: 5,
      avatar: "JW"
    }
  ];

  const stats = [
    { value: "₹50L+", label: "Claims Processed" },
    { value: "2L+", label: "Happy Customers" },
    { value: "28", label: "States Covered" },
    { value: "99.9%", label: "AI Accuracy" }
  ];  useEffect(() => {
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
      setScrollY(scrollTop);
      
      // Calculate parallax offset only for the quotes section
      if (quotesSectionRef.current) {
        const quotesSectionRect = quotesSectionRef.current.getBoundingClientRect();
        const quotesSectionTop = scrollTop + quotesSectionRect.top;
        const quotesSectionBottom = quotesSectionTop + quotesSectionRect.height;
          // Only apply parallax when scrolling within the quotes section area
        if (scrollTop >= quotesSectionTop - window.innerHeight && scrollTop <= quotesSectionBottom) {
          const sectionProgress = (scrollTop - quotesSectionTop + window.innerHeight) / (quotesSectionRect.height + window.innerHeight);
          setParallaxOffset(sectionProgress * 300); // Increased multiplier for more dramatic effect
        }
        
        setIsQuotesSectionPassed(scrollTop > quotesSectionBottom - window.innerHeight);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      // Cleanup smooth scrolling
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);  // Check if scroll container is scrollable and track scroll position
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        requestAnimationFrame(() => {
          const isContainerScrollable = container.scrollHeight > container.clientHeight;
          const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5; // 5px tolerance
          
          setIsScrollable(isContainerScrollable);
          setIsScrolledToBottom(isAtBottom);
          setShowScrollIndicator(isContainerScrollable && !isAtBottom);
        });
      }
    };

    const handleScroll = () => {
      checkScrollable();
    };

    // Debounce the resize handler
    let resizeTimeout: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScrollable, 100);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    checkScrollable();
    window.addEventListener('resize', debouncedCheck);
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(resizeTimeout);
    };
  }, [selectedProviderIndex]);

  // Fetch hero section quotes when component mounts
  useEffect(() => {
    const fetchHeroQuotes = async () => {
      try {
        setIsHeroLoading(true);
        setHeroError(null);
          // Simulate API call with sample data
        const mockQuoteData = {
          name: "Demo User",
          phone: "+91 9876543210",
          registrationNumber: heroVehicleData.registration
        };

        // Try to fetch real quotes, fallback to mock data
        const response = await fetchInsuranceQuotes(mockQuoteData);        if (response.success && response.quotes.length > 0) {
          // Transform API quotes to hero format
          const transformedProviders: HeroInsuranceProvider[] = response.quotes.slice(0, 4).map(quote => {
            // Parse premium string to number for calculations
            const premiumValue = parseFloat(quote.premium.replace(/[₹,]/g, '')) || 0;
            const idvValue = parseFloat(quote.idv.replace(/[₹,]/g, '')) || 0;
            
            return {
              name: quote.insurer,
              logo: quote.logoUrl || quote.insurer.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2),
              logoColor: getCompanyColor(quote.insurer),
              price: `₹${Math.round(premiumValue).toLocaleString()}`,
              idv: quote.idv,
              coverage: quote.planType || "Comprehensive",
              features: quote.details?.coverages?.slice(0, 3) || ["Cashless Claims", "24x7 Support", "NCB Protection"]
            };
          });
          
          // Add AI recommendation as the first item
          const aiRecommendation: HeroInsuranceProvider = {
            name: "AI Recommendation",
            logo: "✨",
            logoColor: "bg-gradient-to-br from-blue-400 to-purple-500",
            price: "Best Match",
            idv: "Optimized",
            coverage: "AI Analyzed",
            features: ["Smart Analysis", "Best Value Detection", "Personalized Match"]
          };
          
          setHeroProviders([aiRecommendation, ...transformedProviders]);
        } else {
          // Use fallback data if API fails
          setHeroProviders(fallbackHeroProviders);
        }
      } catch (error) {
        console.warn('Hero quotes fetch failed, using fallback data:', error);
        setHeroError('Using sample data');
        setHeroProviders(fallbackHeroProviders);
      } finally {
        setIsHeroLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchHeroQuotes, 1000);
    return () => clearTimeout(debounceTimer);
  }, [heroVehicleData]);

  // Helper function to get company brand colors
  const getCompanyColor = (companyName: string): string => {
    const colorMap: Record<string, string> = {
      'ICICI': 'bg-blue-600',
      'Bajaj': 'bg-orange-600',
      'HDFC': 'bg-red-600',
      'Tata': 'bg-green-600',
      'New India': 'bg-purple-600',
      'Oriental': 'bg-yellow-600',
      'United India': 'bg-indigo-600',
      'National': 'bg-pink-600'
    };
    
    for (const [key, color] of Object.entries(colorMap)) {
      if (companyName.includes(key)) return color;
    }
    return 'bg-slate-600'; // Default color
  };
  // Function to refresh hero data
  const refreshHeroData = () => {
    setHeroVehicleData(prev => ({ ...prev })); // Trigger useEffect
  };

  // Hyperspace animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star/line particles for hyperspace effect
    class HyperspaceLine {
      x: number;
      y: number;
      z: number;
      prevX: number;
      prevY: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.z = Math.random() * 1000 + 100;
        const angle = Math.random() * Math.PI * 2;
        const distance = 800;
        this.x = Math.cos(angle) * distance;
        this.y = Math.sin(angle) * distance;
        this.prevX = this.x;
        this.prevY = this.y;
      }

      update(centerX: number, centerY: number, speed: number) {
        this.prevX = this.x / this.z * 300 + centerX;
        this.prevY = this.y / this.z * 300 + centerY;
        
        this.z -= speed;
        
        if (this.z <= 0) {
          this.reset();
        }
      }

      draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
        const x = this.x / this.z * 300 + centerX;
        const y = this.y / this.z * 300 + centerY;
        
        const prevX = this.prevX;
        const prevY = this.prevY;
        
        const opacity = Math.max(0, (1000 - this.z) / 1000);
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.9})`;
        ctx.lineWidth = Math.max(0.5, (1000 - this.z) / 1000 * 3);
        
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    // Background stars for parallax effect
    class BackgroundStar {
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const hyperspaceLines: HyperspaceLine[] = [];
    const backgroundStars: BackgroundStar[] = [];
    
    for (let i = 0; i < 150; i++) {
      hyperspaceLines.push(new HyperspaceLine());
    }
    
    for (let i = 0; i < 50; i++) {
      backgroundStars.push(new BackgroundStar(canvas.offsetWidth, canvas.offsetHeight));
    }

    let time = 0;
    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear canvas with dark space background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, width, height);

      time += 0.016;

      // Draw background stars
      backgroundStars.forEach(star => {
        star.draw(ctx, time);
      });

      // Update and draw hyperspace lines
      hyperspaceLines.forEach(line => {
        line.update(centerX, centerY, 8 + Math.sin(time * 0.5) * 3);
        line.draw(ctx, centerX, centerY);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.registrationNumber.trim()) {
      setQuoteError("Please fill in all fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setQuoteError("Please enter a valid 10-digit phone number");
      return;
    }

    setQuoteError(null);
    setQuotes([]);
    setIsLoadingQuotes(true);
    setShowQuotes(false);

    setTimeout(() => {
      const quotesSection = document.getElementById('quotes-section');
      if (quotesSection) {
        quotesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    try {
      console.log("Fetching quotes for:", formData);
      const response = await fetchInsuranceQuotes(formData);

      if (response.success && response.quotes) {
        setQuotes(response.quotes);
        setVehicleRegistration(response.vehicleRegistration || formData.registrationNumber);
        setShowQuotes(true);
      } else {
        setQuoteError(response.error || "Failed to fetch quotes. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setQuoteError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleNewQuote = () => {
    setFormData({ name: "", phone: "", registrationNumber: "" });
    setQuotes([]);
    setQuoteError(null);
    setShowQuotes(false);
    setIsLoadingQuotes(false);

    const quoteForm = document.getElementById('quote-form');
    quoteForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNewCarClick = () => {
    setIsCarBrandDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been logged out successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
    setSelectedModel("");
    setSelectedFuelType("");
    setSelectedVariant("");
    setSelectedRegistrationPlace("");
    setIsCarBrandDialogOpen(false);
    setShowAllBrands(false);
    setIsModelDialogOpen(true);
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    setSelectedFuelType("");
    setSelectedVariant("");
    setSelectedRegistrationPlace("");
    setIsModelDialogOpen(false);
    setIsFuelTypeDialogOpen(true);
  };

  const handleFuelTypeSelect = (fuelType: string) => {
    setSelectedFuelType(fuelType);
    setSelectedVariant("");
    setSelectedRegistrationPlace("");
    setIsFuelTypeDialogOpen(false);
    setIsVariantDialogOpen(true);
  };
  const handleVariantSelect = (variant: string) => {
    setSelectedVariant(variant);
    setSelectedRegistrationPlace("");
    setIsVariantDialogOpen(false);
    setIsRegistrationDialogOpen(true);
  };

  const handleRegistrationPlaceSelect = (place: string) => {
    setSelectedRegistrationPlace(place);
    setIsRegistrationDialogOpen(false);
    console.log("Car selection complete:", {
      brand: selectedBrand,
      model: selectedModel,
      fuelType: selectedFuelType,
      variant: selectedVariant,
      registrationPlace: place
    });
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1ED' }}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20'
        : 'bg-transparent shadow-none border-b border-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">            <div className="flex items-center -ml-4">              <div className={`font-bold transition-all duration-300 flex items-center justify-center px-3 py-2 rounded-lg border ${isScrolled ? 'text-xl sm:text-2xl bg-white/10 backdrop-blur-sm border-slate-200' : 'text-xl sm:text-2xl md:text-3xl bg-black/10 backdrop-blur-sm border-white/30'}`} style={{ fontWeight: '800' }}>
                <span className="text-emerald-500 font-bold">Sunday</span>
                <span className={`ml-1 font-bold ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                  Insurance
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex relative">
                {(hoveredItem || previousHoveredItem) && (
                  <motion.div
                    className={`absolute rounded-full ${isScrolled ? 'bg-emerald-50' : 'bg-white/10'}`}
                    initial={false}
                    animate={{
                      opacity: hoveredItem ? 1 : 0,
                      scale: hoveredItem ? 1 : 0.8,
                      x: hoveredItem ? itemDimensions[hoveredItem]?.x || 0 : previousHoveredItem ? itemDimensions[previousHoveredItem]?.x || 0 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.1
                    }}
                    style={{
                      width: hoveredItem ? `${itemDimensions[hoveredItem]?.width || 120}px` : '0px',
                      height: '40px',
                      top: 0,
                      left: 0
                    }}
                  />
                )}
                {navigationItems.map((item) => {
                  const isExternalLink = item.href.startsWith('/');
                  if (isExternalLink) {
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        ref={(el) => { navRefs.current[item.label] = el; }}
                        className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${isScrolled ? hoveredItem === item.label ? 'text-emerald-500' : 'text-slate-600' : hoveredItem === item.label ? 'text-white' : 'text-white/90'}`}
                        onMouseEnter={() => {
                          setPreviousHoveredItem(hoveredItem);
                          setHoveredItem(item.label);
                        }}
                        onMouseLeave={() => {
                          setPreviousHoveredItem(hoveredItem);
                          setHoveredItem(null);
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={item.label}
                      ref={(el) => { navRefs.current[item.label] = el; }}
                      href={item.href}
                      className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${isScrolled ? hoveredItem === item.label ? 'text-emerald-500' : 'text-slate-600' : hoveredItem === item.label ? 'text-white' : 'text-white/90'}`}
                      onMouseEnter={() => {
                        setPreviousHoveredItem(hoveredItem);
                        setHoveredItem(item.label);
                      }}
                      onMouseLeave={() => {
                        setPreviousHoveredItem(hoveredItem);
                        setHoveredItem(null);
                      }}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>              {user ? (
                <div className="flex items-center space-x-3">
                  <Link to="/dashboard">
                    <Button
                      variant="ghost"
                      className="px-4 py-2 rounded-full transition-all duration-300"
                      style={{
                        background: isScrolled 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(16, 185, 129, 0.15)',
                        backdropFilter: 'blur(15px)',
                        border: isScrolled 
                          ? '1px solid rgba(16, 185, 129, 0.4)' 
                          : '1px solid rgba(16, 185, 129, 0.3)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        color: isScrolled ? '#10b981' : '#ffffff'
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <div 
                    className="flex items-center space-x-2 rounded-full px-3 py-1"
                    style={{
                      background: isScrolled 
                        ? 'rgba(30, 41, 59, 0.9)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(15px)',
                      border: isScrolled 
                        ? '1px solid rgba(30, 41, 59, 0.3)' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(user.email?.charAt(0) || user.phoneNumber?.charAt(-1) || 'U').toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isScrolled ? 'text-slate-100' : 'text-white'}`}>
                      {user.email ? user.email.split('@')[0] : user.phoneNumber}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="px-4 py-2 rounded-full transition-all duration-300"
                    style={{
                      background: isScrolled 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : 'rgba(239, 68, 68, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: isScrolled 
                        ? '1px solid rgba(239, 68, 68, 0.4)' 
                        : '1px solid rgba(239, 68, 68, 0.3)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      color: isScrolled ? '#ef4444' : '#ffffff'
                    }}
                  >
                    Logout
                  </Button>
                </div>): (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={openLoginModal}
                    variant="ghost"
                    className="px-4 py-2 rounded-full transition-all duration-300"
                    style={{
                      background: isScrolled 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(15px)',
                      border: isScrolled 
                        ? '1px solid rgba(0, 0, 0, 0.1)' 
                        : '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      color: isScrolled ? '#374151' : '#ffffff'
                    }}
                  >
                    Log in
                  </Button>                  <Button
                    onClick={openSignupModal}
                    className="px-6 py-2 rounded-full transition-all duration-300"
                    style={{
                      background: isScrolled 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.25) 50%, rgba(16, 185, 129, 0.2) 100%)' 
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 50%, rgba(16, 185, 129, 0.15) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: isScrolled 
                        ? '1px solid rgba(16, 185, 129, 0.4)' 
                        : '1px solid rgba(16, 185, 129, 0.3)',
                      boxShadow: `
                        inset 0 1px 0 rgba(255, 255, 255, 0.3),
                        inset 0 -1px 0 rgba(16, 185, 129, 0.2),
                        0 4px 15px rgba(16, 185, 129, 0.15),
                        0 2px 8px rgba(0, 0, 0, 0.1)
                      `,
                      color: '#ffffff'
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>            <div className="md:hidden">
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="icon"
                className="p-2 border-0 rounded-full"
                style={{
                  background: isScrolled 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: isScrolled 
                    ? '1px solid rgba(0, 0, 0, 0.1)' 
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  color: isScrolled ? '#374151' : '#ffffff'
                }}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>          <AnimatePresence>
            {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.25, 
                ease: "easeOut"
              }}
              className="md:hidden absolute top-full left-0 right-0 shadow-xl z-50 rounded-b-xl overflow-hidden"              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderTop: 'none',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >              {/* Compact content with optimized spacing */}
              <div className="px-4 py-4 space-y-3 relative z-10">
                {/* Navigation Items with compact design */}
                <div className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const isExternalLink = item.href.startsWith('/');
                    const linkContent = (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.03,
                          ease: "easeOut"
                        }}
                        className="block px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
                        style={{
                          background: 'rgba(255, 255, 255, 0.12)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: `
                            inset 0 1px 0 rgba(255, 255, 255, 0.3),
                            0 2px 8px rgba(0, 0, 0, 0.1)
                          `,
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <span className="font-medium text-slate-700 text-base">{item.label}</span>
                      </motion.div>
                    );

                    if (isExternalLink) {
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={closeMobileMenu}
                        >
                          {linkContent}
                        </Link>
                      );
                    }
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={closeMobileMenu}
                      >
                        {linkContent}
                      </a>
                    );
                  })}
                </div>

                {/* Compact separator */}
                <motion.div 
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="my-4 h-px relative overflow-hidden"
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
                    }}
                  />
                </motion.div>

                {/* Compact User Section */}
                {user ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.3,
                      ease: "easeOut"
                    }}
                    className="space-y-3"
                  >                    <div className="flex items-center space-x-3 px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        boxShadow: `
                          inset 0 1px 0 rgba(255, 255, 255, 0.2),
                          0 2px 8px rgba(16, 185, 129, 0.1)
                        `
                      }}
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {(user.email?.charAt(0) || user.phoneNumber?.charAt(-1) || 'U').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-700 font-medium block text-sm truncate">
                          {user.email ? user.email.split('@')[0] : user.phoneNumber}
                        </span>
                        <span className="text-emerald-600 text-xs">Online</span>
                      </div>
                    </div>

                    <Link to="/dashboard" onClick={closeMobileMenu}>
                      <Button
                        variant="outline"
                        className="w-full border-0 rounded-xl py-3 font-medium hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 touch-manipulation"
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          boxShadow: `
                            inset 0 1px 0 rgba(255, 255, 255, 0.2),
                            0 2px 8px rgba(16, 185, 129, 0.1)
                          `,
                          color: '#10b981',
                          minHeight: '44px'
                        }}
                      >
                        Dashboard
                      </Button>
                    </Link>

                    <Button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      variant="outline"
                      className="w-full border-0 rounded-xl py-3 font-medium hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 touch-manipulation"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: `
                          inset 0 1px 0 rgba(255, 255, 255, 0.2),
                          0 2px 8px rgba(239, 68, 68, 0.1)
                        `,
                        color: '#dc2626',
                        minHeight: '44px'
                      }}
                    >
                      Logout
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.3,
                      ease: "easeOut"
                    }}
                    className="space-y-3"
                  >
                    <Button
                      onClick={() => {
                        openLoginModal();
                        closeMobileMenu();
                      }}
                      variant="outline"
                      className="w-full border-0 rounded-xl py-3 font-medium hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 touch-manipulation"
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `
                          inset 0 1px 0 rgba(255, 255, 255, 0.3),
                          0 2px 8px rgba(0, 0, 0, 0.1)
                        `,
                        color: '#374151',
                        minHeight: '44px'
                      }}
                    >
                      Log in
                    </Button>
                    <Button
                      onClick={() => {
                        openSignupModal();
                        closeMobileMenu();
                      }}
                      className="w-full rounded-xl py-3 font-medium hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 touch-manipulation"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.25) 50%, rgba(16, 185, 129, 0.2) 100%)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: `
                          inset 0 1px 0 rgba(255, 255, 255, 0.3),
                          inset 0 -1px 0 rgba(16, 185, 129, 0.2),
                          0 4px 15px rgba(16, 185, 129, 0.15),
                          0 2px 8px rgba(0, 0, 0, 0.1)
                        `,
                        color: '#ffffff',
                        minHeight: '44px'
                      }}
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                )}
              </div>            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </header>      {/* Hero Section */}
      <section className="relative bg-slate-950 overflow-hidden min-h-screen flex items-center" style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 object-cover opacity-80"
          >
            <source src="/car-video.mp4" type="video/mp4" />
          </video>
          {/* Reduced overlay to make video more visible */}
          <div className="absolute inset-0 bg-slate-950/25"></div>
        </div>        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-slate-950/15 to-slate-900/10"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, #ffffff 0.5px, transparent 0.5px),
                radial-gradient(circle at 75% 25%, #ffffff 0.5px, transparent 0.5px),
                radial-gradient(circle at 25% 75%, #ffffff 0.5px, transparent 0.5px),
                radial-gradient(circle at 75% 75%, #ffffff 0.5px, transparent 0.5px)
              `,
              backgroundSize: '100px 100px'
            }}></div>
          </div>
          {/* Simplified decorative elements */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div><div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-4"
              >
                <span className="text-blue-400 text-sm font-medium tracking-wide uppercase">Insurance, now smarter.</span>
              </motion.div>              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                <span className="text-white">Compare & Save on</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Vehicle Insurance</span><br />
                <span className="text-white">Instantly</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg mb-8 text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Get real-time quotes, AI recommendations, and smarter protection — whether you're renewing or buying a new policy.
              </motion.p>              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8"
              >                <Button
                  onClick={() => {
                    const quoteForm = document.getElementById('quote-form');
                    quoteForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-full text-lg border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  Get Quotes Now
                </Button>                {/* Only show login button when user is not logged in */}
                {!user && (
                  <Button
                    onClick={openLoginModal}
                    variant="outline"
                    className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-green-400 hover:text-white px-8 py-3 rounded-full text-lg backdrop-blur-sm transition-all duration-300"
                  >
                    Login
                  </Button>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative flex justify-center flex-shrink-0"
            >
              <div 
                className="relative p-6 rounded-3xl max-w-md w-full max-h-[600px] overflow-hidden flex flex-col"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.05)
                  `
                }}
              >
                {/* Liquid Glass Inner Glow */}
                <div 
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.1) 0%, 
                        rgba(255, 255, 255, 0.05) 25%, 
                        transparent 50%, 
                        rgba(255, 255, 255, 0.03) 75%, 
                        rgba(255, 255, 255, 0.08) 100%
                      )
                    `
                  }}
                />
                
                {/* Floating Glass Particles */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full blur-sm animate-pulse" />
                <div className="absolute top-8 right-6 w-1 h-1 bg-white/30 rounded-full blur-sm animate-pulse animation-delay-1000" />
                <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-white/15 rounded-full blur-sm animate-pulse animation-delay-2000" />                <div 
                  className="p-4 rounded-2xl mb-6 flex-shrink-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Vehicle Details</span>
                    <div className="flex items-center gap-2">
                      {heroError && (
                        <span className="text-yellow-400 text-xs">Demo</span>
                      )}
                      <span className="text-blue-400 text-xs font-medium">✓ Verified</span>
                      <button 
                        onClick={refreshHeroData}
                        className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                        title="Refresh quotes"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                  <div className="text-white font-bold text-lg">
                    {heroVehicleData.brand} {heroVehicleData.model} {heroVehicleData.year}
                  </div>
                  <div className="text-slate-400 text-sm">{heroVehicleData.registration}</div>
                </div>
                <div 
                  className="flex items-center gap-2 mb-4 p-3 rounded-xl flex-shrink-0"
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <span className="text-blue-300 font-medium text-sm">AI Recommended for You</span>
                </div>                {/* Insurance Provider Cards Container */}
                <div className="flex-1 overflow-y-auto scrollbar-hide relative card-container" ref={scrollContainerRef}>
                  <div className="space-y-3 relative">
                    {heroProviders.map((provider, index) => (
                      <motion.div
                        key={provider.name}
                        initial={false}
                        animate={{
                          height: selectedProviderIndex === index ? "auto" : "64px"
                        }}
                        transition={{ 
                          duration: 0.3,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          type: "tween"
                        }}
                        className="overflow-hidden rounded-xl border cursor-pointer relative"
                        style={{
                          transformOrigin: 'top',
                          willChange: 'height, background-color, border-color, box-shadow',
                          background: selectedProviderIndex === index 
                            ? 'rgba(59, 130, 246, 0.12)' 
                            : 'rgba(255, 255, 255, 0.06)',
                          backdropFilter: 'blur(15px)',
                          border: selectedProviderIndex === index 
                            ? '1px solid rgba(59, 130, 246, 0.3)' 
                            : '1px solid rgba(255, 255, 255, 0.15)',
                          boxShadow: selectedProviderIndex === index
                            ? `
                              0 8px 25px rgba(59, 130, 246, 0.15),
                              inset 0 1px 0 rgba(255, 255, 255, 0.2),
                              inset 0 -1px 0 rgba(59, 130, 246, 0.1)
                            `
                            : `
                              0 4px 15px rgba(0, 0, 0, 0.1),
                              inset 0 1px 0 rgba(255, 255, 255, 0.15)
                            `,
                          transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onClick={() => {
                          if (!user && index > 0) {
                            // If user is not logged in and clicking on policy details (not AI recommendation)
                            openLoginModal();
                            return;
                          }
                          setSelectedProviderIndex(selectedProviderIndex === index ? -1 : index);
                        }}
                      >{/* Collapsed Header (Always Visible) */}
                      <div className="p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 ${provider.logoColor} rounded flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold text-xs">{provider.logo}</span>
                          </div>
                          <span className={`font-semibold transition-colors duration-200 ${
                            selectedProviderIndex === index ? 'text-white' : 'text-slate-300'
                          } ${index === 0 ? 'text-blue-300' : ''}`}>
                            {provider.name}
                          </span>
                          {index === 0 && (
                            <div 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#60a5fa'
                              }}
                            >
                              AI
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`font-semibold transition-all duration-200 ${
                            selectedProviderIndex === index ? 'text-white text-lg' : 'text-white'
                          } ${index === 0 ? 'text-blue-300' : ''}`}>
                            {index === 0 ? provider.price : `${provider.price}/yr`}
                          </span>
                          <motion.div
                            animate={{ rotate: selectedProviderIndex === index ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>                      {/* Expanded Details (Only visible when selected) */}
                      {selectedProviderIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: 0.1 }}
                          className="px-4 pb-4"
                        >
                          {index === 0 ? (
                            // AI Recommendation expanded content
                            <div className="space-y-3">
                              <div 
                                className="p-3 rounded-xl"
                                style={{
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}
                              >
                                <div className="text-blue-300 text-sm font-medium mb-2">AI Analysis Results</div>
                                <div className="text-xs text-slate-300">
                                  Our AI has analyzed 50+ insurance providers to find the optimal coverage 
                                  for your {heroVehicleData.brand} {heroVehicleData.model}.
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div 
                                  className="p-2 rounded-lg"
                                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                                >
                                  <div className="text-emerald-300 text-xs">Best Value</div>
                                  <div className="text-white font-semibold">₹2,850</div>
                                </div>
                                <div 
                                  className="p-2 rounded-lg"
                                  style={{ background: 'rgba(139, 92, 246, 0.1)' }}
                                >
                                  <div className="text-purple-300 text-xs">Coverage Score</div>
                                  <div className="text-white font-semibold">9.2/10</div>
                                </div>
                              </div>
                              {user && (
                                <div 
                                  className="p-3 rounded-xl text-center"
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                  }}
                                >
                                  <div className="text-emerald-300 text-sm font-medium">Ready to proceed!</div>
                                  <div className="text-xs text-slate-300 mt-1">
                                    Click below to see your personalized quotes
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Regular provider expanded content
                            <>
                              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-slate-400">IDV</span>
                                  <div className="text-white font-semibold">{provider.idv}</div>
                                </div>
                                <div>
                                  <span className="text-slate-400">Coverage</span>
                                  <div className="text-white font-semibold">{provider.coverage}</div>
                                </div>
                              </div>
                              {/* Features */}
                              <div className="space-y-2">
                                <h4 className="text-white font-medium text-sm">Key Features:</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {provider.features.map((feature, featureIndex) => (
                                    <motion.div 
                                      key={featureIndex} 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ 
                                        duration: 0.2, 
                                        delay: featureIndex * 0.05 + 0.15 
                                      }}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                                      <span className="text-slate-300">{feature}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>                        )}
                    </motion.div>
                  ))}                  {/* Single Glass Overlay covering all policy detail tiles (except AI recommendation) for logged-out users */}
                  {!user && (
                    <div 
                      className="absolute z-20 rounded-xl flex flex-col items-center justify-center cursor-pointer"
                      style={{
                        top: '76px', // Position after first card (AI recommendation) + gap
                        left: '0',
                        right: '0',
                        bottom: '0',                        background: 'rgba(75, 85, 99, 0.95)',
                        backdropFilter: 'blur(50px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: `
                          0 8px 32px rgba(0, 0, 0, 0.5),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1),
                          inset 0 -1px 0 rgba(255, 255, 255, 0.05)
                        `
                      }}
                      onClick={() => openLoginModal()}
                    >
                      {/* Liquid Glass Lock Icon */}
                      <div 
                        className="w-12 h-12 mb-4 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: `
                            inset 0 1px 0 rgba(255, 255, 255, 0.3),
                            0 4px 15px rgba(0, 0, 0, 0.2)
                          `
                        }}
                      >
                        <Lock className="w-6 h-6 text-white/90" />
                      </div>
                      <div className="text-center">
                        <div className="text-white text-lg font-semibold mb-2">Smart Dashboard</div>
                        <div className="text-white/70 text-sm mb-4 max-w-xs">
                          Login or signup to unlock personalized insurance quotes and smart recommendations
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLoginModal();
                            }}
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            Login
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openSignupModal();
                            }}
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                    {/* Scroll Indicator - Only show when scrollable and not at bottom */}
                  {showScrollIndicator && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <motion.button
                        initial={{ opacity: 0.6 }}
                        animate={{ 
                          opacity: [0.6, 1, 0.6],
                          y: [0, 2, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          opacity: 1
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const container = scrollContainerRef.current;
                          if (container) {
                            container.scrollTo({
                              top: container.scrollTop + 100, // Scroll down by 100px
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className="w-8 h-8 bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-600/80 hover:border-slate-500/70 transition-colors duration-200 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </motion.button>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-6 text-white rounded-xl py-3 flex-shrink-0 transition-all duration-300 transform hover:scale-[1.02]"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: `
                      0 8px 25px rgba(59, 130, 246, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  View All Quotes
                </Button>
              </div>
            </motion.div>
          </div>        </div>
      </section>      {/* 3D Hyperloop Quotes Section Container */}      <div className="px-4 sm:px-6 lg:px-8 pt-4" style={{ backgroundColor: '#F5F1ED' }}>
        <section 
          id="quotes-section" 
          ref={quotesSectionRef}
          className="relative"
          style={{ 
            backgroundColor: '#F5F1ED',
            marginTop: '15px'
          }}
        >
          {/* Quotes Section Container with Space Animation */}
          <div 
            className="p-6 rounded-[20px] relative bg-slate-950 min-h-screen overflow-hidden"
            style={{
              boxShadow: `
                0 15px 30px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
                  {/* Space Animation Background with Canvas */}
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none z-0 rounded-[20px]"
                    style={{ background: 'rgba(0, 0, 0, 0.95)' }}
                  />
                  
                  {/* Portal Glow Effect Around Form */}
                  <div className="absolute inset-0 z-1 rounded-[20px] overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-cyan-400/20 to-blue-600/10 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
                  </div>

                  <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Epic Header */}
                    <div className="text-center mb-12">
                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-2xl"
                      >
                        Get Your AI-Powered Quote
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-lg text-cyan-200/90 drop-shadow-md"
                      >
                        Experience the next generation of insurance with quantum-speed quotes
                      </motion.p>
                    </div>{/* Liquid Glass Form with Subtle Glow */}
          {!showQuotes && !isLoadingQuotes && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Card 
                id="quote-form" 
                className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl"></div>
                
                <CardContent className="p-8 relative z-10">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <FormField
                      label="Name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl transition-all duration-300"
                    />
                    <FormField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl transition-all duration-300"
                    />
                    <FormField
                      label="Registration Number"
                      name="registrationNumber"
                      placeholder="MH 01 AB 1234"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl transition-all duration-300"
                    />
                    <Button
                      type="submit"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-xl text-lg h-12 border border-white/20 hover:border-white/40 shadow-lg transition-all duration-300 transform hover:scale-105"
                      style={{
                        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Get Quotes
                    </Button>
                  </form>
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleNewCarClick}
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white/90 hover:bg-white/20 hover:border-white/50 px-6 py-2 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      New Car? Click Here
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}          {/* Loading Animation */}
          {isLoadingQuotes && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-white/40 rounded-full animate-spin animation-delay-150"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
              </div>
              <p className="text-white/80 text-lg mt-6 animate-pulse">Scanning the galaxy for the best quotes...</p>
            </motion.div>
          )}          {/* Error Display */}
          {quoteError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8"
            >
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
                <p className="text-red-400 text-lg">{quoteError}</p>
              </div>
            </motion.div>
          )}                  {/* Quote Results */}
                  {showQuotes && quotes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <QuoteResults
                        quotes={quotes}
                        vehicleRegistration={vehicleRegistration}
                        onNewQuote={handleNewQuote}
                      />
                    </motion.div>
                  )}

                  {/* Trusted Companies Section */}
                  <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
                    <h3 className="text-center text-white/80 text-base sm:text-lg mb-6 sm:mb-8">Trusted Partners</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-center">
                      {companies.map((company) => (
                        <motion.div 
                          key={company.name} 
                          className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 bg-white/5 backdrop-blur-xl rounded-2xl p-3 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 h-24 sm:h-28 lg:h-32 w-full"
                          style={{
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <img
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className={`w-auto object-contain opacity-70 hover:opacity-90 transition-all duration-300 drop-shadow-lg ${company.name === 'CHASE' ? 'h-8 sm:h-10 lg:h-12' : 'h-6 sm:h-7 lg:h-8'}`}
                          />
                          <span className="text-sm sm:text-base lg:text-lg font-medium text-white/80 text-center">
                            {company.name}
                          </span>                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
          </div>
        </section>
      </div>

      {/* Services Section */}
      <section className="py-16" style={{ backgroundColor: '#F5F1ED' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover how SundayInsurance simplifies your insurance journey with smart, efficient solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 group border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <CardContent className="p-6 flex flex-col h-full relative">
                    {/* Liquid Glass Inner Glow */}
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `
                          linear-gradient(135deg, 
                            rgba(59, 130, 246, 0.05) 0%, 
                            rgba(139, 92, 246, 0.05) 50%, 
                            rgba(236, 72, 153, 0.05) 100%
                          )
                        `
                      }}
                    />
                    
                    {/* Floating Glass Particles */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                    <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400/40 rounded-full blur-sm animate-pulse animation-delay-1000" />
                    <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-pink-400/20 rounded-full blur-sm animate-pulse animation-delay-2000" />
                    
                    <div className="text-3xl mb-4 relative z-10">{service.icon}</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 relative z-10">{service.title}</h3>
                    <p className="text-slate-600 flex-grow relative z-10">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>      {/* Testimonials Section */}
      <section className="py-16" style={{ backgroundColor: '#F5F1ED' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Customers Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hear from real people who’ve saved time and money with SundayInsurance.
            </p>
          </div>          {/* Infinite Scrolling Container with Duplication */}
          <div className="testimonials-container">
            <div className="testimonials-scroll">
              {/* First set of testimonials */}
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={`first-${index}`}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0"
                  style={{ width: '350px' }}
                >
                <Card 
                  className="h-full rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 group border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <CardContent className="p-6 flex flex-col h-full relative">
                    {/* Liquid Glass Inner Glow */}
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `
                          linear-gradient(135deg, 
                            rgba(59, 130, 246, 0.05) 0%, 
                            rgba(139, 92, 246, 0.05) 50%, 
                            rgba(236, 72, 153, 0.05) 100%
                          )
                        `
                      }}
                    />
                    
                    {/* Floating Glass Particles */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                    <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400/40 rounded-full blur-sm animate-pulse animation-delay-1000" />
                    <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-pink-400/20 rounded-full blur-sm animate-pulse animation-delay-2000" />
                    
                    <div className="flex items-center mb-4 relative z-10">
                      <div className="w-12 h-12 mr-4 rounded-full overflow-hidden border-2 border-slate-200/50">
                        <div 
                          className="w-full h-full flex items-center justify-center text-slate-600 text-lg font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                            position: 'relative'
                          }}
                        >
                          {/* Professional avatar icon for light mode */}
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            className="w-7 h-7 text-slate-500"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="8" r="3" fill="currentColor"/>
                            <path d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-semibold">{testimonial.name}</h4>
                        <p className="text-slate-600 text-sm">{testimonial.company}</p>
                      </div>
                    </div>
                    <div className="flex mb-3 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 flex-grow relative z-10">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
              
              {/* Duplicate set of testimonials for seamless infinite loop */}
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={`second-${index}`}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0"
                  style={{ width: '350px' }}
                >
                <Card 
                  className="h-full rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 group border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <CardContent className="p-6 flex flex-col h-full relative">
                    {/* Liquid Glass Inner Glow */}
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `
                          linear-gradient(135deg, 
                            rgba(59, 130, 246, 0.05) 0%, 
                            rgba(139, 92, 246, 0.05) 50%, 
                            rgba(236, 72, 153, 0.05) 100%
                          )
                        `
                      }}
                    />
                    
                    {/* Floating Glass Particles */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                    <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400/40 rounded-full blur-sm animate-pulse animation-delay-1000" />
                    <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-pink-400/20 rounded-full blur-sm animate-pulse animation-delay-2000" />
                    
                    <div className="flex items-center mb-4 relative z-10">
                      <div className="w-12 h-12 mr-4 rounded-full overflow-hidden border-2 border-slate-200/50">
                        <div 
                          className="w-full h-full flex items-center justify-center text-slate-600 text-lg font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                            position: 'relative'
                          }}
                        >
                          {/* Professional avatar icon for light mode */}
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            className="w-7 h-7 text-slate-500"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="8" r="3" fill="currentColor"/>
                            <path d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-semibold">{testimonial.name}</h4>
                        <p className="text-slate-600 text-sm">{testimonial.company}</p>
                      </div>
                    </div>
                    <div className="flex mb-3 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 flex-grow relative z-10">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Car Selection Dialogs */}<Dialog open={isCarBrandDialogOpen} onOpenChange={setIsCarBrandDialogOpen}>
        <DialogContent 
          className="max-w-3xl rounded-2xl border-0 overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Select Car Brand</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto">
            {(showAllBrands ? allCarBrands : topCarBrands).map((brand) => (
              <Button
                key={brand.name}
                variant="outline"
                className="flex items-center justify-start h-16 border-0 text-white transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => handleBrandSelect(brand.name)}
              >
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="w-8 h-8 mr-3 object-contain"
                />
                <span>{brand.name}</span>
              </Button>
            ))}
          </div>
          {!showAllBrands && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                className="border-0 text-blue-300 transition-all duration-300"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
                onClick={() => setShowAllBrands(true)}
              >
                Show All Brands
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent 
          className="rounded-2xl border-0 overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Select Car Model</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {carModels[selectedBrand]?.map((model) => (
              <Button
                key={model}
                variant="outline"
                className="h-12 border-0 text-white transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => handleModelSelect(model)}
              >
                {model}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>      <Dialog open={isFuelTypeDialogOpen} onOpenChange={setIsFuelTypeDialogOpen}>
        <DialogContent 
          className="rounded-2xl border-0 overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Select Fuel Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {fuelTypes.map((fuel) => (
              <Button
                key={fuel}
                variant="outline"
                className="h-12 border-0 text-white transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => handleFuelTypeSelect(fuel)}
              >
                {fuel}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent 
          className="rounded-2xl border-0 overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Select Variant</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {carVariants[selectedModel]?.map((variant) => (
              <Button
                key={variant}
                variant="outline"
                className="h-12 border-0 text-white transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => handleVariantSelect(variant)}
              >
                {variant}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>      <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
        <DialogContent 
          className="rounded-2xl border-0 overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Select Registration Place</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {registrationPlaces.map((place) => (
              <Button
                key={place.code}
                variant="outline"
                className="h-12 border-0 text-white transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => handleRegistrationPlaceSelect(place.name)}
              >
                {place.name}
              </Button>
            ))}
          </div>        </DialogContent>
      </Dialog>      {/* How SundayInsurance Works Section */}
      <section className="py-20 relative overflow-hidden how-works-section">
        {/* Abstract Wavy Background */}
        <div className="absolute inset-0 how-works-bg"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              How <span className="text-emerald-500">Sunday</span>Insurance Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get the perfect insurance for your vehicle in just 3 intelligent steps. No hassle, no spam, just smart protection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1: Compare Quotes */}            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >              {/* Step Number - Outside of Card */}              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-50 border-2 border-slate-200">
                1
              </div>              <Card 
                className="h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 group border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, 
                      rgba(59, 130, 246, 0.08) 0%, 
                      rgba(139, 92, 246, 0.06) 50%, 
                      rgba(236, 72, 153, 0.08) 100%
                    ), rgba(255, 255, 255, 0.95)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.boxShadow = `
                    0 12px 40px rgba(59, 130, 246, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `;
                }}
              >
                <CardContent className="p-8 relative">
                  
                  {/* Liquid Glass Inner Glow */}
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(59, 130, 246, 0.05) 0%, 
                          rgba(139, 92, 246, 0.05) 50%, 
                          rgba(236, 72, 153, 0.05) 100%
                        )
                      `
                    }}
                  />
                  
                  {/* Floating Glass Particles */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                  <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400/40 rounded-full blur-sm animate-pulse animation-delay-1000" />
                  <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-pink-400/20 rounded-full blur-sm animate-pulse animation-delay-2000" />

                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900">Easy to Use</h3>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <p className="text-slate-600 leading-relaxed">
                        Just enter your car registration number or basic vehicle info.
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        We instantly pull relevant details and start comparing policies — no complex forms, no jargon.
                      </p>
                    </div>

                    {/* Interactive Demo - Updated for light mode */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-600 text-sm">Vehicle Registration</span>
                        <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">AUTO-DETECTED</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="MH 12 AB 1234"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 text-sm"
                          disabled
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3 text-slate-900">🡒</span>
                        <div>
                          <div className="text-emerald-700 font-medium text-sm">Your car, your location, your needs</div>
                          <div className="text-emerald-600 text-xs">— all in seconds.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Link Your Vehicle */}            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative"
            >              {/* Step Number - Outside of Card */}              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-50 border-2 border-slate-200">
                2
              </div>                <Card 
                className="h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 group border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, 
                      rgba(59, 130, 246, 0.08) 0%, 
                      rgba(139, 92, 246, 0.06) 50%, 
                      rgba(236, 72, 153, 0.08) 100%
                    ), rgba(255, 255, 255, 0.95)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.boxShadow = `
                    0 12px 40px rgba(59, 130, 246, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `;
                }}
              >
                <CardContent className="p-8 relative">
                  
                  {/* Liquid Glass Inner Glow */}
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(59, 130, 246, 0.05) 0%, 
                          rgba(139, 92, 246, 0.05) 50%, 
                          rgba(236, 72, 153, 0.05) 100%
                        )
                      `
                    }}
                  />
                  
                  {/* Floating Glass Particles */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                  <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400/40 rounded-full blur-sm animate-pulse animation-delay-1000" />
                  <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-pink-400/20 rounded-full blur-sm animate-pulse animation-delay-2000" />

                <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      
                      <h3 className="text-2xl font-bold text-slate-900">AI-Powered with Market Analysis NLP</h3>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <p className="text-slate-600 leading-relaxed">
                        Our intelligent engine does the heavy lifting.
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        We analyze real-time insurance quotes, customer reviews, policy documents, and market trends using AI + NLP to recommend the smartest plan for you.
                      </p>
                    </div>

                    {/* AI Analysis Demo - Updated for light mode */}
                    <div className="space-y-3 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                          <div>
                            <div className="text-slate-900 text-sm font-medium">Real-time Quote Analysis</div>
                            <div className="text-blue-600 text-xs">Processing 50+ insurance providers</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse animation-delay-500"></div>
                          <div>
                            <div className="text-slate-900 text-sm font-medium">Customer Review NLP</div>
                            <div className="text-purple-600 text-xs">Analyzing 10,000+ reviews</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse animation-delay-1000"></div>
                          <div>
                            <div className="text-slate-900 text-sm font-medium">Market Trend Analysis</div>
                            <div className="text-emerald-600 text-xs">Live pricing intelligence</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🡒</span>
                        <div>
                          <div className="text-blue-700 font-medium text-sm">Think of it as having a personal insurance analyst</div>
                          <div className="text-blue-600 text-xs">— but faster and sharper.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>            {/* Step 3: Save & Get Covered */}            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Step Number - Outside of Card */}              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-50 border-2 border-slate-200">
                3
              </div>                <Card 
                className="h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 group border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, 
                      rgba(139, 92, 246, 0.08) 0%, 
                      rgba(236, 72, 153, 0.06) 50%, 
                      rgba(248, 113, 113, 0.08) 100%
                    ), rgba(255, 255, 255, 0.95)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.boxShadow = `
                    0 12px 40px rgba(139, 92, 246, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `;
                }}
              >
                <CardContent className="p-8 relative">
                  
                  {/* Liquid Glass Inner Glow */}
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(59, 130, 246, 0.05) 0%, 
                          rgba(139, 92, 246, 0.05) 50%, 
                          rgba(236, 72, 153, 0.05) 100%
                        )
                      `
                    }}
                  />
                  
                  {/* Floating Glass Particles */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                  <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400/40 rounded-full blur-sm animate-pulse animation-delay-1000" />
                  <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-pink-400/20 rounded-full blur-sm animate-pulse animation-delay-2000" /><div className="relative z-10">
                    <div className="flex items-center mb-6">
                      
                      <h3 className="text-2xl font-bold text-slate-900">Save Time & Money</h3>
                    </div>
                    
                    <div className="space-y-4 mb-6">                      <p className="text-slate-600 leading-relaxed">
                        Compare, choose, and get insured in minutes.
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        No spammy calls. No paperwork. Just transparent policies, better prices, and complete control — all in one place.
                      </p>
                    </div>                    {/* Benefits Display - Updated for light mode */}
                    <div className="space-y-3 mb-6">
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-900 font-bold text-lg">₹2,850</div>
                            <div className="text-emerald-600 text-xs">Average Savings</div>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-900 font-bold text-lg">3 min</div>
                            <div className="text-blue-600 text-xs">Average Time</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                          <div className="text-slate-900 font-semibold">✗ No Spam</div>
                          <div className="text-slate-600">Zero calls</div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                          <div className="text-slate-900 font-semibold">✗ No Papers</div>
                          <div className="text-slate-600">100% Digital</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🡒</span>
                        <div>
                          <div className="text-purple-700 font-medium text-sm">Your perfect insurance</div>
                          <div className="text-purple-600 text-xs">without the usual hassle.</div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                      style={{
                        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      Get Started Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="max-w-3xl mx-auto">              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Ready to Save on Your Insurance?
              </h3>
              <p className="text-slate-600 mb-8">
                Join thousands of satisfied customers who've saved money and time with SundayInsurance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                  style={{
                    boxShadow: '0 15px 35px rgba(52, 211, 153, 0.3)'
                  }}
                >
                  Get Your Quote Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                  style={{
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="border-t border-slate-800 py-12 relative overflow-hidden"
        style={{
          backgroundColor: '#071624',
          backgroundImage: 'url(/bg-hiw-get-started.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="/favicon.svg" 
                  alt="SundayInsurance Logo" 
                  className="w-8 h-8 mr-3"
                />
                <div className="font-bold text-xl">
                  <span className="text-emerald-500">Sunday</span>
                  <span className="text-white ml-1">Insurance</span>
                </div>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Smart vehicle insurance comparison platform that finds you the best quotes from top insurers in India. Compare, save, and protect with confidence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.958 1.404-5.958s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.085.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/services" className="text-slate-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-semibold mb-4">Insurance Types</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Car Insurance</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Bike Insurance</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Commercial Vehicle</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Health Insurance</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 SundayInsurance. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;