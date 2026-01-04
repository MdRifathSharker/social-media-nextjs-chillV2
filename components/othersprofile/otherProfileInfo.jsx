// // components/othersprofile/OtherProfileInfo.jsx
// "use client";

// export default function OtherProfileInfo({ profileData }) {
//   return (
//     <div className="space-y-4">
//       {profileData.contact && (
//         <div>
//           <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
//             Contact:
//           </span>
//           <p className="text-sm">{profileData.contact}</p>
//         </div>
//       )}
      
//       {profileData.email && (
//         <div>
//           <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
//             Email:
//           </span>
//           <p className="text-sm">{profileData.email}</p>
//         </div>
//       )}
      
//       {profileData.website && (
//         <div>
//           <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
//             Website:
//           </span>
//           <p className="text-sm">{profileData.website}</p>
//         </div>
//       )}
      
//       {profileData.location && (
//         <div>
//           <span className="font-semibold text-primary dark:text-accent text-sm block mb-1">
//             Location:
//           </span>
//           <p className="text-sm">{profileData.location}</p>
//         </div>
//       )}
//     </div>
//   );
// }

export default function OtherProfileInfo({ profileData }) {
  return (
    <div className="flex flex-col gap-3 w-full text-sm mb-4">
      <InfoRow label="Contact" value={profileData.contact} />
      <InfoRow label="Email" value={profileData.email} />
      <InfoRow label="Website" value={profileData.website} />
      <InfoRow label="Location" value={profileData.location} />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="font-semibold text-primary dark:text-accent">
        {label}:
      </span>
      <p className="text-xs">{value}</p>
    </div>
  );
}
