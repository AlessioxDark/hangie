import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import { useSocket } from "@/contexts/SocketContext";
import React from "react";
import { useNavigate } from "react-router";
import GroupIcon from "@/components/GroupIcon";

interface Gruppo {
  group_id: string;
  nome: string;
  group_cover_img?: string;
  partecipanti_gruppo: Array<{
    nome: string;
    profile_pic?: string;
  }>;
}

interface Utente {
  nome: string;
  profile_pic?: string;
}

interface RispostaEvento {
  user_id: string;
  status: "pending" | "accepted" | "rejected";
  utenti: {
    profile_pic?: string;
  };
}

interface EventCardSuspendedProps {
  titolo: string;
  created_by: string;
  event_id: string;
  data: string;
  utente: Utente;
  risposte_evento: RispostaEvento[];
  status: "pending" | "accepted" | "rejected";
  gruppo: Gruppo;
  scadenza: string;
  line_clamp?: string;
}

const EventCardSuspended: React.FC<EventCardSuspendedProps> = ({
  titolo,
  data,
  event_id,
  utente,
  gruppo,
  risposte_evento = [],
  status,
  scadenza,
  line_clamp = "line-clamp-1",
}) => {
  const navigate = useNavigate();
  const { currentScreen } = useScreen();
  const { handleEventDecision } = useChat();
  const { currentSocket } = useSocket();
  const { session } = useAuth();

  const risposteAccepted = risposte_evento.filter(
    (r) => r.status === "accepted",
  );

  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const getUrgencyText = () => {
    const scadenza_timestamp = new Date(scadenza).getTime();
    const distanza_ms = scadenza_timestamp - Date.now();

    if (distanza_ms <= 0) return "Scaduto";

    let tempo_residuo = distanza_ms;
    const ms_in_giorno = 86400000;
    const giorni = Math.floor(tempo_residuo / ms_in_giorno);
    tempo_residuo %= ms_in_giorno;

    const ore = Math.floor(tempo_residuo / (1000 * 60 * 60));
    tempo_residuo %= 1000 * 60 * 60;

    const minuti = Math.floor(tempo_residuo / (1000 * 60));

    if (giorni > 0) return `Scade tra ${giorni}g`;
    if (ore > 0) return `Scade tra ${ore}h`;
    return `Scade tra ${minuti}m`;
  };

  const handleVote = (
    e: React.MouseEvent,
    targetStatus: "accepted" | "rejected",
  ) => {
    e.stopPropagation(); // Evita la navigazione al dettaglio evento al click del bottone

    // Se l'utente clicca sullo stato già attivo, torna in "pending"
    const newStatus = status === targetStatus ? "pending" : targetStatus;

    handleEventDecision(event_id, { status: newStatus }, () => {
      if (currentSocket) {
        currentSocket.emit(
          "vote_event",
          event_id,
          gruppo.group_id,
          newStatus,
          session?.user?.id,
          status, // Passiamo l'attuale status reale come prevStatus al server
        );
      }
    });
  };

  return (
    <article className="flex flex-col bg-bg-1 border border-neutral-300/60 rounded-xl overflow-hidden relative shadow-[0_2px_8px_rgba(15,23,42,0.04)] w-full">
      {/* Area Cliccabile Dettaglio */}
      <div
        onClick={() => navigate(`/events/${event_id}`)}
        className="flex flex-col w-full transition-all duration-200 active:bg-bg-2/40 cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4 p-4 pb-0">
          {gruppo && (
            <div className="max-w-[70%]">
              <div className="px-2.5 py-1 bg-text-1/85 backdrop-blur-md rounded-lg shadow-sm flex items-center gap-1.5">
                <GroupIcon
                  group_cover_img={gruppo.group_cover_img}
                  className="w-4 h-4 rounded-md"
                />
                <span className="text-xs font-bold text-bg-1 truncate font-title">
                  {gruppo.nome}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg flex-shrink-0">
            <svg
              className="w-3.5 h-3.5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[11px] font-body font-bold text-primary whitespace-nowrap">
              {getUrgencyText()}
            </span>
          </div>
        </div>

        <div className="p-4 pb-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <time className="text-[11px] block text-primary font-semibold uppercase tracking-wider font-title">
              {formattedTime}
            </time>
            <h3
              className={`text-base font-bold font-body text-text-1 leading-tight ${line_clamp}`}
            >
              {titolo}
            </h3>
          </div>

          {/* Partecipanti */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex-shrink-0 text-text-2">
              <ParticipantsIcon color="currentColor" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {risposteAccepted.length > 0 ? (
                <>
                  <div className="flex -space-x-1.5 flex-shrink-0">
                    {risposteAccepted.slice(0, 3).map((p) => (
                      <div
                        className="w-5 h-5 rounded-full border border-bg-1 overflow-hidden"
                        key={p.user_id}
                      >
                        <ProfileIcon profile_pic={p.utenti?.profile_pic} />
                      </div>
                    ))}
                    {risposteAccepted.length > 3 && (
                      <div className="w-5 h-5 rounded-full border border-bg-1 bg-bg-3 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-text-2">
                          +{risposteAccepted.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-text-2 font-body font-medium truncate">
                    {risposteAccepted.length} partecipant
                    {risposteAccepted.length !== 1 ? "i" : "e"}
                  </span>
                </>
              ) : (
                <span className="text-xs text-text-3 font-body">
                  Nessun partecipante ancora
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Box Azioni */}
      <div className="px-4 pb-4 flex flex-col gap-3">
        <div className="w-full h-[1px] bg-bg-3/50" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden">
            <ProfileIcon profile_pic={utente ? utente.profile_pic : null} />
          </div>
          <p className="text-xs font-semibold text-text-2 truncate font-body">
            {utente ? utente.nome : "Deleted User"}{" "}
            <span className="text-[11px] text-text-3 font-normal font-body">
              ti ha invitato
            </span>
          </p>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => handleVote(e, "accepted")}
            className={`flex-1 font-bold py-2.5 rounded-xl transition-all duration-200 text-xs font-body active:scale-[0.96] cursor-pointer ${
              status === "accepted"
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-bg-2 text-text-2 border border-bg-3/60"
            }`}
          >
            Accetta
          </button>

          <button
            type="button"
            onClick={(e) => handleVote(e, "rejected")}
            className={`flex-1 font-bold py-2.5 rounded-xl transition-all duration-200 text-xs font-body active:scale-[0.96] cursor-pointer ${
              status === "rejected"
                ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
                : "bg-bg-2 text-text-2 border border-bg-3/60"
            }`}
          >
            Rifiuta
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCardSuspended;
