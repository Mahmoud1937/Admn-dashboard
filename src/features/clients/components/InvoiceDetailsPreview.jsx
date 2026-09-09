// import { useState } from 'react'
// import InvoiceDetailsModal from './InvoiceDetailsModal'



// const MOCK_INVOICES = {
//   Paid: {
//     invoiceId: 1009,
//     status: 'Paid',
//     familyFirstName: null,
//     familyLastName: null,
//     date: '2026-08-02T10:15:00',
//     totalBefore: 300.0,
//     totalAfter: 250.0,
//     discountPercentage: 16.67,
//     items: {
//       items: [
//         { id: 1, serviceNameEn: 'X-Ray', serviceNameAr: 'أشعة', priceBefore: 200.0, priceAfter: 170.0, discountPercentage: 15.0 },
//         { id: 2, serviceNameEn: 'Consultation', serviceNameAr: 'كشف', priceBefore: 100.0, priceAfter: 80.0, discountPercentage: 20.0 },
//       ],
//     },
//   },
//   Pending: {
//     invoiceId: 1010,
//     status: 'Pending',
//     familyFirstName: 'Sara',
//     familyLastName: 'Ahmed',
//     date: '2026-09-01T09:00:00',
//     totalBefore: 500.0,
//     totalAfter: 500.0,
//     discountPercentage: 0.0,
//     items: { items: [{ id: 3, serviceNameEn: 'MRI', serviceNameAr: 'رنين مغناطيسي', priceBefore: 500.0, priceAfter: 500.0, discountPercentage: 0.0 }] },
//   },
//   Canceled: {
//     invoiceId: 1005,
//     status: 'Canceled',
//     familyFirstName: null,
//     familyLastName: null,
//     date: '2026-06-11T14:20:00',
//     totalBefore: 120.0,
//     totalAfter: 120.0,
//     discountPercentage: 0.0,
//     items: { items: [{ id: 4, serviceNameEn: 'Blood Sugar Test', serviceNameAr: 'تحليل سكر', priceBefore: 120.0, priceAfter: 120.0, discountPercentage: 0.0 }] },
//   },
//   Used: {
//     invoiceId: 1011,
//     status: 'Used',
//     familyFirstName: null,
//     familyLastName: null,
//     date: '2026-07-19T12:29:30',
//     totalBefore: 150.0,
//     totalAfter: 100.0,
//     discountPercentage: 0.0,
//     items: { items: [{ id: 1011, serviceNameEn: 'CBC', serviceNameAr: 'تحليل دم كامل', priceBefore: 150.0, priceAfter: 100.0, discountPercentage: 33.33 }] },
//   },
// }

// export default function InvoiceDetailsPreviewPage() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [activeStatus, setActiveStatus] = useState('Paid')

//   return (
//     <div className="p-10 space-y-4">
//       <div className="flex flex-wrap gap-2">
//         {Object.keys(MOCK_INVOICES).map((status) => (
//           <button
//             key={status}
//             onClick={() => {
//               setActiveStatus(status)
//               setIsOpen(true)
//             }}
//             className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//           >
//             Show {status}
//           </button>
//         ))}
//       </div>

//       <InvoiceDetailsModal
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         invoice={MOCK_INVOICES[activeStatus]}
//         isLoading={false}
//       />
//     </div>
//   )
// }