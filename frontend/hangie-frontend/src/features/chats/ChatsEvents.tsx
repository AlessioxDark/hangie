import { useChat } from "@/contexts/ChatContext";
import RenderEmptyState from "@/features/utils/RenderEmptyState";
import SearchBar from "@/components/SearchBar";
import GroupEventCard from "@/features/groups/GroupEventCard";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useScreen } from "@/contexts/ScreenContext";
import ChevronLeft from "@/assets/icons/ChevronLeft";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import { useApi } from "@/contexts/ApiContext";
import { useNavigate } from "react-router";

const FILTER_TYPES = ["accepted", "pending", "archive"];
const ChatsEvents = () => {
  const [currentFilter, setCurrentFilter] = useState("");
  const { groupEventsData, fetchGroupEvents, setGroupEventsData } = useChat();
  const [query, setQuery] = useState("");
  const { session } = useAuth();
  const { currentScreen } = useScreen();
  const navigate = useNavigate();
  const { error, loading } = useApi();

  const getEventStatus = (event) => {
    if (event?.created_by === session.user.id) {
      return "creator"; // L'utente è il creatore, vede i pulsanti di modifica
    }
    session.user.id;
    event;

    const userResponse = event.risposte_evento.find(
      (risposta) => risposta.user_id === session.user.id,
    );

    if (userResponse) {
      return userResponse.status;
    }
  };

  const filteredEvents = useMemo(() => {
    const allEvents = groupEventsData || [];
    const getUserEventStatus = (event) => {
      if (event.created_by === session.user.id) {
        return "creator";
      }

      const userResponse = (event.risposte_evento || []).find(
        (risposta) => risposta.user_id === session.user.id,
      );

      if (userResponse) {
        return userResponse.status;
      }

      return "pending";
    };

    let statusFilteredList = [];

    if (currentFilter === "") {
      statusFilteredList = allEvents;
    } else {
      statusFilteredList = allEvents.filter((event) => {
        const status = getUserEventStatus(event);

        if (currentFilter === "pending") {
          return status === "pending" || status === "creator";
        }

        return status === currentFilter;
      });
    }

    if (query.trim() !== "") {
      const regex = new RegExp(query, "i");
      return statusFilteredList.filter(
        (evento) => evento.titolo && evento.titolo.match(regex),
      );
    }
    return statusFilteredList;
  }, [
    groupEventsData,
    currentFilter,
    query,
    session?.user.id,
    setGroupEventsData,
  ]);

  if (loading.events) {
    return <RenderLoadingState type="events" />;
  }
  if (error && error?.events) {
    return (
      <RenderErrorState type={"events"} reloadFunction={fetchGroupEvents} />
    );
  }
  return (
    <div className="w-full h-screen bg-bg-1 flex flex-col overflow-hidden">
      {/* Header Fisso della Schermata */}
      <div className="px-4 py-3 border-b border-bg-3/60 bg-bg-1 flex-shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-primary active:bg-bg-2 transition-colors cursor-pointer"
          aria-label="Torna indietro"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-text-1 font-title font-bold text-lg truncate">
          Eventi Gruppo
        </h1>
      </div>

      {/* Sezione di Ricerca e Filtri (Fissa sotto l'header per non perderla nello scroll) */}
      <div className="px-4 pt-4 pb-3 bg-bg-1 flex flex-col gap-3 flex-shrink-0 border-b border-bg-3/30">
        {/* Barra di Ricerca */}
        <div className="w-full h-11">
          <SearchBar query={query} setQuery={setQuery} />
        </div>

        {/* Pillole dei Filtri con Scorrimento Orizzontale Nativo */}
        <div className="flex w-full flex-row gap-2 items-center overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {FILTER_TYPES.map((filter) => {
            const isActive = currentFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setCurrentFilter(isActive ? "" : filter)}
                className={`
              py-2 px-4 text-xs font-body font-bold rounded-full border transition-all duration-150 flex-shrink-0 cursor-pointer
              ${
                isActive
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                  : "bg-bg-2 text-text-2 border-bg-3/80 active:bg-bg-3/60"
              }
            `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista degli Eventi (Area Scorrevole) */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredEvents?.length > 0 ? (
          <div className="flex flex-col gap-3 pb-8">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <GroupEventCard key={event.event_id} type={status} {...event} />
              );
            })}
          </div>
        ) : (
          <div className="py-12">
            <RenderEmptyState type="events" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsEvents;
