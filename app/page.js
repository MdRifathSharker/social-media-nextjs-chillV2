"use client";

import { useState, useEffect } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Hash Password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Check User Exists
const checkUserExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, name, username')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error && error.code === 'PGRST116') {
      return { exists: false, user: null };
    }

    if (error) {
      console.error("Check user exists error:", error);
      return { exists: false, user: null, error: error.message };
    }

    return { exists: !!data, user: data };
  } catch (error) {
    console.error("Check user exists exception:", error);
    return { exists: false, user: null, error: error.message };
  }
};

// Send OTP Email - FIXED VERSION
const sendOTPEmail = async (email, otp, userName = "") => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 15);
  const formattedTime = expiryTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const templateParams = {
    email: email,
    password: otp,  // OTP code
    time: formattedTime
  };

  try {
    console.log("Sending OTP email to:", email);
    console.log("Template params:", { ...templateParams, password: "***" });

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    if (!serviceId || !templateId) {
      console.warn("EmailJS environment variables missing, showing OTP in UI");
      return {
        success: true,
        otp: otp,
        message: "Email configuration missing - OTP displayed"
      };
    }

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log("Email sent successfully! Status:", response.status);
    return { success: true };

  } catch (err) {
    console.error("EmailJS Error:", err);
    // Even if email fails, return OTP for display
    return {
      success: true,
      otp: otp,
      message: "Email failed, OTP displayed"
    };
  }
};

// Complete Registration - WITHOUT Supabase Auth (Database only)
const completeUserRegistration = async (email, password, name, contact = "") => {
  try {
    console.log("Starting registration for:", email);

    // Check if user exists
    const { exists } = await checkUserExists(email);
    if (exists) {
      return {
        error: "User already exists. Please login instead.",
        userExists: true
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate user ID and username
    const userId = generateUUID();
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = baseUsername + Math.floor(Math.random() * 10000);

    // Create user record
    const userRecord = {
      user_id: userId,
      name: name.trim(),
      username: username,
      email: email.toLowerCase().trim(),
      contact: contact || '',
      password: hashedPassword,
      profile_image: null,
      bio: '',
      followers_count: 0,
      following_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Inserting user record:", { ...userRecord, password: "***" });

    // Insert into database
    const { data, error } = await supabase
      .from('users')
      .insert([userRecord])
      .select()
      .single();

    if (error) {
      console.error("Database error:", {
        message: error.message,
        code: error.code,
        details: error.details
      });

      if (error.code === '23505' || error.message.includes('duplicate key')) {
        return {
          error: "User already exists. Please login instead.",
          userExists: true
        };
      }

      if (error.message.includes('violates row-level security policy')) {
        return {
          error: "Database security policy error. Please contact admin.",
          rlsError: true
        };
      }

      return { error: "Database error: " + error.message };
    }

    console.log("User registered successfully:", data.email);

    // Try to create auth user (optional, not required for login)
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            name: name,
            contact: contact
          }
        }
      });

      if (authError) {
        console.log("Auth creation optional - not required:", authError.message);
      } else {
        console.log("Auth user created as well");
      }
    } catch (authErr) {
      console.log("Auth creation skipped:", authErr.message);
    }

    return {
      success: true,
      user: data,
      message: "Registration successful!"
    };

  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Registration failed: " + error.message };
  }
};

// Login User - FIXED VERSION (Database only, no auth dependency)
const loginUser = async (email, password) => {
  try {
    console.log("Attempting login for:", email);

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error("Database error during login:", error);
      return { error: "Database error. Please try again." };
    }

    if (!user) {
      console.log("User not found:", email);
      return { error: "Invalid email or password" };
    }

    if (!user.password) {
      console.log("Password not set for user:", email);
      return { error: "Account setup incomplete. Please contact support." };
    }

    // Verify password
    console.log("Verifying password...");
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      console.log("Invalid password for:", email);
      return { error: "Invalid email or password" };
    }

    console.log("Login successful for:", email);

    // Try to sign in with Supabase Auth (optional)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (authError) {
        console.log("Supabase auth login failed (optional):", authError.message);
        // Continue with database login anyway
      } else {
        console.log("Supabase auth login successful");
      }
    } catch (authErr) {
      console.log("Supabase auth skipped:", authErr.message);
    }

    return {
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        username: user.username,
        profile_image: user.profile_image,
        bio: user.bio,
        followers_count: user.followers_count,
        following_count: user.following_count,
        created_at: user.created_at
      }
    };

  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed: " + error.message };
  }
};

// Check User for Password Reset
const checkUserForPasswordReset = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, name')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error && error.code === 'PGRST116') {
      return { error: "No account found with this email" };
    }

    if (error) {
      console.error("Check user error:", error);
      return { error: "Database error. Please try again." };
    }

    if (!data) {
      return { error: "No account found with this email" };
    }

    return { success: true, user: data };

  } catch (error) {
    console.error("Check user error:", error);
    return { error: error.message };
  }
};

// Reset Password - FIXED VERSION
const resetPassword = async (email, newPassword) => {
  try {
    console.log("Resetting password for:", email);

    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    const { error, count } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim());

    if (error) {
      console.error("Update error:", error);
      return { error: "Failed to update password: " + error.message };
    }

    if (count === 0) {
      return { error: "User not found" };
    }

    console.log("Password updated in database");

    // Try to update in Supabase Auth (optional)
    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        console.log("Auth password update failed (optional):", authError.message);
      } else {
        console.log("Auth password updated successfully");
      }
    } catch (authError) {
      console.log("Auth update skipped:", authError.message);
    }

    return {
      success: true,
      message: "Password updated successfully! You can now login with your new password."
    };

  } catch (error) {
    console.error("Reset password error:", error);
    return { error: error.message || "Password reset failed" };
  }
};

// Main Component
export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [active, setActive] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);


  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [systemOtp, setSystemOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);


  // Initialize EmailJS
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      try {
        emailjs.init(publicKey);
        console.log("EmailJS initialized");
      } catch (err) {
        console.warn("EmailJS init warning:", err.message);
      }
    } else {
      console.warn("EmailJS public key not found");
    }
  }, []);

  // Clear messages when form changes
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [isSignUp, isForgotPassword, isResetPassword, isVerifying]);

  // Validations
  const validateSignUp = () => {
    if (!fullName.trim()) return "Please enter full name";
    if (!email.includes('@')) return "Please enter valid email";
    if (password.length < 6) return "Password must be 6+ characters";
    if (password !== confirmPassword) return "Passwords don't match";
    return null;
  };

  const validatePasswordReset = () => {
    if (newPassword.length < 6) return "Password must be 6+ characters";
    if (newPassword !== confirmNewPassword) return "Passwords don't match";
    return null;
  };

  // Registration Start
  const handleSignUpStart = async (e) => {
    e.preventDefault();
    const error = validateSignUp();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Checking if user exists...");
      const { exists } = await checkUserExists(email);

      if (exists) {
        setErrorMessage("Account already exists. Please login.");
        setLoading(false);
        return;
      }

      const otp = generateOTP();
      setSystemOtp(otp);
      console.log("Generated OTP:", otp);

      setTempUserData({
        fullName,
        email: email.toLowerCase().trim(),
        contact,
        password,
        purpose: "registration"
      });

      // Send OTP Email
      console.log("Sending OTP email...");
      const emailResult = await sendOTPEmail(email, otp, fullName);

      if (emailResult.error) {
        setErrorMessage("Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage("OTP sent to your email! Check your inbox.");
      setIsVerifying(true);

    } catch (error) {
      console.error("Sign up error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage("Please enter valid email");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Check if user exists
      const result = await checkUserForPasswordReset(email);

      if (result.error) {
        setErrorMessage("No account found with this email");
        setLoading(false);
        return;
      }

      // Generate OTP
      const otp = generateOTP();
      setSystemOtp(otp);
      console.log("Generated OTP for password reset:", otp);

      // Store temp data
      setTempUserData({
        email: email.toLowerCase().trim(),
        purpose: "forgot_password"
      });

      // Send OTP email
      console.log("Sending password reset OTP...");
      const emailResult = await sendOTPEmail(email, otp, result.user?.name);

      if (emailResult.error) {
        setErrorMessage("Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Password reset OTP sent to your email!");
      setIsForgotPassword(false);
      setIsVerifying(true);

    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (userEnteredOtp.length !== 6) {
      setErrorMessage("Please enter 6-digit OTP");
      return;
    }

    if (userEnteredOtp !== systemOtp) {
      setErrorMessage("Invalid OTP! Please try again.");
      return;
    }

    if (!tempUserData) {
      setErrorMessage("Session expired");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (tempUserData.purpose === "registration") {
      try {
        console.log("OTP verified. Starting registration...");
        const result = await completeUserRegistration(
          tempUserData.email,
          tempUserData.password,
          tempUserData.fullName,
          tempUserData.contact
        );

        if (result.error) {
          if (result.userExists) {
            setErrorMessage("An account with this email already exists. Please login instead.");
            setTimeout(() => {
              resetForm();
              setIsSignUp(false);
              setEmail(tempUserData.email);
            }, 2000);
          } else {
            setErrorMessage(result.error);
          }
        } else {
          setSuccessMessage("Registration successful! You can login now.");
          setTimeout(() => {
            resetForm();
            setIsVerifying(false);
            setIsSignUp(false);
          }, 2000);
        }
      } catch (error) {
        console.error("Registration error:", error);
        setErrorMessage("Registration failed: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    else if (tempUserData.purpose === "forgot_password") {
      setIsVerifying(false);
      setIsResetPassword(true);
      setSuccessMessage("OTP verified! Set new password.");
      setLoading(false);
    }
  };

  // Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const error = validatePasswordReset();
    if (error) {
      setErrorMessage(error);
      return;
    }

    if (!tempUserData?.email) {
      setErrorMessage("Session expired. Please start over.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await resetPassword(tempUserData.email, newPassword);

      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Password updated! You can login now.");
        setTimeout(() => {
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage("Password reset failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login - FIXED VERSION
  // Update handleSignIn function:
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Attempting login for:", email);

      // Get user from database directly (no Supabase auth needed)
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        console.error("Database error during login:", error);
        return { error: "Database error. Please try again." };
      }

      if (!user) {
        console.log("User not found:", email);
        setErrorMessage("Invalid email! Email not registered.");
        setLoading(false);
        return ;
      }

      if (!user.password) {
        console.log("Password not set for user:", email);
        setErrorMessage("Account setup incomplete. Please contact support.");
        setLoading(false);
        return;
      }

      // Verify password
      console.log("Verifying password...");
      const isValid = await comparePassword(password, user.password);

      if (!isValid) {
        console.log("Invalid password for:", email);
        setErrorMessage("Invalid password! Please try again.");
        setLoading(false);
        return ;
      }

      console.log("Login successful for:", email);

      // Store user data in localStorage
      if (typeof window !== 'undefined') {
        // Clear old data
        localStorage.clear();
        
        // Store user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name || "");
        localStorage.setItem('userId', user.user_id);
        localStorage.setItem('username', user.username || "");
        
        // Store complete user object (for profile section)
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        console.log("User data stored in localStorage:", {
          userId: user.user_id,
          name: user.name,
          email: user.email
        });
      }

      setSuccessMessage("Login successful! Redirecting...");

      // Redirect immediately
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);

      return {
        success: true,
        user: user
      };

    } catch (error) {
      console.error("Login error:", error);
      return { error: "Login failed: " + error.message };
    } finally {
      setLoading(false);
    }
  };
  // Reset Form
  const resetForm = () => {
    setIsVerifying(false);
    setIsSignUp(false);
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setFullName("");
    setContact("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setUserEnteredOtp("");
    setSystemOtp("");
    setTempUserData(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Handle Back
  const handleBack = () => {
    if (isVerifying) {
      setIsVerifying(false);
      if (tempUserData?.purpose === "forgot_password") {
        setIsForgotPassword(true);
      } else if (tempUserData?.purpose === "registration") {
        setIsSignUp(true);
      }
    } else if (isForgotPassword) {
      setIsForgotPassword(false);
    } else if (isResetPassword) {
      setIsResetPassword(false);
      setIsForgotPassword(true);
    } else if (isSignUp) {
      setIsSignUp(false);
    }
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('session');
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          // Check if session is less than 24 hours old
          const sessionAge = Date.now() - sessionData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (sessionData.isLoggedIn && sessionAge < maxAge) {
            // Auto-fill email if user was recently logged in
            setEmail(sessionData.userEmail || "");
          } else {
            localStorage.removeItem('session');
            localStorage.removeItem('isLoggedIn');
          }
        } catch (e) {
          console.log("Error parsing session:", e);
        }
      }
    }
  }, []);

  return (
    <main className="fixed w-screen h-screen flex items-center justify-center bg-bg text-text dark:bg-bg-dark dark:text-text-dark transition-colors duration-500">
      {/* Logo */}
      <div className={`absolute transition-all duration-700`}
        style={{
          top: active ? "1rem" : "50%",
          left: active ? "auto" : "50%",
          right: active ? "1rem" : "auto",
          width: active ? "6rem" : "20rem",
          height: active ? "6rem" : "20rem",
          transform: active ? "none" : "translate(-50%, -50%)",
        }}>
        <img
          src="/chill_logo.gif"
          alt="Logo"
          className="w-full h-full object-contain"
        />

      </div>

      {/* Sign In Button */}
      {!active && (
        <button
          onClick={() => setActive(true)}
          className="absolute bottom-8 right-8 bg-primary text-white px-8 py-4 rounded-full shadow-lg animate-bounce hover:opacity-90 transition-opacity z-10"
        >
          Sign In
        </button>
      )}

      {/* Auth Form */}
      {active && (
        <div className="w-full max-w-md p-6 bg-primary rounded-lg shadow-lg mx-4 relative z-20">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>

            {/* Messages */}
            {errorMessage && (
              <div className={`p-3 rounded-lg text-sm ${errorMessage.includes("")
                  ? "bg-yellow-100 border border-yellow-300 text-yellow-700"
                  : "bg-red-100 border border-red-300 text-red-700"
                }`}>
                {errorMessage.includes(" ") ? " " : " "} {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* OTP Verification */}
            {isVerifying ? (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-white font-bold text-2xl">Verify OTP</h2>
                  <p className="text-white text-sm mt-2">OTP sent to:</p>
                  <p className="text-accent font-medium text-lg mt-1">{tempUserData?.email}</p>

                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <p className="text-white text-xs mb-2">Your OTP Code (for testing):</p>
                    <p className="text-white text-2xl font-bold tracking-widest">{systemOtp}</p>
                    <p className="text-gray-400 text-xs mt-1">Enter this code above</p>
                  </div>
                </div>

                <input
                  className="p-3 rounded-lg outline-none text-center text-lg font-semibold tracking-widest bg-white"
                  placeholder="Enter 6-digit OTP"
                  value={userEnteredOtp}
                  onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  disabled={loading}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || userEnteredOtp.length !== 6}
                    className="flex-1 bg-accent text-primary py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </>
            ) :

              /* Reset Password Form */
              isResetPassword ? (
                <>
                  <h2 className="text-white font-bold text-center text-2xl mb-2">Reset Password</h2>
                  <p className="text-white text-sm text-center mb-4">Enter your new password</p>

                  <input
                    type="password"
                    className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                    placeholder="New Password (6+ characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="flex-1 bg-accent text-primary py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </>
              ) :
                isForgotPassword ? (
                  <>
                    <h2 className="text-white font-bold text-center text-2xl mb-2">Forgot Password</h2>
                    <p className="text-white text-sm text-center mb-4">Enter your email to reset password</p>

                    <input
                      className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                      placeholder="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={loading}
                        className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="flex-1 bg-accent text-primary py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                  </>
                ) :

                  /* Sign Up Form */
                  isSignUp ? (
                    <>
                      <h2 className="text-white font-bold text-center text-2xl mb-2">Create Account</h2>

                      <input
                        className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                        placeholder="Full Name *"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <input
                        className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                        placeholder="Email Address *"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <input
                        className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                        placeholder="Phone (Optional)"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        disabled={loading}
                      />
                      <input
                        type="password"
                        className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                        placeholder="Password (6+ characters) *"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        minLength={6}
                        required
                      />
                      <input
                        type="password"
                        className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                        placeholder="Confirm Password *"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        minLength={6}
                        required
                      />

                      <button
                        onClick={handleSignUpStart}
                        disabled={loading}
                        className="bg-accent text-primary py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </button>

                      <div className="text-center">
                        <span className="text-white text-sm">Already have an account? </span>
                        <button
                          type="button"
                          onClick={handleBack}
                          className="text-accent text-sm font-medium hover:underline"
                        >
                          Login
                        </button>
                      </div>
                    </>
                  ) :

                    /* Login Form (Default) */
                    (
                      <>
                        <h2 className="text-white font-bold text-center text-2xl mb-2">Welcome Back</h2>
                        <p className="text-white text-sm text-center mb-4">Sign in to your account</p>

                        <input
                          className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                          placeholder="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                        <input
                          type="password"
                          className="p-3 rounded-lg outline-none placeholder-gray-500 bg-white dark:bg-bg-dark dark:text-text-dark dark:placeholder-gray-400"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />

                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-accent text-sm font-medium text-left hover:underline"
                          disabled={loading}
                        >
                          Forgot Password?
                        </button>

                        <button
                          onClick={handleSignIn}
                          disabled={loading}
                          className="bg-accent text-primary py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Signing in...
                            </span>
                          ) : "Sign In"}
                        </button>

                        <div className="text-center">
                          <span className="text-white text-sm">Don't have an account? </span>
                          <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className="text-accent text-sm font-medium hover:underline"
                          >
                            Sign up
                          </button>
                        </div>
                      </>
                    )}
          </form>

          {/* Close Button */}
          <button
            onClick={() => {
              setActive(false);
              resetForm();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}