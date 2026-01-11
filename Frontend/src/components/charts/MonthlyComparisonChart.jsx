import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

const MonthlyComparisonChart = ({ transactions = [] }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { yearlyData, yearlyStats } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const data = {
      [currentYear]: {},
      [lastYear]: {}
    };

    // Initialize months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      data[currentYear][month] = { income: 0, expenses: 0, savings: 0 };
      data[lastYear][month] = { income: 0, expenses: 0, savings: 0 };
    });

    // Process transactions
    if (transactions.length > 0) {
      transactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        const amount = transaction.amount;
        
        if (year === currentYear || year === lastYear) {
          if (transaction.type === 'credit') {
            data[year][month].income += amount;
          } else if (transaction.type === 'debit') {
            data[year][month].expenses += amount;
          }
        }
      });
    } else {
      // Generate mock data if no transactions
      months.forEach(month => {
        const income = 120000 + Math.random() * 50000;
        const expenses = 80000 + Math.random() * 40000;
        data[currentYear][month] = {
          income: Math.round(income),
          expenses: Math.round(expenses),
          savings: Math.round(income - expenses)
        };
        
        const lastYearIncome = income * 0.85;
        const lastYearExpenses = expenses * 0.9;
        data[lastYear][month] = {
          income: Math.round(lastYearIncome),
          expenses: Math.round(lastYearExpenses),
          savings: Math.round(lastYearIncome - lastYearExpenses)
        };
      });
    }

    // Calculate savings
    for (const year of [currentYear, lastYear]) {
      months.forEach(month => {
        const monthData = data[year][month];
        monthData.savings = Math.max(0, monthData.income - monthData.expenses);
      });
    }

    // Calculate yearly statistics
    const stats = {
      [currentYear]: {
        totalIncome: months.reduce((sum, month) => sum + data[currentYear][month].income, 0),
        totalExpenses: months.reduce((sum, month) => sum + data[currentYear][month].expenses, 0),
        totalSavings: months.reduce((sum, month) => sum + data[currentYear][month].savings, 0),
      },
      [lastYear]: {
        totalIncome: months.reduce((sum, month) => sum + data[lastYear][month].income, 0),
        totalExpenses: months.reduce((sum, month) => sum + data[lastYear][month].expenses, 0),
        totalSavings: months.reduce((sum, month) => sum + data[lastYear][month].savings, 0),
      }
    };

    // Calculate growth
    const incomeGrowth = ((stats[currentYear].totalIncome - stats[lastYear].totalIncome) / stats[lastYear].totalIncome) * 100;
    const savingsGrowth = ((stats[currentYear].totalSavings - stats[lastYear].totalSavings) / stats[lastYear].totalSavings) * 100;

    stats[currentYear].incomeGrowth = incomeGrowth.toFixed(1);
    stats[currentYear].savingsGrowth = savingsGrowth.toFixed(1);
    stats[currentYear].savingsRate = ((stats[currentYear].totalSavings / stats[currentYear].totalIncome) * 100).toFixed(1);

    return {
      yearlyData: {
        [currentYear]: months.map(month => ({
          month,
          ...data[currentYear][month]
        })),
        [lastYear]: months.map(month => ({
          month,
          ...data[lastYear][month]
        }))
      },
      yearlyStats: stats
    };
  }, [transactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload[0].value;
      const expenses = payload[1].value;
      const savings = payload[2].value;
      const savingsRate = ((savings / income) * 100).toFixed(1);

      return (
        <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-2xl">
          <p className="font-bold text-white mb-2">{label} {selectedYear}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-400">Income:</span>
              <span className="font-bold text-white">{formatCurrency(income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-400">Expenses:</span>
              <span className="font-bold text-white">{formatCurrency(expenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-400">Savings:</span>
              <span className="font-bold text-white">{formatCurrency(savings)}</span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Savings Rate:</span>
                <span className="font-bold text-purple-400">{savingsRate}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const years = Object.keys(yearlyData);
  const selectedYearData = yearlyData[selectedYear] || [];

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Income vs Expenses</h3>
          <p className="text-gray-400">Monthly comparison analysis</p>
        </div>
        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedYear === year
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-400">FY {selectedYear}</span>
          </div>
        </div>
      </div>

      <div className="h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={selectedYearData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="month"
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
            <Bar
              dataKey="income"
              name="Income"
              radius={[4, 4, 0, 0]}
              fill="#3b82f6"
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              radius={[4, 4, 0, 0]}
              fill="#10b981"
            />
            <Bar
              dataKey="savings"
              name="Savings"
              radius={[4, 4, 0, 0]}
              fill="#8b5cf6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-700/50">
        <div className="text-center p-4 bg-blue-500/10 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
            <p className="text-sm font-medium text-blue-300">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(yearlyStats[selectedYear]?.totalIncome || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {yearlyStats[selectedYear]?.incomeGrowth > 0 ? '+' : ''}
            {yearlyStats[selectedYear]?.incomeGrowth || '0.0'}% growth
          </p>
        </div>

        <div className="text-center p-4 bg-emerald-500/10 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="w-5 h-5 text-emerald-400 mr-2" />
            <p className="text-sm font-medium text-emerald-300">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(yearlyStats[selectedYear]?.totalExpenses || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Expense ratio:{" "}
            {(
              (yearlyStats[selectedYear]?.totalExpenses /
                yearlyStats[selectedYear]?.totalIncome) *
              100 || 0
            ).toFixed(1)}
            %
          </p>
        </div>

        <div className="text-center p-4 bg-purple-500/10 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
            <p className="text-sm font-medium text-purple-300">Total Savings</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(yearlyStats[selectedYear]?.totalSavings || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Savings rate: {yearlyStats[selectedYear]?.savingsRate || '0.0'}% •{" "}
            {yearlyStats[selectedYear]?.savingsGrowth > 0 ? '+' : ''}
            {yearlyStats[selectedYear]?.savingsGrowth || '0.0'}% growth
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyComparisonChart;