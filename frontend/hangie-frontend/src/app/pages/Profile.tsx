import ChevronLeft from "@/assets/icons/ChevronLeft";
import KarmaBadge from "@/components/profile/KarmaBadge";
import StatBlock from "@/components/profile/StatBlock";
import ProfileIcon from "@/components/ProfileIcon";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useProfile } from "@/contexts/ProfileContext";
import EventCard from "@/features/events/EventCard";
import RenderErrorState from "@/features/utils/RenderErrorState";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
import { ApiCalls } from "@/services/api";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";

const Sep = () => <div className="w-px h-7 rounded-full bg-bg-3" />;

const TABS = [
  { id: "programma", label: "In programma" },
  { id: "organizzati", label: "Organizzati" },
  { id: "passati", label: "Passati" },
];

const TabBar = ({ active, onChange }) => (
  <div className="flex border-b border-bg-3">
    {TABS.map((t) => {
      const on = active === t.id;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 ${on ? "text-primary border-primary" : "text-text-3"}`}
        >
          {t.label}
        </button>
      );
    })}
  </div>
);

const EMPTY_MAP = {
  programma: {
    label: "Nessun evento in programma",
    sub: "Aspetta un invito o proponi qualcosa al gruppo.",
  },
  organizzati: {
    label: "Nessun evento organizzato",
    sub: "Metti su qualcosa, il gruppo aspetta.",
  },
  passati: {
    label: "Nessun evento passato",
    sub: "Il meglio deve ancora venire.",
  },
};

const EmptyState = ({ tab }) => {
  const e = EMPTY_MAP[tab] ?? EMPTY_MAP.programma;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-bg-2 botder border-bg-3">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke={"#94a3b8"}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
      <p className="font-bold text-sm text-text-1">{e.label}</p>
      <p className="text-xs mt-1 leading-relaxed text-text-3">{e.sub}</p>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { profileData, getProfileData } = useProfile();
  const { session, LogoutUser } = useAuth();
  const { loading, error, executeApiCall } = useApi();
  const [activeTab, setActiveTab] = useState("programma");

  if (loading?.profile) return <RenderLoadingState type="profile" />;
  if (error?.profile)
    return <RenderErrorState type="profile" reloadFunction={getProfileData} />;
  if (loading?.log_out) return <RenderLoadingState type="log_out" />;
  if (error?.log_out)
    return <RenderErrorState type="log_out" reloadFunction={getProfileData} />;

  const now = new Date();
  const allEvents = [...(profileData?.newEventsData ?? [])];

  const getFilteredEvents = () => {
    if (activeTab === "programma")
      return allEvents.filter((e) => {
        const d = new Date(e.data);
        return d >= now && (e.status === "accepted" || e.status === "pending");
      });
    if (activeTab === "organizzati")
      return allEvents.filter((e) => e.created_by === session.user.id);
    if (activeTab === "passati")
      return allEvents.filter(
        (e) =>
          new Date(e.data) < now &&
          (e.status === "accepted" || e.status == "rejected"),
      );
    return [];
  };
  // risolcvere bug eventi gestire aspetto
  const filtered = getFilteredEvents();

  const karma = profileData?.karma ?? 82;
  const isOwnProfile = session.user.id == profileData?.user_id; // sostituisci con logica reale (es. profileData.user_id === currentUser.id)

  const handleLogoutUser = async () => {
    const isGuest = session?.user.is_anonymous;
    const token = session?.access_token;

    executeApiCall(
      "log_out",
      async () => {
        if (isGuest) {
          await ApiCalls.deleteGuest(token);
        }
      },
      () => {
        LogoutUser();
      },
    );
  };
  return (
    <div className="flex flex-col bg-bg-1">
      {/* ── HEADER CARD ── */}
      <div className="bg-bg-1 border-b border-bg-3">
        {/* Avatar + Name + Karma */}
        {!isOwnProfile ? (
          <div>
            <div className="w-8 h-8" onClick={() => navigate(-1)}>
              <ChevronLeft color={"#2463eb"} />
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-end px-4 pt-2.5">
            {" "}
            <button
              className=" px-5 py-2 text-white text-sm font-body  bg-red-500 font-semibold rounded-2xl active:bg-red-400 transition-all shadow-sm"
              onClick={handleLogoutUser}
            >
              Logout
            </button>
          </div>
        )}
        {/* rimozione ecc firneds, eventi e cosi in login ospite*/}
        <div
          className={`flex items-center justify-between gap-3  ${isOwnProfile && "pt-6"} pb-5 min-w-0 `}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden shrink-0">
              <ProfileIcon profile_pic={profileData?.profile_pic} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-black leading-tight text-text-1 truncate">
                {profileData?.nome ?? "Utente"}
              </h1>
              <p className="text-sm mt-0.5 text-text-3 truncate">
                @{profileData?.handle}
              </p>
            </div>
          </div>
          <KarmaBadge points={karma} />
        </div>
        {/* Bio */}
        {profileData?.biografia && (
          <div className="mx-4 mb-4 px-4 py-3 rounded-xl">
            <p className="text-sm leading-relaxed break-words text-text-2">
              {profileData.biografia}
            </p>
          </div>
        )}
        {/* Stats */}
        <div className="flex items-center justify-around px-4 pb-5">
          <StatBlock
            value={profileData?.acceptedEventsCount || 0}
            label="Uscite"
          />
          <Sep />
          <StatBlock
            value={profileData?.createdEventsCount}
            label="Organizzate"
          />
          <Sep />
          <StatBlock value={profileData?.pastAttendedCount} label="Passate" />
          <Sep />
          <StatBlock value={profileData?.friendsCount} label="Amici" />
        </div>
        {/* CTA */}
        <div className="px-4 pb-4 bg-bg-1">
          {!isOwnProfile && (
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 bg-primary">
                Aggiungi amico
              </button>
            </div>
          )}
        </div>
        {/* Tabs */}
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── EVENTI ── */}
      <div className="px-4 pt-4 space-y-3 flex flex-col">
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          filtered.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
      {filtered.length > 0 && (
        <p className="text-center text-xs mt-6 pb-2 font-semibold text-text-3">
          {filtered.length} event{filtered.length !== 1 ? "i" : "o"}
        </p>
      )}
    </div>
  );
};

export default Profile;
