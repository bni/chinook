import React, { useState } from "react";
import { PaperComponent } from "./PaperComponent";
import { RecordingComponent } from "@components/audio/RecordingComponent";

export function TranslateComponent() {
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: "1.7rem", boxSizing: "border-box", paddingTop: "0rem", paddingBottom: "0.7rem" }}>
      <RecordingComponent
        onRecordingStart={() => setTranscript("")}
        onTranslation={(translation) => {
          setTranscript(translation.transcript || "");
          setTranslation(translation.translation || "");
        }}
        autoStart={false}
      />

      <PaperComponent flag="🇬🇧" text={transcript} />
      <PaperComponent flag="🇸🇪" text={translation} />
    </div>
  );
}
