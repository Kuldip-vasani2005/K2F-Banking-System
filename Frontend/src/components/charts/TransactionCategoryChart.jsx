import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CreditCard, ShoppingBag, Home, Car, Utensils, Heart, Film, TrendingUp, DollarSign } from "lucide-react";

const TransactionCategoryChart = ({ transactions = [] }) => {
  const categoryColors = {
    Shopping: "#3b82f6",
    Food: "#10b981",
    Transportation: "#f59e0b",
    Housing: "#8b5cf6",
    Healthcare: "#ef4444",
    Entertainment: "#ec4899",
    Investment: "#06b6d4",
    Income: "#84cc16",
    Other: "#6b7280",
  };

  const categoryIcons = {
    Shopping: <ShoppingBag className="w-4 h-4" />,
    Food: <Utensils className="w-4 h-4" />,
    Transportation: <Car className="w-4 h-4" />,
    Housing: <Home className="w-4 h-4" />,
    Healthcare: <Heart className="w-4 h-4" />,
    Entertainment: <Film className="w-4 h-4" />,
    Investment: <TrendingUp className="w-4 h-4" />,
    Income: <DollarSign className="w-4 h-4" />,
    Other: <CreditCard className="w-4 h-4" />,
  };

  const processTransactionData = useMemo(() => {
    const categoryMapping = {
      'shopping': 'Shopping',
      'food': 'Food',
      'restaurant': 'Food',
      'transport': 'Transportation',
      'uber': 'Transportation',
      'taxi': 'Transportation',
      'rent': 'Housing',
      'mortgage': 'Housing',
      'housing': 'Housing',
      'medical': 'Healthcare',
      'health': 'Healthcare',
      'entertainment': 'Entertainment',
      'movie': 'Entertainment',
      'streaming': 'Entertainment',
      'salary': 'Income',
      'income': 'Income',
      'investment': 'Investment',
      'stocks': 'Investment',
      'crypto': 'Investment'
    };

    const categories = {
      Shopping: 0,
      Food: 0,
      Transportation: 0,
      Housing: 0,
      Healthcare: 0,
      Entertainment: 0,
      Investment: 0,
      Income: 0,
      Other: 0
    };

    // Process only debit transactions for spending analysis
    const debitTransactions = transactions.filter(t => t.type === 'debit');

    if (debitTransactions.length === 0) {
      // If no debit transactions, show a sample distribution
      return [
        { name: "Shopping", value: 35, color: categoryColors.Shopping },
        { name: "Food", value: 25, color: categoryColors.Food },
        { name: "Transportation", value: 15, color: categoryColors.Transportation },
        { name: "Housing", value: 10, color: categoryColors.Housing },
        { name: "Entertainment", value: 8, color: categoryColors.Entertainment },
        { name: "Healthcare", value: 5, color: categoryColors.Healthcare },
        { name: "Other", value: 2, color: categoryColors.Other },
      ];
    }

    debitTransactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount);
      const description = transaction.description?.toLowerCase() || '';
      
      let category = 'Other';
      
      // Map based on description keywords
      for (const [key, value] of Object.entries(categoryMapping)) {
        if (description.includes(key)) {
          category = value;
          break;
        }
      }
      
      if (transaction.category) {
        category = categoryMapping[transaction.category.toLowerCase()] || transaction.category;
      }
      
      categories[category] = (categories[category] || 0) + amount;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: categoryColors[name] || categoryColors.Other,
      }))
      .filter((item) => item.value > 0);
  }, [transactions]);

  const data = processTransactionData;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-2xl">
          <p className="font-bold text-white mb-2">{payload[0].name}</p>
          <p className="text-sm text-gray-300">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-400">{percentage}% of total spending</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Spending by Category</h3>
        <p className="text-gray-400">Monthly expenditure breakdown</p>
      </div>

      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No spending data available</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {data.slice(0, 5).map((category) => {
          const percentage = ((category.value / total) * 100).toFixed(1);
          return (
            <div key={category.name} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div style={{ color: category.color }}>
                    {categoryIcons[category.name] || categoryIcons.Other}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{category.name}</p>
                  <p className="text-xs text-gray-400">{percentage}% of total</p>
                </div>
              </div>
              <p className="text-sm font-bold text-white">
                {formatCurrency(category.value)}
              </p>
            </div>
          );
        })}
        
        {data.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-400">
              +{data.length - 5} more categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCategoryChart;