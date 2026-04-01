import React from "react";

interface AttendanceStatsSummaryCardProps {
  totalPublishers: number;
  weekdayAverage: number;
  weekendAverage: number;
  groupColor: string;
  hasData: boolean;
}

export default function AttendanceStatsSummaryCard({
  totalPublishers,
  weekdayAverage,
  weekendAverage,
  groupColor,
  hasData,
}: AttendanceStatsSummaryCardProps) {
  if (!hasData) {
    return (
      <div className="rounded-lg border bg-card p-6 mb-4">
        <p className="text-muted-foreground text-center">No data available</p>
      </div>
    );
  }

  const weekdayPercentage =
    totalPublishers > 0
      ? Math.round((weekdayAverage / totalPublishers) * 100)
      : 0;
  const weekendPercentage =
    totalPublishers > 0
      ? Math.round((weekendAverage / totalPublishers) * 100)
      : 0;

  const renderStatRow = (
    label: string,
    average: number,
    percentage: number,
    total: number,
  ) => {
    const roundedAverage = Math.round(average);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-muted-foreground">
            {percentage}% present ({roundedAverage} of {total})
          </span>
        </div>
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: groupColor,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card p-6 mb-4">
      <div className="space-y-4">
        {/* Total Publishers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Total publishers
            </span>
            <span className="text-muted-foreground">{totalPublishers}</span>
          </div>
        </div>

        {/* Mid-week Average */}
        {renderStatRow(
          "Average mid-week attendance",
          weekdayAverage,
          weekdayPercentage,
          totalPublishers,
        )}

        {/* Weekend Average */}
        {renderStatRow(
          "Average weekend attendance",
          weekendAverage,
          weekendPercentage,
          totalPublishers,
        )}
      </div>
    </div>
  );
}
