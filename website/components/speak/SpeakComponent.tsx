import type { AllowedLanguage, Mode } from "@lib/speak/types";
import { Button, Group } from "@mantine/core";
import React, { useState } from "react";
import { AudioHandler } from "@components/speak/AudioHandler";
import { AudioVisualizer } from "./AudioVisualizer";
import { IconCheck } from "@tabler/icons-react";
import { ScrollPaper } from "./ScrollPaper";

const languageFlags: Record<AllowedLanguage, string> = {
  "sv-SE": "🇸🇪",
  "en-GB": "🇬🇧",
  "fr-FR": "🇫🇷",
  "de-DE": "🇩🇪",
  "es-ES": "🇪🇸"
};

export function SpeakComponent() {
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [translationLines, setTranslationLines] = useState<string[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState<AllowedLanguage>("sv-SE"); // Default
  const [targetLanguage, setTargetLanguage] = useState<AllowedLanguage>("en-GB"); // Default
  const [mode, setMode] = useState<Mode>("translation");

  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [speakerAnalyser, setSpeakerAnalyser] = useState<AnalyserNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);

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
            setTranscriptLines([]);
            setTranslationLines([]);
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
            setSourceLanguage("en-GB");
            setTargetLanguage("en-GB");
            setTranscriptLines([]);
            setTranslationLines([]);
          }}
        >
          Conversation
        </Button>
        <AudioHandler
          onRecordingStart={() => {
            setTranscriptLines([]);
            setTranslationLines([]);
            setIsRecording(true);
          }}
          onRecordingStop={() => {
            setIsRecording(false);
          }}
          onServerCommand={(serverCommand) => {
            if (serverCommand.transcript !== undefined) {
              setTranscriptLines(prev => {
                const updated = prev.length === 0
                  ? [serverCommand.transcript!]
                  : [...prev.slice(0, -1), serverCommand.transcript!];
                return serverCommand.newLine ? [...updated, ""] : updated;
              });
            }
            if (serverCommand.translation !== undefined) {
              setTranslationLines(prev => {
                const updated = prev.length === 0
                  ? [serverCommand.translation!]
                  : [...prev.slice(0, -1), serverCommand.translation!];
                return serverCommand.newLine ? [...updated, ""] : updated;
              });
            }
          }}
          autoStart={false}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          mode={mode}
          onMicrophoneAnalyserReady={setMicAnalyser}
          onSpeakerAnalyserReady={setSpeakerAnalyser}
        />
      </Group>

      <div style={{ display: "flex", flex: 1, gap: "1rem", minHeight: 0 }}>
        <div style={{ flex: "1 1 80%", display: "flex", flexDirection: "column" }}>
          <ScrollPaper
            flag={languageFlags[sourceLanguage]}
            text={transcriptLines.join("\n")}
            onLanguageChange={handleSourceLanguageChange}
          />
        </div>
        <div style={{ flex: "0 0 20%", minWidth: "80px" }}>
          <AudioVisualizer analyser={micAnalyser} isActive={isRecording} />
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, gap: "1rem", minHeight: 0 }}>
        <div style={{ flex: "1 1 80%", display: "flex", flexDirection: "column" }}>
          <ScrollPaper
            flag={languageFlags[targetLanguage]}
            text={translationLines.join("\n")}
            onLanguageChange={handleTargetLanguageChange}
          />
        </div>
        <div style={{ flex: "0 0 20%", minWidth: "80px" }}>
          <AudioVisualizer analyser={speakerAnalyser} isActive={speakerAnalyser !== null} />
        </div>
      </div>
    </div>
  );
}
