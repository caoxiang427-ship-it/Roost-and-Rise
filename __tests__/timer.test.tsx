/*
 * Component tests for the Pomodoro timer screen.
 * Most of the tests pin down bugs where the timer saved the wrong duration to the database. 
*/

import TimerScreen from '@/app/(tabs)/pomodoro_timer';
import { getTodaysFocusSessionCount, sessionRecorder } from '@/lib/sessions';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: false })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/constants/storeItems', () => ({ imageMap: {} }));

jest.mock('@/lib/sessions', () => ({
  sessionRecorder: jest.fn(async () => ({ data: null, error: null })),
  getTodayStudyMinutes: jest.fn(async () => 0),
  getTodaysFocusSessionCount: jest.fn(async () => 0),
}));

jest.mock('@/store/useProfileStore', () => ({
  useProfileStore: () => ({
    addFocusXp: jest.fn(async () => 10),
    equippedItemId: null,
    chickName: 'Sunny',
    xp: 0,
  }),
  calculateXPLevel: () => 1,
  totalXpRequiredForLevel: (lvl: number) => lvl * 100,
}));

jest.mock('@/store/useTodoStore', () => ({
  useTodoStore: () => ({ init: jest.fn(), selectedDate: '2026-07-17', setSelectedDate: jest.fn() }),
  useRenderedTaskItems: () => [],
  calculateProgress: () => 0,
}));

const mockRecorder = sessionRecorder as jest.Mock;
const mockFocusCount = getTodaysFocusSessionCount as jest.Mock;

const RADIUS = 106;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Runs the countdown forward
async function runMinutes(minutes: number) {
  await act(async () => {
    jest.advanceTimersByTime(minutes * 60 * 1000);
  });
}

async function pressTimes(testID: string, times: number) {
  for (let i = 0; i < times; i++) {
    await fireEvent.press(screen.getByTestId(testID));
  }
}

// 1 = full ring, 0 = empty
function ringProgress(): number {
  const offset = Number(screen.getByTestId('timer-ring').props.strokeDashoffset);
  return 1 - offset / CIRCUMFERENCE;   
}

// Drops the focus length from 25 (default) to 5, using the Settings tab
async function setFocusToFiveMinutes() {
  await fireEvent.press(screen.getByText('Settings'));
  await pressTimes('focus-minus', 4);
  expect(screen.getByText('05:00')).toBeTruthy(); 
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  // a fixed mid-morning time, so the late-night alert never fires
  jest.setSystemTime(new Date('2026-07-17T10:00:00'));
  mockRecorder.mockResolvedValue({ data: null, error: null });
  mockFocusCount.mockResolvedValue(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Timer — starting and pausing', () => {
  test('shows the default 25-minute focus time', async () => {
    await render(<TimerScreen />);
    expect(screen.getByText('25:00')).toBeTruthy();
    expect(screen.getByText('FOCUS')).toBeTruthy();
  });

  test('timer counts down once started', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Start'));

    await runMinutes(1);
    expect(screen.getByText('24:00')).toBeTruthy();
  });

  test('does not count down before Start is pressed', async () => {
    await render(<TimerScreen />);
    await runMinutes(2);
    expect(screen.getByText('25:00')).toBeTruthy();
  });

  test('Pause stops the countdown', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(1);

    await fireEvent.press(screen.getByText('Pause'));
    await runMinutes(5);

    expect(screen.getByText('24:00')).toBeTruthy();
  });

  test('the companion message changes when the timer is running', async () => {
    await render(<TimerScreen />);
    expect(screen.getByText("Tap start when you're ready")).toBeTruthy();

    await fireEvent.press(screen.getByText('Start'));
    expect(screen.getByText('Sunny is studying with you')).toBeTruthy();
  });
});

describe('Timer — settings stepper', () => {
  test('changing the focus length in Setting tab updates the clock straight away', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Settings'));

    await pressTimes('focus-plus', 1);
    expect(screen.getByText('30 min')).toBeTruthy();
    expect(screen.getByText('30:00')).toBeTruthy();
  });

  test('focus length cannot go below 5 minutes', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Settings'));

    await pressTimes('focus-minus', 10);
    expect(screen.getByText('05:00')).toBeTruthy(); // clamped at 5, not 0 
  });

  test('focus length cannot go above 60 minutes', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Settings'));

    await pressTimes('focus-plus', 20);
    expect(screen.getByText('60 min')).toBeTruthy();
  });

  test('the settings are locked while the timer runs', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Start'));

    await fireEvent.press(screen.getByText('Settings'));
    await pressTimes('focus-plus', 1);

    expect(screen.getByText('25 min')).toBeTruthy();
  });
});

describe('Timer — saving the right duration', () => {
  test('a finished focus session saves the length that actually ran', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();

    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    expect(mockRecorder).toHaveBeenCalledWith(5, 'focus');
  });

  test('a focus length chosen in the modal is the one that gets saved', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();

    // run the first focus session
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    // take the break the modal offers
    await fireEvent.press(screen.getByText('Start 5-min break'));
    await runMinutes(5);

    // the "feeling refreshed?" modal offers 5 min focus, but we choose 10 min
    expect(screen.getByText('Feeling refreshed?')).toBeTruthy();
    await pressTimes('modal-focus-plus', 1);
    await fireEvent.press(screen.getByText('Start 10-min focus'));

    mockRecorder.mockClear();
    await runMinutes(10);

    expect(mockRecorder).toHaveBeenCalledWith(10, 'focus');
    expect(mockRecorder).not.toHaveBeenCalledWith(5, 'focus');
  });

  test('a 15-minute long break is saved as 15 minutes', async () => {
    mockFocusCount.mockResolvedValue(3);  
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();

    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    expect(screen.getByText('4 sessions done 🎉')).toBeTruthy();

    await fireEvent.press(screen.getByText('Rest here (15 min)'));
    mockRecorder.mockClear();
    await runMinutes(15);

    expect(mockRecorder).toHaveBeenCalledWith(15, 'break');
    expect(mockRecorder).not.toHaveBeenCalledWith(5, 'break');
  });
});

describe('Timer — cancelling', () => {
  test('cancelling saves the minutes that actually elapsed, flagged as cancelled', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Settings'));
    await pressTimes('focus-minus', 1); // 20 minutes

    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(8);
    await fireEvent.press(screen.getByText('Cancel'));

    expect(mockRecorder).toHaveBeenCalledWith(8, 'focus', true);
  });

  test('cancelling a long break saves the elapsed minutes instead of nothing', async () => {
    mockFocusCount.mockResolvedValue(3);
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();

    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);
    await fireEvent.press(screen.getByText('Rest here (15 min)'));

    await runMinutes(10);
    mockRecorder.mockClear();
    await fireEvent.press(screen.getByText('Cancel'));

    expect(mockRecorder).toHaveBeenCalledWith(10, 'break', true);
  });

  test('a session under a minute is not saved at all', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Start'));

    await act(async () => { jest.advanceTimersByTime(10 * 1000); });
    await fireEvent.press(screen.getByText('Cancel'));

    expect(mockRecorder).not.toHaveBeenCalled();
  });

  test('cancelling returns the screen to an idle focus session', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(3);
    await fireEvent.press(screen.getByText('Cancel'));

    expect(screen.getByText('FOCUS')).toBeTruthy();
    expect(screen.getByText('25:00')).toBeTruthy();
  });

  test('Cancel does nothing when no session has started', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Cancel'));
    expect(mockRecorder).not.toHaveBeenCalled();
  });
});

describe('Timer — the progress ring', () => {
  test('starts full and empties as time passes', async () => {
    await render(<TimerScreen />);
    expect(ringProgress()).toBeCloseTo(1, 2);

    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);
    expect(ringProgress()).toBeCloseTo(0.8, 2); // 20 of 25 minutes left

    await runMinutes(7.5);
    expect(ringProgress()).toBeCloseTo(0.5, 2);
  });

  test('is accurate for a focus length chosen in the modal', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();

    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);
    await fireEvent.press(screen.getByText('Start 5-min break'));
    await runMinutes(5);

    expect(screen.getByText('Feeling refreshed?')).toBeTruthy();
    await pressTimes('modal-focus-plus', 3); // 5 -> 20 minutes
    await fireEvent.press(screen.getByText('Start 20-min focus'));

    await runMinutes(5);
    expect(ringProgress()).toBeCloseTo(0.75, 2); // 15 of 20 min left, not stuck at 1
  });
});

describe('Timer — the break modal', () => {
  test('finishing a focus session offers a break', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    expect(screen.getByText('Nice work 🌱')).toBeTruthy();
    expect(screen.getByText('Start 5-min break')).toBeTruthy();
  });

  test('the suggested break increases with the focus length', async () => {
    await render(<TimerScreen />);
    await fireEvent.press(screen.getByText('Settings'));
    await pressTimes('focus-plus', 7);           
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(60);

    expect(screen.getByText('Start 15-min break')).toBeTruthy();
  });

  test('the break length can be changed before starting it', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    expect(screen.getByText('Nice work 🌱')).toBeTruthy();
    await pressTimes('modal-break-plus', 1);
    await fireEvent.press(screen.getByText('Start 10-min break'));

    mockRecorder.mockClear();
    await runMinutes(10);
    expect(mockRecorder).toHaveBeenCalledWith(10, 'break');
  });

  test('starting a break switches the screen into break mode', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);
    await fireEvent.press(screen.getByText('Start 5-min break'));

    expect(screen.getByText('BREAK')).toBeTruthy();
    expect(screen.getByText('Sunny is resting too 💛')).toBeTruthy();
  });

  test('Skip break saves no break and returns to an idle focus session', async () => {
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    expect(screen.getByText('Nice work 🌱')).toBeTruthy();
    mockRecorder.mockClear();
    await fireEvent.press(screen.getByText('Skip break'));

    expect(screen.getByText('FOCUS')).toBeTruthy();
    expect(screen.getByText('05:00')).toBeTruthy();
    await runMinutes(10);
    expect(mockRecorder).not.toHaveBeenCalled();
  });

  test('every 4th session offers the navigation to recovery screen instead of just a break suggestion', async () => {
    mockFocusCount.mockResolvedValue(3);
    await render(<TimerScreen />);
    await setFocusToFiveMinutes();
    await fireEvent.press(screen.getByText('Start'));
    await runMinutes(5);

    expect(screen.getByText('4 sessions done 🎉')).toBeTruthy();
    expect(screen.getByText('Take me to recovery →')).toBeTruthy();
    expect(screen.queryByText('Nice work 🌱')).toBeNull();
  });
});