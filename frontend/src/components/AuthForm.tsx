import React, { useState } from "react";
import { auth } from "../lib/firebase-config";
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

const AuthForm: React.FC<{ 
  onAuth: (user: User | null) => void;
  showOverlay?: boolean;
}> = ({ onAuth, showOverlay = true }) => {
  const [tab, setTab] = useState<'email' | 'phone'>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      onAuth(user);
    });
    return () => unsub();
  }, [onAuth]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
    return (window as any).recaptchaVerifier;
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
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
      setConfirmationResult(null);
      setOtp("");
    } catch (err: any) {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={showOverlay ? "auth-form-overlay" : ""}>
      <div className="auth-form-container">
        <div className="auth-tabs">
          <button onClick={() => setTab("email")} className={tab === "email" ? "active" : ""}>Email</button>
          <button onClick={() => setTab("phone")} className={tab === "phone" ? "active" : ""}>Phone</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
          </form>
        )}
        {tab === "phone" && !confirmationResult && (
          <form onSubmit={handlePhoneLogin} className="auth-form">
            <input type="tel" placeholder="Phone (+1234567890)" value={phone} onChange={e => setPhone(e.target.value)} required />
            <div id="recaptcha-container" />
            <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
          </form>
        )}
        {tab === "phone" && confirmationResult && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
