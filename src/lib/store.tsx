/**
 * Demo state.
 *
 * All local. AsyncStorage on device, localStorage on web via the same API.
 * There is no account, no server, and nothing here leaves the phone.
 * Seeded from constants/demo.ts so the founder's pet is a one-file swap.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  DEMO_HISTORY,
  DEMO_OWNER_FIRST_NAME,
  DEMO_PET,
  DEMO_PROGRESS,
  DEMO_REMINDER_TIME,
  DEMO_STREAK_DAYS,
  type DemoPet,
  type ProgressEntry,
} from '@/constants/demo';

const KEY = 'bl4p.demo.v1';

export interface DemoState {
  email: string;
  marketingOptIn: boolean;
  ownerName: string;
  pet: DemoPet;
  /** 30 entries, oldest first, last is today. */
  history: boolean[];
  streak: number;
  reminder: { hour: number; minute: number };
  progress: ProgressEntry[];
  onboarded: boolean;
}

const initial: DemoState = {
  email: '',
  marketingOptIn: false,
  ownerName: DEMO_OWNER_FIRST_NAME,
  pet: DEMO_PET,
  history: DEMO_HISTORY,
  streak: DEMO_STREAK_DAYS,
  reminder: DEMO_REMINDER_TIME,
  progress: DEMO_PROGRESS,
  onboarded: false,
};

interface Ctx extends DemoState {
  ready: boolean;
  set: (patch: Partial<DemoState>) => void;
  setPet: (patch: Partial<DemoPet>) => void;
  markTodayGiven: () => void;
  addProgress: (entry: ProgressEntry) => void;
  /** Wipes persisted state and returns to the seed. Handy mid-call. */
  resetDemo: () => void;
}

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initial);
  const [ready, setReady] = useState(false);

  // Mirrors `state` so the callbacks below never close over a stale value.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            // Merge over `initial` so a demo.ts edit shows up even when the
            // browser is holding stale state from an earlier run.
            setState({ ...initial, ...JSON.parse(raw) });
          } catch {
            // Corrupt payload: fall back to the seed rather than crashing.
          }
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: DemoState) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {
      // Non-fatal in a demo: state still lives in memory for this session.
    });
  }, []);

  const set = useCallback(
    (patch: Partial<DemoState>) => persist({ ...stateRef.current, ...patch }),
    [persist],
  );

  const setPet = useCallback(
    (patch: Partial<DemoPet>) =>
      persist({ ...stateRef.current, pet: { ...stateRef.current.pet, ...patch } }),
    [persist],
  );

  const markTodayGiven = useCallback(() => {
    const s = stateRef.current;
    if (s.history[s.history.length - 1]) return;
    const history = [...s.history];
    history[history.length - 1] = true;
    persist({ ...s, history, streak: s.streak + 1 });
  }, [persist]);

  const addProgress = useCallback(
    (entry: ProgressEntry) =>
      persist({ ...stateRef.current, progress: [...stateRef.current.progress, entry] }),
    [persist],
  );

  const resetDemo = useCallback(() => {
    stateRef.current = initial;
    setState(initial);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...state, ready, set, setPet, markTodayGiven, addProgress, resetDemo }),
    [state, ready, set, setPet, markTodayGiven, addProgress, resetDemo],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}
