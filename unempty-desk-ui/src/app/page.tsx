"use client";

import { Button } from "@unempty-desk-ui/components/Button";
import { RocketIcon, EyeIcon, ClockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@unempty-desk-ui/utils/cn";
import DeskAnimation from "@unempty-desk-ui/lotties/desk.json";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import Footer from "@unempty-desk-ui/components/Footer";
import { useStopStreamOnRouteChange } from "@unempty-desk-ui/hooks/useStopStreamOnRouteChange";

export default function Home() {
  useStopStreamOnRouteChange();
  const router = useRouter();

  return (
    <motion.main
      className="min-h-screen flex flex-col justify-between items-center bg-slate-800 text-slate-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <section className="text-center items-center min-h-full justify-center flex flex-col md:flex-row  pt-20 px-4 shadow-sm">
        <div>
          <motion.h1
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome to <span className="text-indigo-400">EyeOnDesk</span>
          </motion.h1>

          <motion.p
            className="text-lg text-slate-300 max-w-xl mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Monitor and understand student device usage patterns — combining camera data and survey insights with smart prediction models.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <Button className={cn("text-lg px-6 py-3 bg-indigo-400")} onClick={() => router.push("/camera")}>
              Get Started
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="md:w-1/2 mt-10 md:mt-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Lottie animationData={DeskAnimation} loop={true} autoplay={true} />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="pb-16 px-6 max-w-5xl mx-auto grid gap-12 md:grid-cols-3">
        {[
          {
            Icon: EyeIcon,
            title: "Camera-Driven Insights",
            desc: "Automatically analyze device presence from desk camera footage.",
            delay: 0,
          },
          {
            Icon: ClockIcon,
            title: "Predict Usage Time",
            desc: "Get accurate predictions of how long devices are in use.",
            delay: 0.2,
          },
          {
            Icon: RocketIcon,
            title: "Hybrid ML Model",
            desc: "Combines real-time camera data and survey inputs for accuracy.",
            delay: 0.4,
          },
        ].map(({ Icon, title, desc, delay }, i) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
          >
            <Icon className="mx-auto w-10 h-10 text-indigo-400" />
            <h3 className="text-xl font-semibold mt-4">{title}</h3>
            <p className="mt-2 text-slate-300">{desc}</p>
          </motion.div>
        ))}
      </section>
      <Footer />
    </motion.main>
  );
}
