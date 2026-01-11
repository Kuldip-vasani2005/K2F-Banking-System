import React, { useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Target, TrendingUp, Award, CreditCard, AlertCircle } from "lucide-react";

const AccountPerformanceChart = ({ accounts = [], transactions = [] }) => {
  const performance = useMemo(() => {
    const totalAccounts = accounts.length;
    
    if (totalAccounts === 0) {
      return {
        score: 75, // Default score for no accounts
        activeAccounts: 0,
        totalAccounts: 0,
        avgBalance: 0,
        totalBalance: 0,
        monthlyTransactions: 0,
        status: "Good"
      };
    }

    const activeAccounts = accounts.filter(
      (acc) => acc.status === "active"
    ).length;

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance || 0),
      0
    );

    const avgBalance = totalAccounts > 0 ? totalBalance / totalAccounts : 0;

    // Calculate transaction activity
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.createdAt) > oneMonthAgo
    ).length;

    // Calculate performance score
    const activityScore = (activeAccounts / totalAccounts) * 40; // Max 40 points
    const balanceScore = Math.min(30, (totalBalance / 1000000) * 30); // Max 30 points
    const transactionScore = Math.min(30, (recentTransactions / 20) * 30); // Max 30 points
    
    const performanceScore = Math.min(100, activityScore + balanceScore + transactionScore);

    return {
      score: Math.round(performanceScore),
      activeAccounts,
      totalAccounts,
      avgBalance,
      totalBalance,
      monthlyTransactions: recentTransactions,
      status:
        performanceScore >= 80
          ? "Excellent"
          : performanceScore >= 60
          ? "Good"
          : performanceScore >= 40
          ? "Average"
          : "Needs Improvement",
    };
  }, [accounts, transactions]);

  const data = [{ value: performance.score, fill: getColor(performance.score) }];

  function getColor(score) {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Account Performance</h3>
          <p className="text-gray-400">Overall financial health score</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            performance.status === "Excellent"
              ? "bg-emerald-500/20 text-emerald-300"
              : performance.status === "Good"
              ? "bg-blue-500/20 text-blue-300"
              : performance.status === "Average"
              ? "bg-amber-500/20 text-amber-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {performance.status}
        </div>
      </div>

      <div className="relative h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="30%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "#374151" }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{performance.score}</p>
            <p className="text-sm text-gray-400">out of 100</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Active Accounts</p>
              <p className="text-xs text-gray-400">
                {performance.activeAccounts} of {performance.totalAccounts} accounts
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">
              {performance.totalAccounts > 0 
                ? Math.round((performance.activeAccounts / performance.totalAccounts) * 100)
                : 100}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Total Balance</p>
              <p className="text-xs text-gray-400">Across all accounts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">
              {formatCurrency(performance.totalBalance)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Monthly Activity</p>
              <p className="text-xs text-gray-400">
                {performance.monthlyTransactions} transactions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(performance.score / 85) * 100}%`,
                  backgroundColor: getColor(performance.score),
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Goal: 85 points
            </p>
          </div>
        </div>

        {performance.totalAccounts === 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-amber-400 mr-2" />
              <p className="text-sm text-amber-300">
                No accounts found. Performance score based on general metrics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPerformanceChart;