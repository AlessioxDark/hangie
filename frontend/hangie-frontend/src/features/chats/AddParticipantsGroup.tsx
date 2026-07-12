import ChevronLeft from "@/assets/icons/ChevronLeft";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import FriendCard from "../friends/FriendCard";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";
import RenderLoadingState from "../utils/RenderLoadingState";
import RenderErrorState from "../utils/RenderErrorState";
import { useApi } from "@/contexts/ApiContext";
import { ApiCalls } from "@/services/api";

const AddParticipantsGroup = ({
  setIsParticipantsAdd,
  setCurrentParticipants,
  currentParticipants,
  onConfirm,
  isGroup,
}) => {
  const [query, setQuery] = useState("");
  const [friendsData, setFriendsData] = useState([]);
  const [currentFriendsData, setCurrentFriendsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { session } = useAuth();
  const { error: errorApi, executeApiCall, loading } = useApi();
  const [error, setError] = useState(null);
  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const saveData = (data) => {
        const acceptedFriends = data.filter((f) => f.status == "accepted");
        setFriendsData(acceptedFriends);
        setCurrentFriendsData(acceptedFriends);
      };
      executeApiCall(
        "add_participants",
        () => {
          return ApiCalls.handleGetFriends(
            session.access_token,
            session.user.id,
          );
        },
        saveData,
      );
    } catch (error) {
      setError({ message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);
  useEffect(() => {
    if (errorApi?.add_participants) {
      setError({ message: errorApi.add_participants.message });
    }
  }, [errorApi?.new_participants]);
  useEffect(() => {
    if (query) {
      setCurrentFriendsData(() => {
        return friendsData.filter((friend) => {
          const pattern = new RegExp(`^${query}`, "i");
          if (friend.handle.match(pattern)) return friend;
        });
      });
    } else {
      setCurrentFriendsData(friendsData);
    }
  }, [query]);
  const [localParticipants, setLocalParticipants] =
    useState(currentParticipants);

  if (loading?.add_participants) {
    return <RenderLoadingState type={"add_participants"} />;
  }
  return (
    <div className="w-full h-screen bg-bg-1 flex flex-col overflow-hidden">
      {/* Header della Schermata Selettore */}
      <div className="px-4 py-3 border-b border-bg-3/60 bg-bg-1 flex-shrink-0 flex justify-between items-center">
        <div className="flex flex-row gap-2 items-center min-w-0">
          <button
            type="button"
            onClick={() => setIsParticipantsAdd(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-primary active:bg-bg-2 transition-colors cursor-pointer"
            aria-label="Annulla e torna indietro"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <h1 className="text-text-1 font-title font-bold text-lg truncate">
            Aggiungi partecipanti
          </h1>
        </div>

        {/* Tasto Invia / Salva nell'Header */}
        <button
          disabled={localParticipants.length === 0}
          onClick={() => {
            setCurrentParticipants([...localParticipants]);
            if (isGroup) {
              onConfirm(localParticipants);
            }
            setIsParticipantsAdd(false);
          }}
          className={`
        px-4 h-8 rounded-full font-body text-xs font-bold transition-all active:scale-95 cursor-pointer
        ${
          localParticipants.length === 0
            ? "bg-bg-3 text-text-3 opacity-50 cursor-not-allowed"
            : "bg-primary text-white shadow-sm shadow-primary/10"
        }
      `}
        >
          Fatto
        </button>
      </div>

      {/* Area di Ricerca e Lista Amici (Scorrevole) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Barra di Ricerca Integrata */}
        <div className="flex-shrink-0">
          <SearchBar query={query} setQuery={setQuery} />
        </div>

        {/* Switch degli Stati di Caricamento / Errore / Lista */}
        <div className="flex-1">
          {isLoading ? (
            <RenderLoadingState type="participant" />
          ) : error ? (
            <RenderErrorState
              errorMessage={error.message}
              reloadFunction={fetchFriends}
            />
          ) : (
            <div className="flex flex-col gap-1">
              {currentFriendsData?.map((friend) => (
                <FriendCard
                  key={friend.id || friend.uid}
                  friend={friend}
                  localParticipants={localParticipants}
                  setLocalParticipants={setLocalParticipants}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddParticipantsGroup;
