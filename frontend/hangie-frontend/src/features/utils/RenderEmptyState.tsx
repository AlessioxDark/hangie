import { Users, Calendar, MessageCircle, HelpCircle } from "lucide-react";

const RenderEmptyState = ({ type }) => {
  const states = {
    groups: {
      text: "Nessun gruppo trovato",
      description:
        "Crea un nuovo gruppo o fatti invitare dai tuoi amici per iniziare!",
      icon: (
        <Users className="relative w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
      ),
    },
    home: {
      text: "Nessun evento trovato",
      description:
        "Non ci sono eventi in programma. Che ne dici di organizzarne uno?",
      icon: (
        <Calendar className="relative w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
      ),
    },
    events: {
      text: "Nessun evento trovato",
      description:
        "Ancora nessun evento per questo gruppo. Proponi un'attività!",
      icon: (
        <Calendar className="relative w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
      ),
    },
    chat: {
      text: "Nessuna chat attiva",
      description:
        "Invia un messaggio in un gruppo per avviare la conversazione.",
      icon: (
        <MessageCircle className="relative w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
      ),
    },
    default: {
      text: "Nessun dato trovato",
      description: "Non c'è ancora nulla da mostrare qui.",
      icon: <HelpCircle className="relative w-8 h-8 text-gray-400" />,
    },
  };

  // Fallback di sicurezza se passi un tipo non mappato
  const currentState = states[type] || states.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-12 px-6 w-full h-full  group">
      {/* Icona con cerchio di sfondo sfumato e transizione hover */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Cerchio posteriore morbido con transizione al passaggio del mouse */}
        <div className="absolute w-16 h-16 bg-gray-100/80 rounded-full group-hover:bg-gray-100 group-hover:scale-105 transition-all duration-300" />

        {/* Render dell'icona */}
        {currentState.icon}
      </div>

      {/* Titolo principale */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1.5 text-center tracking-tight">
        {currentState.text}
      </h3>

      {/* Descrizione (Call to Action invisibile per l'utente) */}
      <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
        {currentState.description}
      </p>
    </div>
  );
};

export default RenderEmptyState;
