export type TaskItem = {
    id: number;
    text: string;
    completed: boolean;
    dread: boolean;
    difficulty: "easy" | "moderate" | "difficult",
    scheduledDate: string,
    taskDesc: string,
    subtasks: SubtaskItem[],
    xpAwarded: number,
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