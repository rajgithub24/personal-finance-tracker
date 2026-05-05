import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ExpenseChart = ({ expenses }) => {
  const categoryMap = {};

  expenses.forEach((exp) => {
    if (categoryMap[exp.category]) {
      categoryMap[exp.category] += exp.amount;
    } else {
      categoryMap[exp.category] = exp.amount;
    }
  });

  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  const data = {
    labels,
    datasets: [
      {
        label: "Expenses by Category",
        data: values,
      },
    ],
  };

  return (
    <div>
      <h2>Expense Chart</h2>
      <Bar data={data} />
    </div>
  );
};

export default ExpenseChart;