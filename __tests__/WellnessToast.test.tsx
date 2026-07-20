/*
 * Component tests for WellnessToast
*/

import WellnessToast from '@/components/WellnessToast';
import { render, screen } from '@testing-library/react-native';

describe('WellnessToast', () => {
  test('shows the amount with a plus sign', async () => {
    await render(<WellnessToast amount={6} reason="Recovery logged" />);
    expect(screen.getByText('Wellness +6')).toBeTruthy();
  });

  test('shows the reason', async () => {
    await render(<WellnessToast amount={2} reason="Mood check-in" />);
    expect(screen.getByText('Mood check-in')).toBeTruthy();
  });

  test.each([1, 2, 5, 12])('shows the real amount (+%p), not a fixed number', async (amount) => {
    await render(<WellnessToast amount={amount} reason="Recovery logged" />);
    expect(screen.getByText(`Wellness +${amount}`)).toBeTruthy();
  });

  test('an empty reason does not break the render', async () => {
    await render(<WellnessToast amount={3} reason="" />);
    expect(screen.getByText('Wellness +3')).toBeTruthy();
  });
});