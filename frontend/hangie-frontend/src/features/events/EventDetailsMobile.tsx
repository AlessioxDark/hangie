import CalendarIcon from "@/assets/icons/CalendarIcon";
import ChevronLeft from "@/assets/icons/ChevronLeft";
import ChevronRight from "@/assets/icons/ChevronRight";
import DollarIcon from "@/assets/icons/DollarIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { ApiCalls } from "@/services/api";
import MapIcon from "@/assets/icons/MapIcon";
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import RenderEmptyState from "../utils/RenderEmptyState";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { Clock } from "lucide-react";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import { useSocket } from "@/contexts/SocketContext";

const EventDetailsMobile = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { executeApiCall, error, loading } = useApi();
  const {
    setCurrentEventData,
    currentEventData,
    handleDeleteEvent,
    handleEventDecision,
  } = useChat();
  const { currentSocket } = useSocket();
  const { session } = useAuth();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const imageRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchEvent = () => {
    executeApiCall(
      "event",
      () => ApiCalls.fetchEvent(eventId, session.access_token),
      (data) => {
        setCurrentEventData(data);
      },
    );
  };

  // Fix: Ascolta il cambio di eventId se l'utente naviga tra eventi diversi
  useEffect(() => {
    fetchEvent();
  }, [eventId]);
  console.log(currentEventData);
  const {
    titolo,
    descrizione,
    event_imgs,
    cover_img,
    data,
    luogo,
    costo,
    status,
    gruppo,
    scadenza,
    risposte_evento,
    utente,
    created_by,
  } = currentEventData || {};

  // Calcolo booleano corretto della scadenza (parsa la stringa ISO in timestamp)
  const isExpired = useMemo(() => {
    if (!scadenza) return false;
    return new Date(scadenza).getTime() < Date.now();
    // return false;
  }, [scadenza]);

  const acceptedParticipants =
    risposte_evento?.filter((r) => r.status === "accepted") || [];

  const allImgs = [
    cover_img,
    ...(event_imgs?.map((e) => e.img_url) || []),
  ].filter(Boolean);
  const handleScroll = (e) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const index = Math.round(scrollPosition / itemWidth);

    if (index !== currentCarouselIndex) {
      setCurrentCarouselIndex(index);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("it-IT", {
      minute: "2-digit",
      hour: "2-digit",
    });
  };

  const calculateScadenza = (data_scadenza) => {
    const dataScadenza = new Date(data_scadenza);
    const now = new Date();
    const diffInSeconds = Math.floor((dataScadenza - now) / 1000);

    if (isNaN(diffInSeconds)) return "Data non valida";
    if (diffInSeconds <= 0) return "Scaduto";

    if (diffInSeconds < 3600) {
      const min = Math.floor(diffInSeconds / 60);
      return min < 1 ? "meno di un min" : `tra ${min} min`;
    }
    if (diffInSeconds < 86400) {
      const ore = Math.floor(diffInSeconds / 3600);
      return `tra ${ore} ${ore === 1 ? "ora" : "ore"}`;
    }
    if (diffInSeconds < 604800) {
      const giorni = Math.floor(diffInSeconds / 86400);
      return `tra ${giorni} ${giorni === 1 ? "giorno" : "giorni"}`;
    }

    return dataScadenza.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
    });
  };

  // Fix: Logica deterministica basata sui millisecondi rimasti, non sulle stringhe generate
  const getStatusColor = (data_scadenza) => {
    const diffInMs = new Date(data_scadenza).getTime() - Date.now();
    const unGiornoInMs = 86400000;

    if (diffInMs <= 0) {
      return "text-gray-700 bg-gray-50 border-gray-100";
    }
    if (diffInMs < unGiornoInMs) {
      return "text-red-700 bg-red-50 border-red-100"; // Meno di 24 ore
    }
    if (diffInMs < unGiornoInMs * 3) {
      return "text-amber-700 bg-amber-50 border-amber-100"; // Meno di 3 giorni
    }
    return "bg-green-50 text-green-700 border-green-100";
  };

  const goToImg = (imgIndex) => {
    if (carouselRef.current && imageRef.current) {
      carouselRef.current.scrollTo({
        left: imgIndex * imageRef.current.width,
        behavior: "smooth",
      });
    }
  };

  const sendSocketDeleteEvent = () => {
    currentSocket.emit("delete_event", eventId, gruppo?.group_id);
  };

  const sendSocketVoteEvent = (newStatus) => {
    currentSocket.emit(
      "vote_event",
      eventId,
      gruppo?.group_id,
      newStatus,
      session.user.id,
      currentEventData?.status,
    );
    setCurrentEventData((prev) => ({ ...prev, status: newStatus }));
  };
  // Fix: Controllo di sicurezza robusto sullo stato vuoto
  if (
    !currentEventData ||
    Object.keys(currentEventData).length === 0 ||
    loading?.event
  ) {
    return <RenderLoadingState type={"event"} />;
  }

  if (error?.event) {
    return <RenderErrorState reloadFunction={fetchEvent} type={"event"} />;
  }

  return (
    <div className={`${created_by == session?.user.id ? "pb-40" : "pb-24"}`}>
      {" "}
      {/* Padding bottom per non coprire i pulsanti fixed */}
      <div className="px-2 py-3 bg-white z-[100] w-full flex flex-row items-center gap-4 border-b border-gray-200 sticky top-0">
        <div className="w-8 h-8 cursor-pointer" onClick={() => navigate(-1)}>
          <ChevronLeft color={"#2463eb"} />
        </div>
        <h1 className="font-body text-text-1 text-lg font-bold">
          Dettagli Evento
        </h1>
      </div>
      <div className="space-y-2">
        <div className="w-full relative overflow-hidden">
          <div
            className="flex flex-row transition-transform overflow-x-auto duration-500 ease-in-out snap-x snap-mandatory no-scrollbar"
            ref={carouselRef}
            onScroll={handleScroll}
          >
            {allImgs.map((img_url, index) => (
              <img
                key={index}
                ref={index === 0 ? imageRef : null}
                className="aspect-[3/2] w-full snap-center flex-shrink-0 object-cover"
                src={img_url}
                alt={`Immagine evento ${index + 1}`}
                loading="lazy"
              />
            ))}
          </div>

          {allImgs.length > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center space-x-2">
              {allImgs.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 ${
                    index === currentCarouselIndex
                      ? "bg-primary"
                      : "bg-white border border-gray-400"
                  }`}
                  onClick={() => goToImg(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`px-4 ${status !== "pending" && "pb-4"} space-y-2.5`}>
          <div className="flex items-center justify-between text-sm my-3">
            <div
              onClick={() => navigate(`/group/${gruppo?.group_id}`)}
              className="flex items-center gap-2.5 group active:opacity-60 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {gruppo?.group_cover_img ? (
                  <img
                    src={gruppo.group_cover_img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DefaultGroupIcon />
                )}
              </div>
              <span className="font-semibold text-primary">{gruppo?.nome}</span>
            </div>

            {status === "pending" && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 ${getStatusColor(scadenza)} rounded-full border`}
              >
                <Clock size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isExpired
                    ? "Scaduto"
                    : `Scade: ${calculateScadenza(scadenza)}`}
                </span>
              </div>
            )}
          </div>

          <h1 className="font-bold text-2xl font-body break-words">{titolo}</h1>

          <div className="flex flex-col gap-3 border-b pb-6 border-gray-200">
            {[
              {
                icon: <CalendarIcon color="#2463eb" />,
                label: "Data",
                value: `${formatDate(data)} alle ${formatTime(data)}`,
              },
              {
                icon: <DollarIcon color="#2463eb" />,
                label: "Costo",
                value: `${costo?.toFixed(2)}€`,
                sub: "a persona",
              },
              {
                icon: <MapIcon color="#2463eb" />,
                label: "Luogo",
                value: luogo?.nome,
                sub: `${luogo?.indirizzo}, ${luogo?.citta}`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-6 h-6">{item.icon}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-text-1 leading-tight">
                    {item.value}
                  </p>
                  {item.sub && (
                    <p className="text-xs text-text-2">{item.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <h2 className="font-body font-bold text-text-1 text-lg">
                Descrizione
              </h2>
              <p className="text-text-2 text-sm font-body leading-relaxed whitespace-pre-line pl-0.5">
                {isExpanded
                  ? descrizione
                  : `${descrizione?.slice(0, 250)}${descrizione?.length > 250 ? "..." : ""}`}
                {descrizione?.length > 250 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="inline-block text-primary font-bold ml-1.5 text-xs"
                  >
                    {isExpanded ? "Leggi meno" : "Leggi tutto"}
                  </button>
                )}
              </p>
            </div>

            <button
              onClick={() => navigate("participants")}
              className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-2xl border border-orange-100 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {acceptedParticipants.slice(0, 3).map((p, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full border-2 border-orange-50 overflow-hidden"
                    >
                      <ProfileIcon profile_pic={p.utenti?.profile_pic} />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  +{acceptedParticipants.length} Partecipanti
                </span>
              </div>
              <div className="w-6 h-6">
                <ChevronRight color={"#ea580c"} />
              </div>
            </button>

            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="w-10 h-10">
                <ProfileIcon profile_pic={utente?.profile_pic} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Organizzatore
                </p>
                <p className="text-sm font-semibold text-text-1 leading-tight">
                  {utente?.nome}
                </p>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200 p-4 pb-5 z-[110] backdrop-blur-md shadow-lg flex flex-col gap-3">
              {/* 👥 PULSANTI DI VOTO: Visibili a tutti (sia invitati che creatore) */}
              <div className="w-full flex flex-row gap-3">
                <button
                  type="button"
                  disabled={isExpired}
                  onClick={() => {
                    const newStatus =
                      status === "accepted" ? "pending" : "accepted";
                    handleEventDecision(eventId, { status: newStatus }, () =>
                      sendSocketVoteEvent(newStatus),
                    );
                  }}
                  className={`flex-1 h-12 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer ${
                    status === "accepted"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-gray-100 text-gray-700"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Accetta
                </button>

                <button
                  type="button"
                  disabled={isExpired}
                  onClick={() => {
                    const newStatus =
                      status === "rejected" ? "pending" : "rejected";
                    handleEventDecision(eventId, { status: newStatus }, () =>
                      sendSocketVoteEvent(newStatus),
                    );
                  }}
                  className={`flex-1 h-12 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer ${
                    status === "rejected"
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                      : "bg-gray-100 text-gray-700"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Rifiuta
                </button>
              </div>

              {/* 👑 PULSANTE ELIMINA: Spunta sotto solo se sei l'organizzatore */}
              {created_by === session?.user?.id && (
                <button
                  className="w-full  h-10 text-white  bg-red-500 font-body font-bold text-xs rounded-xl active:bg-red-400 transition-all shadow-sm flex items-center justify-center cursor-pointer mt-1"
                  onClick={() => {
                    handleDeleteEvent(eventId, sendSocketDeleteEvent);
                  }}
                >
                  Elimina Evento
                </button>
                // <button
                //   type="button"
                //   className="w-full h-10 text-red-500 bg-red-50 font-body font-bold text-xs rounded-xl active:scale-[0.98] transition-all border border-red-100 flex items-center justify-center cursor-pointer mt-1"
                //   onClick={() =>
                //     handleDeleteEvent(eventId, sendSocketDeleteEvent)
                //   }
                // >
                //   Elimina Evento
                // </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsMobile;
