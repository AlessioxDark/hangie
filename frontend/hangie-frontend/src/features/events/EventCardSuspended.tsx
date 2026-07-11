import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import { useSocket } from "@/contexts/SocketContext";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import GroupIcon from "@/components/GroupIcon";

interface Gruppo {
  nome: string;
  avatar?: string;
  partecipanti_gruppo: Array<{
    nome: string;
    profile_pic?: string;
  }>;
}

interface Utente {
  nome: string;
  profile_pic?: string;
}

interface EventCardSuspendedProps {
  titolo: string;
  created_by: string;
  event_id: string;
  data: string;
  luogo?: {
    nome: string;
    cap: string;
    citta: string;
    paese: string;
  };
  costo?: number;
  utente: Utente;
  partecipanti_count?: number;
  event_imgs?: string[];
  descrizione?: string;
  cover_img?: string;
  gruppo?: Gruppo;
  scadenza?: string; // ✅ NUOVO: data scadenza
  giorni_rimasti?: number; // ✅ NUOVO: giorni rimanenti
  maxW: string;
  line_clamp: string;
}

const EventCardSuspended: React.FC<EventCardSuspendedProps> = ({
  titolo,
  data,
  event_id,
  utente,
  gruppo,
  risposte_evento,
  status,
  group_id,
  scadenza,
  line_clamp = "line-clamp-1",
}) => {
  const risposteAccepted = risposte_evento.filter(
    (r) => r.status == "accepted",
  );
  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const { currentScreen } = useScreen();

  const getUrgencyText = () => {
    // 1. Calcola la differenza in millisecondi (la base di tutto)
    const scadenza_timestamp = new Date(scadenza).getTime();
    const distanza_ms = scadenza_timestamp - Date.now();

    // Se la scadenza è passata
    if (distanza_ms <= 0) {
      return "Scaduto/a";
    }

    let tempo_residuo = distanza_ms;
    (scadenza_timestamp, distanza_ms);
    // 2. Calcoli basati su millisecondi medi per anno/mese (ATTENZIONE: impreciso)

    // Anni: 365.25 giorni * 24h * 60m * 60s * 1000ms
    const ms_in_anno = 31557600000;
    const anni = Math.floor(tempo_residuo / ms_in_anno);
    tempo_residuo %= ms_in_anno; // Rimuovi gli anni

    // Mesi: 30.44 giorni medi
    const ms_in_mese = 2629800000;
    const mesi = Math.floor(tempo_residuo / ms_in_mese);
    tempo_residuo %= ms_in_mese; // Rimuovi i mesi

    // Giorni: 24h * 60m * 60s * 1000ms
    const ms_in_giorno = 86400000;
    const giorni = Math.floor(tempo_residuo / ms_in_giorno);
    tempo_residuo %= ms_in_giorno; // Rimuovi i giorni

    // Ore e Minuti (calcolo preciso)
    const ore = Math.floor(tempo_residuo / (1000 * 60 * 60));
    tempo_residuo %= 1000 * 60 * 60;

    const minuti = Math.floor(tempo_residuo / (1000 * 60));

    // 3. Costruzione della stringa di output (mostra solo l'unità più grande)
    const parti = [];
    if (anni > 0) parti.push(`${anni}a`);
    if (mesi > 0) parti.push(`${mesi}M`);
    if (giorni > 0) parti.push(`${giorni}g`);
    if (ore > 0 && anni === 0 && mesi === 0) parti.push(`${ore}h`); // Mostra ore solo se non ci sono mesi/anni

    if (parti.length === 0) {
      return `Scade tra ${minuti}m`;
    }

    return `${currentScreen !== "xs" ? "Scade tra " : ""}${parti.slice(0, 2).join(" e ")}`; // Mostra solo le due unità più grandi
  };
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { handleEventDecision } = useChat();
  const { currentSocket } = useSocket();
  const { session } = useAuth();
  const [prevStatus, setPrevStatus] = useState("pending");
  const sendSocketVoteEvent = (status, prevStatus) => {
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
    <article
      className="
      flex flex-col bg-bg-1 border border-neutral-300/60 rounded-xl overflow-hidden relative
      shadow-[0_2px_8px_rgba(15,23,42,0.04)] w-full
    "
    >
      {/* AREA NAVIGAZIONE: Cliccando qui vai al dettaglio dell'evento */}
      <div
        onClick={() => navigate(`/events/${event_id}`)}
        className="flex flex-col w-full transition-all duration-200 active:bg-bg-2/40 cursor-pointer"
      >
        {/* Header Info: Badge Gruppo e Urgenza Scadenza */}
        <div className="flex items-center justify-between gap-4 p-4 pb-0">
          {gruppo ? (
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
          ) : (
            <div />
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

        {/* Dettagli Centrali dell'invito */}
        <div className="p-4 pb-3 flex flex-col gap-4">
          {/* Data e Titolo */}
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

          {/* Lista Partecipanti */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex-shrink-0 text-text-2">
              <ParticipantsIcon color="currentColor" />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              {risposteAccepted.length > 0 ? (
                <>
                  <div className="flex -space-x-1.5 flex-shrink-0">
                    {risposteAccepted.slice(0, 3).map((partecipante) => (
                      <div
                        className="w-5 h-5 rounded-full border border-bg-1 overflow-hidden"
                        key={partecipante.user_id}
                      >
                        <ProfileIcon
                          profile_pic={partecipante.utenti.profile_pic}
                        />
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

      {/* AREA AZIONI RAPIDE: Isolata dal click superiore per funzionare all'istante */}
      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* Separatore orizzontale coerente e Info Organizzatore */}
        <div className="w-full h-[1px] bg-bg-3/50"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden">
            <ProfileIcon profile_pic={utente.profile_pic} />
          </div>
          <p className="text-xs font-semibold text-text-2 truncate font-body">
            {utente.nome}{" "}
            <span className="text-[11px] text-text-3 font-normal font-body">
              ti ha invitato
            </span>
          </p>
        </div>

        {/* Pulsanti di Voto Accetta / Rifiuta */}
        <div className="flex gap-2 mt-1">
          <button
            // disabled={isScaduto}
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = status === "accepted" ? "pending" : "accepted";
              handleEventDecision(event_id, { status: newStatus }, () => {
                sendSocketVoteEvent(newStatus, prevStatus);
                setPrevStatus(newStatus);
              });
            }}
            className={`
            flex-1 font-bold py-2.5 rounded-xl transition-all duration-200 text-xs font-body active:scale-[0.96] cursor-pointer
            ${
              status === "accepted"
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-bg-2 text-text-2 border border-bg-3/60"
            }
            disabled:opacity-50 disabled:active:scale-100
          `}
          >
            Accetta
          </button>

          <button
            // disabled={isScaduto}
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = status === "rejected" ? "pending" : "rejected";
              handleEventDecision(event_id, { status: newStatus }, () => {
                sendSocketVoteEvent(newStatus, prevStatus);
                setPrevStatus(newStatus);
              });
            }}
            className={`
            flex-1 font-bold py-2.5 rounded-xl transition-all duration-200 text-xs font-body active:scale-[0.96] cursor-pointer
            ${
              status === "rejected"
                ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
                : "bg-bg-2 text-text-2 border border-bg-3/60"
            }
            disabled:opacity-50 disabled:active:scale-100
          `}
          >
            Rifiuta
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCardSuspended;
