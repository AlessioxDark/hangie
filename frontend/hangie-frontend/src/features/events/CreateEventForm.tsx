import { useChat } from "@/contexts/ChatContext.js";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

// Componente Textarea
import { supabase } from "../../config/db.js";
import FormInputCollection from "../CreateEventForm/FormInputCollection.js";
import ChevronLeft from "@/assets/icons/ChevronLeft.tsx";
import ChevronRight from "@/assets/icons/ChevronRight.tsx";
import { useScreen } from "@/contexts/ScreenContext.tsx";
import { useSocket } from "@/contexts/SocketContext.tsx";
import { useApi } from "@/contexts/ApiContext.tsx";
import { ApiCalls } from "@/services/api.tsx";
import RenderLoadingState from "../utils/RenderLoadingState.js";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext.js";

const EventSchema = z
  .object({
    titolo: z.string().min(1, "il titolo è obbligatorio"),
    descrizione: z
      .string()
      .min(1, "la descrizione è obbligatoria")
      .min(30, "la descrizione deve essere minimo 30 caratteri")
      .max(350, "La descrizione può essere massimo 350 caratteri"),
    data: z
      .string()
      .min(1, "La data dell'evento è obbligatoria")
      .pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
      .refine((date) => date > new Date(), {
        message: "La data dell'evento deve essere futura.",
      }),
    data_scadenza: z
      .string()
      .min(1, "La data di scadenza è obbligatoria")
      .pipe(z.coerce.date()) // Trasforma la stringa (data HTML) in Date object
      .refine((date) => date > new Date(), {
        message: "La data di scadenza deve essere futura.",
      }),
    indirizzo: z.string().min(1, "l'indirizzo è obbligatorio"),
    costo: z
      .any() // Accettiamo inizialmente qualsiasi cosa (stringa vuota o numero)
      .refine((val) => val !== "" && val !== undefined && val !== null, {
        message: "Il costo è obbligatorio",
      })
      .transform((val) => Number(val)) // Convertiamo in numero
      .refine((val) => !isNaN(val), {
        message: "Deve essere un numero valido",
      })
      .refine((val) => val >= 0, {
        message: "Non può essere negativo",
      })
      .refine((val) => val === 0 || val >= 1, {
        message: "Minimo 1€ (o 0 per gratis)",
      }),
    cap: z
      .string()
      .min(5, "il cap deve essere composto da 5 cifre")
      .max(5, "il cap deve essere composto da 5 numeri"),
    citta: z.string().min(1, "La città e obbligatoria"),
    nome_luogo: z.string().min(1, "è obbligatorio dare un nome al luogo"),
  })
  // 3. REGOLA COMPOSITA: Confronta data evento e scadenza
  .refine((data) => data.data > data.data_scadenza, {
    message:
      "La data dell'evento deve essere successiva alla scadenza iscrizione.",
    path: ["root"],
  });
const CreateEventForm = () => {
  const IMAGE_LIMIT = 4;
  const { closeModal } = useModal();
  const { session } = useAuth();
  // const { setCurrentChatData } = useChat();
  const { setMobileView } = useMobileLayout();
  const { currentSocket } = useSocket();
  const [images, setImages] = useState([]);

  const methods = useForm({
    resolver: zodResolver(EventSchema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = methods;
  const { currentGroup, currentGroupData } = useChat();
  const { error: errorsApi } = useApi();
  const { currentScreen } = useScreen();
  const { executeApiCall, loading } = useApi();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageError, setImageError] = useState(false); // Stato per l'errore
  const sendEvent = (event_id, event_details, message_details) => {
    currentSocket.emit(
      "send_event",
      event_id,
      currentGroup,
      event_details,
      message_details,
    );
  };

  const onSubmit = async (data) => {
    if (checkImagesError()) return;

    const handleUploadAndSocket = async (dataArrived) => {
      try {
        clearErrors("root");
        const newEventId = dataArrived.event_id;

        const uploadPromises = images.map(async (img) => {
          const fileExt = img.file.name.split(".").pop();
          const fileName = `${newEventId}/${img.name}.${fileExt}`;
          const filePath = `${fileName}`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("eventi").upload(filePath, img.file, {
              upsert: true,
              contentType: img.type,
              cacheControl: "3600",
            });

          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage
            .from("eventi")
            .getPublicUrl(uploadData.path);

          return urlData.publicUrl;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        const cover_url = uploadedUrls[0];
        const { error: coverError } = await supabase
          .from("eventi")
          .update({ cover_img: cover_url })
          .eq("event_id", newEventId);

        if (coverError) throw coverError;
        const otherImages = uploadedUrls
          .filter((url) => url !== cover_url)
          .map((url) => ({ img_url: url, event_id: newEventId }));
        if (otherImages.length > 0) {
          const { error: imgError } = await supabase
            .from("event_imgs")
            .insert(otherImages);
          if (imgError) throw imgError;
        }
        const newEventDetails = {
          ...dataArrived.messageDetails.eventi,
          cover_img: cover_url,
        };
        const messageDetails = dataArrived.messageDetails;
        sendEvent(newEventId, newEventDetails, messageDetails);
        setMobileView("");
      } catch (error) {
        setError("root", {
          message: error.message || "Qualcosa è andato storto",
        });
      }
    };

    executeApiCall(
      "add_event",
      () => {
        return ApiCalls.addNewEvent(session.access_token, {
          data: {
            ...data,
            group_id: currentGroup,
            images: images,
          },
        });
      },
      handleUploadAndSocket,
    );
  };

  const checkImagesError = () => {
    if (images.length == 0) {
      setImageError({
        message: "inserisci almeno un'immagine",
      });
      return true;
    }
    if (images.length > IMAGE_LIMIT) {
      setImageError({
        message: `Puoi inserire massimo ${IMAGE_LIMIT} immagini`,
      });
      return true;
    }
    setImageError(false);
    return false;
  };

  const handleNextStepMobile = async () => {
    const fieldsByStep = {
      1: ["titolo", "descrizione"],
      2: ["data", "data_scadenza", "costo"],
    };
    if (currentStep == 1) {
      const imageErr = checkImagesError();

      if (imageErr) return;
    }
    const result = await trigger(fieldsByStep[currentStep]);
    if (result && currentStep < 3) {
      setCurrentStep((lastStep) => lastStep + 1);
    }
  };
  const handleLastStepMobile = () => {
    if (currentStep >= 2) {
      setCurrentStep((lastStep) => lastStep - 1);
    } else {
      setMobileView("");
    }
  };
  useEffect(() => {
    if (errorsApi?.add_event) {
      setError("root", {
        message: errorsApi.add_event.message,
        details: errorsApi.add_event.details,
      });
    } else {
      // Se non c'è più l'errore nell'API, pulisci il root nel form
      clearErrors("root");
    }
  }, [errorsApi?.add_event]);

  if (loading.add_event) {
    return <RenderLoadingState type={"add_event"} />;
  }
  return (
    <div className="w-full h-screen bg-bg-1 flex flex-col overflow-hidden relative">
      <form
        className="flex flex-col h-full"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)();
        }}
      >
        {/* Header della Schermata */}
        <div className="px-4 py-3 border-b border-bg-3/60 bg-bg-1 flex-shrink-0 flex justify-between items-center">
          <div className="flex flex-row gap-2 items-center min-w-0">
            <button
              type="button"
              onClick={handleLastStepMobile}
              className="w-9 h-9 flex items-center justify-center rounded-full text-text-2 active:bg-bg-2 transition-colors cursor-pointer"
              aria-label="Torna al passaggio precedente"
            >
              <ChevronLeft color="currentColor" />
            </button>
            <h1 className="text-text-1 font-title font-bold text-lg truncate">
              Crea Evento
            </h1>
          </div>

          {/* Indicatore del Passaggio Corrente (Stile Mobile Nativo) */}
          <span className="text-xs font-body font-bold text-text-3 bg-bg-2 px-2.5 py-1 rounded-md">
            Step {currentStep} di 3
          </span>
        </div>

        {/* Area Contenuto del Form (Scorrevole) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
          <FormInputCollection
            register={register}
            errors={errors}
            imageError={imageError}
            setImageError={setImageError}
            images={images}
            setImages={setImages}
            currentStep={currentStep}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 px-4 bg-bg-1/95 backdrop-blur-md border-t border-bg-3/40 flex items-center justify-center z-50">
          <div
            className="fixed bottom-5 right-5 flex items-center justify-center  font-body text-xs text-primary bg-primary p-3 rounded-full"
            onClick={handleNextStepMobile}
          >
            {currentStep <= 2 ? (
              <div className="w-6 h-6">
                <ChevronRight color="#ffffff" />
              </div>
            ) : (
              <button type="submit" className="w-6 h-6">
                <CheckIcon color="#ffffff" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
