export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="w-96 rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
