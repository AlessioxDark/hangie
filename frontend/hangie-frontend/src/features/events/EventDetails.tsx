import CalendarIcon from "@/assets/icons/CalendarIcon";
import ChevronLeft from "@/assets/icons/ChevronLeft";
import ChevronRight from "@/assets/icons/ChevronRight";
import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useModal } from "@/contexts/ModalContext";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
const EventDetails = ({
  event_imgs,
  descrizione,
  titolo,
  costo,
  data,
  luoghi,
  setCurrentPage,
  utenti,
  risposte_eventi,
  event_status,
}) => {
  const { isOpen } = useModal();
  const navigate = useNavigate();

  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const carouselRef = useRef(null);
  const imageRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [descLimit, setDescLimit] = useState(350);

  // LOGICA CORRETTA PER IL CALCOLO DELLA LARGHEZZA DI SCORRIMENTO
  const calculateScrollWidth = () => {
    if (imageRef.current) {
      // Misura la larghezza effettiva della prima immagine
      const itemWidth = imageRef.current.offsetWidth;
      // La distanza di scorrimento è la larghezza dell'item + il gap (16px)
      const scrollDistance = itemWidth + 16;
      setScrollWidth(scrollDistance);

      // Assicura che l'indice corrente non sia fuori dai limiti
      const maxIndex = Math.max(0, (event_imgs?.length || 0) - 3);
      if (currentCarouselIndex > maxIndex) {
        setCurrentCarouselIndex(maxIndex);
      }
    }
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateScrollWidth();
    }, 100);

    window.addEventListener("resize", calculateScrollWidth);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateScrollWidth);
    };
  }, [event_imgs?.length | 0]);

  const maxIndex = Math.max(0, (event_imgs?.length || 0) - 3);

  const handleNext = () => {
    setCurrentCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (isOpen && event_imgs?.length > 0) {
      const timeoutId = setTimeout(() => {
        calculateScrollWidth();
      }, 100); // Ritardo per consentire il rendering

      window.addEventListener("resize", calculateScrollWidth);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", calculateScrollWidth);
      };
    }
  }, [isOpen, event_imgs?.length]); // Esegui su apertura e cambio dati
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("it-IT", {
      month: "2-digit",
      day: "2-digit",
    });
  };
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("it-IT", {
      minute: "2-digit",
      hour: "2-digit",
    });
  };

  const partecipanti = risposte_eventi
    ?.slice(0, 3)
    .filter((risposta) => {
      return risposta.status == "accepted";
    })
    .map((risposta) => {
      return risposta.utenti.nome;
    });
  return (
    <div className="w-full bg-bg-1 p-4 pb-8">
      <div className="flex flex-col gap-5">
        {/* Header: Titolo dell'evento e pulsante di chiusura */}
        <div className="w-full flex items-start justify-between gap-4">
          <h1 className="text-text-1 font-title font-bold text-xl leading-tight flex-1">
            {titolo}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-1 active:bg-bg-2 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Chiudi e torna indietro"
          >
            <X width={24} height={24} />
          </button>
        </div>

        {/* Carousel Immagini (Ottimizzato per lo scorrimento) */}
        <div className="w-full relative overflow-hidden rounded-xl bg-bg-2">
          <div
            ref={carouselRef}
            className="flex flex-row gap-2 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentCarouselIndex * scrollWidth}px)`,
            }}
          >
            {(event_imgs || []).map((img_url, index) => (
              <img
                key={index}
                ref={index === 0 ? imageRef : null}
                className="aspect-[16/10] w-full flex-shrink-0 object-cover rounded-xl"
                src={img_url}
                alt={`Immagine evento ${index + 1}`}
                loading="lazy"
              />
            ))}
          </div>

          {/* Indicatori a punti (Dots) */}
          {(event_imgs?.length || 0) > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-10">
              {(
                Array.from({
                  length: Math.ceil((event_imgs?.length || 0) / 3),
                }) || []
              ).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentCarouselIndex
                      ? "bg-primary w-4"
                      : "bg-bg-1/60"
                  }`}
                  onClick={() => setCurrentCarouselIndex(index)}
                  aria-label={`Vai alla diapositiva ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Griglia Dettagli Infobox (Quando, Dove, Costo) */}
        <div className="flex flex-col gap-3">
          {/* Box: Quando */}
          <div className="flex items-center gap-4 p-4 bg-bg-2 border border-bg-3/60 rounded-xl">
            <div className="w-10 h-10 text-primary flex-shrink-0">
              <CalendarIcon color="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider font-title mb-0.5">
                Quando
              </p>
              <p className="font-body text-sm text-text-1 font-medium">
                {formatDate(data)}{" "}
                <span className="text-primary font-bold">
                  alle {formatTime(data)}
                </span>
              </p>
            </div>
          </div>

          {/* Griglia a due colonne per Dove e Costo */}
          <div className="grid grid-cols-2 gap-3">
            {/* Box: Dove */}
            <div className="flex flex-col gap-1 p-4 bg-bg-2 border border-bg-3/60 rounded-xl">
              <div className="w-8 h-8 text-text-2 mb-1">
                <MapIcon color="currentColor" />
              </div>
              <p className="text-[11px] font-bold text-text-2 uppercase tracking-wider font-title">
                Dove
              </p>
              <div className="min-w-0">
                <p className="font-body font-bold text-sm text-text-1 truncate">
                  {luoghi?.nome}
                </p>
                <p className="font-body text-xs text-text-3 truncate">
                  {luoghi?.indirizzo}, {luoghi?.citta}
                </p>
              </div>
            </div>

            {/* Box: Costo */}
            <div className="flex flex-col gap-1 p-4 bg-bg-2 border border-bg-3/60 rounded-xl">
              <div className="w-8 h-8 text-text-2 mb-1">
                <DollarIcon color="currentColor" />
              </div>
              <p className="text-[11px] font-bold text-text-2 uppercase tracking-wider font-title">
                Costo
              </p>
              <div>
                <p className="text-base font-black text-text-1">
                  €{costo?.toFixed(2)}
                </p>
                <p className="text-[11px] text-text-3">a persona</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sezione: Descrizione */}
        <div className="flex flex-col gap-1.5 mt-1">
          <h2 className="text-sm font-title font-bold text-text-2 uppercase tracking-wider">
            Descrizione
          </h2>
          <p className="text-[11px] font-body text-text-1 leading-relaxed">
            {descrizione?.slice(0, descLimit)}
            {descrizione?.length > 350 && (
              <span
                className="ml-1.5 font-bold text-primary active:opacity-75 cursor-pointer inline-block"
                onClick={() =>
                  setDescLimit(descLimit === 350 ? descrizione.length : 350)
                }
              >
                {descLimit === 350 ? "Leggi tutto" : "Leggi meno"}
              </span>
            )}
          </p>
        </div>

        {/* Profilo Organizzatore */}
        <div className="flex items-center gap-3 p-3 bg-bg-2 border border-bg-3/40 rounded-xl">
          <div className="w-10 h-10 flex-shrink-0">
            <ProfileIcon profile_pic={utenti?.profile_pic} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-text-3 uppercase tracking-wider font-title">
              Organizzatore
            </p>
            <p className="text-sm font-bold text-text-1 truncate font-body">
              {utenti?.creatore}
            </p>
          </div>
        </div>

        {/* Box Partecipanti Completo */}
        <div
          onClick={() => setCurrentPage("participants")}
          className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer transition-all active:bg-primary/10"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 text-primary flex-shrink-0">
              <ParticipantsIcon color="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider font-title mb-0.5">
                Partecipanti
              </p>
              <p className="text-xs text-text-1 font-body truncate">
                Insieme a{" "}
                <span className="text-primary font-semibold">
                  {partecipanti?.join(", ")}
                </span>
              </p>
            </div>
          </div>
          <div className="w-5 h-5 text-primary flex-shrink-0 ml-2">
            <ChevronRight />
          </div>
        </div>

        {/* Sticky Action Buttons per Evento In Sospeso */}
        {event_status === "pending" && (
          <div className="flex items-center gap-3 w-full mt-3">
            <button className="flex-1 bg-primary text-bg-1 font-bold py-3 rounded-xl text-sm font-body shadow-sm shadow-primary/20 transition-all cursor-pointer">
              Accetta
            </button>
            <button className="flex-1 bg-bg-2 text-text-2 font-bold py-3 rounded-xl text-sm font-body border border-bg-3/60 transition-all cursor-pointer">
              Rifiuta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
