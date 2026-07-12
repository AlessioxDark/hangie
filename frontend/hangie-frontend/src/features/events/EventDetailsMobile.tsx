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
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import RenderEmptyState from "../utils/RenderEmptyState";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { Clock } from "lucide-react";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import { useSocket } from "@/contexts/SocketContext";
import { object } from "zod";

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
      () => {
        return ApiCalls.fetchEvent(eventId, session.access_token);
      },
      (data) => {
        setCurrentEventData(data);
      },
    );
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  if (Object.keys(currentEventData).length == 0) {
    return <RenderLoadingState type={"event"} />;
  }
  if (error?.event) {
    return <RenderErrorState reloadFunction={fetchEvent} type={"event"} />;
  }
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
  const acceptedParticipants = risposte_evento?.filter(
    (r) => r.status == "accepted",
  );
  const allImgs = [cover_img, ...event_imgs?.map((e) => e.img_url)];

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const itemWidth = container.offsetWidth; // O la larghezza specifica della card

    // Calcoliamo l'indice (usiamo round per "agganciare" il numero quando superiamo la metà)
    const index = Math.round(scrollPosition / itemWidth);

    if (index !== currentCarouselIndex) {
      setCurrentCarouselIndex(index);
    }
  };

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

  const calculateScadenza = (data_scadenza) => {
    const dataScadenza = new Date(data_scadenza);
    const now = Date.now();
    const diffInSeconds = Math.floor((dataScadenza - now) / 1000);

    if (isNaN(diffInSeconds)) return "Invalid Date";
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

  const getStatusColor = (data_scadenza) => {
    const scad = calculateScadenza(scadenza).split(" ").pop();
    const scadVal = scad?.split(" ").pop();

    if (scadVal == "giorni" || scadVal == "giorno") {
      return "text-amber-700 bg-amber-50 border-amber-100";
    }
    if (scadVal == "ore" || scadVal == "ora" || scadVal == "min") {
      return "text-red-700 bg-red-50 border-red-100";
    }
    return "bg-green-50 text-green-700 border-green-100";
  };
  const goToImg = (imgIndex) => {
    carouselRef.current.scrollTo({
      left: imgIndex * imageRef.current.width,
      behavior: "smooth",
    });
  };

  const sendSocketDeleteEvent = () => {
    currentSocket.emit("delete_event", eventId, gruppo.group_id);
  };
  const sendSocketVoteEvent = (newStatus) => {
    currentSocket.emit(
      "vote_event",
      eventId,
      gruppo.group_id,
      newStatus,
      session.user.id,
      currentEventData?.status,
    );
    setCurrentEventData((prev) => {
      return { ...prev, status: newStatus };
    });
  };
  return (
    <div className="">
      <div className="px-2 py-3 bg-white z-[100] w-full flex flex-row items-center gap-4 border-b border-gray-200 sticky top-0">
        <div className="w-8 h-8" onClick={() => navigate(-1)}>
          <ChevronLeft color={"#2463eb"} />
        </div>
        <h1 className="font-body text-text-1 text-lg font-bold">
          Dettagli Evento
        </h1>
      </div>
      <div className="space-y-2">
        <div className="w-full relative overflow-hidden ">
          <div
            className={`flex flex-row transition-transform overflow-x-auto duration-500 ease-in-out snap-x snap-mandatory no-scrollbar`}
            ref={carouselRef}
            onScroll={handleScroll}
          >
            {(allImgs || []).map((img_url, index) => {
              return (
                <img
                  key={index}
                  ref={imageRef}
                  className="aspect-[3/2] w-full snap-center flex-shrink-0 object-cover"
                  src={img_url}
                  alt={`Immagine evento ${index + 1}`}
                  loading="lazy"
                />
              );
            })}
          </div>

          <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center space-x-2 border- ">
            {(
              Array.from({
                length: allImgs?.length,
              }) || []
            ).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 
                                    ${
                                      index === currentCarouselIndex
                                        ? "bg-primary"
                                        : "bg-bg-1 border border-gray-400"
                                    }`}
                onClick={() => goToImg(index)}
                aria-label={`Vai all'immagine ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={`px-4 ${status !== "pending" && "pb-4"} space-y-2.5`}>
          <div>
            <div className="flex items-center justify-between text-sm my-3">
              <div
                onClick={() => navigate(`/group/${gruppo.group_id}`)} // implementare sistema eventi anche con gruppo
                className="flex items-center gap-2.5 group active:opacity-60 transition-opacity cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full ">
                  {gruppo.group_cover_img !== null ? (
                    <img
                      src={gruppo.group_cover_img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full">
                      <DefaultGroupIcon />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-primary flex items-center gap-0.5">
                  {gruppo.nome}
                </span>
              </div>

              {status === "pending" && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 ${getStatusColor(scadenza)} rounded-full border  animate-pulse-slow`}
                >
                  <Clock size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Scade: {calculateScadenza(scadenza)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="font-bold text-2xl font-body break-words">
              {titolo}
            </h1>
          </div>
          <div className="">
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
                    : `${descrizione.slice(0, 250)}${descrizione.length > 250 ? "..." : ""}`}
                  {descrizione.length > 250 && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="inline-block text-primary font-bold ml-1.5 active:opacity-70 cursor-pointer text-xs"
                    >
                      {isExpanded ? "Leggi meno" : "Leggi tutto"}
                    </button>
                  )}
                </p>
              </div>
              <button className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-2xl border border-orange-100 active:scale-95 transition-transform">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {acceptedParticipants.slice(0, 3).map((p) => (
                      <div className="w-8 h-8">
                        <ProfileIcon profile_pic={p.utenti.profile_pic} />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    +{acceptedParticipants.length} Partecipanti
                  </span>
                </div>
                <div
                  className="w-6 h-6"
                  onClick={() => {
                    navigate("participants");
                  }}
                >
                  <ChevronRight color={"#ea580c"} />
                </div>
              </button>

              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                <div className="w-10 h-10">
                  <ProfileIcon profile_pic={utente.profile_pic} />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Organizzatore
                  </p>
                  <p className="text-sm font-semibold text-text-1 leading-tight">
                    {utente.nome}
                  </p>
                </div>
              </div>
              {created_by == session.user.id && (
                <button
                  className="w-full py-4 text-white  bg-red-500 font-semibold rounded-2xl active:bg-red-400 transition-all shadow-sm"
                  onClick={() => {
                    handleDeleteEvent(eventId, sendSocketDeleteEvent);
                  }}
                >
                  Elimina Evento
                </button>
              )}
            </div>
          </div>
        </div>
        {created_by !== session?.user?.id && (
          <div className="fixed bottom-0 left-0 right-0 bg-bg-1/95 border-t border-bg-3/60 p-4 pb-5 z-[110] backdrop-blur-md shadow-lg">
            <div className="w-full flex flex-row gap-3">
              <button
                type="button"
                disabled={scadenza < Date.now()}
                onClick={() => {
                  const newStatus =
                    status === "accepted" ? "pending" : "accepted";
                  handleEventDecision(eventId, { status: newStatus }, () => {
                    sendSocketVoteEvent(newStatus);
                  });
                }}
                className={`
            flex-1 h-12 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer
            ${
              status === "accepted"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-bg-2 text-text-2 border border-bg-3/80 active:bg-bg-3/60"
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
              >
                Accetta
              </button>

              <button
                type="button"
                disabled={scadenza < Date.now()}
                onClick={() => {
                  const newStatus =
                    status === "rejected" ? "pending" : "rejected";
                  handleEventDecision(eventId, { status: newStatus }, () => {
                    sendSocketVoteEvent(newStatus);
                  });
                }}
                className={`
            flex-1 h-12 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer
            ${
              status === "rejected"
                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                : "bg-bg-2 text-text-2 border border-bg-3/80 active:bg-bg-3/60"
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
              >
                Rifiuta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsMobile;
