import ChevronRight from "@/assets/icons/ChevronRight";
import ProfileIcon from "@/components/ProfileIcon";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useModal } from "@/contexts/ModalContext";
import { useSocket } from "@/contexts/SocketContext";
import { ApiCalls } from "@/services/api";
import { Plus } from "lucide-react";

const ParticipantsSection = ({
  handleParticipantsAdd,
  isAdmin,
  currentParticipants,
}) => {
  const { openModal } = useModal();
  const { currentGroupData, currentGroup } = useChat();
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const { executeApiCall } = useApi();
  const handleMakeAdmin = async (partecipante) => {
    const saveData = (data) => {
      currentSocket.emit("admin_participant", currentGroup, partecipante);
    };
    executeApiCall(
      "make_admin",
      () => {
        return () => {
          ApiCalls.editGroupField(session.access_token, currentGroup, {
            user_id: partecipante.user_id,
          });
        };
      },
      saveData,
    );
  };
  const handleRemoveParticipants = async (partecipante) => {
    const saveData = (data) => {
      currentSocket.emit("remove_participant", currentGroup, partecipante);
    };

    executeApiCall(
      "remove_participant",
      () =>
        ApiCalls.handleRemoveParticipant(session.access_token, currentGroup, {
          user_id: partecipante.user_id,
        }),

      saveData,
    );
  };
  return (
    <section className="flex flex-col gap-2">
      {/* Conteggio dei Partecipanti */}
      <div className="w-full flex flex-row justify-between items-center px-4 mb-1">
        <h3 className="text-xs font-body font-bold text-text-3 uppercase tracking-wider pl-0.5">
          {currentParticipants.length} Partecipanti
        </h3>
      </div>

      {/* Contenitore Lista in Stile iOS/Android Card Grouped */}
      <div className="mx-4 bg-bg-1 rounded-2xl border border-bg-3/80 overflow-hidden shadow-sm">
        {currentParticipants.map((partecipante, idx) => {
          const isMe = partecipante.user_id === session?.user?.id;
          const isCreator =
            currentGroupData.createdBy === partecipante.partecipante_id ||
            currentGroupData.createdBy === partecipante.user_id;
          const isAdminRole = partecipante.role === "admin";

          return (
            <div
              key={partecipante.partecipante_id || partecipante.user_id}
              onClick={() => {
                if (!isMe) {
                  openModal({
                    type: "PARTICIPANT_ACTIONS",
                    data: {
                      partecipante,
                      handleMakeAdmin,
                      handleRemoveParticipants,
                      isAdmin,
                    },
                  });
                }
              }}
              className={`
            flex items-center gap-3 px-3.5 py-3 transition-colors select-none relative
            ${isMe ? "cursor-default" : "cursor-pointer active:bg-bg-2"}
            ${idx !== currentParticipants.length - 1 || isAdmin ? "border-b border-bg-3/60" : ""}
          `}
            >
              {/* Avatar del Partecipante */}
              <div className="w-11 h-11 shrink-0">
                <ProfileIcon profile_pic={partecipante.profile_pic} />
              </div>

              {/* Informazioni Utente (Dati & Badge) */}
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <div className="flex flex-row items-center gap-1.5 w-full">
                  <span className="text-text-1 font-body font-bold text-sm truncate max-w-[160px] leading-tight">
                    {partecipante.nome}
                  </span>

                  {/* Badge di Ruolo Semantici */}
                  {isCreator ? (
                    <span className="text-[9px] font-body font-extrabold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      Creatore
                    </span>
                  ) : isAdminRole ? (
                    <span className="text-[9px] font-body font-extrabold bg-text-3/10 text-text-2 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      Admin
                    </span>
                  ) : null}
                </div>

                <span className="text-text-3 font-body text-xs truncate mt-0.5">
                  @{partecipante.handle}
                </span>
              </div>

              {/* Indicatore Chevron Laterale (Nascosto se sono io) */}
              {!isMe && (
                <div className="w-5 h-5 flex items-center justify-center text-text-3/60 shrink-0">
                  <ChevronRight size={16} strokeWidth={2.5} />
                </div>
              )}
            </div>
          );
        })}

        {/* Pulsante Aggiungi Partecipante (Integrato come riga interna per gli Admin) */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleParticipantsAdd}
            className="w-full h-13 px-4 bg-bg-2/40 text-primary font-body font-semibold text-sm flex items-center justify-center gap-2 active:bg-bg-3/40 transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            Aggiungi partecipanti
          </button>
        )}
      </div>
    </section>
  );
};

export default ParticipantsSection;
