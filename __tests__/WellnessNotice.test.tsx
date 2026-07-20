/*
 * Component tests for WellnessNotice (the non-numerical one)
*/

import WellnessNotice from '@/components/WellnessNotice';
import { render, screen } from '@testing-library/react-native';

describe('WellnessNotice — display behaviour', () => {
  test.each(['engaged', 'balanced'])('renders nothing for the %s tier', async (status) => {
    await render(<WellnessNotice status={status as any} factors={['Long study day']} />);
    expect(screen.queryByText('What\'s been happening')).toBeNull();
    expect(screen.queryByText(/Sunny/)).toBeNull();
  });

  test('shows the tired message for overextended', async () => {
    await render(<WellnessNotice status="overextended" factors={[]} />);
    expect(screen.getByText("Sunny's a little tired")).toBeTruthy();
    expect(screen.getByText(/pushing hard lately/)).toBeTruthy();
  });

  test('shows the stronger message for burnout', async () => {
    await render(<WellnessNotice status="burnout" factors={[]} />);
    expect(screen.getByText('Sunny needs a rest')).toBeTruthy();
    expect(screen.getByText(/running low for a while/)).toBeTruthy();
  });

  test('the two tiers show different messages', async () => {
    const { rerender } = await render(<WellnessNotice status="overextended" factors={[]} />);
    expect(screen.queryByText('Sunny needs a rest')).toBeNull();

    await rerender(<WellnessNotice status="burnout" factors={[]} />);
    expect(screen.queryByText("Sunny's a little tired")).toBeNull();
    expect(screen.getByText('Sunny needs a rest')).toBeTruthy();
  });
});

describe('WellnessNotice — the factors box', () => {
  test('turns a factor into gentle wording', async () => {
    await render(<WellnessNotice status="overextended" factors={['Long study day']} />);
    expect(screen.getByText("What's been happening")).toBeTruthy();
    expect(screen.getByText('Long study hours today')).toBeTruthy();
  });

  test('shows several factors at once', async () => {
    await render(
      <WellnessNotice
        status="burnout"
        factors={['Very heavy study load today', 'Barely any breaks today', 'Low mood check-ins']}
      />
    );
    expect(screen.getByText('A very long study day')).toBeTruthy();
    expect(screen.getByText('Very few breaks today')).toBeTruthy();
    expect(screen.getByText('A draining day')).toBeTruthy();
  });

  test('hides the box entirely when there are no factors', async () => {
    await render(<WellnessNotice status="overextended" factors={[]} />);
    expect(screen.queryByText("What's been happening")).toBeNull();
  });

  test('hides the box when no factor is recognised', async () => {
    await render(<WellnessNotice status="overextended" factors={['Something made up']} />);
    expect(screen.queryByText("What's been happening")).toBeNull();
  });

  test('ignores unrecognised factors but still shows the known ones', async () => {
    await render(
      <WellnessNotice status="overextended" factors={['Something made up', 'Long study day']} />
    );
    expect(screen.getByText('Long study hours today')).toBeTruthy();
  });

  test('shows at most 3 factors', async () => {
    await render(
      <WellnessNotice
        status="burnout"
        factors={[
          'Very heavy study load today',
          'Heavy load building up all week',
          'Barely any breaks today',
          'Low mood check-ins',
        ]}
      />
    );
    expect(screen.queryByText('A draining day')).toBeNull();  
  });

  test.each([
    'Great self-care 🌿',
    'Taking good breaks',
    'Feeling good lately',
    'Finishing what you start',
  ])('does not show the positive factor "%s"', async (factor) => {
    await render(<WellnessNotice status="overextended" factors={[factor]} />);
    expect(screen.queryByText("What's been happening")).toBeNull();
  });
});

describe('WellnessNotice — the nudge', () => {
  test('always points at something the user can do', async () => {
    await render(<WellnessNotice status="overextended" factors={[]} />);
    expect(screen.getByText(/Logging a break or some rest/)).toBeTruthy();
  });

  test('shows even when there are no factors to explain', async () => {
    await render(<WellnessNotice status="burnout" factors={[]} />);
    expect(screen.getByText(/lift this back up/)).toBeTruthy();
  });

  test('never shows a number', async () => {
    await render(
      <WellnessNotice status="burnout" factors={['Very heavy study load today', 'Low mood check-ins']} />
    );
    expect(screen.queryByText(/\d+ points?/)).toBeNull();
    expect(screen.queryByText(/-\d+/)).toBeNull();
    expect(screen.queryByText(/\/ 100/)).toBeNull();
  });
});

describe('WellnessNotice — the factor strings match burnout.ts', () => {
  const NEGATIVE_FACTORS = [
    'Very heavy study load today',
    'Long study day',
    'Heavy load building up all week',
    'Load creeping up this week',
    'Barely any breaks today',
    'Low mood check-ins',
  ];

  test.each(NEGATIVE_FACTORS)('"%s" is recognised and shown', async (factor) => {
    await render(<WellnessNotice status="overextended" factors={[factor]} />);
    expect(screen.getByText("What's been happening")).toBeTruthy();
  });

});