interface SessionStatsProps {
  solvedPercent: number
  rightPercent: number
}

export function SessionStats({ solvedPercent, rightPercent }: SessionStatsProps) {
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const solvedOffset = circumference - (solvedPercent / 100) * circumference
  const rightOffset = circumference - (rightPercent / 100) * circumference

  return (
    <div className="flex gap-8 items-center justify-center">
      {/* Solved Percentage */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={solvedOffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(solvedPercent)}%</div>
              <div className="text-xs text-muted-foreground">Решено</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Percentage */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={rightOffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                rightPercent >= 70
                  ? 'text-green-500'
                  : rightPercent >= 50
                    ? 'text-yellow-500'
                    : 'text-red-500'
              }`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(rightPercent)}%</div>
              <div className="text-xs text-muted-foreground">Правильно</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

