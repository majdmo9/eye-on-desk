"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const [year, setYear] = useState<number | null>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  if (!year) {
    return null;
  }
  return (
    <motion.footer
      className="text-center py-4 text-slate-300 border-t bg-slate-700 border-none w-full rounded-t-md fixed bottom-0 left-0"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p>© {year} EyeOnDesk. All rights reserved.</p>
      <p className="text-sm">Made with ❤️ by Majd Mousa and David Nour</p>
    </motion.footer>
  );
};

export default Footer;
