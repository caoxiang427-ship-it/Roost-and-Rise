import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
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
        start: Date, 
        end: Date,
        allDay: boolean,
        color?: string, 
        subtitle? : string,
    ) => Promise<void>;
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
            subtitle: event.subtitle ?? undefined,
            start: event.all_day
                ? { date: event.start_time.split('T')[0] }
                : { dateTime: event.start_time },
            end: event.all_day
                ? { date: event.end_time.split('T')[0] }
                : { dateTime: event.end_time },
            color: event.color,
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
    },}))