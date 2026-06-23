/* 
 * Test if the counddown time displays corretcly 
 * For typical session duration (25 min for focus, 5 min for break)
 * edge cases (zero, negative), and long sessions exceeding 1h.
*/

function displayTime(seconds: number) {
  const totalSeconds = Math.max(0, seconds);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

describe('displayTime', () => {
  test('formats 25 minutes as 25:00', () => {
    expect(displayTime(1500)).toBe('25:00');
  });

  test('formates 5 seconds as 00:05', () => {
    expect(displayTime(5)).toBe('00:05');
  });

  test('handles negative values by resetting to 00:00', () => {
    expect(displayTime(-10)).toBe('00:00');
  });

  test('format 1 hour 30 minutes as 90:00', () => {
    expect(displayTime(5400)).toBe('90:00');
  });
});
