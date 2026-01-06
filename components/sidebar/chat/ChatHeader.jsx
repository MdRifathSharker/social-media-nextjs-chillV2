// // components/sidebar/chat/ChatHeader.jsx
// "use client";

// import { Phone, Video, Info, MoreVertical, ChevronLeft, X } from "lucide-react";
// import { useState } from "react";

// export default function ChatHeader({ 
//   conversation, 
//   onBack, 
//   setSelectedProfile,
//   compactMode = false 
// }) {
//   const [showMenu, setShowMenu] = useState(false);

//   const handleProfileClick = () => {
//     if (conversation?.user && setSelectedProfile) {
//       setSelectedProfile({
//         user_id: conversation.user.id,
//         name: conversation.user.name,
//         profile_image: conversation.user.avatar,
//         email: conversation.user.email || `${conversation.user.name.toLowerCase()}@example.com`
//       });
//     }
//   };

//   return (
//     <div className={`flex items-center justify-between ${
//       compactMode ? 'p-2' : 'p-4'
//     } border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`}>
//       <div className="flex items-center gap-3">
//         {onBack && (
//           <button
//             onClick={onBack}
//             className={`${
//               compactMode ? 'p-1.5' : 'p-2'
//             } hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors`}
//           >
//             <ChevronLeft size={compactMode ? 18 : 20} className="text-gray-600 dark:text-gray-300" />
//           </button>
//         )}
        
//         {/* Clickable User Info */}
//         <button 
//           onClick={handleProfileClick}
//           className="flex items-center gap-3 hover:opacity-80 transition-opacity"
//         >
//           <div className="relative">
//             <img
//               src={conversation.user.avatar}
//               alt={conversation.user.name}
//               className={`${compactMode ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover`}
//             />
//             {conversation.user.online && (
//               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
//             )}
//           </div>
          
//           <div className="text-left">
//             <h2 className={`font-semibold text-gray-800 dark:text-white ${
//               compactMode ? 'text-sm' : ''
//             }`}>
//               {conversation.user.name}
//             </h2>
//             <p className={`text-gray-500 dark:text-gray-400 ${
//               compactMode ? 'text-xs' : 'text-sm'
//             }`}>
//               {conversation.user.online ? (
//                 <span className="flex items-center gap-1">
//                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                   Online
//                 </span>
//               ) : `Last seen ${conversation.user.lastSeen}`}
//             </p>
//           </div>
//         </button>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex items-center gap-1">
//         {!compactMode && (
//           <>
//             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
//               <Phone size={20} className="text-gray-600 dark:text-gray-300" />
//             </button>
//             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
//               <Video size={20} className="text-gray-600 dark:text-gray-300" />
//             </button>
//           </>
//         )}
        
//         <div className="relative">
//           <button 
//             onClick={() => setShowMenu(!showMenu)}
//             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
//           >
//             <MoreVertical size={compactMode ? 18 : 20} className="text-gray-600 dark:text-gray-300" />
//           </button>
          
//           {showMenu && (
//             <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
//               <button 
//                 onClick={handleProfileClick}
//                 className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//               >
//                 View Profile
//               </button>
//               <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//                 Mute Notifications
//               </button>
//               <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//                 Clear Chat
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// components/sidebar/chat/ChatHeader.jsx
"use client";

import { ChevronLeft, MoreVertical } from "lucide-react";

export default function ChatHeader({ 
  conversation, 
  onBack, 
  setSelectedProfile,
  compactMode = true 
}) {
  const handleProfileClick = () => {
    if (conversation?.user && setSelectedProfile) {
      setSelectedProfile({
        user_id: conversation.user.id,
        name: conversation.user.name,
        profile_image: conversation.user.avatar,
        email: conversation.user.email
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src={conversation.user.avatar}
            alt={conversation.user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              {conversation.user.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {conversation.user.online ? "Online" : "Offline"}
            </p>
          </div>
        </button>
      </div>

      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}