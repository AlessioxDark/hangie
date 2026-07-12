import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useScreen } from "./ScreenContext.js";
import { type Message, type UUID, type GroupData } from "../types/chat.tsx";
import { ApiCalls } from "@/services/api.tsx";
import { useApi } from "./ApiContext.tsx";
import { useNavigate, useParams } from "react-router";
import { useSocket } from "./SocketContext.tsx";

export const ChatContext = createContext({
  currentChatData: null,
  setCurrentChatData: (arg) => arg,
  currentGroup: null,
  setCurrentGroup: (arg) => arg,
  currentGroupData: {},
  setCurrentGroupData: (arg) => arg,
  groupsData: [],
  error: { chat: null, home: null, groups: null, events: null },
  groupEventsData: [],
  setGroupsData: (arg) => arg,
  fetchGroups: () => {},
  fetchGroupEvents: () => {},
  messagesMap: null,
  setMessagesMap: (arg) => arg,
  homeEventsData: [],
  homeOffset: 0,
  currentEventData: {},
  setCurrentEventData: (arg) => arg,
  loading: { chat: false, home: false, groups: false, events: false },
  setHomeEventsData: (arg) => arg,
  fetchEvents: (arg) => arg,
});

export const useChat = () => {
  const context = useContext(ChatContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error("useChat deve essere usato all'interno di un ChatProvider");
  }

  return context;
};

export const ChatProvider = ({ children }) => {
  const [currentChatData, setCurrentChatData] = useState<Message[] | null>(
    null,
  );
  const [currentGroup, setCurrentGroup] = useState<UUID | null>(null);
  const [currentGroupData, setCurrentGroupData] = useState<GroupData | null>(
    null,
  );
  const [messagesMap, setMessagesMap] = useState<Message[] | object>({});

  const [groupsData, setGroupsData] = useState<GroupData[] | null>([]);
  const { executeApiCall } = useApi();

  const [homeOffset, setHomeOffset] = useState(0);
  const [homeEventsData, setHomeEventsData] = useState<{
    pending: any[];
    accepted: any[];
    rejected: any[];
  }>({
    pending: [],
    accepted: [],
    rejected: [],
  });
  const [groupEventsData, setGroupEventsData] = useState(null);
  const [currentEventData, setCurrentEventData] = useState({});
  const { currentScreen } = useScreen();
  const { isAuthLoading, session } = useAuth();

  const fetchEvents = useCallback(async (): Promise<void> => {
    const saveData = (data) => {
      setHomeEventsData((prevData) => {
        const mergeAccepted = [...prevData.accepted, ...data.accepted];
        const dedupAccepted = Array.from(
          new Map(mergeAccepted.map((item) => [item.event_id, item])).values(),
        );
        const mergePending = [...prevData.pending, ...data.pending];
        const dedupPending = Array.from(
          new Map(mergePending.map((item) => [item.event_id, item])).values(),
        );

        return {
          pending: dedupPending,
          accepted: dedupAccepted,
          rejected: prevData.rejected, // fai uguale se ti serve
        };
      });
    };
    executeApiCall(
      "home",
      () => {
        return ApiCalls.fetchHomeEvents(homeOffset, session.access_token);
      },
      saveData,
    );
  }, [homeOffset, session, executeApiCall]);
  const fetchGroupEvents = useCallback(
    async (groupId) => {
      const idToUse = groupId || currentGroup;
      const saveData = (data) => {
        setGroupEventsData(data);
      };
      executeApiCall(
        "events",
        () => {
          return ApiCalls.fetchGroupEvents(idToUse, session?.access_token);
        },
        saveData,
      );
    },
    [session, executeApiCall, currentGroup],
  );
  const fetchGroups = useCallback(async () => {
    const saveData = (data) => {
      setGroupsData(data);
    };
    executeApiCall(
      "groups",
      () => {
        return ApiCalls.fetchGroups(session?.access_token);
      },
      saveData,
    );
  }, [session, executeApiCall]);
  const fetchChat = useCallback(
    async (groupId: UUID) => {
      if (!groupId || !session || isAuthLoading) return;

      const saveData = (groupData) => {
        const mappedMessages = groupData.messaggi.map((mess) => ({
          ...mess,
          isUser: mess.user_id === session.user.id,
        }));

        setCurrentChatData({
          ...groupData,
          messaggi: mappedMessages,
        });
        setMessagesMap((prev) => ({
          ...prev,
          [groupId]: [...mappedMessages],
        }));
      };

      executeApiCall(
        "chat",
        () => {
          return ApiCalls.fetchChat(groupId, session.access_token);
        },
        saveData,
      );
    },
    [session, executeApiCall],
  );
  const handleDeleteEvent = (eventId, saveData) => {
    executeApiCall(
      "delete_event",
      () => {
        return ApiCalls.deleteEvent(eventId, session.access_token);
      },
      saveData,
    );
  };
  const handleEventDecision = (eventId, body, saveData) => {
    executeApiCall(
      "vote_event",
      () => {
        return ApiCalls.voteEvent(eventId, session.access_token, body);
      },
      (data) => {
        // 1. Esegui il callback del socket passato dal componente
        saveData(data);

        // 2. Aggiorna lo stato locale degli eventi della Home per spostare l'evento nel tab corretto
        setHomeEventsData((prev) => {
          // Logica di spostamento dell'array (pending -> accepted / rejected)
          // basata sull'eventId e sul body.status inviato.
          return { ...prev };
        });
      },
    );
  };

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session, fetchGroups]);
  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [homeOffset, session, fetchEvents]);

  const loadAll = useCallback(
    (id) => {
      if (!id || !session) return;
      setCurrentGroup(id);
      fetchGroups(); // Aggiorna la lista gruppi
      fetchGroupEvents(id); // Carica eventi con ID fresco
      fetchChat(id); // Carica chat con ID fresco
    },
    [fetchGroups, fetchGroupEvents, fetchChat, session],
  );

  useEffect(() => {
    const match = location.pathname.match(/\/chats\/([^\/]+)/);
    const paramsGroupId = match ? match[1] : null;
    // Se l'ID nell'URL è diverso da quello in stato, carichiamo tutto
    if (paramsGroupId) {
      if (paramsGroupId !== currentGroup) {
        loadAll(paramsGroupId);
      }
    } else {
      setCurrentGroup(null);
    }
  }, [
    location.pathname,
    currentGroup,
    groupsData,
    groupEventsData,
    session,
    loadAll,
    isAuthLoading,
  ]);

  useEffect(() => {
    if (groupsData?.length > 0 && currentGroup) {
      const foundGroup = groupsData.find((g) => g.group_id === currentGroup);
      if (foundGroup) {
        setCurrentGroupData(foundGroup);
      }
    }
  }, [groupsData, currentGroup]);
  useEffect(() => {
    const isLargeScreen = currentScreen && currentScreen !== "xs";
    if (
      isLargeScreen &&
      !currentGroup &&
      groupsData &&
      groupsData?.length > 0
    ) {
      setCurrentGroup(groupsData[0].group_id);
      setCurrentGroupData(groupsData[0]);
    }
  }, [groupsData, currentGroup, currentScreen]);

  return (
    <ChatContext.Provider
      value={{
        currentChatData,
        setCurrentChatData,
        currentGroup,
        setCurrentGroup,
        currentGroupData,
        setCurrentGroupData,
        groupsData,
        setGroupsData,
        fetchGroups,
        messagesMap,
        setMessagesMap,
        homeEventsData,
        setHomeOffset,
        fetchGroupEvents,
        setCurrentEventData,
        currentEventData,
        setHomeEventsData,
        groupEventsData,
        setGroupEventsData,
        handleDeleteEvent,
        handleEventDecision,
        fetchEvents,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
