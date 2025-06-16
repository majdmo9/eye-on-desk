import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      className="text-center py-8 text-slate-300 border-t bg-slate-700 border-none w-full rounded-t-md"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p>© {new Date().getFullYear()} EyeOnDesk. All rights reserved.</p>
    </motion.footer>
  );
};

export default Footer;
