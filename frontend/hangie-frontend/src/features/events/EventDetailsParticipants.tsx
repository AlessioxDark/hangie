import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useModal } from "@/contexts/ModalContext";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import PartecipanteCard from "./PartecipanteCard";
import { useNavigate, useParams } from "react-router";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import SearchBar from "@/components/SearchBar";
import { ApiCalls } from "@/services/api";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import RenderErrorState from "../utils/RenderErrorState";
import RenderLoadingState from "../utils/RenderLoadingState";

const FILTER_TYPES = ["Confermati", "In attesa", "Rifiutati"];

const EventDetailsParticipants = () => {
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [currentRisposte, setCurrentRisposte] = useState([]);
  const { currentEventData, setCurrentEventData } = useChat();
  const navigate = useNavigate();
  const { executeApiCall, error, loading } = useApi();
  const { session } = useAuth();
  const { eventId } = useParams();

  const fetchEvent = () => {
    executeApiCall(
      "event",
      () => ApiCalls.fetchEvent(eventId, session.access_token),
      (data) => {
        console.log("DSD", data);
        setCurrentEventData(data);
      },
    );
  };

  useEffect(() => {
    const hasNoData =
      !currentEventData || Object.keys(currentEventData).length === 0;
    const isDifferentEvent = currentEventData?.event_id !== eventId; // Previene la visualizzazione di vecchi dati se cambi evento

    if (hasNoData || isDifferentEvent) {
      fetchEvent();
    }
  }, [eventId, currentEventData?.event_id]);

  // Gestione combinata di ricerca e filtri di stato
  const renderFilteredAnswers = useCallback(() => {
    if (!currentEventData?.risposte_evento) {
      setCurrentRisposte([]);
      return;
    }

    let result = [...currentEventData.risposte_evento];

    // 1. Applica filtro di ricerca testuale (se presente)
    if (query.trim() !== "") {
      const queryRegex = new RegExp(query, "i");
      result = result.filter(
        (risposta) =>
          risposta.utenti?.nome && risposta.utenti.nome.match(queryRegex),
      );
    }

    // 2. Applica filtro a pillola (se selezionato)
    if (currentFilter === "Confermati") {
      result = result.filter((r) => r.status === "accepted");
    } else if (currentFilter === "In attesa") {
      result = result.filter((r) => r.status === "pending");
    } else if (currentFilter === "Rifiutati") {
      // ✅ Corretto da "rejected" a "refused" per allinearsi al backend
      result = result.filter(
        (r) => r.status === "refused" || r.status === "rejected",
      );
    }

    setCurrentRisposte(result);
  }, [currentFilter, query, currentEventData]);

  useEffect(() => {
    renderFilteredAnswers();
  }, [renderFilteredAnswers]);

  if (error?.event) {
    return <RenderErrorState reloadFunction={fetchEvent} type={"event"} />;
  }

  if (loading?.event || !currentEventData) {
    return <RenderLoadingState type={"event"} />;
  }

  return (
    <div className="flex flex-col h-screen bg-bg-1 overflow-hidden">
      {/* Header della schermata */}
      <div className="px-4 py-3 w-full flex flex-row items-center gap-3 border-b border-bg-3/60 bg-bg-1">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-primary active:bg-bg-2/70 transition-colors cursor-pointer"
          aria-label="Torna indietro"
        >
          <ChevronLeft color="currentColor" />
        </button>
        <h1 className="font-title text-text-1 text-lg font-bold">
          Partecipanti ({currentRisposte?.length})
        </h1>
      </div>

      {/* Area di Controllo: SearchBar e Filtri di stato */}
      <div className="flex flex-col gap-4 p-4 pb-3 flex-shrink-0">
        {/* Barra di ricerca */}
        <div className="w-full h-11">
          <SearchBar query={query} setQuery={setQuery} />
        </div>

        {/* Lista dei Filtri a Pillola */}
        <div className="flex flex-row gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_TYPES.map((filter) => {
            const isActive = currentFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setCurrentFilter(isActive ? "" : filter)}
                className={`
                  px-4 py-2 rounded-full font-body text-xs font-bold whitespace-nowrap
                  transition-all duration-200 cursor-pointer 
                  ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-bg-2 text-text-2 border border-bg-3/60 active:bg-bg-3/50"
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista Scorrevole dei Partecipanti */}
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-bg-3/40">
        {currentRisposte.length > 0 ? (
          currentRisposte.map((risposta) => (
            <div key={risposta.user_id || risposta.id}>
              <PartecipanteCard {...risposta} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-text-2">
            Nessun partecipante trovato
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsParticipants;
