import { Paper, ScrollArea, Text } from "@mantine/core";

interface TranslationPanelProps {
  flag: string;
  text: string;
}

export function PaperComponent({ flag, text }: TranslationPanelProps) {
  return (
    <Paper shadow="sm" pt={0} pb={0} pl="md" pr="md" withBorder style={{ flex: 1, overflow: "hidden", margin: 0, backgroundColor: "#FFF8F0" }}>
      <div style={{ display: "flex", height: "100%", gap: "1rem" }}>
        <div style={{ fontSize: "3rem", display: "flex", alignItems: "flex-start" }}>{flag}</div>
        <ScrollArea type="never" style={{ flex: 1, height: "100%" }}>
          <div style={{ height: "7px", visibility: "hidden" }}></div>
          <Text style={{ fontSize: "2.5rem", fontFamily: "Georgia, serif", lineHeight: 1.46, color: "#3E2723", textAlign: "justify" }}>
            {text}
          </Text>
        </ScrollArea>
        <div style={{ fontSize: "3rem", display: "flex", alignItems: "flex-start", visibility: "hidden" }}>{flag}</div>
      </div>
    </Paper>
  );
}
