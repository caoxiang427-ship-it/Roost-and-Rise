export type EventItem = {
    id: string;
    start: { dateTime: string; timeZone?: string } | { date: string }; // date-only = all-day event
    end: { dateTime: string; timeZone?: string } | { date: string };
    allDay?: boolean;
    title?: string;
    eventDesc?: string;
    color?: string;
};