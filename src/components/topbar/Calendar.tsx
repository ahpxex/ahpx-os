import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

interface CalendarProps {
  selectedDate: Date
}

export function Calendar({ selectedDate }: CalendarProps) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = monthStart.getDay()
  const emptyCells = Array(firstDayOfWeek).fill(null)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="w-64 border border-[var(--color-border)] bg-white p-3 shadow-md">
      <div className="mb-3 text-center">
        <div className="text-sm font-bold">{format(selectedDate, 'MMMM yyyy')}</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {daysInMonth.map((day) => {
          const isToday = isSameDay(day, new Date())
          const isSelected = isSameDay(day, selectedDate)

          return (
            <div
              key={day.toString()}
              className={`flex h-7 w-7 items-center justify-center text-xs ${
                isToday
                  ? 'rounded bg-[var(--color-primary)] font-bold text-white'
                  : isSelected
                    ? 'rounded bg-[var(--color-primary-bg)] font-medium'
                    : 'hover:bg-gray-100'
              }`}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>

      <div className="mt-3 border-t border-gray-200 pt-2 text-center text-xs text-gray-600">
        {format(selectedDate, 'EEEE, MMMM do, yyyy')}
      </div>
    </div>
  )
}
