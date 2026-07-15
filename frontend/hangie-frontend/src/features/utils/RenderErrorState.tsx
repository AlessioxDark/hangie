import { useApi } from "@/contexts/ApiContext";
import { AlertCircle, RefreshCw } from "lucide-react";

const RenderErrorState = ({ type, reloadFunction }) => {
  const { error } = useApi();
  const defaultError = {
    message: "Si è verificato un errore imprevisto",
    details: "Non siamo riusciti a completare l'operazione. Riprova tra poco.",
  };

  const currentError = error[type] || defaultError;

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] py-12 px-6 w-full h-full ">
      {/* Icona di errore con background morbido ed effetto soft glow */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Cerchio di sfondo sfumato */}
        <div className="absolute w-20 h-20 bg-warning/10 rounded-full  opacity-60" />

        {/* Icona principale */}
        <AlertCircle className="relative w-12 h-12 text-warning" />
      </div>

      {/* Titolo dell'errore ben strutturato */}
      <h3 className="text-lg font-semibold text-text-1  mb-6 text-center max-w-xs tracking-tight">
        {currentError.message}
      </h3>

      {/* Dettagli dell'errore più discreti */}
      {currentError.details && (
        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm leading-relaxed">
          {currentError.details}
        </p>
      )}

      {/* Pulsante "Riprova" moderno con icona e transizione */}
      {reloadFunction && (
        <button
          onClick={() => reloadFunction()}
          className="group flex items-center gap-2 bg-primary hover:bg-primary/95 text-bg-1 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
          Riprova
        </button>
      )}
    </div>
  );
};

export default RenderErrorState;
