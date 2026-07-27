/*
 * Component tests for BurnoutIndicator.
 * We mock the burnout score calculator 
*/

import BurnoutIndicator from '@/components/BurnoutIndicator';
import { calculateBurnoutScore } from '@/lib/burnout';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@/lib/burnout', () => ({
  calculateBurnoutScore: jest.fn(),
}));

const mockCalculate = calculateBurnoutScore as jest.Mock;

// Creates a default burnout result
function result(over: Partial<{ score: number; status: string; factors: string[] }> = {}) {
  return {
    score: 65,
    status: 'balanced',
    factors: [],
    breakdown: {
      effectiveLoad: 0, exhaustion: 0, chronic: 0,
      mood: 0, recovery: 0, efficacy: 0,
    },
    ...over,
  } as any;
}

const SIZE = 96;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * ((SIZE - STROKE) / 2);

// Reads the ring's progress
function ringOffset(): number {
  return Number(screen.getByTestId('wellness-ring').props.strokeDashoffset);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCalculate.mockResolvedValue(result());
});

describe('BurnoutIndicator — where the score comes from', () => {
  // this test ensures both screens show the same score, whether it is passed in or computed by the component
  test('uses the provided burnout score instead of recalculating it', async () => {
    await render(<BurnoutIndicator result={result({ score: 88, status: 'engaged' })} />);
    expect(screen.getByText('88 / 100')).toBeTruthy();
    expect(mockCalculate).not.toHaveBeenCalled();
  });

  test('calculates the score when no result is provided', async () => {
    mockCalculate.mockResolvedValue(result({ score: 42, status: 'overextended' }));
    await render(<BurnoutIndicator />);
    expect(await screen.findByText('42 / 100')).toBeTruthy();
    expect(mockCalculate).toHaveBeenCalledTimes(1);
  });

  test('renders nothing when the parent is still loading', async () => {
    await render(<BurnoutIndicator result={null} />);
    expect(screen.queryByText('Wellness Score')).toBeNull();
    expect(mockCalculate).not.toHaveBeenCalled();
  });

  test('renders the calculated score after it is loaded', async () => {
    await render(<BurnoutIndicator />);
    await waitFor(() => expect(screen.getByText('65 / 100')).toBeTruthy());
  });
});

describe('BurnoutIndicator — full view', () => {
  test.each([
    ['engaged', 'Engaged', 'Sunny is thriving. Keep it up.'],
    ['balanced', 'Balanced', 'Sunny is calm. No rush today.'],
    ['overextended', 'Overextended', 'Sunny needs a breather soon.'],
    ['burnout', 'Burnout', 'Time to rest. Sunny is tired.'],
  ])('the %s tier shows its own label and message', async (status, label, message) => {
    await render(<BurnoutIndicator result={result({ status })} />);
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });

  test('shows the score out of 100', async () => {
    await render(<BurnoutIndicator result={result({ score: 73, status: 'engaged' })} />);
    expect(screen.getByText('73 / 100')).toBeTruthy();
  });

  test('labels itself as the wellness score', async () => {
    await render(<BurnoutIndicator result={result()} />);
    expect(screen.getByText('Wellness Score')).toBeTruthy();
  });
});

describe('BurnoutIndicator — the ring', () => {
  test('a score of 0 leaves the ring completely empty', async () => {
    await render(<BurnoutIndicator result={result({ score: 0, status: 'burnout' })} />);
    expect(ringOffset()).toBeCloseTo(CIRCUMFERENCE, 3);
  });

  test('a score of 100 fills the ring completely', async () => {
    await render(<BurnoutIndicator result={result({ score: 100, status: 'engaged' })} />);
    expect(ringOffset()).toBeCloseTo(0, 3);
  });

  test('a score of 50 fills the ring halfway', async () => {
    await render(<BurnoutIndicator result={result({ score: 50, status: 'balanced' })} />);
    expect(ringOffset()).toBeCloseTo(CIRCUMFERENCE / 2, 3);
  });

  test('the ring never overflows if a score somehow lands outside 0-100', async () => {
    const { rerender } = await render(
      <BurnoutIndicator result={result({ score: 150, status: 'engaged' })} />
    );
    expect(ringOffset()).toBeCloseTo(0, 3);

    await rerender(<BurnoutIndicator result={result({ score: -20, status: 'burnout' })} />);
    expect(ringOffset()).toBeCloseTo(CIRCUMFERENCE, 3);
  });

  test('the ring follows the score when it changes', async () => {
    const { rerender } = await render(
      <BurnoutIndicator result={result({ score: 25, status: 'overextended' })} />
    );
    const before = ringOffset();

    await rerender(<BurnoutIndicator result={result({ score: 75, status: 'engaged' })} />);
    expect(ringOffset()).toBeLessThan(before);   
  });
});

describe('BurnoutIndicator — tier info modal', () => {
  test('the modal is closed until the info button is tapped', async () => {
    await render(<BurnoutIndicator result={result()} />);
    expect(screen.queryByText('Sustainable balance of exertion and recovery.')).toBeNull();
  });

  test('tapping info lists all four tiers with their ranges', async () => {
    await render(<BurnoutIndicator result={result()} />);

    await fireEvent.press(screen.getByTestId('wellness-info'));

    expect(screen.getByText(/70-100/)).toBeTruthy();
    expect(screen.getByText(/45-69/)).toBeTruthy();
    expect(screen.getByText(/25-44/)).toBeTruthy();
    expect(screen.getByText(/0-24/)).toBeTruthy();
  });

  test('the ranges shown match the thresholds in the config', () => {
    const { BURNOUT_CONFIG } = require('@/lib/burnout_constants');
    expect(BURNOUT_CONFIG.THRESHOLDS.ENGAGED).toBe(70);
    expect(BURNOUT_CONFIG.THRESHOLDS.BALANCED).toBe(45);
    expect(BURNOUT_CONFIG.THRESHOLDS.OVEREXTENDED).toBe(25);
  });
});