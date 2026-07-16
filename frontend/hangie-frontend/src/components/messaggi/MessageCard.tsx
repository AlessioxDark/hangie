import DoubleTick from "@/assets/icons/DoubleTick";
import TickIcon from "@/assets/icons/TickIcon";
import ProfileIcon from "@/components/ProfileIcon";

const MessageCard = ({
  isUser,
  content,
  utenti,
  user_id,
  sent_at,
  isSent,
  isRead,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const renderTick = () => {
    if (!isUser) return null;

    // 1. MESSAGGIO LETTO (Spunta azzurra stile WhatsApp/Telegram - super riconoscibile)
    if (isRead) {
      return (
        <div className="w-5 h-4 flex-shrink-0 flex items-center justify-center">
          <DoubleTick className="text-cyan-300 drop-shadow-[0_0_1px_rgba(56,189,248,0.2)]" />
        </div>
      );
    }

    // 2. MESSAGGIO CONSEGNATO (Doppia spunta grigio-chiara/bianco opaco)
    if (isSent) {
      return (
        <div className="w-5 h-4 flex-shrink-0 flex items-center justify-center">
          <DoubleTick className="text-white/50" />
        </div>
      );
    }

    // 3. MESSAGGIO INVIATO (Spunta singola grigio-chiara/bianco opaco)
    return (
      <div className="w-5 h-4 flex-shrink-0 flex items-center justify-center">
        <TickIcon className="text-white/50" />
      </div>
    );
  };

  return (
    <div
      className={`flex flex-row items-end gap-2 w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar dell'altro utente allineato in basso (stile WhatsApp/Telegram) */}
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 mb-1">
          <ProfileIcon profile_pic={utenti ? utenti.profile_pic : null} />
        </div>
      )}

      {/* Bolla del Messaggio */}
      <div
        className={`
        rounded-2xl max-w-[80%] relative flex flex-col p-2 min-h-[32px] justify-between
        ${
          isUser
            ? "bg-primary text-white rounded-br-none" // Angolo arrotondato asimmetrico nativo
            : "bg-bg-2 text-text-1 border border-neutral-300/40 rounded-bl-none"
        }
      `}
      >
        {/* Contenuto di Testo (Nome + Messaggio) */}
        <div className="flex flex-col px-1 flex-1 min-w-0">
          {!isUser && (
            <span className="text-text-1 font-body font-bold text-[11px] uppercase tracking-wider mb-0.5">
              {utenti ? utenti.nome : "Deleted User"}
            </span>
          )}
          <p className="font-body text-sm whitespace-pre-wrap break-words leading-snug">
            {content}
          </p>
        </div>

        {/* Info riga inferiore: Orario e Spunte di invio */}
        <div className="flex flex-row items-center justify-end gap-1 mt-1 ml-auto pr-1">
          <span
            className={`font-body text-[10px] select-none tracking-tight shrink-0 ${
              isUser ? "text-white/70" : "text-text-3"
            }`}
          >
            {formatDate(sent_at)}
          </span>
          {renderTick()}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
