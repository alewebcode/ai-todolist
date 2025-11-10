'use client'
import { FormEvent, useState } from 'react'
import { useGoalStore } from '../../store/goal'
import { Info, LoaderCircle, ShieldAlert } from 'lucide-react'

export default function CreateTasks() {
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [errors, setErrors] = useState<{ prompt?: string; apiKey?: string }>({})

  const { createGoal, loading } = useGoalStore()

  const handleAddGoal = (e: FormEvent) => {
    e.preventDefault()

    const newErrors: { prompt?: string; apiKey?: string } = {}

    if (!prompt.trim()) newErrors.prompt = 'O objetivo é obrigatório.'
    if (!apiKey.trim()) newErrors.apiKey = 'A API Key é obrigatória.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    createGoal(prompt, apiKey)
    setPrompt('')
  }

  return (
    <>
      <form
        className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow"
        onSubmit={handleAddGoal}
      >
        <h2 className="text-lg font-semibold text-blue-500">Criar Novo Objetivo</h2>

        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              if (errors.prompt) setErrors({ ...errors, prompt: '' })
            }}
            placeholder="Descreva seu objetivo..."
            className={`rounded-lg border p-2 text-gray-700 focus:ring-2 focus:outline-none ${
              errors.prompt ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
          />
          {errors.prompt && <span className="text-sm text-red-500">{errors.prompt}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              if (errors.apiKey) setErrors({ ...errors, apiKey: '' })
            }}
            placeholder="Sua API Key"
            className={`rounded-lg border p-2 text-gray-700 focus:ring-2 focus:outline-none ${
              errors.apiKey ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
          />
          {errors.apiKey && <span className="text-sm text-red-500">{errors.apiKey}</span>}
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <ShieldAlert className="h-4 w-4 text-blue-500" /> Use sua API Key do Open Router
          </p>
        </div>

        <button
          className="rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoaderCircle className="text-white-500 h-5 w-5 animate-spin" /> Gerando Tarefas...
            </div>
          ) : (
            'Gerar Tarefas'
          )}
        </button>
      </form>
    </>
  )
}
