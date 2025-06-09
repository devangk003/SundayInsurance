import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase-config";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  modalMode: "login" | "signup";
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeLoginModal: () => void;
  toggleModalMode: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null,
  isLoginModalOpen: false,
  modalMode: "login",
  openLoginModal: () => {},
  openSignupModal: () => {},
  closeLoginModal: () => {},
  toggleModalMode: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const openLoginModal = () => {
    setModalMode("login");
    setIsLoginModalOpen(true);
  };

  const openSignupModal = () => {
    setModalMode("signup");
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const toggleModalMode = () => {
    setModalMode(prev => prev === "login" ? "signup" : "login");
  };

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user && isLoginModalOpen) {
      closeLoginModal();
    }
  }, [user, isLoginModalOpen]);
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoginModalOpen, 
      modalMode,
      openLoginModal, 
      openSignupModal,
      closeLoginModal,
      toggleModalMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};
