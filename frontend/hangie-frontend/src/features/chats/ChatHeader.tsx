import CalendarIcon from "@/assets/icons/CalendarIcon";
import ChevronLeft from "@/assets/icons/ChevronLeft";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import React, { useMemo } from "react";
import { useNavigate } from "react-router";

const ChatHeader = () => {
  const { currentScreen } = useScreen();
  const { currentGroupData, setCurrentGroup } = useChat();
  const displayImage = useMemo(() => {
    if (!currentGroupData?.group_cover_img) return null;

    // Usa il timestamp dell'ultimo aggiornamento o una stringa fissa
    // Se updated_at non c'è, non mettere Date.now(), metti una stringa vuota o nulla
    const version = currentGroupData?.updated_at
      ? new Date(currentGroupData.updated_at).getTime()
      : "1";

    return `${currentGroupData.group_cover_img}?v=${version}`;
  }, [currentGroupData?.group_cover_img, currentGroupData?.updated_at]);

  const navigate = useNavigate();
  return (
    <div className="w-full bg-bg-1 p-3 flex flex-row justify-between items-center border-b border-neutral-300/60 sticky top-0 z-50">
      {/* Sezione Sinistra: Back, Avatar e Info Gruppo */}
      <div className="flex flex-row gap-2 items-center min-w-0 flex-1">
        {/* Pulsante Torna Indietro */}
        <button
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full text-primary active:bg-bg-2/70 transition-colors cursor-pointer"
          onClick={() => {
            setCurrentGroup(null);
            navigate(-1);
          }}
          aria-label="Torna alle chat"
        >
          <ChevronLeft color="currentColor" />
        </button>

        {/* Info Gruppo (Cliccabile per i dettagli) */}
        <div
          className="flex flex-row items-center gap-3 min-w-0 flex-1 active:opacity-75 transition-opacity cursor-pointer"
          onClick={() => {
            navigate(`/chats/${currentGroupData?.group_id}/details`);
          }}
        >
          {displayImage ? (
            <img
              src={displayImage}
              loading="eager"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              alt="Avatar del gruppo"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-bg-2 overflow-hidden">
              <DefaultGroupIcon />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-text-1 font-title font-bold text-base leading-tight truncate">
              {currentGroupData?.nome}
            </h1>
            <p className="font-body text-text-3 text-[11px] line-clamp-1">
              {currentGroupData?.partecipanti_gruppo
                ?.map((p) => p.utenti.nome)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* Sezione Destra: Pulsante Calendario Eventi */}
      <div className="flex items-center ml-2 flex-shrink-0">
        <button
          onClick={() => {
            navigate(`/chats/${currentGroupData.group_id}/events`);
          }}
          className="p-2.5 rounded-full bg-primary/10 text-primary active:scale-[0.93] active:bg-primary/20 transition-all cursor-pointer shadow-sm shadow-primary/5"
          aria-label="Vedi eventi del gruppo"
        >
          <div className="w-5 h-5">
            <CalendarIcon color="currentColor" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
