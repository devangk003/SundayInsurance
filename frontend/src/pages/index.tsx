import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import QuoteResults from "@/components/QuoteResults";
import LoadingQuotes from "@/components/LoadingQuotes";
import { fetchInsuranceQuotes, InsuranceQuote, QuoteResponse } from "@/services/api";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const Index = () => {
  const { user, openLoginModal, openSignupModal } = useAuth();
  const { toast } = useToast();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [previousHoveredItem, setPreviousHoveredItem] = useState<string | null>(null);
  const [isCarBrandDialogOpen, setIsCarBrandDialogOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [itemDimensions, setItemDimensions] = useState<Record<string, { width: number; x: number }>>({});
  const navRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Car selection flow state
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedFuelType, setSelectedFuelType] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedRegistrationPlace, setSelectedRegistrationPlace] = useState<string>("");
  
  // Dialog states for multi-step flow
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isFuelTypeDialogOpen, setIsFuelTypeDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    registrationNumber: ""
  });

  // Quote-related state
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [showQuotes, setShowQuotes] = useState(false);
  const [vehicleRegistration, setVehicleRegistration] = useState<string>("");

  const navigationItems = [
    { label: "Car Insurance", href: "#car-insurance" },
    { label: "Business", href: "#business" },
    { label: "For Employees", href: "#employees" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About Us", href: "/about" }
  ];

  // Car data for vehicle selection
  const carModels: Record<string, string[]> = {
    "Ford": ["EcoSport", "Endeavour", "Figo", "Aspire", "Freestyle"],
    "Honda": ["City", "Amaze", "WR-V", "Jazz", "CR-V"],
    "Hyundai": ["Creta", "Verna", "i20", "Venue", "Tucson"],
    "Mahindra": ["XUV700", "Scorpio", "Thar", "Bolero", "XUV300"],
    "Maruti": ["Swift", "Baleno", "Alto", "Wagon R", "Vitara Brezza"],
    "Toyota": ["Innova", "Fortuner", "Camry", "Glanza", "Urban Cruiser"],
    "Tata": ["Nexon", "Harrier", "Safari", "Altroz", "Punch"]
  };

  const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

  const carVariants: Record<string, string[]> = {
    "EcoSport": ["Ambiente", "Trend", "Titanium", "S"],
    "City": ["V", "VX", "ZX"],
    "Creta": ["E", "EX", "S", "SX"],
    "Swift": ["LXI", "VXI", "ZXI", "ZXI+"]
  };

  const registrationPlaces = [
    { code: "DL", name: "Delhi" },
    { code: "MH", name: "Maharashtra" },
    { code: "KA", name: "Karnataka" },
    { code: "TN", name: "Tamil Nadu" },
    { code: "UP", name: "Uttar Pradesh" },
    { code: "GJ", name: "Gujarat" },
    { code: "RJ", name: "Rajasthan" },
    { code: "WB", name: "West Bengal" },
    { code: "MP", name: "Madhya Pradesh" },
    { code: "HR", name: "Haryana" }
  ];

  const topCarBrands = [
    {
      name: "Ford",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg"
    },
    {
      name: "Honda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Honda_logo.svg"
    },
    {
      name: "Hyundai",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hyundai_logo.svg"
    },
    {
      name: "Mahindra",
      logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg"
    },
    {
      name: "Maruti",
      logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Maruti_Suzuki_logo.svg"
    },
    {
      name: "Mercedes-Benz",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg"
    },
    {
      name: "Nissan",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Nissan_logo.svg"
    },
    {
      name: "Renault",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/Renault_logo.svg"
    },
    {
      name: "Skoda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Skoda_logo.svg"
    },
    {
      name: "Tata",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Tata_logo.svg"
    },
    {
      name: "Toyota",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Toyota_logo.svg"
    },
    {
      name: "Volkswagen",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg"
    }
  ];
  const allCarBrands = [
    {
      name: "Ashok Leyland",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzMzNzNkYyIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUw8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      name: "Aston Martin",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwNzUzMSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QU08L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      name: "Audi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg"
    },
    {
      name: "Bentley",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "BMW",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg"
    },
    {
      name: "Bugatti",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "BYD",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwOGZmZiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QllEPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      name: "Chevrolet",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Chevrolet_logo.svg"
    },
    {
      name: "Citroen",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QzwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Datsun",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMzM5OSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Ferrari",
      logo: "https://upload.wikimedia.org/wikipedia/de/9/90/Ferrari_Logo.svg"
    },
    {
      name: "Fiat",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RjwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Force",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwNzUzMSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RjwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Ford",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg"
    },
    {
      name: "Honda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Honda_logo.svg"
    },
    {
      name: "Hop",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwYWE0NCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Hummer",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzQ0NGQ1ZiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Hyundai",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hyundai_logo.svg"
    },
    {
      name: "Isuzu",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmMzMwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+STwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Jaguar",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Jaguar_logo.svg"
    },
    {
      name: "Jeep",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMzMwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SjwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Kia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Kia_logo2.svg"
    },
    {
      name: "Lamborghini",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmZDcwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Land Rover",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwNzUzMSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TFI8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      name: "Lexus",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzQ0NGQ1ZiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Mahindra",
      logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg"
    },
    {
      name: "Mahindra Renault",
      logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg"
    },
    {
      name: "Mahindra Ssangyong",
      logo: "https://upload.wikimedia.org/wikipedia/en/8/85/Mahindra_logo.svg"
    },
    {
      name: "Maruti",
      logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Maruti_Suzuki_logo.svg"
    },
    {
      name: "Maserati",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMzM5OSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "McLaren",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmMzMwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Mercedes-Benz",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg"
    },
    {
      name: "MG",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUc8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      name: "Mini Cooper",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUlOSTwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Mitsubishi",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2Q3MDAyNCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Nissan",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Nissan_logo.svg"
    },
    {
      name: "Opel",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmZGQwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TzwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Porsche",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2ZmZGQwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9ImJsYWNrIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Premier",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzMzNzNkYyIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UDwvdGV4dD4KPC9zdmc+"
    },
    {
      name: "Renault",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/Renault_logo.svg"
    },
    {
      name: "Rolls Royce",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UlI8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      name: "Skoda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Skoda_logo.svg"
    },
    {
      name: "Ssangyong",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI2QzMDAxYyIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1M8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      name: "Tata",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Tata_logo.svg"
    },
    {
      name: "Toyota",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Toyota_logo.svg"
    },
    {
      name: "Volkswagen",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg"
    }
  ];
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);  // Measure the actual width and position of each navigation item
  useEffect(() => {
    const measureItemDimensions = () => {
      const dimensions: Record<string, { width: number; x: number }> = {};
      let cumulativeX = 0;
      
      navigationItems.forEach(item => {
        const element = navRefs.current[item.label];
        if (element) {
          const rect = element.getBoundingClientRect();
          const parentRect = element.parentElement?.getBoundingClientRect();
          
          dimensions[item.label] = {
            width: rect.width,
            x: cumulativeX
          };
          cumulativeX += rect.width;
        }
      });
      
      setItemDimensions(dimensions);
    };

    // Measure after a short delay to ensure elements are rendered
    const timer = setTimeout(measureItemDimensions, 100);
    
    // Re-measure on window resize
    window.addEventListener('resize', measureItemDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureItemDimensions);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.registrationNumber.trim()) {
      setQuoteError("Please fill in all fields");
      return;
    }

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setQuoteError("Please enter a valid 10-digit phone number");
      return;
    }    // Clear previous state
    setQuoteError(null);
    setQuotes([]);
    setIsLoadingQuotes(true);
    setShowQuotes(false);

    // Scroll to quote results section immediately when API execution starts
    setTimeout(() => {
      const quotesSection = document.getElementById('quotes-section');
      if (quotesSection) {
        quotesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    try {
      console.log("Fetching quotes for:", formData);
      const response: QuoteResponse = await fetchInsuranceQuotes(formData);
      
      if (response.success && response.quotes) {
        setQuotes(response.quotes);
        setVehicleRegistration(response.vehicleRegistration || formData.registrationNumber);
        setShowQuotes(true);
      } else {
        setQuoteError(response.error || "Failed to fetch quotes. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setQuoteError("An unexpected error occurred. Please try again.");    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleNewQuote = () => {
    setFormData({ name: "", phone: "", registrationNumber: "" });
    setQuotes([]);
    setQuoteError(null);
    setShowQuotes(false);
    setIsLoadingQuotes(false);
    
    // Scroll to form
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

  // Handlers for multi-step car selection
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
    // All selections complete - could trigger quote generation
    console.log("Car selection complete:", {
      brand: selectedBrand,
      model: selectedModel,
      fuelType: selectedFuelType,
      variant: selectedVariant,
      registrationPlace: place
    });
  };
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


  const services = [
    {
      title: "Smart Car Insurance Quotes",
      description: "Get personalized, real-time quotes from top insurers in minutes—thanks to our advanced comparison engine.",
      color: "bg-emerald-500"
    },
    {
      title: "Simplified Decision-Making",
      description: "Our platform reduces the time to choose the right coverage from hours to minutes, cutting through complexity for you.",
      color: "bg-blue-100"
    },
    {
      title: "Smart Savings, Seamless Experience",
      description: "SundayInsurance partners with trusted providers to offer optimal coverage at the best prices—fast and hassle-free.",
      color: "bg-gray-100"
    }
  ];

  const companies = [
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
    },
    {
      name: "PayPal",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    }, {
      name: "CHASE",
      logo: "/Chase-logo.png"
    },
    {
      name: "Walmart",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg"
    }];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20'
        : 'bg-transparent shadow-none border-b border-transparent'
        }`}>        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">            {/* Logo */}
            <div className="flex items-center -ml-4">
              <div className={`
                font-bold transition-all duration-300 
                flex items-center justify-center
                px-4 py-2 rounded-lg border
                ${isScrolled 
                  ? 'text-2xl bg-white/10 backdrop-blur-sm border-slate-200' 
                  : 'text-3xl bg-black/10 backdrop-blur-sm border-white/30'
                }
              `}>
                <span className="text-emerald-500">Sunday</span>
                <span className={`ml-1 ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                  Insurance
                </span>
              </div>
            </div>

              {/* Navigation and Login */}
              <div className="hidden md:flex items-center space-x-8">              <nav className="flex relative">
                {(hoveredItem || previousHoveredItem) && (
                  <motion.div
                    className={`absolute rounded-full ${isScrolled
                      ? 'bg-emerald-50'
                      : 'bg-white/10'
                      }`}
                    initial={false}
                    animate={{
                      opacity: hoveredItem ? 1 : 0,
                      scale: hoveredItem ? 1 : 0.8,
                      x: hoveredItem 
                        ? itemDimensions[hoveredItem]?.x || 0
                        : previousHoveredItem
                          ? itemDimensions[previousHoveredItem]?.x || 0
                          : 0
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
                )}                {navigationItems.map((item, index) => {
                  const isExternalLink = item.href.startsWith('/');
                  
                  if (isExternalLink) {
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        ref={(el) => { navRefs.current[item.label] = el; }}
                        className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${isScrolled
                          ? hoveredItem === item.label
                            ? 'text-emerald-500'
                            : 'text-slate-600'
                          : hoveredItem === item.label
                            ? 'text-white'
                            : 'text-white/90'
                          }`}
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
                      className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${isScrolled
                        ? hoveredItem === item.label
                          ? 'text-emerald-500'
                          : 'text-slate-600'
                        : hoveredItem === item.label
                          ? 'text-white'
                          : 'text-white/90'
                        }`}
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
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(user.email?.charAt(0) || user.phoneNumber?.charAt(-1) || 'U').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {user.email ? user.email.split('@')[0] : user.phoneNumber}
                    </span>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white hover:bg-white/20 px-4 py-2 rounded-full transition-all duration-300"
                  >
                    Logout
                  </Button>
                </div>              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={openLoginModal}
                    variant="ghost"
                    className={`px-4 py-2 rounded-full transition-all duration-300 ${isScrolled
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-white hover:bg-white/20 border border-white/30'
                    }`}>
                    Log in
                  </Button>
                  <Button 
                    onClick={openSignupModal}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${isScrolled
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-white hover:bg-white/90 text-slate-800'
                    }`}>
                    Sign Up
                  </Button>
                </div>
              )}</div>
          </div>
        </div>
      </header>      {/* Hero Section */}
      <section className="relative blue-green-gradient hero-grid-pattern overflow-hidden pt-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-emerald-100">Protect</span> Your<br />
                <span className="text-slate-800">Future</span>
              </h1>
              <p className="text-lg mb-8 text-emerald-50 leading-relaxed">
                We understand that unexpected events can have a major impact
                on your life. That's why we're committed to providing
                comprehensive insurance coverage to protect you and your assets.
              </p>              <div className="flex items-center mb-8">
                <div className="flex -space-x-2 mr-4">                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&q=80",
                    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face&q=80",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&q=80",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&q=80"
                  ].map((src, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-emerald-400 overflow-hidden">
                      <img 
                        src={src} 
                        alt={`Customer ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">1,000,000 +</div>
                  <div className="text-emerald-100">Customers</div>
                </div>
              </div>              <Button
                onClick={() => {
                  const quoteForm = document.getElementById('quote-form');
                  quoteForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>            <div className="relative">
              <img
                src="/hero-image.jpg"
                alt="Car insurance and protection"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </div>        </div>
      </section>      {/* Quote Form Section */}
      <section id="quote-section" className="quote-section-bg quote-section-pattern py-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Card id="quote-form" className="shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <FormField
                  label="Name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Number to Communicate"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Registration Number"
                  name="registrationNumber"
                  placeholder="Vehicle Registration"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
                <Button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-full text-lg h-12"
                >
                  Get Quote
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  onClick={handleNewCarClick}
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full"
                >
                  Bought New Car? Click Here
                </Button>
              </div>
            </CardContent>
          </Card>        </div>

        {/* Trusted By Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
          <h3 className="text-center text-slate-600 text-lg mb-8">We're trusted by</h3>          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {companies.map((company) => (
              <div key={company.name} className="flex flex-col items-center space-y-3">                <img
                src={company.logo}
                alt={`${company.name} logo`}
                className={`w-auto object-contain opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300 ${company.name === 'CHASE' ? 'h-12' : 'h-8'
                  }`}
              />
                <span className="text-lg font-semibold text-slate-400">{company.name}</span>
              </div>
            ))}
          </div>        </div>
      </section>      {/* Quote Results Section */}
      {(isLoadingQuotes || showQuotes || quoteError) && (
        <section id="quotes-section" className="bg-gray-50 py-16 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoadingQuotes && (
              <LoadingQuotes />
            )}
            
            {quoteError && !isLoadingQuotes && (
              <div className="text-center">
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-8">
                    <div className="text-red-500 text-lg font-semibold mb-4">
                      Oops! Something went wrong
                    </div>
                    <p className="text-gray-600 mb-6">{quoteError}</p>
                    <Button 
                      onClick={handleNewQuote}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}              {showQuotes && quotes.length > 0 && !isLoadingQuotes && (
              <div className="relative">
                {/* Quote Results - newspaper-style paywall for non-authenticated users */}
                <div className={!user ? "relative overflow-hidden" : ""}>
                  {/* Quote content without blur for better visibility */}
                  <div className={!user ? 'quotes-locked' : ''}>
                    <QuoteResults 
                      quotes={quotes}
                      vehicleRegistration={vehicleRegistration}
                      onNewQuote={handleNewQuote}
                    />
                  </div>
                  
                  {/* Newspaper-style gradient overlay for non-authenticated users */}
                  {!user && (
                    <div className="absolute inset-0 z-10 quotes-paywall-overlay pointer-events-none"></div>
                  )}
                </div>

                {/* Lock Overlay for Non-Authenticated Users - positioned in the lower portion */}
                {!user && (
                  <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center pb-8 pointer-events-none">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4 pointer-events-auto border border-gray-200">
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Login to unlock all quotes</h3>
                        <p className="text-gray-600">Sign in to see complete quote details and comparison features</p>
                      </div>
                      <div className="space-y-3">
                        <Button 
                          onClick={openLoginModal}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
                        >
                          Login
                        </Button>
                        <Button 
                          onClick={openSignupModal}
                          variant="outline"
                          className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-3 rounded-lg font-medium"
                        >
                          Sign Up
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              What makes<br />
              <span className="text-emerald-500">SundayInsurance</span> accessible
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              We believe that insurance should provide you with peace of mind,
              knowing that you're covered in case of an unexpected event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  filter: "blur(10px)",
                  x: 0,
                  y: 50
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  x: 0,
                  y: 0
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className={`${service.color} border-0 rounded-2xl overflow-hidden h-80 flex flex-col justify-between p-8 text-white ${service.color === 'bg-emerald-500' ? 'text-white' : 'text-slate-800'}`}>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                    <p className="text-lg opacity-90">{service.description}</p>
                  </div>
                  <div className="mt-8">
                    <div className="w-20 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-12 h-8 bg-white/40 rounded"></div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>      {/* Testimonials Section */}
      <section className="bg-emerald-600 py-20 relative overflow-hidden" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.25) 2px, transparent 2px),
          linear-gradient(to bottom, rgba(0,0,0,0.25) 2px, transparent 2px)
        `,
        backgroundSize: '40px 40px'
      }}>        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-16 drop-shadow-lg">
            Read Honest Reviews of what<br />
            Clients Say About Us!
          </h2>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  filter: "blur(10px)",
                  x: 0,
                  y: 50
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  x: 0,
                  y: 0
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="w-12 h-12 mr-4">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-slate-800">{testimonial.name}</h4>
                        <p className="text-slate-500 text-sm">{testimonial.company}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4">{testimonial.text}</p>

                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-8">
            Join us now for a prosperous<br />
            and secure future
          </h2>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full text-lg">
            Join Us
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="text-2xl font-bold">
                  <span className="text-emerald-500">Sunday</span>
                  <span className="text-slate-800">Insurance</span>
                </span>
              </div>
              <p className="text-slate-600 mb-6">
                SundayInsurance offers comprehensive insurance solutions to
                individuals, families and businesses
              </p>              <p className="text-slate-400 text-sm">
                © SundayInsurance 2025 All rights reserved
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Personal</h4>
              <div className="space-y-2">
                <p className="text-slate-600">Privacy Policy</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Business</h4>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Employee</h4>
              <div className="space-y-2">
                <p className="text-slate-600">Terms & Condition</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Bounds</h4>
              <div className="flex space-x-4 mt-6">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              </div>
            </div>          </div>
        </div>
      </footer>      {/* Car Brand Selection Dialog */}
      <Dialog open={isCarBrandDialogOpen} onOpenChange={(open) => {
        setIsCarBrandDialogOpen(open);
        if (!open) {
          setShowAllBrands(false);
        }
      }}>        <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              What is your car's brand?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!showAllBrands && (
              <h3 className="text-lg font-semibold text-center text-slate-600">TOP BRANDS</h3>
            )}

            <div className="overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin smooth-scroll">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 gpu-accelerated">
                {(showAllBrands ? allCarBrands : topCarBrands).map((brand) => (
                  <div
                    key={brand.name}
                    className="flex flex-col items-center space-y-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-emerald-50 hover:scale-105 active:scale-95 gpu-accelerated"                    onClick={() => {
                      handleBrandSelect(brand.name);
                    }}
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-200 ease-out"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700 text-center">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!showAllBrands && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-8 py-2 rounded-full"
                  onClick={() => {
                    setShowAllBrands(true);
                  }}
                >
                  Show all Brands
                </Button>
              </div>
            )}

            {showAllBrands && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="border-slate-400 text-slate-600 hover:bg-slate-50 px-8 py-2 rounded-full"
                  onClick={() => {
                    setShowAllBrands(false);
                  }}
                >
                  Show Top Brands
                </Button>
              </div>
            )}
          </div>        </DialogContent>
      </Dialog>

      {/* Car Model Selection Dialog */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Select your {selectedBrand} model
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin smooth-scroll">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(carModels[selectedBrand] || []).map((model) => (
                <div
                  key={model}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-emerald-50 hover:scale-105 active:scale-95 border-2 border-slate-200 hover:border-emerald-400"
                  onClick={() => handleModelSelect(model)}
                >
                  <span className="text-sm font-medium text-slate-700 text-center block">
                    {model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fuel Type Selection Dialog */}
      <Dialog open={isFuelTypeDialogOpen} onOpenChange={setIsFuelTypeDialogOpen}>
        <DialogContent className="max-w-3xl w-[90vw] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Select fuel type for {selectedBrand} {selectedModel}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {fuelTypes.map((fuelType) => (
              <div
                key={fuelType}
                className="p-6 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-emerald-50 hover:scale-105 active:scale-95 border-2 border-slate-200 hover:border-emerald-400 text-center"
                onClick={() => handleFuelTypeSelect(fuelType)}
              >
                <div className="text-2xl mb-2">
                  {fuelType === 'Petrol' && '⛽'}
                  {fuelType === 'Diesel' && '🚛'}
                  {fuelType === 'CNG' && '🌿'}
                  {fuelType === 'Electric' && '🔋'}
                  {fuelType === 'Hybrid' && '🔄'}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {fuelType}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Selection Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Select variant for {selectedBrand} {selectedModel} ({selectedFuelType})
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin smooth-scroll">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(carVariants[selectedModel] || ["Base", "Mid", "Top"]).map((variant) => (
                <div
                  key={variant}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-emerald-50 hover:scale-105 active:scale-95 border-2 border-slate-200 hover:border-emerald-400"
                  onClick={() => handleVariantSelect(variant)}
                >
                  <span className="text-sm font-medium text-slate-700 text-center block">
                    {variant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Place Selection Dialog */}
      <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Select your vehicle registration place
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin smooth-scroll">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {registrationPlaces.map((place) => (
                <div
                  key={place.code}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:bg-emerald-50 hover:scale-105 active:scale-95 border-2 border-slate-200 hover:border-emerald-400"
                  onClick={() => handleRegistrationPlaceSelect(place.code)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600 mb-1">
                      {place.code}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {place.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
