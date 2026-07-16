import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import { useChat } from "@/contexts/ChatContext";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import {
  Calendar,
  Check,
  ChevronRight,
  DollarSign,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useScreen } from "@/contexts/ScreenContext";
import { useSocket } from "@/contexts/SocketContext";
const MessageEvent = ({ event_details, group_id, utenti }) => {
  const { openModal } = useModal();
  const { session } = useAuth();
  const [prevStatus, setPrevStatus] = useState(event_details.status);
  const { handleEventDecision, setCurrentEventData } = useChat();
  const { currentSocket } = useSocket();

  const formatDate = (dateString) => {
    if (!dateString) return "Data non definita";
    try {
      // Aggiungo una gestione più robusta
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };
  // Determina se la data di scadenza è passata
  const isExpired = useMemo(() => {
    if (!event_details.data_scadenza) return false;
    return new Date(event_details.data_scadenza).getTime() < Date.now();
    // return false;
  }, [event_details.data_scadenza]);
  const isDeadlinePassed = useMemo(() => {
    return (
      event_details.scadenza && new Date(event_details.scadenza) < new Date()
    );
  }, [event_details?.scadenza || null]);

  const sendSocketVoteEvent = (status, prevStatus) => {
    setCurrentEventData((prev) => {
      return { ...prev, status };
    });
    currentSocket.emit(
      "vote_event",
      event_details.event_id,
      group_id,
      status,
      session.user.id,
      prevStatus,
    );
  };

  const acceptedParticipants = event_details.risposte_evento.filter(
    (r) => r.status == "accepted",
  ).length;
  return (
    <Link
      to={`/events/${event_details.event_id}`}
      className="block max-w-[320px]"
    >
      <div
        onClick={() => {
          openModal({
            type: "EVENT_MODAL",
            data: { event_id: event_details.event_id },
          });
        }}
        className={`
      flex flex-col bg-bg-1 border border-bg-3/60 rounded-2xl overflow-hidden
      shadow-sm mb-4 cursor-pointer transition-all duration-200
      ${event_details.status === "rejected" ? "grayscale opacity-60 bg-bg-2" : ""}
    `}
      >
        {/* Immagine di Copertina con Aspect Ratio Mobile */}
        <div className="w-full relative aspect-[16/10]">
          <img
            className="w-full h-full object-cover"
            src={event_details.cover_img}
            alt={event_details.titolo || "Copertina evento"}
          />
          {event_details.scadenza && (
            <div
              className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white shadow-sm font-body ${
                isDeadlinePassed ? "bg-red-600" : "bg-primary"
              }`}
            >
              {isDeadlinePassed
                ? "CHIUSO"
                : `SCADE: ${formatDate(event_details.scadenza)}`}
            </div>
          )}
        </div>

        {/* Dettagli dell'Evento */}
        <div className="p-4 flex flex-col gap-3.5">
          {/* Titolo e Data Principale */}
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-base text-text-1 leading-snug font-title">
              {event_details.titolo}
            </h2>
            <div className="flex items-center gap-1.5 text-primary">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-body text-xs font-bold">
                {formatDate(event_details.data) || "Data non specificata"}
              </span>
            </div>
          </div>

          {/* Informazioni Logistiche (Luogo e Costo) */}
          <div className="flex flex-col gap-1.5 py-1 border-y border-bg-3/40">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-text-3 flex-shrink-0">
                <MapIcon color="currentColor" />
              </div>
              <span className="font-body text-xs text-text-2 truncate">
                {event_details.luogo.nome}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex-shrink-0">
                <DollarIcon
                  color={event_details.costo === 0 ? "#16a34a" : "#64748b"}
                />
              </div>
              <span
                className={`font-body font-bold text-xs ${event_details.costo === 0 ? "text-green-600" : "text-text-1"}`}
              >
                {event_details.costo > 0
                  ? `${event_details.costo}€`
                  : "Gratuito"}
              </span>
            </div>
          </div>

          {/* Contatore Partecipanti e Profilo Creatore */}
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2 text-text-2">
              <div className="w-4 h-4 flex-shrink-0">
                <ParticipantsIcon color="currentColor" />
              </div>
              <p className="text-[11px] font-body">
                <span className="font-bold text-text-1">
                  {acceptedParticipants}
                </span>{" "}
                {acceptedParticipants === 1 ? "confermato" : "confermati"}
              </p>
            </div>

            <div className="flex items-center gap-2 max-w-[50%]">
              <div className="w-6 h-6 flex-shrink-0">
                <ProfileIcon profile_pic={utenti ? utenti.profile_pic : null} />
              </div>
              <span className="font-body text-[11px] text-text-2 truncate">
                Da:{" "}
                <span className="font-semibold text-text-1">
                  {event_details.utente
                    ? event_details.utente?.nome
                    : "Deleted User"}
                </span>
              </span>
            </div>
          </div>

          {/* Pulsanti di Azione / Decisione (Solo se non siamo i creatori) */}
          {event_details.created_by !== session.user.id && (
            <div className="flex flex-row gap-2 mt-1">
              {/* Tasto Accetta */}
              <button
                disabled={isExpired}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const newStatus =
                    event_details.status === "accepted"
                      ? "pending"
                      : "accepted";
                  handleEventDecision(
                    event_details.event_id,
                    { status: newStatus },
                    () => {
                      sendSocketVoteEvent(newStatus, prevStatus);
                      setPrevStatus(newStatus);
                    },
                  );
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-body font-bold text-xs transition-all cursor-pointer ${
                  event_details.status === "accepted"
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-bg-2 text-text-2 border border-bg-3/60 active:bg-bg-3/40"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {event_details.status === "accepted"
                  ? "Confermato ✓"
                  : "Accetta"}
              </button>

              {/* Tasto Rifiuta */}
              <button
                disabled={isExpired}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const newStatus =
                    event_details.status === "rejected"
                      ? "pending"
                      : "rejected";
                  handleEventDecision(
                    event_details.event_id,
                    { status: newStatus },
                    () => {
                      sendSocketVoteEvent(newStatus, prevStatus);
                      setPrevStatus(newStatus);
                    },
                  );
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-body font-bold text-xs transition-all cursor-pointer ${
                  event_details.status === "rejected"
                    ? "bg-red-500 text-white shadow-sm shadow-red-500/10"
                    : "bg-bg-2 text-text-2 border border-bg-3/60 active:bg-bg-3/40"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {event_details.status === "rejected"
                  ? "Rifiutato ✕"
                  : "Rifiuta"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MessageEvent;
