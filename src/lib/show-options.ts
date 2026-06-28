export type ShowOption = {
  id: number;
  eventName: string;
  venueName: string;
  dateKey: string; // yyyy-mm-dd (for date filtering)
  dateDisplay: string; // localized
};

/** Build ShowPicker options from rows with event/venue names and a startsAt date. */
export function toShowOptions(
  rows: { id: number; eventName: string; venueName: string; startsAt: Date | string }[],
): ShowOption[] {
  return rows.map((r) => {
    const d = new Date(r.startsAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    return {
      id: r.id,
      eventName: r.eventName,
      venueName: r.venueName,
      dateKey,
      dateDisplay: d.toLocaleDateString("he-IL"),
    };
  });
}
