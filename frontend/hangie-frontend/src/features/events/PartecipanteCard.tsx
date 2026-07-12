import ProfileIcon from "@/components/ProfileIcon";
import React from "react";
const formatDate = (dateString) => {
  const now = Date.now();

  const seconds = Math.floor((now - new Date(dateString).getTime()) / 1000);

  if (seconds < 0) return "In the future";
  if (isNaN(seconds)) return "Invalid Date";

  const intervals = [
    { limit: 31536000, label: "year" }, // 60*60*24*365
    { limit: 2592000, label: "month" }, // 60*60*24*30
    { limit: 604800, label: "week" }, // 60*60*24*7
    { limit: 86400, label: "day" }, // 60*60*24
    { limit: 3600, label: "hour" }, // 60*60
    { limit: 60, label: "minute" }, // 60
  ];

  for (const interval of intervals) {
    if (seconds >= interval.limit) {
      const count = Math.floor(seconds / interval.limit);
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return seconds < 10 ? "just now" : `${seconds} seconds ago`;
};
const GetStatusColor = (statusValue) => {
  if (statusValue === "accepted") {
    return "bg-green-100 text-green-600 ";
  }
  if (statusValue === "rejected") {
    return "bg-red-100 text-red-600  ";
  }

  return "bg-amber-100 text-amber-600 ";
};
const PartecipanteCard = ({ utenti, created_at, status, is_creator }) => {
  return (
    <div
      className="
      w-full flex flex-row justify-between items-center px-1 py-3 gap-3
      bg-bg-1 transition-all duration-150 active:bg-bg-2/50 cursor-pointer
    "
    >
      {/* Info Utente: Avatar, Nome e Data Risposta */}
      <div className="flex flex-row gap-3 items-center min-w-0">
        <div className="w-11 h-11 flex-shrink-0">
          <ProfileIcon profile_pic={utenti.profile_pic} />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-1 font-body font-semibold text-sm truncate">
              {utenti.nome}
            </span>
            {is_creator && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-text-1/10 text-text-1 px-1.5 py-0.5 rounded-md flex-shrink-0">
                Creatore
              </span>
            )}
          </div>
          <span className="text-text-3 text-[11px] font-body font-medium mt-0.5">
            Risposto il {formatDate(created_at)}
          </span>
        </div>
      </div>

      {/* Badge di Stato (Accettato, In Attesa, Rifiutato) */}
      <div
        className={`
        ${GetStatusColor(status)} px-3 py-1.5 rounded-full flex items-center flex-shrink-0
      `}
      >
        <span className="text-xs font-body font-bold tracking-wide">
          {status === "accepted"
            ? "Confermato"
            : status === "pending"
              ? "In attesa"
              : "Rifiutato"}
        </span>
      </div>
    </div>
  );
};

export default PartecipanteCard;
