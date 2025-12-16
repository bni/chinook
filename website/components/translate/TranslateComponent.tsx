import type { AllowedLanguage, Mode } from "@lib/audio/types";
import { Button, Group } from "@mantine/core";
import React, { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { RecordingComponent } from "@components/audio/RecordingComponent";
import { ScrollPaper } from "./ScrollPaper";

const languageFlags: Record<AllowedLanguage, string> = {
  "sv-SE": "🇸🇪",
  "en-GB": "🇬🇧",
  "fr-FR": "🇫🇷",
  "de-DE": "🇩🇪",
  "es-ES": "🇪🇸"
};

export function TranslateComponent() {
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<AllowedLanguage>("sv-SE"); // Default
  const [targetLanguage, setTargetLanguage] = useState<AllowedLanguage>("en-GB"); // Default
  const [mode, setMode] = useState<Mode>("translation");

  const handleSourceLanguageChange = (language: AllowedLanguage) => {
    if (mode === "conversation") {
      setSourceLanguage(language);
      setTargetLanguage(language);
    } else if (language === targetLanguage) {
      setSourceLanguage(language);
      setTargetLanguage(sourceLanguage);
    } else {
      setSourceLanguage(language);
    }
  };

  const handleTargetLanguageChange = (language: AllowedLanguage) => {
    if (mode === "conversation") {
      setSourceLanguage(language);
      setTargetLanguage(language);
    } else if (language === sourceLanguage) {
      setTargetLanguage(language);
      setSourceLanguage(targetLanguage);
    } else {
      setTargetLanguage(language);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: "1.7rem", boxSizing: "border-box", paddingTop: "0rem", paddingBottom: "0.7rem" }}>
      <Group justify="left">
        <Button
          size="compact-lg"
          variant={mode === "translation" ? "filled" : "light"}
          leftSection={<IconCheck size={14} style={{ opacity: mode === "translation" ? 1 : 0 }} />}
          rightSection={<IconCheck size={14} style={{ opacity: 0 }} />}
          onClick={() => {
            setMode("translation");
            setSourceLanguage("sv-SE");
            setTargetLanguage("en-GB");
            setTranscript("");
            setTranslation("");
          }}
        >
          Translation
        </Button>
        <Button
          size="compact-lg"
          variant={mode === "conversation" ? "filled" : "light"}
          leftSection={<IconCheck size={14} style={{ opacity: mode === "conversation" ? 1 : 0 }} />}
          rightSection={<IconCheck size={14} style={{ opacity: 0 }} />}
          onClick={() => {
            setMode("conversation");
            setTargetLanguage(sourceLanguage);
            setTranscript("");
            setTranslation("");
          }}
        >
          Conversation
        </Button>
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
          mode={mode}
        />
      </Group>

      <ScrollPaper
        flag={languageFlags[sourceLanguage]}
        text={transcript}
        onLanguageChange={handleSourceLanguageChange}
      />
      <ScrollPaper
        flag={languageFlags[targetLanguage]}
        text={translation}
        onLanguageChange={handleTargetLanguageChange}
      />
    </div>
  );
}
