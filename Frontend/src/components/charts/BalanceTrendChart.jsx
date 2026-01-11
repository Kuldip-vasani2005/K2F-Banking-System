import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const BalanceTrendChart = ({ data, timeRange = "month" }) => {
  const [chartData, setChartData] = useState([]);
  const [trend, setTrend] = useState({ value: 0, isPositive: true });

  useEffect(() => {
    if (data && data.length > 0) {
      processChartData();
    } else {
      generateMockData();
    }
  }, [data, timeRange]);

  const generateMockData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const mockData = months.map((month, index) => ({
      name: month,
      balance: 50000 + Math.random() * 100000,
      deposits: 15000 + Math.random() * 30000,
      withdrawals: 8000 + Math.random() * 20000,
    }));
    setChartData(mockData);
    calculateTrend(mockData);
  };

  const processChartData = () => {
    // Process actual data if available
    if (data) {
      calculateTrend(data);
      setChartData(data);
    }
  };

  const calculateTrend = (dataArray) => {
    if (dataArray.length >= 2) {
      const first = dataArray[0].balance;
      const last = dataArray[dataArray.length - 1].balance;
      const trendValue = ((last - first) / first) * 100;
      setTrend({
        value: Math.abs(trendValue).toFixed(1),
        isPositive: trendValue >= 0,
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Balance Trend</h3>
          <p className="text-sm text-gray-500">Last 6 months overview</p>
        </div>
        <div className="flex items-center">
          <div
            className={`flex items-center px-3 py-1 rounded-full ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {trend.value}% {trend.isPositive ? "Growth" : "Decline"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Balance"]}
              labelStyle={{ color: "#374151", fontWeight: 600 }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#4f46e5"
              fill="url(#colorBalance)"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Avg. Balance</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(
              chartData.reduce((sum, item) => sum + item.balance, 0) /
                chartData.length
            )}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Deposits</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(
              chartData.reduce((sum, item) => sum + item.deposits, 0)
            )}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Withdrawals</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(
              chartData.reduce((sum, item) => sum + item.withdrawals, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceTrendChart;