"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [active, setActive] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const router = useRouter();

  const initialWidth = "20rem";
  const initialHeight = "20rem";

  useEffect(() => {
    if (!password) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("Weak");
    } else if (password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)) {
      setPasswordStrength("Medium");
    } else if (
      password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Weak");
    }
  }, [password]);

  useEffect(() => {
    if (!isForgot) setForgotStep(1);
  }, [isForgot]);

  return (
    <main className="fixed top-0 left-0 w-screen h-screen overflow-hidden bg-bg text-text dark:bg-bg-dark dark:text-text-dark flex items-center justify-center transition-colors duration-500">

      {/* Dark/Light Mode Toggle */}
      <div className="absolute top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div
        className="absolute transition-all duration-700"
        style={{
          top: active ? "1rem" : "50%",
          left: active ? "auto" : "50%",
          right: active ? "1rem" : "auto",
          width: active ? "6rem" : initialWidth,
          height: active ? "6rem" : initialHeight,
          transform: active ? "none" : "translate(-50%, -50%)",
        }}
      >
        <Image
          src="/LogoUpdate.png"
          alt="Logo"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Floating Sign In Button */}
      {!active && (
        <button
          onClick={() => setActive(true)}
          className="absolute bottom-8 right-8 px-8 py-4 text-lg font-bold rounded-full bg-primary text-white shadow-lg hover:scale-105 transition-transform duration-300 animate-bounce"
        >
          Sign In
        </button>
      )}

      {/* Form Box */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <form className="flex flex-col gap-4 bg-primary p-6 rounded shadow-md w-80">

          {/* Forgot Password */}
          {isForgot ? (
            <>
              {forgotStep === 1 && (
                <>
                  <h2 className="text-xl font-bold text-center text-white">Forgot Password</h2>
                  <input type="email" placeholder="Enter your email" className="p-2 rounded border border-white text-black" />
                  <button
                    type="button"
                    className="bg-accent text-primary py-2 rounded font-semibold"
                    onClick={() => setForgotStep(2)}
                  >
                    Submit Email
                  </button>
                  <div className="text-center text-sm text-white">
                    <button onClick={() => setIsForgot(false)} className="underline">
                      Back to Sign In
                    </button>
                  </div>
                </>
              )}

              {forgotStep === 2 && (
                <>
                  <h2 className="text-xl font-bold text-center text-white">Enter OTP</h2>
                  <input type="text" placeholder="Enter OTP" className="p-2 rounded border border-white text-black" />
                  <button
                    type="button"
                    className="bg-accent text-primary py-2 rounded font-semibold"
                    onClick={() => setForgotStep(3)}
                  >
                    Submit OTP
                  </button>
                </>
              )}

              {forgotStep === 3 && (
                <>
                  <h2 className="text-xl font-bold text-center text-white">Set New Password</h2>
                  <input
                    type="password"
                    placeholder="New Password"
                    className="p-2 rounded border border-white text-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordStrength && (
                    <span className="text-sm text-white">
                      Password Strength: {passwordStrength}
                    </span>
                  )}
                  <button
                    type="button"
                    className="bg-accent text-primary py-2 rounded font-semibold"
                    onClick={() => {
                      setIsForgot(false);
                      setIsSignUp(false);
                      setForgotStep(1);
                      setPassword("");
                    }}
                  >
                    Reset Password
                  </button>
                </>
              )}
            </>
          ) : isSignUp ? (
            <>
              <h2 className="text-xl font-bold text-center text-white">Sign Up</h2>
              <input type="text" placeholder="Full Name" className="p-2 rounded border border-white text-black" />
              <input type="email" placeholder="Email" className="p-2 rounded border border-white text-black" />
              <input type="tel" placeholder="Contact Number" className="p-2 rounded border border-white text-black" />
              <input
                type="password"
                placeholder="Password"
                className="p-2 rounded border border-white text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="bg-accent text-primary py-2 rounded font-semibold">
                Sign Up
              </button>
              <div className="text-center text-sm text-white">
                Already registered?{" "}
                <button className="underline" onClick={() => setIsSignUp(false)}>
                  Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center text-white">Sign In</h2>
              <input type="email" placeholder="Email" className="p-2 border rounded border-white bg-white text-text" />
              <input type="password" placeholder="Password" className="p-2 border rounded border-white bg-white text-text" />

              <button
                type="button"
                className="text-sm text-black text-left"
                onClick={() => {
                  setIsForgot(true);
                  setIsSignUp(false);
                }}
              >
                Forgot Password?
              </button>

              {/* ✅ FIXED BUTTON */}
              <button
                type="button"
                className="bg-accent text-primary py-2 rounded font-semibold"
                onClick={() => router.push("/home")}
              >
                Sign In
              </button>

              <div className="text-center text-sm text-white">
                Not yet registered?{" "}
                <button className="underline" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </main>
  );
}

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="px-4 py-2 rounded bg-primary text-white dark:bg-primary-dark dark:text-black"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
