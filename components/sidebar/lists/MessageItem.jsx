// "use client";

// export default function MessageItem({
//   name,
//   avatar,
//   lastMessage,
//   unread = false,
// }) {
//   return (
//     <div
//       className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
//         border border-primary/30
//         ${
//           unread
//             ? "bg-primary/15 border-primary"
//             : "hover:bg-gray-200 dark:hover:bg-gray-700"
//         }
//       `}
//     >
//       <img
//         src={avatar}
//         alt={name}
//         className="w-10 h-10 rounded-full object-cover"
//       />

//       <div className="flex-1 overflow-hidden">
//         <p
//           className={`text-sm font-medium ${
//             unread ? "text-primary" : ""
//           }`}
//         >
//           {name}
//         </p>
//         <p className="text-xs opacity-70 truncate">
//           {lastMessage}
//         </p>
//       </div>

//       {unread && (
//         <span className="w-2 h-2 bg-primary rounded-full"></span>
//       )}
//     </div>
//   );
// }
