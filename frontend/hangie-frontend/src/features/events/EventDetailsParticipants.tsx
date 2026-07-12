import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useModal } from "@/contexts/ModalContext";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import PartecipanteCard from "./PartecipanteCard";
import { useNavigate } from "react-router";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import SearchBar from "@/components/SearchBar";

const FILTER_TYPES = ["Confermati", "In attesa", "Rifiutati"];
const EventDetailsParticipants = () => {
  const [query, setQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [currentRisposte, setCurrentRisposte] = useState([]);
  const { currentEventData } = useChat();
  const navigate = useNavigate();
  const { currentScreen } = useScreen();
  const renderFilteredAnswers = useCallback(() => {
    if (currentFilter == "") {
      {
        setCurrentRisposte(currentEventData?.risposte_evento);
      }
    }
    if (query !== "") {
      const queryRegex = new RegExp(query, "i");

      const nuoveRisposte = currentEventData?.risposte_evento.filter(
        (risposta) => {
          return risposta.utenti.nome.match(queryRegex);
        },
      );

      setCurrentRisposte(nuoveRisposte);
    }
    if (currentFilter == "Confermati") {
      setCurrentRisposte(
        currentEventData.risposte_evento?.filter((r) => r.status == "accepted"),
      );
    }
    if (currentFilter == "In attesa") {
      setCurrentRisposte(
        currentEventData.risposte_evento?.filter((r) => r.status == "pending"),
      );
    }
    if (currentFilter == "Rifiutati") {
      setCurrentRisposte(
        currentEventData.risposte_evento?.filter((r) => r.status == "rejected"),
      );
    }
  }, [currentFilter, query]);
  useEffect(() => {
    renderFilteredAnswers();
  }, [currentFilter, query]);

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
          Partecipanti ({currentRisposte.length})
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
              transition-all duration-200 cursor-pointer active:scale-[0.96]
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
      <div className="flex-1 overflow-y-auto px-4 divide-bg-3/40">
        {currentRisposte?.map((risposta) => (
          <div key={risposta.user_id || risposta.id}>
            <PartecipanteCard {...risposta} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetailsParticipants;
