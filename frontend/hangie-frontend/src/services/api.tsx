const BASE_URL = "https://hangie-web.onrender.com/api";
// const BASE_URL = "http://localhost:3000/api";
const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { ...errorData, status: res.status };
  }
  const dataToSend = await res.json();

  return dataToSend.data !== undefined ? dataToSend.data : dataToSend;
};

export const ApiCalls = {
  fetchGroups: async (token: string) => {
    const res = await fetch(`${BASE_URL}/groups?t=${Date.now()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  AddParticipants: async (token: string, groupId: string, dataToSend) => {
    const res = await fetch(`${BASE_URL}/groups/add/participants/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  handleRemoveParticipant: async (
    token: string,
    groupId: string,
    dataToSend,
  ) => {
    const res = await fetch(
      `${BASE_URL}/groups/remove/participants/${groupId}`,
      {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return await handleResponse(res);
  },
  handleGetFriends: async (token: string, userId: string) => {
    const res = await fetch(`${BASE_URL}/friends/${userId}`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  handleDeleteFriend: async (token: string, dataToSend) => {
    const res = await fetch(`${BASE_URL}/friends/delete`, {
      method: "DELETE",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  handleGetProfile: async (handle: string) => {
    const res = await fetch(`${BASE_URL}/profile/${handle}`, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  handleGetFriendsByQuery: async (token: string, query: string) => {
    const res = await fetch(`${BASE_URL}/friends/query/${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  handleSendOrDeleteFriendRequest: async (token: string, dataToSend) => {
    const res = await fetch(`${BASE_URL}/friends/request`, {
      method: "POST",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  fetchSuspendedEvents: (token: string, offset: number) =>
    fetch(`${BASE_URL}/events/suspendedevenets/all`, {
      method: "POST",
      body: JSON.stringify({ offset }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  addNewEvent: (token: string, dataToSend) =>
    fetch(`${BASE_URL}/events/add/create-event`, {
      method: "POST",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),

  editGroupField: (token: string, groupId: string, dataToSend) =>
    fetch(`${BASE_URL}/groups/modify/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  MakeParticipantAdmin: (token: string, groupId: string, dataToSend) =>
    fetch(`${BASE_URL}/groups/modify/participants/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),

  handleLeaveGroup: async (token: string, groupId: string) => {
    const res = await fetch(`${BASE_URL}/groups/leave/${groupId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },

  fetchChat: async (groupId: string, token: string) => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  fetchEvent: async (eventId: string, token: string) => {
    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },
  deleteEvent: async (eventId: string, token: string) => {
    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },
  voteEvent: async (eventId: string, token: string, body) => {
    const res = await fetch(`${BASE_URL}/events/answer/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },

  fetchGroupEvents: (groupId: string, token: string) =>
    fetch(`${BASE_URL}/groups/${groupId}/group-events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),

  fetchHomeEvents: (offset: number, token: string) =>
    fetch(`${BASE_URL}/events/discover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ offset }),
    }).then(handleResponse),
  deleteGuest: async (token: string) => {
    const res = await fetch(`${BASE_URL}/profile/guest/removeall`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },
  addGuest: async (token: string, dataToSend) => {
    const res = await fetch(`${BASE_URL}/profile/guest/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });
    return await handleResponse(res);
  },
  signUp: async (token: string, dataToSend) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });
    return await handleResponse(res);
  },

  createGroup: async (token: string, dataToSend) => {
    const res = await fetch(`${BASE_URL}/groups/add/newGroup`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });
    return await handleResponse(res);
  },
};
