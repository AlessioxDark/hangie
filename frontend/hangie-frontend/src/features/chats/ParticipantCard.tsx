import ProfileIcon from "@/components/ProfileIcon";
import { X } from "lucide-react";
import React from "react";

const ParticipantCard = ({
  handle,
  user_id,
  profile_pic,
  setCurrentParticipants,
}) => {
  return (
    <div className="h-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0 animate-in fade-in zoom-in-95 duration-150">
        {/* Contenitore Avatar + Tasto Rimozione */}
        <div className="w-12 h-12 relative">
          {/* Icona di Profilo Principale */}
          <div className="w-full h-full">
            <ProfileIcon profile_pic={profile_pic} />
          </div>

          {/* Pulsante di Rimozione "X" (Touch-friendly) */}
          <button
            type="button"
            onClick={() => {
              setCurrentParticipants((prevParticipants) =>
                prevParticipants.filter((friend) => friend.handle !== handle),
              );
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer z-10"
            aria-label={`Rimuovi ${handle}`}
          >
            <X size={10} strokeWidth={3} />
          </button>
        </div>

        {/* Handle/Username dell'Utente */}
        <span className="font-body text-[10px] font-medium text-text-2 truncate w-full text-center leading-none">
          @{handle.replace(/^@/, "")}
        </span>
      </div>
    </div>
  );
};

export default ParticipantCard;
