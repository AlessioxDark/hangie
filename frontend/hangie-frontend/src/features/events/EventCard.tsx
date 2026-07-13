import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import ParticipantsIcon from "@/assets/icons/ParticipantsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { useModal } from "@/contexts/ModalContext";
import { useScreen } from "@/contexts/ScreenContext";
import { Link, useLocation } from "react-router";
import { useChat } from "@/contexts/ChatContext";
import GroupIcon from "@/components/GroupIcon";

const EventCard = ({ event }) => {
  const {
    titolo,
    created_by,
    event_id,
    data,
    luogo,
    costo,
    utente,
    event_imgs,
    status: eventStatus,
    descrizione,
    risposte_evento,
    cover_img,
    gruppo,
  } = event;
  const risposteAccepted = risposte_evento.filter(
    (r) => r.status == "accepted",
  );
  const formattedTime = data
    ? new Date(data).toLocaleTimeString("it-IT", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Link to={`/events/${event_id}`} className="block focus:outline-none">
      <article
        className="
      flex flex-col bg-bg-1 border border-neutral-300/60 rounded-xl overflow-hidden relative shadow-sm
      transition-all duration-200 active:scale-[0.99] active:bg-bg-2/50
    "
      >
        {/* Immagine di Copertina con altezza ottimizzata per smartphone */}
        {cover_img == null ? (
          <div className="w-full h-40 bg-bg-2 flex items-center justify-center text-text-3">
            <DefaultGroupIcon />
          </div>
        ) : (
          <img
            src={cover_img}
            className="w-full h-40 object-cover flex-shrink-0"
            alt="Immagine cover evento"
            loading="lazy"
          />
        )}

        {/* Badge del Gruppo Fluttuante */}
        {gruppo && (
          <div className="absolute top-3 left-3 max-w-[75%]">
            <div className="px-2.5 py-1 bg-text-1/85 backdrop-blur-md rounded-lg shadow-sm flex items-center gap-1.5">
              <GroupIcon
                group_cover_img={gruppo.group_cover_img}
                className="w-4 h-4 rounded-md"
              />
              <span className="text-xs font-bold text-bg-1 truncate font-title">
                {gruppo.nome}
              </span>
            </div>
          </div>
        )}

        {/* Corpo della Card */}
        <div className="p-4 flex flex-col gap-3 justify-between flex-1">
          {/* Info Principali: Titolo e Data */}
          <div className="flex flex-col gap-1">
            <time className="text-[11px] block text-primary font-semibold uppercase tracking-wider font-title">
              {formattedTime}
            </time>
            <h2 className="text-base font-bold font-body text-text-1 line-clamp-1 leading-tight">
              {titolo}
            </h2>
          </div>

          {/* Dettagli dell'Evento (Luogo, Costo, Partecipanti) */}
          <div className="flex flex-col gap-2">
            {/* Riga Luogo */}
            <div className="flex flex-row gap-2 items-center">
              <div className="w-4 h-4 flex-shrink-0 text-text-2">
                <MapIcon color="currentColor" />
              </div>
              <span className="text-text-2 font-body text-xs truncate">
                {luogo.nome}, {luogo.citta}
              </span>
            </div>

            {/* Riga Costo */}
            <div className="flex flex-row gap-2 items-center">
              <div className="w-4 h-4 flex-shrink-0 text-text-2">
                <DollarIcon color="currentColor" />
              </div>
              {costo === 0 ? (
                <span className="text-emerald-600 font-body font-semibold text-xs">
                  Gratis
                </span>
              ) : (
                <span className="text-text-2 font-body font-semibold text-xs">
                  {`${costo}€`}
                </span>
              )}
            </div>

            {/* Riga Partecipanti */}
            <div className="flex flex-row gap-2 items-center mt-0.5">
              <div className="w-4 h-4 flex-shrink-0 text-text-2">
                <ParticipantsIcon color="currentColor" />
              </div>

              <div className="flex items-center gap-2">
                {risposteAccepted.length > 0 ? (
                  <>
                    {/* Stack di cerchietti sovrapposti */}
                    <div className="flex -space-x-1.5">
                      {risposteAccepted.slice(0, 3).map((partecipante) => (
                        <div
                          className="w-5 h-5 rounded-full border border-bg-1 overflow-hidden"
                          key={partecipante.user_id}
                        >
                          <ProfileIcon
                            profile_pic={partecipante.utenti.profile_pic}
                          />
                        </div>
                      ))}

                      {risposteAccepted.length > 3 && (
                        <div className="w-5 h-5 rounded-full border border-bg-1 bg-bg-3 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-text-2">
                            +{risposteAccepted.length - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-text-2 font-body font-medium text-xs">
                      {risposteAccepted.length} partecipant
                      {risposteAccepted.length !== 1 ? "i" : "e"}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-text-3 font-body">
                    Nessun partecipante
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Separatore e Organizzatore */}
          <div className="flex flex-col gap-2.5 mt-1">
            <div className="w-full h-[1px] bg-bg-3/50"></div>
            <div className="flex flex-row items-center gap-2">
              <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden">
                <ProfileIcon profile_pic={utente.profile_pic} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-3 font-body leading-none mb-0.5">
                  Organizzato da
                </span>
                <span className="font-body text-text-2 font-semibold text-xs leading-none">
                  {utente.nome}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
export default EventCard;
