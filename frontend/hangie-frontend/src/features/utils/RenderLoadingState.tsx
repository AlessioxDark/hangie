import { Loader2 } from "lucide-react";

const RenderLoadingState = ({ type }) => {
  const messages = {
    groups: {
      main: "Caricamento dei gruppi in corso...",
      alt: "Stiamo cercando i tuoi gruppi",
    },
    events: {
      main: "Caricamento degli eventi del gruppo in corso...",
      alt: "Stiamo cercando i tuoi eventi",
    },
    participant: {
      main: "Caricamento degli amici in corso...",
      alt: "Stiamo cercando i tuoi amici",
    },
    add_participants: {
      main: "Caricamento degli amici in corso...",
      alt: "Stiamo cercando i tuoi amici",
    },
    new_group: {
      main: "creazione gruppo in corso...",
      alt: "Stiamo creando il tuo gruppo",
    },
    home: {
      main: "Caricamento degli eventi in corso...",
      alt: "Stiamo cercando i tuoi eventi",
    },
    add_event: {
      main: "Creazione evento in corso...",
      alt: "Stiamo creando il tuo evento",
    },
    event: {
      main: "Caricamento evento in corso...",
      alt: "Stiamo cercando il tuo evento",
    },
    friends: {
      main: "Caricamento amici  in corso...",
      alt: "Stiamo cercando i tuoi amici",
    },
    profile: {
      main: "Caricamento del profilo in corso...",
      alt: "Stiamo cercando il tuo profilo",
    },
    auth: {
      main: "Autenticazione in corso...",
      alt: "Ci vorra solo un secondo!",
    },
    log_out: {
      main: "Uscita in corso...",
      alt: "",
    }, // Fallback di sicurezza se passi un type inesistente
    default: {
      main: "Caricamento in corso...",
      alt: "Un attimo di pazienza",
    },
  };

  // Se 'type' non esiste nell'oggetto, usa il fallback 'default' senza crashare
  const currentMessage = messages[type] || messages.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] py-12 px-6 w-full h-full ">
      <div className="relative flex items-center justify-center mb-6">
        <Loader2 className="relative w-14 h-14 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 tracking-tight mb-1.5 text-center max-w-xs">
        {currentMessage.main}
      </h3>

      {currentMessage.alt && (
        <p className="text-sm text-gray-400 font-medium text-center max-w-xs ">
          {currentMessage.alt}
        </p>
      )}
    </div>
  );
};

export default RenderLoadingState;
