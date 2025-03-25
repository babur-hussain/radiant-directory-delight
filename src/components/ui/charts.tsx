
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Line Chart Component
interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  className?: string;
  height?: number;
}

export const LineChart = ({ data, options, className, height }: LineChartProps) => {
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className={`w-full h-full ${className || ''}`} style={{ height: height || '100%' }}>
      <Line data={data} options={options || defaultOptions} />
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  className?: string;
  height?: number;
}

export const BarChart = ({ data, options, className, height }: BarChartProps) => {
  const defaultOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className={`w-full h-full ${className || ''}`} style={{ height: height || '100%' }}>
      <Bar data={data} options={options || defaultOptions} />
    </div>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: ChartData<'pie'>;
  options?: ChartOptions<'pie'>;
  className?: string;
  height?: number;
}

export const PieChart = ({ data, options, className, height }: PieChartProps) => {
  const defaultOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      }
    }
  };

  return (
    <div className={`w-full h-full ${className || ''}`} style={{ height: height || '100%' }}>
      <Pie data={data} options={options || defaultOptions} />
    </div>
  );
};
