import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { ApiCalls } from "@/services/api";
import { useEffect, useState } from "react";
import ProfileIcon from "../ProfileIcon";
import { useSocket } from "@/contexts/SocketContext";
import { useNavigate } from "react-router";

const FriendItem = ({ friend, setFetchData, type }) => {
  const { executeApiCall } = useApi();
  const { session } = useAuth();
  const { currentSocket } = useSocket();
  const navigate = useNavigate();
  const handleAction = async (actionType) => {
    // Mapping delle azioni verso lo status del DB
    const statusMap = {
      send: "pending",
      accept: "accepted",
      delete: "delete",
    };
    console.log("friend cliccato", friend);

    const apiStatus = statusMap[actionType];

    const updateUI = () => {
      if (setFetchData) {
        setFetchData((prevData) => {
          const data = prevData || [];

          if (actionType === "delete") {
            // Rimuovi completamente dall'array se annullata o rifiutata
            return data.filter((f) => f.user_id !== friend.user_id);
          }

          const exists = data.some((f) => f.user_id === friend.user_id);

          if (exists) {
            // Aggiorna lo stato se è già in friendsData
            return data.map((f) =>
              f.user_id === friend.user_id ? { ...f, status: apiStatus } : f,
            );
          } else {
            // Aggiungi all'array se abbiamo cercato globalmente e mandato una richiesta
            return [
              ...data,
              { ...friend, status: apiStatus, sender_id: session?.user?.id },
            ];
          }
        });
      }

      //socket
      if (actionType === "accept") {
        // Mandiamo un evento specifico per l'accettazione
        currentSocket.emit("accept_request", {
          sender_id: session.user.id,
          receiver_id: friend.user_id,
        });
      } else if (actionType == "delete") {
        currentSocket.emit("reject_request", {
          sender_id: session.user.id,
          receiver_id: friend.user_id,
          apiStatus: apiStatus,
        });
      } else {
        // Per invio o cancellazione usiamo quello standard
        currentSocket.emit("send_request", {
          sender_id: session.user.id,
          receiver_id: friend.user_id,
          apiStatus: apiStatus,
        });
      }
    };

    executeApiCall(
      "friends",
      () =>
        ApiCalls.handleSendOrDeleteFriendRequest(session.access_token, {
          status: apiStatus,
          user_id: session.user.id,
          friend_id: friend.user_id,
        }),
      updateUI,
    );
  };
  const deleteFriend = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const saveData = (data) => {
      currentSocket.emit("delete_friend", {
        user_id: session.user.id,
        friend_id: friend.user_id,
      });
    };
    executeApiCall(
      "friends",
      () => {
        return ApiCalls.handleDeleteFriend(session.access_token, {
          friend_id: friend.user_id,
        });
      },
      saveData,
    );
  };

  useEffect(() => {}, [friend]);
  return (
    <div
      onClick={() => navigate(`/profile/${friend.handle}`)}
      className="w-full flex flex-row justify-between items-center px-4 py-3 border-b border-bg-3/60 last:border-b-0 active:bg-bg-2 transition-colors select-none cursor-pointer"
    >
      {/* Info Utente: Avatar e Nome */}
      <div className="flex flex-row items-center gap-3 min-w-0 flex-1 mr-3">
        <div className="w-11 h-11 flex-shrink-0">
          <ProfileIcon profile_pic={friend.profile_pic} />
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-text-1 font-body font-bold text-sm truncate">
            {friend.nome}
          </h2>
          <span className="font-body text-xs text-text-3 truncate">
            @{friend.handle}
          </span>
        </div>
      </div>

      {/* Stati dell'Azione (Rendering Condizionale) */}
      <div className="flex flex-row gap-2 flex-shrink-0">
        {type === "friend_request" ||
        (friend.status === "pending" &&
          friend.sender_id !== session?.user?.id) ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction("accept");
              }}
              className="h-9 px-3.5 bg-primary text-white rounded-xl text-xs font-body font-bold active:scale-95 transition-transform cursor-pointer"
            >
              Accetta
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction("delete");
              }}
              className="h-9 px-3.5 bg-bg-2 text-text-2 border border-bg-3/80 rounded-xl text-xs font-body font-bold active:scale-95 transition-transform cursor-pointer"
            >
              Rifiuta
            </button>
          </>
        ) : friend.status === "accepted" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              deleteFriend();
            }}
            className="h-9 px-3.5 bg-red-500/10 text-red-600 rounded-xl text-xs font-body font-bold active:scale-95 transition-transform cursor-pointer"
          >
            Rimuovi
          </button>
        ) : friend.status === "pending" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAction("delete");
            }}
            className="h-9 px-3.5 bg-bg-2 text-text-3 border border-bg-3/80 rounded-xl text-xs font-body font-bold active:scale-95 transition-transform cursor-pointer"
          >
            Annulla
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAction("send");
            }}
            className="h-9 px-3.5 bg-primary text-white rounded-xl text-xs font-body font-bold active:scale-95 transition-transform cursor-pointer"
          >
            Aggiungi
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendItem;
