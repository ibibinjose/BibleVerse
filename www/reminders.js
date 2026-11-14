// A daily local notification. The browser can remember the time; only the
// installed app can deliver the alert.

export function parseReminderTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function reminderNotification({ hour, minute }) {
  return {
    id: 1,
    title: "Today's verse",
    body: "A moment with Scripture is waiting in BibleVerse.",
    schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
  };
}
