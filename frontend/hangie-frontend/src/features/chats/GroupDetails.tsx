import ChevronLeft from "@/assets/icons/ChevronLeft";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useScreen } from "@/contexts/ScreenContext";
import { useEffect, useMemo, useState } from "react";
import AddParticipantsGroup from "./AddParticipantsGroup";
import { useSocket } from "@/contexts/SocketContext.js";
import ParticipantsSection from "../groups/groupsDetails/ParticipantsSection.js";
import EditableDescription from "../groups/groupsDetails/EditableDescription.js";
import EditableImg from "../groups/groupsDetails/EditableImg.tsx";
import LeaveButton from "../groups/groupsDetails/LeaveButton.tsx";
import { useApi } from "@/contexts/ApiContext.tsx";
import { ApiCalls } from "@/services/api.tsx";
import { useNavigate } from "react-router";

const GroupDetails = () => {
  const { currentScreen } = useScreen();
  const { session } = useAuth();

  const { currentGroupData, currentGroup, setCurrentGroupData, setGroupsData } =
    useChat();
  const navigate = useNavigate();
  const [isParticipantsAdd, setIsParticipantsAdd] = useState(false);
  const { executeApiCall } = useApi();
  const [formError, setFormError] = useState(null);
  const isAdmin = useMemo(() => {
    return currentGroupData?.partecipanti_gruppo?.some(
      (p) =>
        p.role === "admin" &&
        (p.partecipante_id || p.user_id) === session.user.id,
    );
  }, [currentGroupData, session.user.id]);

  const { currentSocket } = useSocket();
  const [localGroupData, setLocalGroupData] = useState({
    group_cover_img: currentGroupData?.group_cover_img,
    descrizione: currentGroupData?.descrizione,
    nome: currentGroupData?.nome,
  });
  const [currentEditingField, setCurrentEditingField] = useState(null);
  const [currentParticipants, setCurrentParticipants] = useState(() => {
    return (
      currentGroupData?.partecipanti_gruppo?.map((partecipante) => {
        const { utenti, ...resto } = partecipante;
        return {
          ...resto,
          nome: utenti.nome,
          handle: utenti.handle,
          user_id: utenti.user_id,
          profile_pic: utenti.profile_pic || null,
        };
      }) || []
    );
  });

  const handleParticipantsAdd = () => {
    setIsParticipantsAdd(true);
  };
  const handleSaveParticipants = async (updatedList) => {
    // 1. Troviamo chi è veramente nuovo (quelli in updatedList che non sono in currentGroupData)
    const newParticipants = updatedList.filter((participant) => {
      return !currentGroupData?.partecipanti_gruppo.some(
        (original) => original.utenti.user_id === participant.user_id,
      );
    });

    // 2. Se non ci sono nuovi membri, chiudiamo e basta
    if (newParticipants.length === 0) {
      setIsParticipantsAdd(false);
      return;
    }

    // 3. Prepariamo i soli ID da inviare
    const newParticipantsIds = newParticipants.map((p) => ({
      user_id: p.user_id,
    }));

    const saveData = (data) => {
      currentSocket.emit(
        "add_participants",
        currentGroup,
        session.access_token,
        data.finalEventsResponses,
      );
    };

    executeApiCall(
      "add_participants",
      () => {
        return ApiCalls.AddParticipants(
          session.access_token,
          currentGroup,
          newParticipantsIds,
        );
      },
      saveData,
    );
  };

  useEffect(() => {
    if (currentGroupData?.partecipanti_gruppo) {
      setCurrentParticipants(
        currentGroupData?.partecipanti_gruppo?.map((partecipante) => {
          const { utenti, ...resto } = partecipante;
          return {
            ...resto,
            nome: utenti.nome,
            handle: utenti.handle,
            user_id: utenti.user_id,
            profile_pic: utenti.profile_pic || null,
          };
        }) || [],
      );
    }
  }, [currentGroupData?.partecipanti_gruppo]);

  useEffect(() => {
    if (currentGroupData) {
      const { descrizione, nome, group_cover_img } = currentGroupData;
      const usefulGroupData = { descrizione, nome, group_cover_img };
      let hasChanged = false;
      const updatedState = { ...localGroupData };
      for (const key in usefulGroupData) {
        if (usefulGroupData[key] !== localGroupData[key]) {
          updatedState[key] = usefulGroupData[key];
          hasChanged = true;
        }
      }
      if (hasChanged) {
        setLocalGroupData(updatedState);
      }
    }
  }, [currentGroupData]);

  const editField = async () => {
    const saveData = (data) => {
      setCurrentGroupData((prevData) => {
        return {
          ...prevData,
          [currentEditingField]: localGroupData[currentEditingField],
        };
      });

      setGroupsData((prevData) => {
        return prevData.map((group) => {
          if (group.group_id == currentGroup) {
            return {
              ...group,
              [currentEditingField]: localGroupData[currentEditingField],
            };
          }
          return group;
        });
      });
      currentSocket.emit(
        "edit_field",
        currentGroup,
        currentEditingField,
        localGroupData[currentEditingField],
      );
    };
    executeApiCall(
      "edit_field",
      () => {
        return () => {
          ApiCalls.editGroupField(session.access_token, currentGroup, {
            field: currentEditingField,
            fieldValue: localGroupData[currentEditingField],
            isAdmin,
          });
        };
      },
      saveData,
    );
  };

  const handleFinishEdit = async () => {
    if (
      localGroupData[currentEditingField] !==
      currentGroupData[currentEditingField]
    ) {
      if (validateField()) {
        await editField();
        setCurrentEditingField(null);
      }
    }
  };

  const validateField = () => {
    if (currentEditingField == "descrizione") {
      if (localGroupData.descrizione.length < 10) {
        setFormError({
          type: "descrizione",
          message: "la descrizione deve essere minimo 10 caratteri",
        });
        return false;
      }
      if (localGroupData.descrizione.length > 350) {
        setFormError({
          type: "descrizione",
          message: "La descrizione può essere massimo 350 caratteri",
        });
        return false;
      }
      setFormError(null);

      return true;
    }
    if (currentEditingField == "nome") {
      if (localGroupData.nome.length < 3) {
        setFormError({
          type: "nome",
          message: "il titolo deve avere almeno 3 caratteri",
        });
        return false;
      }
      if (localGroupData.nome.length > 20) {
        setFormError({
          type: "nome",
          message: "il titolo può avere massimo 20 caratteri",
        });
        return false;
      }
      setFormError(null);

      return true;
    }
  };

  return (
    <div className="w-full h-screen bg-bg-1 flex flex-col overflow-hidden">
      {isParticipantsAdd ? (
        <AddParticipantsGroup
          setIsParticipantsAdd={setIsParticipantsAdd}
          setCurrentParticipants={setCurrentParticipants}
          currentParticipants={currentParticipants}
          isGroup={true}
          onConfirm={(listaDalloSchermoAdd) =>
            handleSaveParticipants(listaDalloSchermoAdd)
          }
        />
      ) : (
        <>
          {/* Header Fisso Mobile Nativo */}
          <div className="px-4 py-3 border-b border-neutral-300/60 bg-bg-1 flex-shrink-0 flex justify-between items-center">
            <div className="flex flex-row gap-2 items-center min-w-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#007AFF] active:bg-bg-2 transition-colors cursor-pointer"
                aria-label="Torna indietro"
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
              </button>
              <h1 className="text-text-1 font-title font-bold text-lg truncate">
                Info Gruppo
              </h1>
            </div>
          </div>

          {/* Corpo della Schermata (Area Scorrevole) */}
          <div className="flex-1 overflow-y-auto px-2 py-5 flex flex-col justify-between">
            {/* Contenitore Principale delle Informazioni ed Editabili */}
            <div className="flex flex-col gap-6 w-full">
              {/* Box Immagine e Nome Gruppo */}
              <div className="flex flex-col gap-5  p-1 rounded-2xl ">
                <EditableImg
                  currentEditingField={currentEditingField}
                  formError={formError}
                  handleFinishEdit={handleFinishEdit}
                  isAdmin={isAdmin}
                  localGroupData={localGroupData}
                  setCurrentEditingField={setCurrentEditingField}
                  setLocalGroupData={setLocalGroupData}
                  setFormError={setFormError}
                  currentParticipants={currentParticipants}
                />

                <EditableDescription
                  currentEditingField={currentEditingField}
                  formError={formError}
                  handleFinishEdit={handleFinishEdit}
                  isAdmin={isAdmin}
                  localGroupData={localGroupData}
                  setCurrentEditingField={setCurrentEditingField}
                  setLocalGroupData={setLocalGroupData}
                />
              </div>

              {/* Lista Componente Partecipanti */}
              <div className="w-full">
                <ParticipantsSection
                  isAdmin={isAdmin}
                  currentParticipants={currentParticipants}
                  handleParticipantsAdd={handleParticipantsAdd}
                />
              </div>
            </div>

            {/* Pulsante Abbandona (Spinto sempre in fondo alla vista) */}
            <div className="w-full pt-8 pb-4 flex justify-center ">
              <LeaveButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default GroupDetails;
