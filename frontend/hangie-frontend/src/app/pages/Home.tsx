import ChevronRight from "@/assets/icons/ChevronRight.js";

import EventCard from "@/features/events/EventCard.js";
import EventCardSuspended from "@/features/events/EventCardSuspended.js";

import RenderEmptyState from "@/features/utils/RenderEmptyState.js";
import EventDetailsModal from "@/features/modal/EventDetailsModal.js";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../config/db.js";
import { useChat } from "@/contexts/ChatContext.js";
import RenderErrorState from "@/features/utils/RenderErrorState.js";
import RenderLoadingState from "@/features/utils/RenderLoadingState.js";
import { useApi } from "@/contexts/ApiContext.js";
type Utente = {
  nome: string;
  user_id: string;
  profile_pic: null | string;
};

type EventDataTypes = {
  titolo: string;
  data: Date;
  scadenza: Date;
  descrizione: string;
  costo: number;
  status: "accepted" | "pending";
  cover_img: string;
  event_imgs: string[];
  gruppo: any[];
  utente: Utente[];
  luogo: any[];
};

type EventDataTypesArray = {
  pending: EventDataTypes[];
  accepted: EventDataTypes[];
};
const EVENTSINPAGE = 12;
const Home = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { homeEventsData, setHomeOffset, fetchEvents } = useChat();
  const { error, loading } = useApi();
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => {
      if (loading.home) return; // <--- QUESTA RIGA QUI
      const { scrollHeight, scrollTop, clientHeight } = slider;
      const distanzaDalBasso = scrollHeight - scrollTop - clientHeight;

      if (distanzaDalBasso < 540) {
        setHomeOffset((prevOffset) => prevOffset + EVENTSINPAGE);
      }
    };
    slider.addEventListener("scroll", onScroll);
    return () => slider.removeEventListener("scroll", onScroll);
  }, [loading.home]);

  const renderContent = useCallback(
    (type: string) => {
      if (error.home) {
        return <RenderErrorState reloadFunction={fetchEvents} type="home" />;
      }
      if (loading.home) {
        return <RenderLoadingState type={"home"} />;
      }

      if (type == "pending") {
        return (
          <div>
            {homeEventsData.pending.length > 0 ? (
              <div
                className="grid 
   grid-cols-1          
    lg:grid-cols-2 
    grid-rows-1    
    
    gap-4
    2xl:gap-8"
              >
                {homeEventsData &&
                  homeEventsData.pending.slice(0, 3).map((event) => (
                    <div className="w-full " key={event.event_id}>
                      <EventCardSuspended {...event} />
                    </div>
                  ))}
              </div>
            ) : (
              <RenderEmptyState type="home" />
            )}
          </div>
        );
      }
      if (type == "accepted") {
        return (
          <div>
            {homeEventsData.accepted.length > 0 ? (
              <div
                className="
              grid 
              grid-cols-1
              md:grid-cols-2
             
              2xl:grid-cols-4
         
            gap-4
    2xl:gap-8
              "
              >
                {homeEventsData.accepted.map((event) => {
                  return (
                    <div key={event.event_id}>
                      <EventCard event={event} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <RenderEmptyState type="home" />
            )}
          </div>
        );
      }

      return null;
    },
    [homeEventsData, error.home, loading.home],
  );

  return (
    <div className="min-h-screen bg-bg-main px-4 py-5 flex flex-col">
      <main ref={sliderRef} className="flex-1">
        <div className="flex flex-col gap-10">
          {/* SEZIONE: Eventi in Sospeso */}
          <section aria-labelledby="pending-events-title">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2
                  id="pending-events-title"
                  className="text-xl font-bold font-body text-text-1 tracking-tight mb-0.5"
                >
                  Eventi in Sospeso
                </h2>
                <p className="text-xs font-body text-text-2">
                  Hai{" "}
                  <span className="font-semibold text-primary">
                    {homeEventsData.pending?.length} invit
                    {homeEventsData.pending?.length === 1 ? "o" : "i"}
                  </span>{" "}
                  in attesa
                </p>
              </div>

              <Link
                to="/events/suspended/all"
                className="group flex items-center gap-0.5 text-primary font-semibold text-sm font-body active:opacity-70 transition-opacity"
              >
                <span>Vedi Tutti</span>
                <div className="w-5 h-5 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ChevronRight color="#2463eb" />
                </div>
              </Link>
            </div>

            <div>{renderContent("pending")}</div>
          </section>

          {/* SEZIONE: Prossimi Eventi */}
          <section aria-labelledby="upcoming-events-title">
            <div className="mb-4">
              <h2
                id="upcoming-events-title"
                className="text-xl font-bold font-body text-text-1 tracking-tight mb-0.5"
              >
                I tuoi Prossimi Eventi
              </h2>
              <p className="text-xs text-text-2 font-body">
                <span className="font-semibold text-text-1">
                  {homeEventsData.accepted?.length} event
                  {homeEventsData.accepted?.length === 1 ? "o" : "i"}
                </span>{" "}
                nelle prossime settimane
              </p>
            </div>

            {/* pb-24 serve per non far finire il contenuto sotto l'eventuale Bottom Navigation Bar mobile */}
            <div className="pb-24">{renderContent("accepted")}</div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
