import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Keyboard } from 'react-native';
import { supabase } from '@/lib/supabase';
import { EventItem } from '@/types/event';

type PlannerState = {
    userID: string | null;
    eventItems: EventItem[];
    eventsLoading: boolean;
    selectedDate: string;

    init: () => Promise<void>;
    fetchEvents: () => Promise<void>;
    addEvent: (
        title: string,
        start: string, 
        end: string,
        allDay: boolean,
        color?: string, 
        subtitle? : string,
    ) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    updateEvent: (
        id: string,
        title: string,
        start: string, 
        end: string,
        allDay: boolean,
        color?: string, 
        subtitle? : string,
    ) => Promise<void>,
    rescheduleEvent: (updatedEvent: Pick<EventItem, 'id' | 'start' | 'end'>) => Promise<void>,
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
    userID: null,
    eventItems: [],
    eventsLoading: false,
    selectedDate: new Date().toISOString().split('T')[0],

    init: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        set({ userID: user?.id ?? null });
        if (user?.id) await get().fetchEvents();
    },

    fetchEvents: async () => {

        const { userID, selectedDate } = get();
        if (!userID) return;

        set({ eventsLoading: true});

        const offset = 30; // days
        const from = new Date(get().selectedDate); from.setDate(from.getDate() - offset);
        const to = new Date(get().selectedDate); to.setDate(to.getDate() + offset);

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', userID)
            .gte('start_time', from.toISOString())
            .lte('start_time', to.toISOString());

        if (error) {
            console.log(error);
            set({ eventsLoading: false });
            return;
        }


        const formattedEvents: EventItem[] = data.map(event => ({
            id: event.id,
            title: event.title,
            eventDesc: event.subtitle ?? undefined,
            start: event.all_day
                ? { date: event.start_time.split('T')[0] }
                : { dateTime: event.start_time },
            end: event.all_day
                ? { date: event.end_time.split('T')[0] }
                : { dateTime: event.end_time },
            color: event.color,
            allDay: event.all_day,
        }));

        set({ eventItems: formattedEvents, eventsLoading: false });
    },

    addEvent: async (title, start, end, allDay = false, color = '#ffff9c', subtitle = '') => {
        const { userID, fetchEvents } = get();
        if (!title.trim() || !userID) return;

        const { error } = await supabase
            .from('events')
            .insert({
                user_id: userID,
                title: title.trim(),
                subtitle: subtitle.trim() || null,
                start_time: start,
                end_time: end,
                color,
                all_day: allDay
            });

        if (error) {
            console.log(error);
            return;
        }

        fetchEvents();
    },

    deleteEvent: async (id) => {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) {
            console.log(error);
            return;
        }
        get().fetchEvents();
    },

    updateEvent: async (id, title, start, end, allDay = false, color = '#ffff9c', subtitle = '') => {
            Keyboard.dismiss();
            if (!title.trim()) return;
    
            const { error } = await supabase
                .from('events')
                .update({
                    title: title.trim(),
                    subtitle: subtitle.trim() || null,
                    start_time: start,
                    end_time: end,
                    color,
                    all_day: allDay
                })
                .eq('id', id);
    
            if (error) {
                console.log(error);
                return;
            }

            get().fetchEvents();
        },
    
        rescheduleEvent: async (updatedEvent) => {
            console.log('updatedEvent.start:', updatedEvent.start);
            const { error } = await supabase
                .from('events')
                .update({
                    start_time: getDateTimeString(updatedEvent.start),
                    end_time: getDateTimeString(updatedEvent.end),
                })
                .eq('id', updatedEvent.id);
    
            if (error) {
                console.log(error);
                return;
            }

            get().fetchEvents();
        },

}))

    // to convert date object into YYYY-MM-DD (for all day events)
export const formatDatetoString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
};

// EventItem start/end isn't a plain string — it's a union type { dateTime: string; timeZone?: string } | { date: string }
// this function converts it into a string so it can be stored into the state
export const getDateTimeString = (
    eventDate?: { dateTime: string; timeZone?: string } | { date: string }
    ): string | undefined => {
        if (!eventDate) return undefined;
        // check time in eventDate, if dateTime return dateTime, if date return date
        if ('dateTime' in eventDate) {
            return eventDate.dateTime;
            } else {
            return eventDate.date;
        }
}