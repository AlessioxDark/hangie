import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";
import { useChat } from "@/contexts/ChatContext";
import { useSocket } from "@/contexts/SocketContext";
import { Edit2, X } from "lucide-react";
import React, { useMemo, useRef } from "react";
import { supabase } from "../../../config/db.js";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg", "webm", "svg"];

const EditableImg = ({
  isAdmin,
  currentEditingField,
  setCurrentEditingField,
  setFormError,
  localGroupData,
  setLocalGroupData,
  formError,
  handleFinishEdit,
  currentParticipants,
}) => {
  const { setGroupsData, currentGroupData, setCurrentGroupData, currentGroup } =
    useChat();
  const fileInputRef = useRef(null);
  const displayImage = useMemo(() => {
    if (!localGroupData?.group_cover_img) return null;

    // Usa il timestamp dell'ultimo aggiornamento o una stringa fissa
    // Se updated_at non c'è, non mettere Date.now(), metti una stringa vuota o nulla
    const version = currentGroupData?.updated_at
      ? new Date(currentGroupData.updated_at).getTime()
      : "1";

    return `${localGroupData.group_cover_img}?v=${version}`;
  }, [localGroupData?.group_cover_img, currentGroupData?.updated_at]);
  const { currentSocket } = useSocket();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${currentGroup}/cover.${ext}`;
      const filePath = `${fileName}`;
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setFormError({
          type: "img",
          message: `inserire solo file tipi: ${ACCEPTED_EXTENSIONS.join(", ")}`,
        });
        return;
      }
      setFormError(null);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("group_cover_pics")
        .update(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });
      if (uploadError) {
        setFormError("img", { message: uploadError.message });
        return;
      }
      const { data: urlData } = supabase.storage
        .from("group_cover_pics")
        .getPublicUrl(uploadData.path);
      const { data: coverData, error: coverError } = await supabase
        .from("gruppi")
        .update({ group_cover_img: urlData.publicUrl })
        .eq("group_id", currentGroup);
      if (coverError) setFormError("img", { message: coverError.message });
      setLocalGroupData((prev) => {
        return { ...prev, group_cover_img: urlData.publicUrl };
      });
      setCurrentGroupData((prevData) => {
        return { ...prevData, group_cover_img: urlData.publicUrl };
      });
      setGroupsData((prevData) => {
        return prevData.map((group) => {
          if (group.group_id == currentGroup) {
            return { ...group, group_cover_img: urlData.publicUrl };
          }
          return group;
        });
      });
      currentSocket.emit(
        "edit_field",
        currentGroup,
        "group_cover_img",
        urlData.publicUrl,
        currentParticipants,
      );
    } catch (error) {
      setFormError("img", { message: error.message });
    }
  };
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-6 items-center">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
          <div className="flex flex-col gap-2 w-full items-center">
            {localGroupData?.group_cover_img == null ? (
              <div
                className="rounded-full w-48 h-48 "
                onClick={() => {
                  fileInputRef.current.click();
                }}
              >
                <DefaultGroupIcon />
              </div>
            ) : (
              <img
                src={displayImage}
                alt=""
                className="w-48 h-48 rounded-full"
                onClick={() => {
                  fileInputRef.current.click();
                }}
              />
            )}
            {formError && formError.type == "img" && (
              <span className="text-sm font-body  text-red-500 ">
                {formError.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col text-center font-body">
          <div className="relative">
            {isAdmin && (
              <div
                className="absolute rounded-full -top-2.5 -right-5 rotate-270 p-1.5 bg-primary"
                onClick={() => {
                  if (currentEditingField != "nome") {
                    setCurrentEditingField("nome");
                  } else {
                    if (localGroupData.nome !== currentGroupData.nome) {
                      handleFinishEdit();
                    } else {
                      setCurrentEditingField("");
                    }
                  }
                }}
              >
                {currentEditingField == "nome" ? (
                  <X fill="#ffffff" stroke="#ffffff" size={12} />
                ) : (
                  <Edit2 fill="#ffffff" stroke="#ffffff" size={12} />
                )}
              </div>
            )}

            {currentEditingField == "nome" ? (
              <div className="flex flex-col gap-1.5 items-center w-full">
                <input
                  type="text"
                  autoFocus
                  value={localGroupData.nome}
                  onChange={(e) =>
                    setLocalGroupData((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  className="text-xl font-title font-bold text-text-1 bg-bg-2 border-b-2 border-primary px-2 py-0.5 outline-none text-center rounded-t-md max-w-xs"
                />
                {formError?.type === "nome" && (
                  <p className="text-[11px] font-body font-bold text-red-500">
                    {formError.message}
                  </p>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-text-1 leading-tight">
                {localGroupData.nome}
              </h1>
            )}
          </div>
          <p className="text-text-2 text-zinc-400 text-base font-medium">
            Gruppo • {currentGroupData?.partecipanti_gruppo.length} partecipanti
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditableImg;
