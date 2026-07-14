import GroupCard from "@/features/groups/GroupCard.js";
import { Plus } from "lucide-react";
import { useChat } from "@/contexts/ChatContext.js";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import RenderEmptyState from "../utils/RenderEmptyState";
import { useApi } from "@/contexts/ApiContext";
import { useMobileLayout } from "@/contexts/MobileLayoutChatContext";

const ChatsSidebar = () => {
  const { groupsData, fetchGroups } = useChat();
  const { setMobileView } = useMobileLayout();
  const { error, loading } = useApi();

  const renderContent = () => {
    if (loading.groups) {
      return <RenderLoadingState type="groups" />;
    }
    if (error && error.groups) {
      return <RenderErrorState type="groups" reloadFunction={fetchGroups} />;
    }
    if (groupsData?.length === 0) {
      return <RenderEmptyState type="groups" />;
    }
    if (groupsData) {
      return groupsData.map((group, i) => {
        return <GroupCard key={i} {...group} fullGroup={group} />;
      });
    }
  };

  return (
    <div className="w-full h-screen bg-bg-1 flex flex-col overflow-hidden pb-6">
      {/* Header: Titolo della sezione e Bottone Nuova Chat */}
      <div className="p-4 flex flex-row justify-between items-center border-b border-bg-3/60">
        <h1 className="font-title font-bold text-text-1 text-xl tracking-tight">
          Messaggi
        </h1>

        {/* Pulsante Crea Gruppo (Area touch ottimizzata con active) */}
        <button
          className="bg-primary rounded-full p-2.5 flex items-center justify-center transition-all active:scale-[0.93] cursor-pointer shadow-sm shadow-primary/10"
          onClick={() => {
            setMobileView("CREATE_GROUP");
          }}
          aria-label="Crea nuovo gruppo"
        >
          <Plus className="text-bg-1 w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Lista Scorrevole dei Gruppi/Chat */}
      <div className="flex-1 overflow-y-scroll min-h-0 pb-10 ">
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatsSidebar;
