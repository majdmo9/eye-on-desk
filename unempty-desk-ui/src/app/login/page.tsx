"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

import { useRouter } from "next/navigation";
import { auth } from "@unempty-desk-ui/lib/firebase";
import { Button } from "@unempty-desk-ui/components/Button";
import Image from "next/image";
import { User } from "lucide-react";
import { useStopStreamOnRouteChange } from "@unempty-desk-ui/hooks/useStopStreamOnRouteChange";
import NavBar from "@unempty-desk-ui/components/NavBar";
import Footer from "@unempty-desk-ui/components/Footer";
export default function LoginPage() {
  useStopStreamOnRouteChange();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Store token in localStorage or send to backend
      localStorage.setItem("token", token);

      // You can redirect or call protected API here
      router.push("/camera");
    } catch (err) {
      console.log({ err });
      setError("Login failed. Check your credentials.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        router.push("/camera");
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-between">
      <NavBar />
      <div className="flex flex-col md:flex-row items-center justify-center gap-32 w-full px-4 md:px-0">
        <form
          onSubmit={handleLogin}
          className="h-[500px] bg-slate-700 p-8 rounded-md shadow-md w-full max-w-sm items-center justify-center flex flex-col"
        >
          <h1 className="text-2xl font-bold">Login to EyeOnDesk</h1>
          <div className="flex flex-col gap-4 pt-8 w-full">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded text-black"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded text-black"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full py-2 text-lg">
              Login
            </Button>
          </div>
          <User className="rounded-full border-2 border-slate-100 w-32 h-32 mt-8" />
        </form>
        <div className="w-[430px] h-[500px] rounded-md">
          <Image src="/images/login.png" width={1000} height={1000} alt="login pic" className="shadow-md rounded-md object-cover w-full h-full" />
        </div>
      </div>
      <Footer />
    </main>
  );
}
