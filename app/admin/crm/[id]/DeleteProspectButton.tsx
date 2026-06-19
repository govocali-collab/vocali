"use client"

import { useFormStatus } from "react-dom"
import { deleteProspectAction } from "../actions"

function Inner() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-60 text-sm font-medium px-5 py-2 rounded-lg transition-colors flex-shrink-0"
    >
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  )
}

export default function DeleteProspectButton({ id, name }: { id: string; name: string }) {
  const action = deleteProspectAction.bind(null, id)
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Supprimer définitivement « ${name} » ?\n\nCette action est irréversible.`)) {
          e.preventDefault()
        }
      }}
    >
      <Inner />
    </form>
  )
}
