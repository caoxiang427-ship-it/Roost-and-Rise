export type TaskItem = {
    id: number;
    text: string;
    completed: boolean;
    dread: boolean;
    difficulty: "easy" | "moderate" | "difficult",
    scheduledDate: string, // YYYY-MM-DD
    taskDesc: string,
    subtasks: SubtaskItem[],
    xpAwarded: number,
    startTime?: string | null;  // ISO datetime, if null -> all day
    endTime?: string | null;    // ISO datetime, if start time but no end time: (default start + 30m)
};

export type NewSubtaskItem = {
    text: string;
    completed: boolean
};

export type SubtaskItem = {
    id: number
    text: string;
    completed: boolean
}