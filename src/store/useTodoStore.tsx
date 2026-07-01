import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Keyboard } from 'react-native';
import { supabase } from '@/lib/supabase';
import { TaskItem, NewSubtaskItem, SubtaskItem } from '@/types/todo';

type TodoState = {
    userID: string | null;
    taskItems: TaskItem[];
    tasksLoading: boolean;
    selectedDate: string;
    selectedTask: TaskItem | null;

    init: () => Promise<void>;
    setSelectedDate: (date: string) => void;
    syncSelectedDate: (selected: string) => void;
    setSelectedTask: (task: TaskItem | null) => void;

    fetchTasks: () => Promise<void>;
    handleAddTask: (
        text: string,
        dread: boolean,
        complete: boolean,
        difficulty: 'easy' | 'moderate' | 'difficult' | '',
        scheduledDate: string,
        taskDesc?: string,
        subtasks?: NewSubtaskItem[],
    ) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    handleEditTask: (
        id: number,
        text: string,
        dread: boolean,
        complete: boolean,
        difficulty: 'easy' | 'moderate' | 'difficult' | '',
        scheduledDate: string,
        taskDesc?: string,
        subtasks?: SubtaskItem[],
        deletedSubtaskIds?: number[],
    ) => Promise<void>;
    toggleCompletion: (id: number, completed: boolean, subtasks: SubtaskItem[]) => Promise<void>;
    toggleDread: (id: number, dread: boolean) => Promise<void>;
    toggleSubtaskCompletion: (id: number, completed: boolean) => Promise<void>;
    updateTaskXp: (id: number, awarded: number) => Promise<void>;
};

export const useTodoStore = create<TodoState>((set, get) => ({
    userID: null,
    taskItems: [],
    tasksLoading: true,
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTask: null,

    // call once on mount instead of the loadUser + useEffect([userID]) pair
    init: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        set({ userID: user?.id ?? null });
        if (user?.id) await get().fetchTasks();
    },

    setSelectedDate: (date) => set({ selectedDate: date }),
    syncSelectedDate: (selected) => set({ selectedDate: selected }),
    setSelectedTask: (task) => set({ selectedTask: task }),

    fetchTasks: async () => {
        const { userID } = get();
        if (!userID) return;

        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        subtasks (
          id,
          text,
          completed
        )
      `)
            .eq('user_id', userID)
            .order('created_at', { ascending: false })
            .order('id', { referencedTable: 'subtasks', ascending: true });

        if (error) {
            console.log(error);
            return;
        }

        const formattedTasks: TaskItem[] = data.map(task => ({
            id: task.id,
            text: task.text,
            completed: task.completed,
            dread: task.dread,
            difficulty: task.difficulty,
            taskDesc: task.task_desc,
            subtasks: task.subtasks ?? [],
            scheduledDate: task.scheduled_date,
            xpAwarded: task.xp_awarded,
        }));

        set({ taskItems: formattedTasks, tasksLoading: false });
    },

    handleAddTask: async (text, dread, complete, difficulty, scheduledDate, taskDesc = '', subtasks = []) => {
        Keyboard.dismiss();

        const { userID, fetchTasks } = get();
        if (!text.trim() || !userID) return;

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                user_id: userID,
                text: text.trim(),
                completed: complete,
                dread,
                difficulty,
                task_desc: taskDesc ?? '',
                scheduled_date: scheduledDate,
            })
            .select()
            .single();

        if (error) {
            console.log(error);
            return;
        }

        if (subtasks.length > 0) {
            const { error: subtaskError } = await supabase
                .from('subtasks')
                .insert(subtasks.map(subtask => ({
                    task_id: data.id,
                    text: subtask.text,
                    completed: subtask.completed,
                })));
            if (subtaskError) console.log(subtaskError);
        }

        fetchTasks();
    },

    deleteTask: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
            console.log(error);
            return;
        }
        get().fetchTasks();
    },

    handleEditTask: async (id, text, dread, complete, difficulty, scheduledDate, taskDesc = '', subtasks = [], deletedSubtaskIds = []) => {
        Keyboard.dismiss();
        if (!text.trim()) return;

        const { error } = await supabase
            .from('tasks')
            .update({
                text: text.trim(),
                completed: complete,
                dread,
                difficulty,
                task_desc: taskDesc ?? '',
                scheduled_date: scheduledDate,
            })
            .eq('id', id);

        if (error) {
            console.log(error);
            return;
        }

        if (deletedSubtaskIds.length > 0) {
            const { error: deleteError } = await supabase.from('subtasks').delete().in('id', deletedSubtaskIds);
            if (deleteError) console.log(deleteError);
        }

        const existingSubtasks = subtasks.filter(s => s.id < 1e12);
        const newSubtasks = subtasks.filter(s => s.id >= 1e12);

        if (existingSubtasks.length > 0) {
            for (const subtask of existingSubtasks) {
                const { error: updateError } = await supabase
                    .from('subtasks')
                    .update({ text: subtask.text, completed: subtask.completed })
                    .eq('id', subtask.id);
                if (updateError) console.log(updateError);
            }
        }

        if (newSubtasks.length > 0) {
            const { error: insertError } = await supabase
                .from('subtasks')
                .insert(newSubtasks.map(subtask => ({
                    task_id: id,
                    text: subtask.text,
                    completed: subtask.completed,
                })));
            if (insertError) console.log(insertError);
        }

        get().fetchTasks();
    },

    toggleCompletion: async (id, completed, subtasks) => {
        const { error } = await supabase.from('tasks').update({ completed: !completed }).eq('id', id);
        if (error) {
            console.log(error);
            return;
        }

        if (subtasks.length > 0) {
            const { error: subtaskError } = await supabase
                .from('subtasks')
                .update({ completed: !completed })
                .eq('task_id', id);
            if (subtaskError) console.log(subtaskError);
        }

        get().fetchTasks();
    },

    toggleDread: async (id, dread) => {
        const { error } = await supabase.from('tasks').update({ dread: !dread }).eq('id', id);
        if (error) {
            console.log(error);
            return;
        }
        get().fetchTasks();
    },

    toggleSubtaskCompletion: async (id, completed) => {
        const { error } = await supabase.from('subtasks').update({ completed: !completed }).eq('id', id);
        if (error) {
            console.log(error);
            return;
        }
        get().fetchTasks();
    },
    updateTaskXp: async (id: number, awarded: number) => {
        const { error } = await supabase.from('tasks').update({ xp_awarded: awarded }).eq('id', id);
        if (error) {
            console.log(error);
            return;
        }
        get().fetchTasks();
    }
}));

// kept out of state so they can't go stale; useShallow stops a re-render
// when the filtered result is unchanged, even though .filter() returns
// a new array reference every call
export const useRenderedTaskItems = () =>
    useTodoStore(useShallow((s) => s.taskItems.filter(t => t.scheduledDate === s.selectedDate)));

export const usePendingTaskItems = () =>
    useTodoStore(useShallow((s) => s.taskItems.filter(t => !t.completed)));

export function calculateProgress(tasks: TaskItem[]): number {
    if (tasks.length === 0) return 0;

    const percentPerTask = 1 / tasks.length;

    return tasks.reduce((total, task) => {
        let taskProgress = 0;

        if (!task.subtasks || task.subtasks.length === 0) {
            taskProgress = task.completed ? 1 : 0;
        } else {
            const completedSubtasks = task.subtasks.filter(s => s.completed).length;
            taskProgress = completedSubtasks / task.subtasks.length;
        }

        return total + taskProgress * percentPerTask;
    }, 0);
}

// function to group tasks by date scheduled
export function groupTaskByDate(tasks: TaskItem[]): Record<string, TaskItem[]> {
    const groupedTasks: Record<string, TaskItem[]> = {};
    for (const task of tasks) {
        if (!groupedTasks[task.scheduledDate]) {
            groupedTasks[task.scheduledDate] = [];
        }
        groupedTasks[task.scheduledDate].push(task);
    }
    return groupedTasks;
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}