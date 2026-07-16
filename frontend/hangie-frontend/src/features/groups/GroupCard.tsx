import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useChat } from "@/contexts/ChatContext";
import { useNotification } from "@/contexts/NotificationContext";
import type { GroupData, Message, Participant, UUID } from "@/types/chat";
import { useMemo } from "react";
import { useNavigate } from "react-router";
interface GroupCardInterface {
  nome: string;
  partecipanti_gruppo: Participant[];
  group_id: UUID;
  descrizione: string;
  createdBy: UUID;
  created_at: string;
  group_cover_img: string | null;
  event_id: UUID | null;
  updated_at: string | null;
  fullGroup: GroupData;
  ultimoMessaggio: Message;
}
const GroupCard = ({
  nome,
  group_cover_img,
  ultimoMessaggio,
  group_id,
  created_at,
  updated_at,
  fullGroup,
}: GroupCardInterface) => {
  const {
    setCurrentGroup,
    setCurrentGroupData,
    currentGroupData,
    currentGroup,
  } = useChat();
  const { currentNotifications } = useNotification();
  const navigate = useNavigate();
  const displayImage = useMemo(() => {
    if (!group_cover_img) return null;

    const version = updated_at ? new Date(updated_at).getTime() : "1";

    return `${group_cover_img}?v=${version}`;
  }, [group_cover_img, updated_at]);

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const unreadMsgNotifications = useMemo(
    () =>
      currentNotifications?.unread.filter((n) => {
        if (n.type == "new_message" && n.group_id == group_id) return n;
      }).length,
    [currentNotifications?.unread, group_id],
  );
  return (
    <div
      onClick={() => {
        navigate(`/chats/${group_id}`);
        setCurrentGroupData(fullGroup);
      }}
      className={`
      w-full p-3.5 flex items-center rounded-xl border cursor-pointer
      transition-all duration-150 
      ${
        currentGroup === group_id
          ? "bg-primary/10 border-primary/30" // Stato selezionato coerente
          : "bg-bg-1 border-bg-3/60 active:bg-bg-2/70"
      }
    `}
    >
      <div className="flex flex-row items-center w-full h-full gap-3">
        {/* Immagine Profilo Gruppo */}
        {displayImage ? (
          <img
            src={displayImage}
            loading="eager"
            className="rounded-full w-12 h-12 flex-shrink-0 object-cover"
            alt="Avatar del gruppo"
          />
        ) : (
          <div className="rounded-full w-12 h-12 flex-shrink-0 bg-bg-2 overflow-hidden">
            <DefaultGroupIcon />
          </div>
        )}

        {/* Dettagli della Chat */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Riga Superiore: Nome Gruppo e Orario */}
          <div className="flex justify-between items-baseline gap-2">
            <h2 className="font-bold font-title text-base text-text-1 truncate">
              {nome}
            </h2>
            <span className="text-text-3 text-[11px] font-body font-medium flex-shrink-0">
              {formatTime(ultimoMessaggio?.sent_at || created_at)}
            </span>
          </div>

          {/* Riga Inferiore: Ultimo Messaggio e Notifica */}
          <div className="flex justify-between items-center gap-2">
            <p className="text-text-2 font-body text-sm leading-tight line-clamp-1 flex-1">
              {ultimoMessaggio?.type === "event" && (
                <span className="text-primary font-bold">evento: </span>
              )}
              {ultimoMessaggio?.content || "Nessun messaggio"}
            </p>

            {unreadMsgNotifications > 0 && (
              <div className="bg-primary flex items-center justify-center min-w-[20px] h-5 px-1.5 font-body font-bold text-white rounded-full text-[10px] flex-shrink-0 animate-pulse-slow shadow-sm shadow-primary/20">
                {unreadMsgNotifications}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
