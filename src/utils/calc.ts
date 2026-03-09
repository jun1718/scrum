/**
 * 투입률(%) = 특정 업무 workHours / 당일 전체 workHours 합계 × 100
 */
export function calcWorkRate(workHours: number, totalHours: number): number {
  if (totalHours <= 0) return 0
  return Math.round((workHours / totalHours) * 100)
}

export function sumWorkHours(details: { workHours: number }[]): number {
  return details.reduce((sum, d) => sum + d.workHours, 0)
}
