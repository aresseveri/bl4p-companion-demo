/**
 * Daily dose reminders.
 *
 * These are LOCAL notifications scheduled by the OS on the device. There is
 * no push server, no token registration, and nothing leaves the phone. That
 * matters twice over: it is the honest privacy story for the App Store
 * nutrition label, and reliable scheduled reminders are the clearest answer
 * to "why is this an app and not a website?" (guideline 4.2).
 *
 * Web is a deliberate second-class citizen here. Browsers cannot schedule a
 * notification for 8am tomorrow without a service worker and a push service,
 * so on web we register permission and fire an immediate confirmation so the
 * mechanic is visible in the demo, and report `scheduled: false`. The UI
 * says so rather than pretending.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { productById } from '@/constants/products';
import { doseFor, isAsNeeded } from '@/lib/dosing';

export interface ReminderPet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  weightLb: number;
  birthYear: number;
  productId: string;
  reminder: { hour: number; minute: number };
  reminderOn: boolean;
}

export interface ScheduleResult {
  granted: boolean;
  /** True only when the OS actually holds a repeating daily trigger. */
  scheduled: boolean;
  reason?: string;
}

const isWeb = Platform.OS === 'web';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Stable per-pet identifier so re-scheduling replaces rather than stacks. */
const idFor = (petId: string) => `bl4p-dose-${petId}`;

export async function requestPermission(): Promise<boolean> {
  if (isWeb) {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const res = await window.Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** The body text of the reminder, using her real label wording. */
export function reminderBody(pet: ReminderPet): string {
  const product = productById(pet.productId);
  if (!product) return `Time for ${pet.name}'s dose.`;
  if (isAsNeeded(product)) {
    return `${product.shortName} for ${pet.name}, about 30 minutes before anything stressful.`;
  }
  const dose = doseFor(product, pet);
  return dose
    ? `${pet.name}: ${dose.pills} ${Number(dose.pills.split('-')[0]) === 1 ? 'pill' : 'pills'} of ${product.shortName}.`
    : `Time for ${pet.name}'s ${product.shortName}.`;
}

export async function schedulePetReminder(pet: ReminderPet): Promise<ScheduleResult> {
  const granted = await requestPermission();
  if (!granted) return { granted: false, scheduled: false, reason: 'permission denied' };

  const title = `Time for ${pet.name}'s dose`;
  const body = reminderBody(pet);

  if (isWeb) {
    // No reliable scheduling without a service worker and push service.
    try {
      new window.Notification(title, { body });
    } catch {
      // Some browsers require a service worker registration even for this.
    }
    return {
      granted: true,
      scheduled: false,
      reason: 'Browsers cannot schedule a daily reminder. The built app can.',
    };
  }

  await cancelPetReminder(pet.id);
  await Notifications.scheduleNotificationAsync({
    identifier: idFor(pet.id),
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: pet.reminder.hour,
      minute: pet.reminder.minute,
    },
  });
  return { granted: true, scheduled: true };
}

export async function cancelPetReminder(petId: string): Promise<void> {
  if (isWeb) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(idFor(petId));
  } catch {
    // Nothing scheduled under that id. Not an error.
  }
}

/** Fires one now, so the founder can see the reminder on the call. */
export async function previewReminder(pet: ReminderPet): Promise<ScheduleResult> {
  const granted = await requestPermission();
  if (!granted) return { granted: false, scheduled: false, reason: 'permission denied' };

  const title = `Time for ${pet.name}'s dose`;
  const body = reminderBody(pet);

  if (isWeb) {
    try {
      new window.Notification(title, { body });
      return { granted: true, scheduled: false };
    } catch {
      return { granted: true, scheduled: false, reason: 'blocked by the browser' };
    }
  }
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });
  return { granted: true, scheduled: true };
}
