import BottomNav from "@/app/pages/mobile/BottomNav";
import { useLocation } from "react-router";
const LayoutMobile = ({ children }) => {
  const location = useLocation();
  return (
    <div className="h-screen w-full flex flex-col justify-between  ">
      {location.pathname == "/" ? (
        <div className="">
          <header className="sticky top-0 z-30 w-full bg-bg-1 border-b border-neutral-300/60 pt-safe-top">
            <div className="flex w-full flex-row justify-between items-center px-4 py-3">
              {/* Logo e Nome App */}
              <div className="flex flex-row gap-2.5 items-center">
                <div className="bg-primary rounded-lg py-1 px-2 flex items-center justify-center">
                  <span className="font-title text-bg-1 font-black text-xl leading-none">
                    H
                  </span>
                </div>
                <h1 className="font-title font-bold text-xl text-text-1 tracking-tight">
                  HANGIE
                </h1>
              </div>

              {/* Spazio per eventuali icone future (es. Notifiche o Profilo) */}
              <div className="flex items-center">
                {/* Se hai un'icona delle notifiche o del profilo, andrà qui */}
              </div>
            </div>
          </header>

          <div className={`${"p-4 pt-0 pb-20"}`}>{children}</div>
        </div>
      ) : (
        <div className={`${"p-4 pt-0 pb-20"}`}>{children}</div>
      )}

      <BottomNav />
    </div>
  );
};

export default LayoutMobile;
