import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center select-none font-sans">
      <div className="relative mb-8">
        <div className="text-9xl font-black text-primary">404</div>
      </div>

      <h1 className="text-3xl font-bold tracking-tighter mb-4 text-text-1">
        Evento non trovato
      </h1>

      <p className="max-w-xs text-zinc-500 text-lg mb-10 leading-relaxed">
        Hai appena provato a imbucarti a un evento che non esiste. Non
        preoccuparti, non lo diremo a nessuno (o forse si 🤔).
      </p>

      <Link
        to="/"
        className="px-8 py-4 bg-primary text-bg-1 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all duration-300  shadow-lg shadow-white/5"
      >
        Torna alla Home
      </Link>
    </div>
  );
};

export default NotFound;
