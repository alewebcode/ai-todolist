'use client'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Trash, LayoutList } from 'lucide-react'
import CreateGoals from './create-goals'

import { useGoalStore } from '../../store/goal'
import ConfirmDialog from '../confirm-dialog/page'

export default function ListGoals() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'goal' | 'task' | null
    id: string | null
  }>({
    isOpen: false,
    type: null,
    id: null,
  })

  const { goals, fetchGoals, toggleTask, deleteTask, deleteGoal, loading } = useGoalStore()

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const toggleExpand = (goalId: string) => {
    setExpanded(expanded === goalId ? null : goalId)
  }

  const handleDeleteGoal = (goalId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'goal',
      id: goalId,
    })
  }

  const handleDeleteTask = (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'task',
      id: taskId,
    })
  }

  const confirmDelete = () => {
    if (confirmDialog.type === 'goal' && confirmDialog.id) {
      deleteGoal(confirmDialog.id)
    } else if (confirmDialog.type === 'task' && confirmDialog.id) {
      deleteTask(confirmDialog.id)
    }
  }

  return (
    <div className="mx-auto mt-2 w-full max-w-4xl p-4">
      <CreateGoals />
      <h3 className="justify-left mb-6 flex items-center gap-2 text-2xl font-bold">
        <LayoutList className="h-6 w-6 text-blue-500" />
        <span className="text-blue-500">Lista De Objetivos</span>
      </h3>
      {loading && (
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-500"></div>
        </div>
      )}

      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div
              className="flex w-full cursor-pointer items-center justify-between"
              onClick={() => toggleExpand(goal.id)}
            >
              <div className="mr-4 flex flex-1 items-center justify-between gap-4">
                <span className="text-lg font-semibold text-gray-600">{goal.title}</span>
                <button
                  type="button"
                  className="text-red-400 transition hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGoal(goal.id)
                  }}
                >
                  <Trash className="h-5 w-5 cursor-pointer" />
                </button>
              </div>
              {expanded === goal.id ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {expanded === goal.id && (
              <ul className="mt-4 space-y-2">
                {goal.tasks.length === 0 ? (
                  <li className="text-sm text-gray-500 italic">Nenhuma tarefa adicionada ainda.</li>
                ) : (
                  goal.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between border-b pb-2 last:border-none"
                    >
                      <div
                        className="flex flex-1 cursor-pointer items-center gap-2"
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500 transition" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 transition" />
                        )}
                        <span
                          className={`transition ${
                            task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-600'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <button
                        className="ml-2 text-red-400 transition hover:text-red-600"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash className="h-5 w-5 cursor-pointer" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      {!loading && goals.length === 0 && (
        <p className="text-center text-gray-500">
          Nenhum objetivo encontrado. Crie um novo objetivo acima.
        </p>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, id: null })}
        onConfirm={confirmDelete}
        title={confirmDialog.type === 'goal' ? 'Excluir Objetivo' : 'Excluir Tarefa'}
        message={`Tem certeza que deseja excluir? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
