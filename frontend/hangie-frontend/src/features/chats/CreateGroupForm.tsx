import ChevronLeft from "@/assets/icons/ChevronLeft";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FormInput from "../CreateEventForm/FormInput";
import FormTextarea from "../CreateEventForm/FormTextarea";
import { Trash } from "lucide-react";
import AddParticipantsGroup from "./AddParticipantsGroup";
import ParticipantCard from "./ParticipantCard";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../../config/db.js";
import { useSocket } from "@/contexts/SocketContext.js";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext.js";
import { useApi } from "@/contexts/ApiContext.js";
import { ApiCalls } from "@/services/api.js";
import RenderLoadingState from "../utils/RenderLoadingState.js";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg", "webm", "svg"];
const GroupSchema = z.object({
  nome: z
    .string()
    .min(1, "il nome è obbligatorio")
    .min(3, " il nome deve avere minimo 3 caratteri")
    .max(20, "il nome è troppo lungo")
    .regex(
      /^[a-zA-Z0-9\s\u00C0-\u017F!?.()\-@#&]+$/u,
      "Il nome contiene caratteri non validi",
    ),
  descrizione: z
    .string()
    .min(1, "la descrizione è obbligatoria")
    .min(10, "la descrizione deve essere minimo 10 caratteri")
    .max(350, "La descrizione può essere massimo 350 caratteri"),
});
const CreateGroupForm = () => {
  const methods = useForm({
    resolver: zodResolver(GroupSchema),
    mode: "onSubmit",
  });
  const [groupImage, setGroupImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [participantsError, setParticipantsError] = useState(null);
  const [isParticipantsAdd, setIsParticipantsAdd] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const { session } = useAuth();
  const { executeApiCall, error, loading } = useApi();
  const { setMobileView } = useMobileLayout();
  const { currentSocket } = useSocket();
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.type.split("/")[1];
    file.name;
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setImageError({
        message: `Accettiamo solo ${ACCEPTED_EXTENSIONS.join(", ")}`,
      });

      event.target.value = null;
      return;
    } else {
      setImageError(null);
    }
    file.name.split(".").pop();
    setGroupImage({
      file: file, // <--- Qui salviamo l'oggetto File integro
      type: file.type,
      ext: file.name.split(".").pop(),

      name: "cover",
      url: URL.createObjectURL(file),
    });
    event.target.value = null;
  };
  const handleButtonClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = methods;

  const onSubmit = async (data) => {
    if (currentParticipants.length < 2) {
      setParticipantsError({ message: "Inserisci almeno due partecipanti" });
      return;
    } else {
      setParticipantsError(null);
    }
    try {
      const saveData = async (data) => {
        let finalImgUrl = null;
        console.log(data);
        const groupId = data.group_id;
        if (groupImage) {
          const fileName = `${groupId}/cover.${groupImage.ext}`;
          const filePath = `${fileName}`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("group_cover_pics")
              .upload(filePath, groupImage.file, {
                upsert: true,
                contentType: groupImage.type,
                cacheControl: "3600",
              });
          if (uploadError) throw new Error(uploadError);
          const { data: urlData } = supabase.storage
            .from("group_cover_pics")
            .getPublicUrl(uploadData.path);

          const { data: coverData, error: coverError } = await supabase
            .from("gruppi")
            .update({ group_cover_img: urlData.publicUrl })
            .eq("group_id", groupId);
          if (coverError) throw new Error(coverError);
          finalImgUrl = urlData.publicUrl;
        }
        currentSocket.emit(
          "add_new_group",
          groupId,
          data.groupData,

          finalImgUrl,
          session.user.id,
        );
        setMobileView("");
      };

      executeApiCall(
        "new_group",
        () => {
          return ApiCalls.createGroup(session.access_token, {
            ...data,
            participants: currentParticipants,
          });
        },
        saveData,
      );
    } catch (error) {
      setError("root", { message: `errore: ${error}` });
    }
  };
  useEffect(() => {
    if (currentParticipants.length >= 2) {
      setParticipantsError(null);
    }
  }, [currentParticipants]);
  useEffect(() => {
    if (error?.new_group) {
      setError("root", { message: error?.new_group?.message });
    }
  }, [error?.new_group]);

  if (loading?.new_group) {
    return <RenderLoadingState type={"new_group"} />;
  }

  return (
    <div className="w-full h-screen bg-bg-1 flex flex-col overflow-hidden relative">
      {isParticipantsAdd ? (
        <AddParticipantsGroup
          setIsParticipantsAdd={setIsParticipantsAdd}
          setCurrentParticipants={setCurrentParticipants}
          currentParticipants={currentParticipants}
        />
      ) : (
        <>
          {/* Header della Schermata (Fisso in alto grazie alla struttura flex) */}
          <div className="px-4 py-3 border-b border-bg-3/60 bg-bg-1 flex-shrink-0 flex justify-between items-center">
            <div className="flex flex-row gap-2 items-center min-w-0">
              <button
                type="button"
                onClick={() => setMobileView("")}
                className="w-9 h-9 flex items-center justify-center rounded-full text-primary active:bg-bg-2 transition-colors cursor-pointer"
                aria-label="Torna indietro"
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
              </button>
              <h1 className="text-text-1 font-title font-bold text-lg truncate">
                Crea un gruppo
              </h1>
            </div>
          </div>

          {/* Corpo del Form (Scorrevole) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }}
            className="flex-1 flex flex-col justify-between overflow-hidden"
          >
            {/* Container Campi con Scroll Dedicato */}
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5 pb-28">
              {/* Sezione Caricamento Immagine Profilo Gruppo */}
              <div className="w-full flex flex-col items-center gap-3">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                {groupImage == null ? (
                  <div className="flex flex-col gap-2 items-center">
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="w-24 h-24 rounded-full overflow-hidden bg-bg-2 flex items-center justify-center transition-transform shadow-sm border border-bg-3/40 cursor-pointer text-text-3"
                      aria-label="Aggiungi immagine del gruppo"
                    >
                      <DefaultGroupIcon />
                    </button>
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="text-xs font-body text-primary font-bold active:opacity-70"
                    >
                      Inserisci un'immagine di copertina
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 relative">
                    <img
                      src={groupImage.url}
                      alt="Anteprima copertina gruppo"
                      className="w-full h-full object-cover rounded-full border border-bg-3/60 shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-md transition-transform cursor-pointer"
                      onClick={() => setGroupImage(null)}
                    >
                      <Trash size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                )}

                {imageError && (
                  <p className="text-[11px] font-body font-bold text-red-500 text-center">
                    {imageError.message}
                  </p>
                )}
              </div>

              {/* Input per il Nome del Gruppo */}
              <FormInput
                error={errors.nome}
                label="Nome gruppo"
                placeholder="Es. Calcetto del Giovedì"
                register={register}
                id="nome"
                type="text"
              />

              {/* Input per la Descrizione */}
              <FormTextarea
                id="descrizione"
                label="Descrizione"
                placeholder="Aggiungi i dettagli o le regole del gruppo..."
                register={register}
                error={errors.descrizione}
              />

              {/* Sezione Orizzontale Partecipanti */}
              <div className="flex flex-col gap-2">
                <h3 className="text-text-1 font-body text-xs font-bold uppercase tracking-wider pl-1">
                  Partecipanti Gruppo
                </h3>

                <div className="flex flex-row gap-3 items-center overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                  {/* Bottone Selettore "+" */}
                  <button
                    type="button"
                    onClick={() => setIsParticipantsAdd(true)}
                    className={`
                  w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center 
                  border-2 border-dashed transition-all cursor-pointer bg-bg-2
                  ${
                    participantsError
                      ? "border-red-500 bg-red-50/10 text-red-500 ring-2 ring-red-500/20"
                      : "border-text-3 text-text-3 active:bg-bg-3/40"
                  }
                `}
                  >
                    <span className="text-2xl font-light font-body -mt-0.5">
                      +
                    </span>
                  </button>

                  {/* Lista Orizzontale delle Card Partecipanti */}
                  <div className="flex flex-row gap-2 min-w-0 min-h-20">
                    {currentParticipants.map((participant) => (
                      <ParticipantCard
                        key={participant.id}
                        {...participant}
                        setCurrentParticipants={setCurrentParticipants}
                      />
                    ))}
                  </div>
                </div>

                {participantsError && (
                  <p className="text-[11px] font-body font-bold text-red-500 pl-1 mt-0.5">
                    {participantsError.message}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Fisso Bottom Bar (Unificato con il design di Hangie) */}
            <div className="absolute bottom-0 left-0 right-0 h-20 px-4 bg-bg-1/95 backdrop-blur-md border-t border-bg-3/40 flex items-center justify-center z-50">
              <div className="w-full max-w-sm mx-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary text-white font-body font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-primary/10"
                >
                  {isSubmitting ? "Creazione..." : "Crea Gruppo"}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateGroupForm;
