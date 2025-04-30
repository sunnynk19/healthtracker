"use client";

import { useHabitStore } from "@/store/habits";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, Save } from "lucide-react";

const HABITS = [
  { id: "noSmoking", label: "No Smoking" },
  { id: "exercise", label: "30 min Exercise" },
  { id: "water", label: "Drink Water" },
  { id: "sleep", label: "Good Sleep" },
  { id: "vegFruits", label: "Veg+Fruits" },
  { id: "alcohol", label: "No Alcohol" },
  { id: "saltOil", label: "Low Salt+Oil" },
  { id: "b12", label: "B12 Supplement" },
  { id: "breathing", label: "Breathing Exercise" },
] as const;

export default function Home() {
  const {
    habitData,
    isLoading,
    error,
    initialized,
    initializeExcel,
    toggleHabit,
    incrementSmokingCount,
    saveToExcel,
  } = useHabitStore();

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Health Tracker
          </h1>
          <p className="text-gray-600 mb-4">
            Click the button below to start tracking your habits
          </p>
          <Button onClick={initializeExcel}>Start Tracking</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => initializeExcel()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const todayData = habitData.find((day) => day.date === today);

  if (!todayData) {
    return null;
  }

  const last30Days = habitData
    .slice(0, 30)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Health Habit Tracker
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your daily health habits
            </p>
          </div>
          <Button
            onClick={saveToExcel}
            className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Save className="h-4 w-4" />
            Save to Excel
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
          {/* Today&apos;s Habits */}
          <div className="rounded-xl bg-white p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Today&apos;s Habits
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {HABITS.map(({ id, label }) => (
                <div
                  key={id}
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {label}
                  </span>
                  <Button
                    variant={
                      todayData[id as keyof typeof todayData]
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleHabit(today, id)}
                    className={`text-sm sm:text-base transition-all duration-200 ${
                      todayData[id as keyof typeof todayData]
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {todayData[id as keyof typeof todayData]
                      ? "Done"
                      : "Not Done"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Smoking Count
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Click to increment
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => incrementSmokingCount(today)}
                  className="text-base sm:text-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {todayData.smokingCount}
                </Button>
              </div>
            </div>
          </div>

          {/* Smoking Trend */}
          <div className="rounded-xl bg-white p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              30-Day Smoking Trend
            </h2>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    labelFormatter={(date) =>
                      format(new Date(date), "MMM d, yyyy")
                    }
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="smokingCount"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History View */}
          <div className="md:col-span-2">
            <div className="rounded-xl bg-white p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                History
              </h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50">
                          Date
                        </th>
                        {HABITS.map(({ id, label }) => (
                          <th
                            key={id}
                            className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50"
                          >
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">
                              {label.split(" ")[0]}
                            </span>
                          </th>
                        ))}
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {habitData.slice(0, 7).map((day) => (
                        <tr
                          key={day.date}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                            {format(new Date(day.date), "MMM d, yyyy")}
                          </td>
                          {HABITS.map(({ id }) => (
                            <td
                              key={id}
                              className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900"
                            >
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                                  day[id as keyof typeof day]
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {day[id as keyof typeof day] ? "✓" : "✗"}
                              </span>
                            </td>
                          ))}
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-medium">
                              {day.smokingCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
