import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Keyboard } from 'react-native';
import { supabase } from '@/lib/supabase';
import { TaskItem, NewSubtaskItem, SubtaskItem } from '@/types/todo';
import { EventItem } from '@/types/event';

type PlannerState = {
    userID: string | null;
    eventItems: EventItem[];
    isLoading: boolean;
    selectedDate: string;

    init: () => Promise<void>;
    fetchEvents: () => Promise<void>;
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
    userID: null,
    eventItems: [],
    isLoading: false,
    selectedDate: new Date().toISOString().split('T')[0],

    init: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        set({ userID: user?.id ?? null });
        if (user?.id) await get().fetchEvents();
    },

    fetchEvents: async () => {

        const { userID, selectedDate } = get();
        if (!userID) return;

        set({ isLoading: true});

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
            set({ isLoading: false });
            return;
        }

        const formattedEvents: EventItem[] = data.map(event => ({
            id: event.id,
            title: event.title,
            subtitle: event.subtitle ?? undefined,
            start: { dateTime: event.start_time },
            end: { dateTime: event.end_time },
            color: event.color,
        }));

        set({ eventItems: formattedEvents, isLoading: false });
    },
}))