import React, { useState } from "react";
import type { AllowedLanguage } from "@lib/audio/types";
import { RecordingComponent } from "@components/audio/RecordingComponent";
import { ScrollPaper } from "./ScrollPaper";

export function TranslateComponent() {
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<AllowedLanguage>("en-GB");
  const [targetLanguage, setTargetLanguage] = useState<AllowedLanguage>("sv-SE");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: "1.7rem", boxSizing: "border-box", paddingTop: "0rem", paddingBottom: "0.7rem" }}>
      <RecordingComponent
        onRecordingStart={() => {
          setTranscript("");
          setTranslation("");
        }}
        onTranslation={(translation) => {
          setTranscript(translation.transcript || "");
          setTranslation(translation.translation || "");
        }}
        autoStart={false}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
      />

      <ScrollPaper
        flag="🇬🇧"
        text={transcript}
        onLanguageChange={setSourceLanguage}
      />
      <ScrollPaper
        flag="🇸🇪"
        text={translation}
        onLanguageChange={setTargetLanguage}
      />
    </div>
  );
}
