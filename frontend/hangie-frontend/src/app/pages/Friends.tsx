import SearchBar from "@/components/SearchBar";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import RenderErrorState from "@/features/utils/RenderErrorState";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
import { ApiCalls } from "@/services/api";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react"; // Se non hai lucide-react, usa un testo come "V"
import FriendItem from "@/components/friends/FriendItem";
import { useFriends } from "@/contexts/FriendsContext";
const Friends = () => {
  const [query, setQuery] = useState("");
  const { error } = useApi();
  const [isPendingCollapsed, setIsPendingCollapsed] = useState(false);
  const [isAcceptedCollapsed, setIsAcceptedCollapsed] = useState(false);
  const {
    friendsData,
    globalFriendships,
    getFriendsByQuery,
    pendingFriends,
    acceptedFriends,
    setFriendsData,

    setGlobalFriendships,
  } = useFriends();

  useEffect(() => {
    if (query.length < 3) {
      setGlobalFriendships([]);
      return;
    }

    const handler = setTimeout(() => {
      getFriendsByQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query, getFriendsByQuery]);
  const renderContent = () => {
    if (error && error?.friends) {
      return <RenderErrorState reloadFunction={friendsData} type={"friends"} />;
    }

    if (query === "") {
      return (
        <div className="flex flex-col gap-5 w-full">
          {/* SEZIONE RICHIESTE PENDENTI */}
          <div className="flex flex-col gap-2">
            {/* Header Collassabile Richieste */}
            <div
              onClick={() => setIsPendingCollapsed((prev) => !prev)}
              className="flex flex-row justify-between items-center py-1 cursor-pointer select-none active:opacity-70 transition-opacity"
            >
              <h2 className="font-title text-base font-bold text-text-1">
                Richieste di Amicizia ({pendingFriends.length})
              </h2>
              <ChevronDown
                size={20}
                className={`text-text-3 transition-transform duration-250 ${
                  isPendingCollapsed ? "-rotate-90" : ""
                }`}
              />
            </div>

            {/* Contenitore Lista Richieste */}
            <div
              className={`
        bg-bg-1 rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden
        ${
          isPendingCollapsed
            ? "max-h-0 opacity-0 border-transparent pointer-events-none"
            : "max-h-[1000px] opacity-100 border-neutral-300/80 shadow-sm"
        }
      `}
            >
              {pendingFriends.length > 0 ? (
                <div className="flex flex-col">
                  {pendingFriends.map((friend) => (
                    <FriendItem
                      key={friend.user_id}
                      friend={friend}
                      setFetchData={setFriendsData}
                      type="friend_request"
                    />
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs font-body font-medium text-text-3 italic text-center bg-bg-2/30">
                  Nessuna richiesta pendente
                </p>
              )}
            </div>
          </div>

          {/* SEZIONE AMICI ACCETTATI */}
          <div className="flex flex-col gap-2">
            {/* Header Collassabile Lista Amici */}
            <div
              onClick={() => setIsAcceptedCollapsed((prev) => !prev)}
              className="flex flex-row justify-between items-center py-1 cursor-pointer select-none active:opacity-70 transition-opacity"
            >
              <h2 className="font-title text-base font-bold text-text-1">
                Amici ({acceptedFriends.length})
              </h2>
              <ChevronDown
                size={20}
                className={`text-text-3 transition-transform duration-250 ${
                  isAcceptedCollapsed ? "-rotate-90" : ""
                }`}
              />
            </div>

            {/* Contenitore Lista Amici */}
            <div
              className={`
        bg-bg-1 rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden
        ${
          isAcceptedCollapsed
            ? "max-h-0 opacity-0 border-transparent pointer-events-none"
            : "max-h-[2000px] opacity-100 border-neutral-300/80 shadow-sm"
        }
      `}
            >
              {acceptedFriends.length > 0 ? (
                <div className="flex flex-col">
                  {acceptedFriends.map((friend) => (
                    <FriendItem
                      key={friend.user_id}
                      friend={friend}
                      setFetchData={setFriendsData}
                    />
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs font-body font-medium text-text-3 italic text-center bg-bg-2/30">
                  Non hai ancora aggiunto amici
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (query !== "") {
      const queryRegex = new RegExp(query, "i");

      // Cerca nei tuoi amici e richieste locali
      const localFriendsMatches = (friendsData || []).filter(
        (friend) =>
          friend.handle?.toLowerCase().match(queryRegex) ||
          friend.nome?.toLowerCase().match(queryRegex),
      );

      // Cerca negli utenti globali
      const globalMatches = (globalFriendships || []).filter(
        (friend) =>
          friend.handle?.toLowerCase().match(queryRegex) ||
          friend.nome?.toLowerCase().match(queryRegex),
      );

      // Unisci e rimuovi eventuali duplicati
      const allFriendsMap = new Map();
      localFriendsMatches.forEach((f) => allFriendsMap.set(f.user_id, f));
      globalMatches.forEach((f) => {
        if (!allFriendsMap.has(f.user_id)) {
          allFriendsMap.set(f.user_id, f);
        }
      });
      const allFriends = Array.from(allFriendsMap.values());
      return (
        <div className="bg-bg-1 rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden max-h-[2000px] opacity-100 border-neutral-300/80 shadow-sm">
          {allFriends.length > 0 ? (
            allFriends.map((friend) => {
              return (
                <FriendItem
                  key={`${friend.user_id}-${friend.status}`}
                  friend={friend}
                  setFetchData={setFriendsData}
                />
              );
            })
          ) : (
            <p className="p-4 text-sm text-text-2 italic">
              Non è stato trovato nulla per la ricerca
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="">
      <div className="space-y-4  sticky top-0 bg-bg-1 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="font-title text-2xl font-bold text-text-1 tracking-tight">
              Amici
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              {acceptedFriends.length}
            </span>
          </div>
        </div>
        <SearchBar query={query} setQuery={setQuery} />
      </div>
      {renderContent()}
    </div>
  );
};

export default Friends;
