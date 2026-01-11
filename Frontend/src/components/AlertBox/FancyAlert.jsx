import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { useEffect } from "react";

const alertConfig = {
  success: {
    bg: "bg-emerald-600",
    icon: <Check size={18} />,
    title: "Well done!",
  },
  error: {
    bg: "bg-rose-600",
    icon: <X size={18} />,
    title: "Oh snap!",
  },
  warning: {
    bg: "bg-amber-500",
    icon: <AlertTriangle size={18} />,
    title: "Warning!",
  },
  info: {
    bg: "bg-blue-600",
    icon: <Info size={18} />,
    title: "Hi there!",
  },
};

const FancyAlert = ({ 
  type = "info", 
  message, 
  onClose,
  duration = 2000, // Auto-hide duration in milliseconds
  autoClose = true // Whether to auto-hide
}) => {
  const config = alertConfig[type];

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`relative flex items-center gap-4 px-6 py-4 rounded-full shadow-xl text-white ${config.bg}`}
    >
      {/* Icon badge */}
      <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center shadow">
        {config.icon}
      </div>

      {/* Text */}
      <div className="pl-4">
        <p className="font-semibold">{config.title}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="ml-auto opacity-70 hover:opacity-100 transition"
      >
        ✕
      </button>

      {/* Progress bar for auto-close */}
      {autoClose && duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
        />
      )}
    </motion.div>
  );
};

export default FancyAlert;