// import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { formatDate } from "../../../utils/formatDate";

// const CardActivationTable = ({ items, isLoading }) => {
//   if (isLoading) {
//     return <div className="text-center py-8 text-gray-500">Loading...</div>;
//   }

//   if (!items?.length) {
//     return (
//       <div className="text-center py-8 text-gray-500">No activated cards found</div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto min-w-0 border border-gray-200 rounded-lg scroll-table">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50 sticky top-0 z-10">
//           <tr>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Card Number</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Name</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Phone</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Gender</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Birth Date</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">National ID</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Activated At</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Expired At</th>
//             <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-100 bg-white">
//           {items.map((card) => (
//             <tr key={card.memberCardId} className="hover:bg-gray-50">
//               <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">{card.cardNumber}</td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700">
//                 {card.firstName} {card.lastName}
//               </td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700">{card.phoneNumber}</td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700">{card.gender}</td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(card.birthDate)}</td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700 font-mono">
//                 {card.nationalId || card.passportNumber || "-"}
//               </td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(card.activatedAt)}</td>
//               <td className="px-4 py-3 text-sm text-center text-gray-700">{formatDate(card.expiredAt)}</td>
//               <td className="px-4 py-3 text-sm text-center">
//                 <span
//                   className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
//                     card.isBlocked
//                       ? "bg-red-100 text-red-700"
//                       : card.isExpired
//                       ? "bg-gray-100 text-gray-600"
//                       : "bg-green-100 text-green-700"
//                   }`}
//                 >
//                   <FontAwesomeIcon icon={card.isBlocked ? faLock : faLockOpen} />
//                   {card.isBlocked ? "Blocked" : card.isExpired ? "Expired" : "Active"}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CardActivationTable;