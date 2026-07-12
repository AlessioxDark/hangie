import DollarIcon from "@/assets/icons/DollarIcon";
import MapIcon from "@/assets/icons/MapIcon";
import React from "react";

const FormInput = ({ id, label, type, placeholder, register, error }) => {
  return (
    <div className="flex flex-col gap-1.5 2xl:gap-1 w-full group">
      {label !== "" && (
        <label
          htmlFor={id}
          className={`font-body text-text-1 text-sm 2xl:text-base font-medium`}
        >
          {label} <span className="text-red-500 text-sm">*</span>
        </label>
      )}
      <div className="flex flex-col gap-0.5">
        <div
          className={`flex items-center
		                         bg-bg-2 rounded-xl
		                         transition-all duration-200
		                         ${
                               error
                                 ? "border-red-500 border-2"
                                 : "focus-within:border-primary  focus-within:ring-primary  ring-2 ring-gray-200"
                             }
		                         shadow-inner-sm p-0.5`}
        >
          {id == "costo" && (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8">
                <DollarIcon color={"#64748b"} />
              </div>
            </div>
          )}
          {id == "indirizzo" && (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8">
                <MapIcon color={"#64748b"} />
              </div>
            </div>
          )}

          <input
            id={id}
            type={type}
            placeholder={placeholder}
            className={`w-full font-body text-sm 2xl:text-base 2xl:py-3 py-2.5
               rounded-r-xl outline-none appearance-none bg-transparent
		           text-text-1 placeholder-text-3 2xl:px-3 px-2.5
		                             ${
                                   id === "costo" ||
                                   id === "indirizzo" ||
                                   "rounded-l-xl"
                                 }
		                             `}
            // Uso corretto della funzione register
            {...register(id)}
          />
        </div>
        {error?.message && (
          <p className="text-[11px] font-body font-bold text-red-500 pl-1.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-100">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormInput;
