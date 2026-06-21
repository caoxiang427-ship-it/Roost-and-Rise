export type TaskItem = {
    id: number;
    text: string;
    completed: boolean;
    dread: boolean;
    difficulty: "easy" | "moderate" | "hard"
    taskDesc: string;
    subtasks: SubtaskItem[];
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