import { ActionIcon } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import { useToggle } from "@mantine/hooks";

export function SocketComponent() {
  const [value, toggle] = useToggle(["on", "off"]);

  const handleClick = () => {
    console.log("Clicked...");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const ws = new WebSocket(`${protocol}//${window.location.host}/api/internal/ws`);

    if (value === "on") {
      console.log("Turning on");
    } else {
      console.log("Turning off");
    }

    ws.onopen = () => {
      console.log("Connected to WebSocket.");

      ws.send(JSON.stringify({ event: "ping" }));

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder( stream, { mimeType: "audio/webm" });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            event.data.arrayBuffer()
              .then((buffer) => {
                console.log(`Sending ${buffer.byteLength} bytes of data`);

                ws.send(buffer);
              })
              .catch((error) => {
                console.error("Error reading data as ArrayBuffer:", error);
              });
          }
        };

        mediaRecorder.start(1000);
      }).catch((error) => {
        console.error("Error accessing media devices:", error);
      });
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

  function handleButtonClick() {
    toggle();
    handleClick();
  }

  return (
    <ActionIcon
      size="lg"
      onClick={() => handleButtonClick()}
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
