import { useProfile } from "@/contexts/ProfileContext";
import SidebarIcons from "@/utils/SidebarIcons";
import React from "react";
import { Link } from "react-router-dom";

const BottomNav = () => {
  type ValidPath = `/${string}`;
  const { defaultHandle } = useProfile();
  const isLinkActive = (linkPath: ValidPath): boolean => {
    // Gestione più robusta del path attivo
    if (linkPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(linkPath);
  };
  type SidebarLinksType = {
    id: number;
    title: "Home" | "Chats" | "Profilo" | "Amici";
    link: ValidPath;
    description: string;
  };
  const sidebarLinks: SidebarLinksType[] = [
    {
      id: 1,
      title: "Home",
      link: "/",
      description: "Scopri nuovi eventi",
    },
    {
      id: 2,
      title: "Chats",

      link: "/chats",
      description: "I tuoi messaggi",
    },
    {
      id: 3,
      title: "Amici",
      link: "/friends",
      description: "I tuoi eventi",
    },
    {
      id: 4,
      title: "Profilo",
      link: `/profile/${defaultHandle}`,
      description: "Impostazioni account",
    },
  ];
  return (
    <div
      className="
    fixed bottom-0 left-0 right-0 z-50 
    h-16 flex flex-row items-center justify-around 
    bg-bg-1 border-t border-neutral-300/70
    pb-safe-bottom
  "
      role="navigation"
      aria-label="Menu principale mobile"
    >
      {sidebarLinks.map((link) => {
        const isActive = isLinkActive(link.link);

        return (
          <Link
            to={link.link}
            key={link.id}
            className={`
          flex flex-col items-center justify-center flex-1 h-full gap-1
          transition-all duration-200 
          ${isActive ? "text-primary" : "text-text-2"}
        `}
            aria-label={link.description}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Un leggero contenitore attorno all'icona per dare struttura visiva */}
            <div className={`p-1 rounded-xl ${isActive ? "bg-primary/5" : ""}`}>
              <SidebarIcons isActive={isActive} title={link.title} />
            </div>

            <span className="font-body font-medium text-[11px] tracking-wide leading-none">
              {link.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
