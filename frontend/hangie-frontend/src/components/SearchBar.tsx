import SearchLensIcon from "@/assets/icons/SearchLensIcon";
import { X } from "lucide-react";

const SearchBar = ({ query, setQuery }) => {
  const handleClearInput = () => {
    setQuery("");
  };
  return (
    <div className="w-full h-11 px-3 bg-bg-2 border border-bg-3 rounded-full flex flex-row items-center justify-between gap-2 shadow-inner transition-all duration-150 focus-within:ring-2 focus-within:ring-primary ">
      {/* Icona Lente e Input Text */}
      <div className="flex flex-row items-center gap-2 flex-1 h-full min-w-0">
        <div className="w-5 h-5 text-text-3 flex-shrink-0 flex items-center justify-center">
          <SearchLensIcon color="currentColor" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca..."
          className="w-full h-full bg-transparent outline-none border-none text-sm font-body text-text-1 placeholder-text-3/80 appearance-none"
        />
      </div>

      {/* Pulsante di Cancellazione Chiara (X) */}
      {query !== "" && (
        <button
          type="button"
          onClick={handleClearInput}
          className="w-7 h-7 flex items-center justify-center rounded-full text-text-3 active:bg-bg-3/60 transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Cancella ricerca"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
