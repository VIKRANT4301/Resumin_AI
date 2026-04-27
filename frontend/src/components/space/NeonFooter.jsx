import { motion } from 'framer-motion';
import { Terminal, Globe, MessageSquare } from 'lucide-react';
import { BrainCircuit } from 'lucide-react';

export default function NeonFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0A0D18]/50">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full bg-gradient-to-b from-[#5B8CFF]/5 to-transparent blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-10 h-10 object-contain rounded-xl" />
              <span className="font-black text-lg tracking-tighter text-white">
                ResuMind<span className="text-[#5B8CFF]">AI</span>
              </span>
            </div>
            <p className="text-sm text-stone-500">
              AI-powered resume shortlisting for modern teams
            </p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-[0.15em]">
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              {['Features', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-stone-400 hover:text-[#5B8CFF] transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-[0.15em]">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-stone-400 hover:text-[#8A2BE2] transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-[0.15em]">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              {['Privacy', 'Terms', 'Cookies', 'Compliance'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-stone-400 hover:text-[#FF5BEF] transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-stone-500"
          >
            <p>
              © {currentYear} ResuMindAI. Made with{' '}
              <span className="text-[#FF5BEF]">♥</span> for modern recruiters.
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6"
          >
            {[
              { icon: MessageSquare, href: '#', label: 'Twitter' },
              { icon: Globe, href: '#', label: 'LinkedIn' },
              { icon: Terminal, href: '#', label: 'GitHub' },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                whileHover={{ scale: 1.2, y: -3 }}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-[#5B8CFF] hover:border-[#5B8CFF]/50 transition-all duration-300 group"
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
