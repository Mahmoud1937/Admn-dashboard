import { useState } from 'react'
import { faTrash, faImage, faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import LazyImageCell from '../../../shared/components/LazyImageCell'
import ImageLightbox from '../../../shared/components/ImageLightbox'
import { formatDate } from '../../../utils/formatDate'

// const formatDate = (dateStr) => {
//   if (!dateStr || dateStr.startsWith('0001')) {
//     return '-'
//   }

//   return new Date(dateStr).toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   })
// }

const ActionButton = ({ icon, onClick, title, variant }) => {
  const colors =
    variant === 'danger'
      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
      : 'text-gray-400 hover:text-blue-700 hover:bg-blue-50'

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors ${colors}`}
    >
      <FontAwesomeIcon icon={icon} className="text-sm" />
    </button>
  )
}

const SlidersTable = ({ sliders, isLoading, onView, onEdit, onDelete }) => {
  const [previewImage, setPreviewImage] = useState(null)

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Loading sliders...
      </div>
    )
  }

  if (!sliders?.length) {
    return (
      <TableEmptyState
        icon={faImage}
        title="No sliders found"
        emptyMessage="Get started by adding a new slider."
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto min-w-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">EN Image</th>
              <th className="px-4 py-3">AR Image</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sliders.map((slider, index) => (
              <tr
                key={slider.id}
                onClick={() => onView(slider)}
                className="group cursor-pointer hover:bg-gray-50/80 transition-colors text-center"
              >
                <td className="px-4 py-3 text-gray-400 font-medium">
                  {index + 1}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <LazyImageCell
                      url={slider.enImageUrl}
                      label={`${slider.providerNameEn} - EN`}
                      onPreview={(url, label) =>
                        setPreviewImage({ url, label })
                      }
                    />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <LazyImageCell
                      url={slider.arImageUrl}
                      label={`${slider.providerNameAr} - AR`}
                      onPreview={(url, label) =>
                        setPreviewImage({ url, label })
                      }
                    />
                  </div>
                </td>

                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex flex-col items-center justify-center leading-tight">
                    <p className="font-medium text-gray-900">
                      {slider.providerNameEn}
                    </p>

                    <p
                      className="mt-0.5 text-xs text-gray-400"
                      style={{ unicodeBidi: 'plaintext' }}
                    >
                      {slider.providerNameAr}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {formatDate(slider.createdAt)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <ActionButton
                      icon={faPen}
                      title="Edit slider"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(slider)
                      }}
                    />

                    <ActionButton
                      icon={faTrash}
                      title="Delete slider"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(slider)
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  )
}

export default SlidersTable
