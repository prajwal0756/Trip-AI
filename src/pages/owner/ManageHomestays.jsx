import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEye, FaEdit, FaTrash, FaBed } from 'react-icons/fa'
import Badge from '../../components/shared/Badge'
import Button from '../../components/shared/Button'
import Modal from '../../components/shared/Modal'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function ManageHomestays() {
  const { user } = useAuth()
  const { homestays, updateHomestay, deleteHomestay } = useApp()
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', availability: 'Available' })

  const myHomestays = homestays.filter((h) => h.ownerId === user.id)

  const openEdit = (h) => {
    setEditing(h)
    setEditForm({ name: h.name, price: h.price, availability: h.availability })
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    updateHomestay(editing.id, { name: editForm.name, price: Number(editForm.price), availability: editForm.availability })
    setEditing(null)
  }

  const handleDelete = () => {
    deleteHomestay(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">My homestays</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your listed properties.</p>
        </div>
        <Link to="/owner/add">
          <Button size="sm">Add homestay</Button>
        </Link>
      </div>

      {myHomestays.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<FaBed />}
            title="No homestays listed yet"
            description="Add your first homestay to start receiving bookings."
            action={<Link to="/owner/add"><Button>Add homestay</Button></Link>}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900/5 text-xs text-ink-500">
                <th className="px-4 py-3 font-medium">Homestay</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myHomestays.map((h) => (
                <tr key={h.id} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={h.image} alt={h.name} className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-ink-900">{h.name}</p>
                        <p className="text-xs text-ink-500">{h.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">${h.price}/night</td>
                  <td className="px-4 py-3 text-ink-700">{h.rating > 0 ? `${h.rating} ★` : 'No ratings'}</td>
                  <td className="px-4 py-3"><Badge status={h.availability}>{h.availability}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-ink-500">
                      <button onClick={() => setViewing(h)} aria-label="View" className="hover:text-teal-700"><FaEye size={14} /></button>
                      <button onClick={() => openEdit(h)} aria-label="Edit" className="hover:text-teal-700"><FaEdit size={14} /></button>
                      <button onClick={() => setDeleteTarget(h)} aria-label="Delete" className="hover:text-red-600"><FaTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.name}>
        {viewing && (
          <div>
            <img src={viewing.image} alt={viewing.name} className="h-44 w-full rounded-xl object-cover" />
            <p className="mt-3 text-sm text-ink-700">{viewing.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {viewing.amenities.map((a) => (
                <span key={a} className="rounded-full bg-sand-200 px-2.5 py-1 text-xs text-ink-700">{a}</span>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit homestay">
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Name</label>
            <input
              required
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Price per night</label>
            <input
              required
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Availability</label>
            <select
              value={editForm.availability}
              onChange={(e) => setEditForm((f) => ({ ...f, availability: e.target.value }))}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="Limited">Limited</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete homestay?" size="sm">
        <p className="text-sm text-ink-700">
          Are you sure you want to delete <span className="font-medium">{deleteTarget?.name}</span>? This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
