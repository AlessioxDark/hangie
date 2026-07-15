import ClipIcon from "@/assets/icons/ClipIcon";
import SendIcon from "@/assets/icons/SendIcon";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import { Calendar, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const ChatInput = ({
  chatInputRef,
  inputValue,
  setInputValue,
  sendMessage,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { setMobileView } = useMobileLayout();
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

  const handleInput = useCallback(
    (e) => {
      const currentContent = e.currentTarget.textContent || "";

      // 1. Cancella il timer precedente (se l'utente sta ancora digitando)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 2. Imposta un nuovo timer per aggiornare lo stato del genitore
      debounceTimerRef.current = setTimeout(() => {
        // Questa chiamata avviene solo DOPO la pausa, riducendo i re-render del genitore.
        setInputValue(currentContent);
      }, 100);
    },
    [setInputValue],
  );
  const isSendActive =
    inputValue && inputValue.trim().length > 0 && !isDropdownOpen;

  return (
    <div className="w-full bg-bg-1 border-t border-neutral-300/60 p-2 flex flex-col items-center sticky bottom-0 z-50 shadow-lg">
      {/* Contenitore Input Interno */}
      <div className="flex flex-row w-full gap-2 items-end">
        {/* Campo di testo e Graffetta Allegati */}
        <div className="flex-1 bg-bg-2 rounded-2xl border border-neutral-300/40 p-1 flex items-end gap-1 min-h-[44px] relative focus-within:ring-2 focus-within:ring-primary">
          {/* Menu/Bottone Graffetta */}
          <div className="relative mb-0.5" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="w-9 h-9 flex items-center justify-center rounded-full text-text-2 active:bg-bg-3/50 active:text-text-1 transition-all cursor-pointer"
              aria-label="Apri opzioni allegati"
            >
              <div className="w-5 h-5">
                <ClipIcon color="currentColor" />
              </div>
            </button>

            {/* Dropdown Mobile: Menu ad Azione Nativo (Action Sheet) */}
            {isDropdownOpen && (
              <div className="absolute left-0 bottom-12 w-44 bg-bg-1 border border-bg-3/60 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => {
                    setMobileView("CREATE_EVENT");
                    toggleDropdown();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 font-body font-bold text-xs text-text-1 active:bg-bg-2 text-left cursor-pointer"
                >
                  <div className="p-1.5 rounded-full bg-primary text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" strokeWidth={3} />
                  </div>
                  Crea Evento
                </button>
              </div>
            )}
          </div>

          {/* Input di testo editabile */}
          <div
            contentEditable={!isDropdownOpen}
            ref={chatInputRef}
            className={`
          flex-1 min-h-[24px] max-h-24 w-full py-2 px-1 pr-3 outline-none 
          text-sm text-text-1 font-body overflow-y-auto transition-opacity duration-200
          ${isDropdownOpen ? "opacity-40 cursor-not-allowed" : "opacity-100"}
        `}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isSendActive) sendMessage();
              }
            }}
            data-placeholder="Scrivi un messaggio..."
          />
        </div>

        {/* Pulsante Invia Messaggio */}
        <button
          onClick={isSendActive ? sendMessage : undefined}
          disabled={!isSendActive}
          className={`
        w-10 h-10 flex items-center justify-center rounded-full 
        transition-all duration-150 flex-shrink-0 mb-0.5 cursor-pointer
        ${
          isSendActive
            ? "bg-primary text-white shadow-md shadow-primary/10"
            : "bg-primary text-text-3 opacity-60 cursor-not-allowed"
        }
      `}
          aria-label="Invia messaggio"
        >
          <div className="w-8 h-8">
            <SendIcon color="currentColor" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
