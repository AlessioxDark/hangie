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
import { Calendar } from "lucide-react";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";

const Sep = () => <div className="w-px h-7 rounded-full bg-bg-3" />;

const TABS = [
  { id: "programma", label: "In programma" },
  { id: "organizzati", label: "Organizzati" },
  { id: "passati", label: "Passati" },
];

const TabBar = ({ active, onChange }) => (
  <div className="flex border-b border-bg-3 sticky top-14 z-[200] bg-bg-1 transition-shadow duration-200">
    {TABS.map((t) => {
      const on = active === t.id;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 ${
            on ? "text-primary border-primary" : "text-text-3"
          }`}
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
    <div className="flex flex-col items-center justify-center min-h-[150px] py-12 px-6 w-full h-full  group">
      {/* Icona con cerchio di sfondo sfumato e transizione hover */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Cerchio posteriore morbido con transizione al passaggio del mouse */}
        <div className="absolute w-14 h-14 bg-gray-100/80 rounded-full group-hover:bg-gray-100 group-hover:scale-105 transition-all duration-300" />

        {/* Render dell'icona */}
        <Calendar className="relative w-7 h-7 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Titolo principale */}
      <h3 className="text-base font-semibold text-gray-800 mb-1.5 text-center tracking-tight">
        {e.label}
      </h3>

      {/* Descrizione (Call to Action invisibile per l'utente) */}
      <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
        {e.sub}
      </p>
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
    <div className="w-full min-h-screen bg-bg-1 flex flex-col select-none">
      {/* ── HEADER NAVIGATION BAR (Fisso in cima) ── */}
      <div className="w-full px-4 h-14 border-b border-bg-3/60 flex flex-row items-center justify-between sticky top-0 bg-bg-1/95 backdrop-blur-md z-[100]">
        {!isOwnProfile ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 -ml-1.5 flex items-center justify-center rounded-full text-primary active:bg-bg-2 cursor-pointer transition-colors"
            aria-label="Torna indietro"
          >
            <ChevronLeft size={22} strokeWidth={2.5} className="text-current" />
          </button>
        ) : (
          <div className="font-title text-base font-bold text-text-1">
            Il tuo Profilo
          </div>
        )}

        {isOwnProfile && (
          <button
            type="button"
            onClick={handleLogoutUser}
            className="h-8 px-3.5 bg-red-500/10 text-red-600 font-body font-bold text-xs rounded-xl transition-transform cursor-pointer flex items-center justify-center"
          >
            Logout
          </button>
        )}
      </div>

      {/* ── CORPO PROFILO (Scorre normalmente) ── */}
      <div className="w-full flex flex-col bg-bg-1">
        {/* Blocco Dati Utente: Avatar, Nome, Karma */}
        <div className="flex flex-row items-center justify-between gap-3 px-4 pt-4 pb-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-bg-2 border border-bg-3/30 shrink-0">
              <ProfileIcon profile_pic={profileData?.profile_pic} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-title font-bold leading-tight text-text-1 truncate">
                {profileData?.nome ?? "Utente"}
              </h1>
              <p className="text-xs font-body text-text-3 truncate mt-0.5">
                @{profileData?.handle}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <KarmaBadge points={karma} />
          </div>
        </div>

        {/* Sezione Biografia Utente */}
        {profileData?.biografia && (
          <div className="mx-4 mb-4 px-3.5 py-2.5 bg-bg-2/40 border border-bg-3/40 rounded-xl">
            <p className="text-xs font-body leading-relaxed break-words text-text-2 whitespace-pre-line">
              {profileData.biografia}
            </p>
          </div>
        )}

        {/* Griglia Contatori Statistiche */}
        <div className="flex items-center justify-around px-2 pb-4 pt-1">
          <StatBlock
            value={profileData?.acceptedEventsCount || 0}
            label="Uscite"
          />
          <Sep />
          <StatBlock
            value={profileData?.createdEventsCount || 0}
            label="Organizzate"
          />
          <Sep />
          <StatBlock
            value={profileData?.pastAttendedCount || 0}
            label="Passate"
          />
          <Sep />
          <StatBlock value={profileData?.friendsCount || 0} label="Amici" />
        </div>

        {/* Pulsante di Invito/Azione Rapida */}
        {!isOwnProfile && (
          <div className="px-4 pb-4">
            <button
              type="button"
              className="w-full h-11 rounded-xl font-body text-xs font-bold text-white bg-primary transition-all cursor-pointer shadow-sm shadow-primary/10 flex items-center justify-center"
            >
              Aggiungi amico
            </button>
          </div>
        )}

        {/* ── LE TABS ANCORATE ── */}
        {/* Quando lo scroll le spinge in alto, si bloccano a top-14 (sotto l'header) */}
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── SEZIONE EVENTI FILTRATI ── */}
      <div className="px-4 pt-4 flex flex-col gap-3 flex-1 bg-bg-1">
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center font-body text-[11px] font-bold text-text-3 pt-4 pb-6 tracking-wide">
            {filtered.length}{" "}
            {filtered.length !== 1 ? "eventi trovati" : "evento trovato"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
