import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useSocket } from "@/contexts/SocketContext";
import { ApiCalls } from "@/services/api";
import React from "react";
import { useNavigate } from "react-router";

const LeaveButton = () => {
  const { session } = useAuth();
  const { currentGroup, setCurrentGroup, setGroupsData, setHomeEventsData } =
    useChat();
  const { currentSocket } = useSocket();
  const { executeApiCall } = useApi();
  const handleLeaveGroup = async () => {
    // Salviamo i riferimenti prima di azzerarli
    const groupToLeave = currentGroup;
    const myId = session?.user?.id;

    if (!groupToLeave || !myId) return;

    const saveData = () => {
      // 🚀 1. Avvisiamo il server e gli altri utenti via Socket (Spara e fuggi)
      currentSocket.emit("leave_group", groupToLeave, myId);
    };
    executeApiCall(
      "leave_group",
      () => {
        return ApiCalls.handleLeaveGroup(session.access_token, currentGroup);
      },
      saveData,
    );
  };
  return (
    <section className="w-full px-4 mt-4">
      <button
        className="w-full py-4 text-white  bg-red-500 font-semibold rounded-2xl active:bg-red-400 transition-all shadow-sm"
        onClick={() => {
          handleLeaveGroup();
        }}
      >
        Abbandona Gruppo
      </button>
    </section>
  );
};

export default LeaveButton;
