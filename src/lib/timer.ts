export function displayTime(seconds: number) {
    const totalSeconds = Math.max(0, seconds);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;

    const displayMin = min.toString().padStart(2, '0');
    const displaySec = sec.toString().padStart(2, '0');

    return `${displayMin}:${displaySec}`;
  }

export function isLateNight(hour: number): boolean {
  return hour >= 23 || hour < 5;
}

export function getCyclePosition(completedToday: number): number {
  const nextSession = completedToday + 1;
  return ((nextSession - 1) % 4) + 1;
}

export function isLongBreakNext(completedToday: number): boolean {
  const nextSession = completedToday + 1;
  return nextSession % 4 === 0;
}
