import { useState } from 'react'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import LazyImageCell from '../../../shared/components/LazyImageCell'
import ImageLightbox from '../../../shared/components/ImageLightbox'
import ScrollableTable from '../../../shared/components/ScrollableTable'
import RowActions from '../../../shared/components/RowActions'
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
      <ScrollableTable maxHeight="60vh" className="min-w-0">
        <table className="w-full min-w-[720px] text-center text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="w-10 px-4 py-3">#</th>
              <th className="px-4 py-3">EN Image</th>
              <th className="px-4 py-3">AR Image</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sliders.map((slider, index) => (
              <tr
                key={slider.id}
                onClick={() => onView(slider)}
                className="group cursor-pointer border-b border-slate-100 text-center transition-colors last:border-0 hover:bg-slate-50/60"
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
                    <RowActions
                      onEdit={(e) => {
                        e.stopPropagation()
                        onEdit(slider)
                      }}
                      onDelete={(e) => {
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
      </ScrollableTable>

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  )
}

export default SlidersTable
