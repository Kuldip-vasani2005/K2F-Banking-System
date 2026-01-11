import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import {
  Shield,
  CreditCard,
  Wallet,
  TrendingUp,
  Globe,
  Users,
  Lock,
  Zap,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Smartphone,
  BarChart,
  Award,
  Clock,
  DollarSign,
  ShieldCheck,
  Target,
  ChevronRight,
  Star,
  Banknote,
  Smartphone as Mobile,
  Building,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

const PublicDashboard = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView();

  const features = [
    {
      icon: ShieldCheck,
      title: "Military-Grade Security",
      description: "256-bit encryption & biometric authentication",
      color: "from-emerald-500 to-green-400",
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Real-time transfers with zero delays",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Bank anywhere with international support",
      color: "from-purple-500 to-violet-400",
    },
    {
      icon: TrendingUp,
      title: "Smart Investments",
      description: "AI-powered investment recommendations",
      color: "from-amber-500 to-orange-400",
    },
  ];

  const stats = [
    { value: "500K+", label: "Happy Customers", icon: Users },
    { value: "99.9%", label: "Uptime", icon: Clock },
    { value: "₹10B+", label: "Assets Managed", icon: DollarSign },
    { value: "4.8", label: "App Rating", icon: Star },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Business Owner",
      content: "K2F Bank transformed how I manage my business finances.",
      rating: 5,
      avatarColor: "from-pink-500 to-rose-400",
    },
    {
      name: "Raj Patel",
      role: "Software Engineer",
      content: "The investment features helped me grow my savings by 30%.",
      rating: 5,
      avatarColor: "from-blue-500 to-cyan-400",
    },
    {
      name: "Aisha Khan",
      role: "Freelancer",
      content: "International transfers are now instant and fee-free!",
      rating: 5,
      avatarColor: "from-purple-500 to-violet-400",
    },
  ];

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -8 },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        <motion.div
          animate={floatingAnimation}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={floatingAnimation}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-8">
              <Sparkles className="w-5 h-5 text-cyan-300 mr-3" />
              <span className="text-sm font-medium text-cyan-300">
                Welcome to Future Banking
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl lg:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Banking Reimagined
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                For Everyone
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto mb-12"
            >
              Experience the future of digital banking with cutting-edge
              security, smart investments, and seamless global access.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center text-lg">
                  Get Started Free
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.button>

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-gray-800/50 border-2 border-gray-700 text-gray-300 font-bold rounded-2xl hover:bg-gray-700/50 hover:border-gray-600 hover:text-white transition-all duration-300 shadow-xl"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-400"
            >
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-emerald-400 mr-2" />
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-blue-400 mr-2" />
                <span>Zero fees on transactions</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-purple-400 mr-2" />
                <span>Global banking</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Animated Hero Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: Wallet,
                title: "Digital Wallet",
                description: "Manage all your cards in one secure place",
                color: "from-blue-500 to-cyan-400",
                delay: 0.1,
              },
              {
                icon: CreditCard,
                title: "Smart Cards",
                description: "Virtual & physical cards with dynamic CVV",
                color: "from-purple-500 to-violet-400",
                delay: 0.2,
              },
              {
                icon: BarChart,
                title: "Wealth Growth",
                description: "AI-powered investment portfolios",
                color: "from-amber-500 to-orange-400",
                delay: 0.3,
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                custom={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
              >
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-xl`}
                >
                  <card.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                <p className="text-gray-400">{card.description}</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: card.delay + 0.5, duration: 1 }}
                  className="mt-6 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Choose K2F Bank
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with cutting-edge technology to deliver the best banking
              experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => setActiveFeature(index)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    activeFeature === index
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/50 shadow-2xl"
                      : "bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Animated Feature Preview */}
            <div className="relative">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center mr-6 shadow-xl`}
                  >
                    {React.createElement(features[activeFeature].icon, {
                      className: "w-8 h-8 text-white",
                    })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-gray-400">
                      {features[activeFeature].description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center p-4 bg-gray-800/30 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                      <span className="text-gray-300">
                        Advanced {features[activeFeature].title.toLowerCase()}{" "}
                        feature {i}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mt-8 h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full bg-[length:200%_100%]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-cyan-300" />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what our customers say about their banking experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-xl"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center mr-4 shadow-lg`}
                  >
                    <span className="text-lg font-bold text-white">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">{testimonial.content}</p>

                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974')] bg-cover bg-center opacity-10" />
            <div className="relative p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="lg:w-2/3 mb-8 lg:mb-0">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
                    <Award className="w-5 h-5 text-white mr-2" />
                    <span className="text-sm font-medium">
                      LIMITED TIME OFFER
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                    Start Your Financial Journey Today
                  </h2>
                  <p className="text-blue-100 text-lg mb-8 max-w-2xl">
                    Join thousands of customers who trust K2F Bank with their
                    financial future. Get your first month free with zero hidden
                    fees.
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-300 mr-3" />
                      <span className="text-sm">No minimum balance</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-300 mr-3" />
                      <span className="text-sm">Instant account setup</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-300 mr-3" />
                      <span className="text-sm">24/7 customer support</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-shadow shadow-xl"
                    >
                      Create Free Account
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                      Sign In to Existing Account
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-xl pt-12 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-6 lg:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">K2F</span>
              </div>
              <div>
                <span className="text-sm text-gray-400">
                  © 2024 K2F Secure Bank
                </span>
                <p className="text-xs text-gray-500">Secure • Smart • Simple</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <button className="hover:text-cyan-300 transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-cyan-300 transition-colors">
                Terms of Service
              </button>
              <button className="hover:text-cyan-300 transition-colors">
                Security
              </button>
              <button className="hover:text-cyan-300 transition-colors">
                Careers
              </button>
              <button className="hover:text-cyan-300 transition-colors flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700/50 text-center">
            <p className="text-xs text-gray-500">
              Protected by 256-bit encryption • ISO 27001 Certified • Member
              FDIC • Registered with RBI
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <Shield className="w-4 h-4 mr-2 text-emerald-400" />
                PCI DSS Compliant
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Lock className="w-4 h-4 mr-2 text-blue-400" />
                2FA Required
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Mobile className="w-4 h-4 mr-2 text-purple-400" />
                Mobile First
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicDashboard;
