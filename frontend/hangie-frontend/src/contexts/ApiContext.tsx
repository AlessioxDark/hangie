import React, { createContext, useCallback, useContext, useState } from "react";
export const ApiContext = createContext({
  executeApiCall: (arg, arg2, arg3) => {},
  loading: {},
  error: {},
});

export const useApi = () => {
  const context = useContext(ApiContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error("useChat deve essere usato all'interno di un ChatProvider");
  }

  return context;
};
export const ApiContextProvider = ({ children }) => {
  const [loading, setLoading] = useState({
    chat: false,
    home: false,
    groups: false,
    events: false,
    home_events: false,
    add_event: false,
    add_participants: false,
    edit_field: false,
    make_admin: false,
    leave_group: false,
    remove_participant: false,
    event: false,
    delete_event: false,
    vote_event: false,
    friends: false,
    profile: false,
    new_group: false,
    auth: false,
    log_out: false,
  });
  const [error, setError] = useState({
    chat: null,
    home: null,
    groups: null,
    events: null,
    home_events: null,
    add_event: null,
    add_participants: null,
    edit_field: null,
    make_admin: null,
    leave_group: null,
    remove_participant: null,
    event: null,
    delete_event: null,
    vote_event: null,
    friends: null,
    profile: null,
    new_group: null,
    auth: null,
    log_out: null,
  });

  const executeApiCall = useCallback(
    async (
      type:
        | "chat"
        | "groups"
        | "events"
        | "home"
        | "home_events"
        | "add_event"
        | "event"
        | "delete_event"
        | "vote_event"
        | "friends"
        | "profile"
        | "new_group"
        | "auth",
      fetchCall,
      onSuccess,
    ) => {
      try {
        setError((prev) => ({ ...prev, [type]: null }));
        setLoading((prev) => {
          return { ...prev, [type]: true };
        });
        const data = await fetchCall();
        console.log("rimango qua");
        onSuccess(data);
      } catch (err: any) {
        console.log("torno qui");
        setError((prev) => {
          return {
            ...prev,
            [type]: {
              message: err.message || "Errore di connessione",
              status: err.status || 500,
              at: Date.now(),
              details: err.details,
            },
          };
        });
      } finally {
        setLoading((prev) => {
          return { ...prev, [type]: false };
        });
      }
    },
    [],
  );
  return (
    <ApiContext.Provider value={{ loading, error, executeApiCall }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
