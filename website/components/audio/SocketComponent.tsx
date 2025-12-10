import { ActionIcon } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";

export function SocketComponent() {
  const handleClick = async () => {
    console.log("Connecting...");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

    ws.onopen = () => {
      console.log("Connected to WebSocket.");

      ws.send(JSON.stringify({ event: "ping" }));
    };

    ws.onmessage = (event) => {
      console.log("Message received:", event.data);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      ws.close();
    };
  };

  return (
    <ActionIcon
      size="lg"
      onClick={() => handleClick()}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 1000
      }}
    >
      <IconMicrophone/>
    </ActionIcon>
  );
}
