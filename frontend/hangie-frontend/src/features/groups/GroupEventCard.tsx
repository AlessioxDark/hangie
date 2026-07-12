import DollarIcon from "@/assets/icons/DollarIcon";
import KebabMenuIcon from "@/assets/icons/KebabMenuIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import { useSocket } from "@/contexts/SocketContext";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const GroupEventCard = ({
  titolo,

  event_id,
  data,
  luogo,
  costo,
  cover_img,
  gruppo,
  scadenza,
  risposte_evento,
  status,
  created_by,
}) => {
  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const { handleDeleteEvent, setCurrentEventData, handleEventDecision } =
    useChat();
  const { currentSocket } = useSocket();
  const { session } = useAuth();
  const { currentScreen } = useScreen();
  const sendSocket = () => {
    currentSocket.emit("delete_event", event_id, gruppo.group_id);
  };
  const getUrgencyText = () => {
    const scadenza_timestamp = new Date(scadenza).getTime();
    const distanza_ms = scadenza_timestamp - Date.now();
    if (distanza_ms <= 0) {
      return "Scaduto/a";
    }

    let residuo = distanza_ms;
    const units = [
      {
        label: "y",
        ms: 31557600000,
      },
      {
        label: "m",
        ms: 2629800000,
      },
      {
        label: "g",
        ms: 86400000,
      },
      {
        label: "h",
        ms: 60 * 100 * 24,
      },
      {
        label: "m",
        ms: 60 * 100 * 24 * 60,
      },
    ];
    const parti = [];
    for (const { label, ms } of units) {
      const valore = Math.floor(residuo / ms);
      if (valore > 0) {
        parti.push(`${valore}${label}`);
        residuo %= ms;
      }
      if (parti.length === 2) break;
    }

    return `${currentScreen == "xs" ? "" : "Scade tra"} ${parti.join(" e ")}`;
  };

  const { openModal } = useModal();
  const numPartecipanti = risposte_evento.filter(
    (r) => r.status == "accepted",
  ).length;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Aggiunge l'event listener al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Pulizia: rimuove l'event listener quando il componente viene smontato
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isInactive = status === "archive" || status === "rejected";

  const sendSocketVoteEvent = (status, prevStatus) => {
    setCurrentEventData((prev) => {
      return { ...prev, status };
    });
    currentSocket.emit(
      "vote_event",
      event_id,
      gruppo.group_id,
      status,
      session.user.id,
      prevStatus,
    );
  };
  return (
    <div
      className={`
    w-full flex flex-col p-4 bg-bg-1 border border-neutral-300/80 rounded-2xl transition-all duration-150 select-none
    ${isInactive ? "grayscale opacity-60" : "active:scale-[0.99]"}
  `}
    >
      {/* Corpo della Card */}
      <div className="flex flex-row gap-4 py-1.5 h-full items-start">
        {/* Immagine di Copertina */}
        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-bg-2 border border-neutral-300/30">
          <img
            src={cover_img}
            className="h-full w-full object-cover"
            alt="Copertina evento"
          />
        </div>

        {/* Info Testuali dell'Evento */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-row justify-between items-center relative w-full">
              {/* Data/Ora formattata */}
              <time className="text-[10px] font-body font-bold uppercase tracking-wider text-primary truncate">
                {formattedTime}
              </time>

              {/* Badge di Urgenza e Menu Azioni */}
              <div
                className="flex flex-row gap-1.5 items-center relative"
                ref={dropdownRef}
              >
                {status === "pending" && (
                  <div className="flex items-center gap-1 rounded-md px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 flex-shrink-0">
                    <span className="text-[9px] font-body font-extrabold uppercase tracking-wide">
                      {getUrgencyText()}
                    </span>
                  </div>
                )}

                {/* Pulsante Menu Kebab */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown();
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-text-3 active:bg-bg-2 cursor-pointer transition-colors"
                  aria-label="Opzioni evento"
                >
                  <KebabMenuIcon className="w-4 h-4 text-current" />
                </button>

                {/* Dropdown Menu per azioni rapide */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-7 w-36 bg-bg-1 shadow-lg rounded-xl border border-bg-3/80 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2.5 active:bg-red-50 text-red-600 font-body font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event_id, sendSocket);
                      }}
                    >
                      Elimina Evento
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Titolo Evento */}
            <h3 className="text-sm font-title font-bold text-text-1 line-clamp-2 leading-snug">
              {titolo}
            </h3>
          </div>

          {/* Grid delle specifiche (Luogo, Costo, Partecipanti) */}
          <div className="flex flex-col gap-1 mt-0.5">
            {[
              { icon: <MapIcon color={"currentColor"} />, text: luogo.nome },
              {
                icon: <DollarIcon color={"currentColor"} />,
                text: `${costo} €`,
              },
              {
                icon: <ParticipantsIcon color={"currentColor"} />,
                text: `${numPartecipanti} partecipanti`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-text-3 min-w-0"
              >
                <div className="w-4 h-4 text-text-3 flex-shrink-0 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-body font-medium truncate">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Azioni di Voto: Accetta o Rifiuta (Se non create dall'utente stesso) */}
      {created_by !== session?.user?.id && (
        <div className="flex gap-2.5 pt-3 mt-2 border-t border-bg-3/50 flex-shrink-0">
          {/* Bottone Accetta */}
          <button
            type="button"
            disabled={scadenza < Date.now()}
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = status === "accepted" ? "pending" : "accepted";
              handleEventDecision(event_id, { status: newStatus }, () => {
                sendSocketVoteEvent(newStatus, prevStatus);
                setPrevStatus(newStatus);
              });
            }}
            className={`
          flex-1 h-9 rounded-xl font-body text-xs font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer
          ${
            status === "accepted"
              ? "bg-primary text-white shadow-sm shadow-primary/10"
              : "bg-bg-2 text-text-2 border border-bg-3/80 active:bg-bg-3/60"
          }
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
          >
            Accetta
          </button>

          {/* Bottone Rifiuta */}
          <button
            type="button"
            disabled={scadenza < Date.now()}
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = status === "rejected" ? "pending" : "rejected";
              handleEventDecision(event_id, { status: newStatus }, () => {
                sendSocketVoteEvent(newStatus, prevStatus);
                setPrevStatus(newStatus);
              });
            }}
            className={`
          flex-1 h-9 rounded-xl font-body text-xs font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer
          ${
            status === "rejected"
              ? "bg-red-500 text-white shadow-sm shadow-red-500/10"
              : "bg-bg-2 text-text-2 border border-bg-3/80 active:bg-bg-3/60"
          }
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
          >
            Rifiuta
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupEventCard;
