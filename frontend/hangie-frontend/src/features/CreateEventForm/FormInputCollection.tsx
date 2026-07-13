import React, { useState } from "react";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import ImageInput from "./ImageInput";
import { useScreen } from "@/contexts/ScreenContext";
import LocationAutocomplete from "../events/LocationAutocomplete";

const FormInputCollection = ({
  register,
  errors,
  imageError,
  setImageError,
  images,
  setImages,
  currentStep,
  methods,
}) => {
  const { currentScreen } = useScreen();
  const renderCurrentStep = () => {
    if (currentScreen == "xs") {
      switch (currentStep) {
        case 1:
          return (
            <div
              className="p-4 2xl:p-8 flex flex-col gap-3 h-full"
              key="step-1"
            >
              <ImageInput
                imageError={imageError}
                setImageError={setImageError}
                images={images}
                setImages={setImages}
              />

              <div className="flex flex-col gap-3">
                <FormInput
                  id="titolo"
                  label="Titolo Evento"
                  placeholder="Es: Mostra d'Arte Contemporanea"
                  type="text"
                  register={register}
                  error={errors.titolo}
                />
                <FormTextarea
                  id="descrizione"
                  label="Descrizione"
                  placeholder="Descrivi l'evento: cosa, chi, quando e perché."
                  register={register}
                  error={errors.descrizione}
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div className="p-4 2xl:p-8 flex flex-col gap-3" key="step-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInput
                  id="data"
                  label="Data Evento (Data e Ora)"
                  type="datetime-local"
                  register={register}
                  error={errors.data}
                />
                <FormInput
                  id="data_scadenza"
                  label="Scadenza Iscrizione"
                  type="datetime-local"
                  register={register}
                  error={errors.data_scadenza}
                />
                <FormInput
                  id="costo"
                  label="Costo (€)"
                  placeholder="0.00"
                  type="number" // Lasciamo text per regex e input corretto
                  register={register}
                  error={errors.costo}
                />
              </div>
            </div>
          );
        case 3:
          return (
            <div className="p-4 flex flex-col gap-3" key="step-3">
              <div className="flex flex-col gap-3">
                <FormInput
                  id="nome_luogo"
                  label="Nome Luogo"
                  placeholder="Casa di Marco"
                  type="text"
                  register={register}
                  error={errors.nome_luogo}
                />
                {/* <FormInput
                  id="indirizzo"
                  label="Indirizzo / Luogo"
                  placeholder="Via Roma, 12, 00100 Roma"
                  type="text"
                  register={register}
                  error={errors.indirizzo}
                />
                <FormInput
                  id="citta"
                  label="Citta / Provincia"
                  placeholder="Roma"
                  type="text"
                  register={register}
                  error={errors.citta}
                />
                <FormInput
                  id="cap"
                  label="CAP"
                  placeholder="00100"
                  type="text"
                  register={register}
                  error={errors.cap}
                /> */}

                {currentStep === 3 && (
                  <div className="flex flex-col gap-3">
                    {/* <FormInput
                      id="nome_luogo"
                      label="Nome Personalizzato del Luogo"
                      placeholder="Es: Terrazza di Marco, Pub da Gianluca"
                      type="text"
                      register={register}
                      error={errors.nome_luogo}
                    /> */}

                    <LocationAutocomplete
                      error={errors.locationData}
                      onLocationSelect={(data) => {
                        console.log("PLACE SELEZIONATO:", data); // 👈 aggiungi questo
                        methods.setValue("locationData", data, {
                          shouldValidate: true,
                        });
                        methods.trigger("locationData"); // Rimuove l'errore in tempo reale
                      }}
                    />
                  </div>
                )}
              </div>
              {errors.root && (
                <p className="text-sm font-body  text-red-500 ">
                  {errors.root.message}. {errors.root.details}
                </p>
              )}
            </div>
          );
      }
    } else {
      return (
        <>
          <div className="p-4 2xl:p-8 flex flex-col gap-3">
            <ImageInput
              imageError={imageError}
              setImageError={setImageError}
              images={images}
              setImages={setImages}
            />

            <div className="flex flex-col gap-3">
              <FormInput
                id="titolo"
                label="Titolo Evento"
                placeholder="Es: Mostra d'Arte Contemporanea"
                type="text"
                register={register}
                error={errors.titolo}
              />
              <FormTextarea
                id="descrizione"
                label="Descrizione"
                placeholder="Descrivi l'evento: cosa, chi, quando e perché."
                register={register}
                error={errors.descrizione}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                id="data"
                label="Data Evento (Data e Ora)"
                type="datetime-local"
                register={register}
                error={errors.data}
              />
              <FormInput
                id="data_scadenza"
                label="Scadenza Iscrizione"
                type="datetime-local"
                register={register}
                error={errors.data_scadenza}
              />
              <FormInput
                id="costo"
                label="Costo (€)"
                placeholder="0.00"
                type="number" // Lasciamo text per regex e input corretto
                register={register}
                error={errors.costo}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="font-body text-text-1 text-xl font-medium">
                Dettagli sul Luogo
              </h1>
              <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-4">
                  <FormInput
                    id="nome_luogo"
                    label="Nome Luogo"
                    placeholder="Casa di Marco"
                    type="text"
                    register={register}
                    error={errors.nome_luogo}
                  />
                  <FormInput
                    id="indirizzo"
                    label="Indirizzo / Luogo"
                    placeholder="Via Roma, 12, 00100 Roma"
                    type="text"
                    register={register}
                    error={errors.indirizzo}
                  />
                </div>
                <div className="flex flex-row gap-4">
                  <FormInput
                    id="citta"
                    label="Citta / Provincia"
                    placeholder="Roma"
                    type="text"
                    register={register}
                    error={errors.citta}
                  />
                  <FormInput
                    id="cap"
                    label="CAP"
                    placeholder="00100"
                    type="text"
                    register={register}
                    error={errors.cap}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };
  return renderCurrentStep();
};

export default FormInputCollection;
