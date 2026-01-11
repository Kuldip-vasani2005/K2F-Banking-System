import React, { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";

const InteractiveBalanceChart = ({ timeRange = "month", transactions = [], accounts = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [data, setData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    if (transactions.length > 0) {
      generateDynamicData();
    } else {
      generateFallbackData();
    }
  }, [timeRange, transactions]);

  const generateDynamicData = () => {
    let timePeriods;
    let formatLabel;
    
    switch (timeRange) {
      case "week":
        timePeriods = 7;
        formatLabel = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case "month":
        timePeriods = 30;
        formatLabel = (date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        break;
      case "year":
        timePeriods = 12;
        formatLabel = (date) => date.toLocaleDateString('en-US', { month: 'short' });
        break;
      default:
        timePeriods = 30;
        formatLabel = (date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    const now = new Date();
    const dynamicData = [];
    let cumulativeBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Calculate daily/weekly/monthly data
    for (let i = timePeriods - 1; i >= 0; i--) {
      const date = new Date(now);
      
      if (timeRange === "year") {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      const periodTransactions = sortedTransactions.filter(t => {
        const tDate = new Date(t.createdAt);
        if (timeRange === "year") {
          return tDate.getMonth() === date.getMonth() && 
                 tDate.getFullYear() === date.getFullYear();
        } else {
          return tDate.toDateString() === date.toDateString();
        }
      });

      const deposits = periodTransactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const withdrawals = periodTransactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Adjust cumulative balance
      cumulativeBalance += deposits - withdrawals;

      dynamicData.push({
        date: formatLabel(date),
        balance: cumulativeBalance,
        deposits,
        withdrawals,
        transactions: periodTransactions.length
      });
    }

    setData(dynamicData);
  };

  const generateFallbackData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const mockData = months.map((month, index) => ({
      date: month,
      balance: 850000 + Math.random() * 400000,
      deposits: 200000 + Math.random() * 100000,
      withdrawals: 150000 + Math.random() * 80000,
      transactions: Math.floor(Math.random() * 50) + 10
    }));
    setData(mockData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-2xl"
        >
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-sm">{entry.name}</span>
              </div>
              <span className="text-white font-medium">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                {data[hoveredIndex].transactions} transactions
              </p>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (data.length < 2) return { value: 0, isPositive: true };
    const first = data[0].balance;
    const last = data[data.length - 1].balance;
    const growth = ((last - first) / first) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0
    };
  };

  const growth = calculateGrowth();

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl" />
      <div className="relative bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Balance Evolution</h3>
            <p className="text-gray-400">Real-time financial growth tracking</p>
            <div className="flex items-center mt-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                growth.isPositive 
                  ? "bg-emerald-500/20 text-emerald-300" 
                  : "bg-red-500/20 text-red-300"
              }`}>
                {growth.isPositive ? "↗" : "↘"} {growth.value}% {growth.isPositive ? "Growth" : "Decline"}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 mr-2" />
              <span className="text-sm text-gray-300">Balance</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-300 mr-2" />
              <span className="text-sm text-gray-300">Deposits</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-pink-300 mr-2" />
              <span className="text-sm text-gray-300">Withdrawals</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setHoveredIndex(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#60a5fa"
                fill="url(#colorBalance)"
                strokeWidth={3}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="#34d399"
                fill="url(#colorDeposits)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke="#f87171"
                fill="url(#colorWithdrawals)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {hoveredIndex !== null && data[hoveredIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(data[hoveredIndex].balance)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Deposits</p>
                <p className="text-xl font-bold text-emerald-400">
                  {formatCurrency(data[hoveredIndex].deposits)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Withdrawals</p>
                <p className="text-xl font-bold text-red-400">
                  {formatCurrency(data[hoveredIndex].withdrawals)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Transactions</p>
                <p className="text-xl font-bold text-purple-400">
                  {data[hoveredIndex].transactions}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InteractiveBalanceChart;