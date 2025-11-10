import { api } from '@/src/lib/api'
import { create } from 'zustand'

type Task = {
  id: string
  title: string
  isCompleted: boolean
}

type Goal = {
  id: string
  title: string
  tasks: Task[]
}

type GoalStore = {
  goals: Goal[]
  loading: boolean
  fetchGoals: () => Promise<void>
  toggleTask: (taskId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  createGoal: (title: string, apiKey: string) => Promise<void>
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,

  async createGoal(prompt: string, apiKey: string) {
    set({ loading: true })
    try {
      const { data } = await api.post('/generate-tasks', { prompt, apiKey })

      set((state) => ({ goals: [data, ...state.goals] }))
    } finally {
      set({ loading: false })
    }
  },

  async fetchGoals() {
    set({ loading: true })

    try {
      const { data } = await api.get('/goals')
      set({ goals: data })
    } finally {
      set({ loading: false })
    }
  },

  async toggleTask(taskId: string) {
    const { goals } = get()

    const goalIndex = goals.findIndex((goal: Goal) => goal.tasks.some((task) => task.id === taskId))

    const goal = goals[goalIndex]
    const taskIndex = goal.tasks.findIndex((task: Task) => task.id === taskId)
    const oldTask = goal.tasks[taskIndex]

    const updatedGoals = [...goals]
    updatedGoals[goalIndex] = {
      ...goal,
      tasks: [
        ...goal.tasks.slice(0, taskIndex),
        { ...oldTask, isCompleted: !oldTask.isCompleted },
        ...goal.tasks.slice(taskIndex + 1),
      ],
    }
    set({ goals: updatedGoals })

    try {
      await api.patch(`/tasks/${taskId}/toggle`)
    } catch (error) {
      set({ goals })
    }
  },

  async deleteTask(taskId: string) {
    const { goals } = get()

    const updateTask = goals.map((goal) => ({
      ...goal,
      tasks: goal.tasks.filter((task) => task.id !== taskId),
    }))

    set({ goals: updateTask })

    try {
      await api.delete(`/tasks/${taskId}`)
    } catch (error) {
      set({ goals })
    }
  },

  async deleteGoal(goalId: string) {
    const { goals } = get()

    const updateGoal = goals.filter((goal) => goal.id !== goalId)

    set({ goals: updateGoal })

    try {
      await api.delete(`/goals/${goalId}`)
    } catch (error) {
      set({ goals })
    }
  },
}))
