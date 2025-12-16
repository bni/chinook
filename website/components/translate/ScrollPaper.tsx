import { Button, Menu, Paper, ScrollArea, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import type { AllowedLanguage } from "@lib/audio/types";

interface Language {
  code: AllowedLanguage;
  flag: string;
}

const languages: Language[] = [
  { code: "sv-SE", flag: "🇸🇪" },
  { code: "en-GB", flag: "🇬🇧" },
  { code: "fr-FR", flag: "🇫🇷" },
  { code: "de-DE", flag: "🇩🇪" },
  { code: "es-ES", flag: "🇪🇸" }
];

interface TranslationPanelProps {
  flag: string;
  text: string;
  // eslint-disable-next-line no-unused-vars
  onLanguageChange?: (languageCode: AllowedLanguage) => void;
}

export function ScrollPaper({ flag, text, onLanguageChange }: TranslationPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.flag === flag) || languages[0]
  );
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);

    if (onLanguageChange) {
      onLanguageChange(language.code);
    }
  };

  useEffect(() => {
    const newLanguage = languages.find(lang => lang.flag === flag);
    if (newLanguage && newLanguage.code !== selectedLanguage.code) {
      setSelectedLanguage(newLanguage);
    }
  }, [flag, selectedLanguage.code]);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [text]);

  // Remove trailing newlines from text
  const displayText = text.replace(/\n+$/, "");

  return (
    <Paper shadow="sm" pt={0} pb={0} pl="md" pr="md" withBorder style={{ flex: 1, overflow: "hidden", margin: 0, backgroundColor: "#FFF8F0" }}>
      <div style={{ display: "flex", height: "100%", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", marginTop: "7px" }}>
          <Menu position="bottom-start">
            <Menu.Target>
              <Button
                variant="subtle"
                p={0}
                style={{
                  fontSize: "3rem",
                  height: "auto",
                  minHeight: "auto",
                  minWidth: "auto",
                  border: "none",
                  background: "transparent"
                }}
              >
                {selectedLanguage.flag}
              </Button>
            </Menu.Target>
            <Menu.Dropdown style={{ padding: "0", minWidth: "auto" }}>
              {languages.map((language) => (
                <Menu.Item
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  style={{ fontSize: "3rem", lineHeight: "3rem", padding: "0", margin: "0", minWidth: "auto", display: "flex", justifyContent: "flex-start" }}
                >
                  {language.flag}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
        <ScrollArea type="never" style={{ flex: 1, height: "100%" }} viewportRef={scrollViewportRef}>
          <div style={{ height: "0.1rem", visibility: "hidden" }}></div>
          <div>
            {displayText.split("\n").map((line, index) => (
              <Text
                key={index}
                style={{
                  fontSize: "2.5rem",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.46,
                  color: "#3E2723",
                  marginBottom: "0.8rem",
                  display: "block"
                }}
              >
                {line || "\u00A0"}
              </Text>
            ))}
          </div>
          <div style={{ height: "0.1rem", visibility: "hidden" }}></div>
        </ScrollArea>
        <div style={{ fontSize: "3rem", display: "flex", alignItems: "flex-start", visibility: "hidden" }}>{selectedLanguage.flag}</div>
      </div>
    </Paper>
  );
}
