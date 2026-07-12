import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./pages/desktop/Login";
import SignUp from "./pages/desktop/SignUp";

import { ChatProvider } from "@/contexts/ChatContext";
import LayoutChatDesktop from "@/components/Layouts/chats/LayoutChatDesktop";
import EventDetailsModal from "@/features/modal/EventDetailsModal";
import ModalHandler from "@/features/modal/ModalHandler";
import { AuthContextProvider } from "../contexts/AuthContext";
import {
  ModalContext,
  ModalProvider,
  useModal,
} from "../contexts/ModalContext";
import Chats from "./pages/Chats";
import EventsSuspended from "./pages/EventsSuspended";
import Home from "./pages/Home";
import ResponsiveLayoutWrapper from "../components/Layouts/ResponsiveLayoutWrapper";
import { ScreenProvider } from "@/contexts/ScreenContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ApiContextProvider } from "@/contexts/ApiContext";
import AppRouter from "./AppRouter";
import { FriendsProvider } from "@/contexts/FriendsContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import AppWithContexts from "./AppWithContexts";

function App() {
  return (
    <ScreenProvider>
      <BrowserRouter>
        <AuthContextProvider>
          <AppWithContexts />
        </AuthContextProvider>
      </BrowserRouter>
    </ScreenProvider>
  );
}

export default App;
