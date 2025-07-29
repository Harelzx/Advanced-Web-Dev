'use client';

import { memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import ChartErrorBoundary from './ChartErrorBoundary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Utility function to detect mobile screen size
const isMobileScreen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640; // Tailwind's sm breakpoint
};

// Get responsive font sizes based on screen size and fullscreen mode
const getResponsiveFontSizes = (isFullscreen = false) => {
  const isMobile = isMobileScreen();
  if (isFullscreen && isMobile) {
    return {
      title: 16,
      axis: 14,
      tooltip: 14,
    };
  }
  return {
    title: isMobile ? 12 : 14,
    axis: isMobile ? 10 : 12,
    tooltip: isMobile ? 11 : 12,
  };
};

// Success Rate Trend Chart - Shows accuracy over last 5 sessions
export const SuccessRateTrendChart = memo(function SuccessRateTrendChart({ sessionAnalytics, isDark = false, isFullscreen = false }) {
  if (!sessionAnalytics || sessionAnalytics.length < 2) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        <p className="text-sm">נדרשים לפחות 2 מפגשים לגרף מגמה</p>
      </div>
    );
  }

  // Get last 5 sessions or all if fewer than 5
  const lastSessions = sessionAnalytics.slice(-5);
  
  const data = {
    labels: lastSessions.map(session => `מפגש ${session.session}`),
    datasets: [
      {
        label: '',
        data: lastSessions.map(session => session.accuracy),
        borderColor: isDark ? '#60a5fa' : '#3b82f6',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: isDark ? '#60a5fa' : '#3b82f6',
        pointBorderColor: isDark ? '#1e40af' : '#1d4ed8',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const fontSizes = getResponsiveFontSizes(isFullscreen);
  const isMobile = isMobileScreen();
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    resizeDelay: 100,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'מגמת הצלחה - 5 מפגשים אחרונים',
        color: isDark ? 'white' : '#374151',
        font: {
          size: fontSizes.title,
          weight: 'bold',
        },
        padding: {
          top: isMobile ? 8 : 10,
          bottom: isMobile ? 12 : 16,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#374151',
        bodyColor: isDark ? '#f3f4f6' : '#374151',
        borderColor: isDark ? '#6b7280' : '#d1d5db',
        borderWidth: 1,
        displayColors: false,
        titleFont: {
          size: fontSizes.tooltip,
          weight: 'bold',
        },
        bodyFont: {
          size: fontSizes.tooltip,
        },
        padding: isMobile ? 8 : 12,
        cornerRadius: isMobile ? 6 : 8,
        caretSize: isMobile ? 4 : 6,
        position: 'nearest',
        yAlign: 'bottom',
        callbacks: {
          label: function(context) {
            return `ציון: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: isDark ? 'white' : '#6b7280',
          font: {
            size: fontSizes.axis,
          },
          maxTicksLimit: isMobile ? 5 : 6,
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          lineWidth: isMobile ? 0.5 : 1,
        }
      },
      x: {
        ticks: {
          color: isDark ? 'white' : '#6b7280',
          font: {
            size: fontSizes.axis,
          },
          maxRotation: isMobile ? 45 : 0,
          minRotation: 0,
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          lineWidth: isMobile ? 0.5 : 1,
        }
      }
    },
  };

  return (
    <ChartErrorBoundary height="h-full" message="לא ניתן להציג גרף מגמת הצלחה">
      <div className="h-full w-full overflow-hidden">
        <Line data={data} options={options} />
      </div>
    </ChartErrorBoundary>
  );
});

// Improvement Graph - Compares early vs recent performance
export const ImprovementGraph = memo(function ImprovementGraph({ sessionAnalytics, isDark = false, isFullscreen = false }) {
  if (!sessionAnalytics || sessionAnalytics.length < 3) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        <p className="text-sm">נדרשים לפחות 3 מפגשים לגרף שיפור</p>
      </div>
    );
  }

  // Compare first half vs second half of sessions
  const firstHalf = sessionAnalytics.slice(0, Math.ceil(sessionAnalytics.length / 2));
  const secondHalf = sessionAnalytics.slice(Math.floor(sessionAnalytics.length / 2));
  
  const earlyAvg = Math.round(firstHalf.reduce((sum, s) => sum + s.accuracy, 0) / firstHalf.length);
  const recentAvg = Math.round(secondHalf.reduce((sum, s) => sum + s.accuracy, 0) / secondHalf.length);
  
  const improvement = recentAvg - earlyAvg;
  const isImproving = improvement > 0;
  
  // Create more specific labels showing session ranges
  const firstSessionNumbers = firstHalf.map(s => s.session).sort((a, b) => a - b);
  const lastSessionNumbers = secondHalf.map(s => s.session).sort((a, b) => a - b);
  
  const firstLabel = firstSessionNumbers.length === 1 
    ? `מפגש ${firstSessionNumbers[0]}` 
    : `מפגשים ${firstSessionNumbers[0]}-${firstSessionNumbers[firstSessionNumbers.length - 1]}`;
    
  const lastLabel = lastSessionNumbers.length === 1
    ? `מפגש ${lastSessionNumbers[0]}`
    : `מפגשים ${lastSessionNumbers[0]}-${lastSessionNumbers[lastSessionNumbers.length - 1]}`;

  const data = {
    labels: [firstLabel, lastLabel],
    datasets: [
      {
        label: 'ממוצע דיוק (%)',
        data: [earlyAvg, recentAvg],
        backgroundColor: [
          isDark ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)',
          isImproving 
            ? (isDark ? 'rgba(34, 197, 94, 0.8)' : 'rgba(22, 163, 74, 0.8)')
            : improvement < 0
            ? (isDark ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.8)')
            : (isDark ? 'rgba(251, 191, 36, 0.8)' : 'rgba(245, 158, 11, 0.8)')
        ],
        borderColor: [
          isDark ? '#9ca3af' : '#6b7280',
          isImproving 
            ? (isDark ? '#22c55e' : '#16a34a')
            : improvement < 0
            ? (isDark ? '#ef4444' : '#dc2626')
            : (isDark ? '#fbbf24' : '#f59e0b')
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const fontSizes = getResponsiveFontSizes(isFullscreen);
  const isMobile = isMobileScreen();
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    resizeDelay: 100,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'גרף שיפור - השוואה בין מפגשים ראשונים לאחרונים',
        color: isDark ? 'white' : '#374151',
        font: {
          size: fontSizes.title,
          weight: 'bold',
        },
        padding: {
          top: isMobile ? 8 : 10,
          bottom: isMobile ? 12 : 16,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#374151',
        bodyColor: isDark ? '#f3f4f6' : '#374151',
        borderColor: isDark ? '#6b7280' : '#d1d5db',
        borderWidth: 1,
        displayColors: false,
        titleFont: {
          size: fontSizes.tooltip,
          weight: 'bold',
        },
        bodyFont: {
          size: fontSizes.tooltip,
        },
        padding: isMobile ? 8 : 12,
        cornerRadius: isMobile ? 6 : 8,
        caretSize: isMobile ? 4 : 6,
        position: 'nearest',
        yAlign: 'bottom',
        callbacks: {
          label: function(context) {
            return `ממוצע: ${context.parsed.y}%`;
          },
          afterLabel: function(context) {
            if (context.dataIndex === 1) {
              return improvement > 0 
                ? `שיפור של ${improvement}%` 
                : improvement < 0 
                ? `ירידה של ${Math.abs(improvement)}%`
                : 'ללא שינוי';
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: isDark ? 'white' : '#6b7280',
          font: {
            size: fontSizes.axis,
          },
          maxTicksLimit: isMobile ? 5 : 6,
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          lineWidth: isMobile ? 0.5 : 1,
        }
      },
      x: {
        ticks: {
          color: isDark ? 'white' : '#6b7280',
          font: {
            size: fontSizes.axis,
          },
          maxRotation: isMobile ? 20 : 0,
          minRotation: 0,
        },
        grid: {
          display: false, // Hide vertical grid lines for cleaner bar chart look
        }
      }
    },
  };

  return (
    <ChartErrorBoundary height="h-full" message="לא ניתן להציג גרף שיפור">
      <div className="h-full w-full overflow-hidden">
        <Bar data={data} options={options} />
      </div>
    </ChartErrorBoundary>
  );
});