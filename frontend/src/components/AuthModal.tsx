import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase-config";
import { useToast } from "@/hooks/use-toast";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  User
} from "firebase/auth";

const AuthModal: React.FC = () => {
  const { isLoginModalOpen, modalMode, closeLoginModal, toggleModalMode } = useAuth();
  const { toast } = useToast();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setOtp("");
    setError("");
    setSuccess("");
    setConfirmationResult(null);
    setLoading(false);
  };

  const handleModalClose = () => {
    resetForm();
    closeLoginModal();
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { 
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          }
        }
      );
    }
    return (window as any).recaptchaVerifier;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);    try {
      if (modalMode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created successfully!");
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
          duration: 3000,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Logged in successfully!");
        toast({
          title: "Welcome Back",
          description: "You have been signed in successfully!",
          duration: 3000,
        });
      }
      
      setTimeout(() => {
        handleModalClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!phone.startsWith('+')) {
        throw new Error("Phone number must include country code (e.g., +1234567890)");
      }
      
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setSuccess("OTP sent to your phone");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      setSuccess("Phone verified successfully!");
      setTimeout(() => {
        handleModalClose();
      }, 1000);
    } catch (err: any) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };  return (
    <Dialog open={isLoginModalOpen} onOpenChange={handleModalClose}>      <DialogContent 
        className="sm:max-w-[480px] p-0 border-0 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05)
          `
        }}      >
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
        <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-white/15 rounded-full blur-sm animate-pulse animation-delay-2000" />

        {/* Custom Close Button using DialogClose */}
        <DialogClose asChild>
          <button
            className="absolute right-4 top-4 z-50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <X className="h-4 w-4 text-white/70 hover:text-white" />
          </button>
        </DialogClose>

        <DialogHeader className="px-6 pt-6 pb-2 relative z-10">
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {modalMode === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader><div className="px-6 pb-6 relative z-10">
          <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "email" | "phone")}>
            <TabsList 
              className="grid w-full grid-cols-1 mb-6 border-0 rounded-2xl p-1"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <TabsTrigger 
                value="email" 
                className="flex items-center gap-2 text-white rounded-xl border-0 data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              {/* Phone authentication temporarily disabled - requires Firebase Blaze plan */}
              {/* <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger> */}
            </TabsList>            {(error || success) && (
              <Alert 
                className="mb-4 border-0 rounded-2xl"
                style={{
                  background: success 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : 'rgba(239, 68, 68, 0.15)',
                  backdropFilter: 'blur(15px)',
                  border: success 
                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <AlertDescription className={success ? 'text-green-200' : 'text-red-200'}>
                  {error || success}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="email" className="space-y-4">
              {!confirmationResult && (
                <form onSubmit={handleEmailAuth} className="space-y-4">                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="border-0 rounded-xl text-white placeholder:text-white/60"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                        className="border-0 rounded-xl text-white placeholder:text-white/60 pr-10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-0 h-full w-8 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>                  {modalMode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                        className="border-0 rounded-xl text-white placeholder:text-white/60"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Please wait..." : modalMode === "login" ? "Sign In" : "Create Account"}
                  </Button>                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {modalMode === "login" 
                        ? "Don't have an account? " 
                        : "Already have an account? "
                      }
                      <span 
                        className="text-emerald-600 cursor-pointer hover:underline"
                        onClick={() => {
                          toggleModalMode();
                          setError("");
                          setSuccess("");
                        }}
                      >
                        {modalMode === "login" ? "Sign up" : "Log in"}
                      </span>
                    </p>
                  </div>
                </form>
              )}            </TabsContent>

            {/* Phone authentication temporarily disabled - requires Firebase Blaze plan */}
            {/* <TabsContent value="phone" className="space-y-4">
              {!confirmationResult ? (
                <form onSubmit={handlePhoneAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Include country code (e.g., +1 for US, +91 for India)
                    </p>
                  </div>

                  <div id="recaptcha-container"></div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={loading}
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the 6-digit code sent to {phone}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setConfirmationResult(null);
                        setOtp("");
                        setError("");
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      Change Number
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent> */}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
