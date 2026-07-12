import CheckIcon from "@/assets/icons/CheckIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { Check } from "lucide-react";
import React, { useMemo } from "react";

const FriendCard = ({
  friend,

  localParticipants,

  setLocalParticipants,
}) => {
  const isSelected = useMemo(
    () => localParticipants.some((p) => p.user_id === friend.user_id),
    [localParticipants, friend.user_id],
  );
  return (
    <div
      onClick={() => {
        if (isSelected) {
          setLocalParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p.user_id !== friend.user_id),
          );
        } else {
          setLocalParticipants((prevParticipants) => [
            friend,
            ...prevParticipants,
          ]);
        }
      }}
      className={`
    flex flex-row items-center gap-3 p-3 rounded-xl cursor-pointer select-none
    border transition-all duration-150
    ${
      isSelected
        ? "border-primary bg-primary/5 shadow-md ring ring-primary"
        : "border-[#E2E8F0] bg-white hover:border-gray-300 shadow-sm"
    }
  `}
    >
      {/* Avatar dell'Amico */}
      <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center">
        <ProfileIcon profile_pic={friend.profile_pic} />
      </div>

      {/* Dati dell'Utente e Checkbox Nativo */}
      <div className="flex flex-row justify-between w-full items-center min-w-0">
        <div className="flex flex-col min-w-0 gap-0.5">
          <h2 className="text-text-1 font-body font-bold text-sm truncate">
            {friend.nome}
          </h2>
          <span className="font-body text-xs text-text-3 truncate">
            @{friend.handle}
          </span>
        </div>

        {/* Checkbox Circolare Mobile Style */}
        <div
          className={`
        w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-150 flex-shrink-0
        ${
          isSelected
            ? "bg-primary border-primary scale-100"
            : "bg-transparent border-bg-3 scale-95"
        }
      `}
        >
          {isSelected && <Check color="#ffffff" size={14} strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
