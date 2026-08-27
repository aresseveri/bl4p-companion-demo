/**
 * Demo state.
 *
 * All local. AsyncStorage on device, localStorage on web via the same API.
 * There is no account, no server, and nothing here leaves the phone.
 * Seeded from constants/demo.ts so the founder's pets are a one-file swap.
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
  DEMO_EMAIL,
  DEMO_OWNER_FIRST_NAME,
  DEMO_PETS,
  emptyPet,
  type Pet,
  type ProgressEntry,
  type VetNote,
  type WeightEntry,
} from '@/constants/demo';
import { cancelPetReminder, schedulePetReminder } from '@/lib/reminders';

const KEY = 'bl4p.demo.v2';

export interface DemoState {
  email: string;
  marketingOptIn: boolean;
  ownerName: string;
  pets: Pet[];
  activePetId: string;
  /** Finished onboarding at least once. */
  onboarded: boolean;
  /** Accepted the not-veterinary-advice notice. */
  disclaimerAccepted: boolean;
}

const initial: DemoState = {
  email: DEMO_EMAIL,
  marketingOptIn: false,
  ownerName: DEMO_OWNER_FIRST_NAME,
  pets: DEMO_PETS,
  activePetId: DEMO_PETS[0]?.id ?? '',
  onboarded: false,
  disclaimerAccepted: false,
};

interface Ctx extends DemoState {
  ready: boolean;
  /** The pet Home and the tabs are currently showing. */
  pet: Pet;
  set: (patch: Partial<DemoState>) => void;
  setActivePet: (id: string) => void;
  /** Patch the active pet, or a specific one by id. */
  setPet: (patch: Partial<Pet>, id?: string) => void;
  addPet: () => string;
  removePet: (id: string) => void;
  markTodayGiven: (id?: string) => void;
  addProgress: (entry: ProgressEntry, id?: string) => void;
  addWeight: (entry: WeightEntry, id?: string) => void;
  addVetNote: (entry: VetNote, id?: string) => void;
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
            const saved = JSON.parse(raw) as Partial<DemoState>;
            setState({ ...initial, ...saved });
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

  const patchPet = useCallback(
    (patch: Partial<Pet>, id?: string) => {
      const s = stateRef.current;
      const target = id ?? s.activePetId;
      const pets = s.pets.map((p) => (p.id === target ? { ...p, ...patch } : p));
      persist({ ...s, pets });
      return pets.find((p) => p.id === target);
    },
    [persist],
  );

  const setPet = useCallback(
    (patch: Partial<Pet>, id?: string) => {
      const next = patchPet(patch, id);
      // Keep the OS reminder in sync whenever the schedule changes.
      if (next && ('reminder' in patch || 'reminderOn' in patch || 'name' in patch)) {
        if (next.reminderOn) schedulePetReminder(next);
        else cancelPetReminder(next.id);
      }
    },
    [patchPet],
  );

  const setActivePet = useCallback((id: string) => set({ activePetId: id }), [set]);

  const addPet = useCallback(() => {
    const s = stateRef.current;
    // Monotonic, so removing a pet can never collide with a later add.
    let n = s.pets.length + 1;
    while (s.pets.some((p) => p.id === `pet-${n}`)) n += 1;
    const id = `pet-${n}`;
    persist({ ...s, pets: [...s.pets, emptyPet(id)], activePetId: id });
    return id;
  }, [persist]);

  const removePet = useCallback(
    (id: string) => {
      const s = stateRef.current;
      if (s.pets.length <= 1) return;
      cancelPetReminder(id);
      const pets = s.pets.filter((p) => p.id !== id);
      persist({
        ...s,
        pets,
        activePetId: s.activePetId === id ? pets[0].id : s.activePetId,
      });
    },
    [persist],
  );

  const markTodayGiven = useCallback(
    (id?: string) => {
      const s = stateRef.current;
      const target = id ?? s.activePetId;
      const pet = s.pets.find((p) => p.id === target);
      if (!pet || pet.history[pet.history.length - 1]) return;
      const history = [...pet.history];
      history[history.length - 1] = true;
      patchPet({ history, streak: pet.streak + 1 }, target);
    },
    [patchPet],
  );

  const addProgress = useCallback(
    (entry: ProgressEntry, id?: string) => {
      const s = stateRef.current;
      const target = id ?? s.activePetId;
      const pet = s.pets.find((p) => p.id === target);
      if (!pet) return;
      patchPet({ progress: [...pet.progress, entry] }, target);
    },
    [patchPet],
  );

  const addWeight = useCallback(
    (entry: WeightEntry, id?: string) => {
      const s = stateRef.current;
      const target = id ?? s.activePetId;
      const pet = s.pets.find((p) => p.id === target);
      if (!pet) return;
      const weights = [...pet.weights, entry].sort((a, b) => a.date.localeCompare(b.date));
      // The profile weight drives dosing, so keep it on the latest reading.
      patchPet({ weights, weightLb: entry.lb }, target);
    },
    [patchPet],
  );

  const addVetNote = useCallback(
    (entry: VetNote, id?: string) => {
      const s = stateRef.current;
      const target = id ?? s.activePetId;
      const pet = s.pets.find((p) => p.id === target);
      if (!pet) return;
      const vetNotes = [...pet.vetNotes, entry].sort((a, b) => a.date.localeCompare(b.date));
      patchPet({ vetNotes }, target);
    },
    [patchPet],
  );

  const resetDemo = useCallback(() => {
    stateRef.current = initial;
    setState(initial);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const pet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      pet,
      ready,
      set,
      setActivePet,
      setPet,
      addPet,
      removePet,
      markTodayGiven,
      addProgress,
      addWeight,
      addVetNote,
      resetDemo,
    }),
    [
      state,
      pet,
      ready,
      set,
      setActivePet,
      setPet,
      addPet,
      removePet,
      markTodayGiven,
      addProgress,
      addWeight,
      addVetNote,
      resetDemo,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}
