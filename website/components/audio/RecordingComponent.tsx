import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@mantine/core";

interface TranscriptionData {
  transcript?: string | undefined
  isPartial?: boolean | undefined
  error?: string | undefined
}

interface Translation {
  transcript?: string | undefined
  translation?: string | undefined
}

interface RecordingComponentProps {
  onRecordingStart: () => void;
  // eslint-disable-next-line no-unused-vars
  onTranslation: (translation: Translation) => void;
  autoStart?: boolean;
}

export function RecordingComponent({ onTranslation, onRecordingStart, autoStart = false }: RecordingComponentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  let completeTranscription = "";

  const startRecording = () => {
    console.log("Starting recording...");

    if (onRecordingStart) {
      onRecordingStart();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const ws = new WebSocket(`${protocol}//${window.location.host}/api/internal/ws`);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket.");

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => {
              console.log(`Sending ${buffer.byteLength} bytes of data`);
              ws.send(buffer);
            }).catch((error) => {
              console.error("Error reading data as ArrayBuffer:", error);
            });
          }
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
        console.log("MediaRecorder started");

        console.log("Sending ping...");
        ws.send(JSON.stringify({ event: "ping" }));
      }).catch((error) => {
        console.error("Error accessing media devices:", error);

        ws.close();
      });
    };

    ws.onmessage = (event) => {
      console.log("Message received:", event.data);

      const data = JSON.parse(event.data) as TranscriptionData;

      if (data.error) {
        console.error("Server error:", data.error);

        stopRecording();

        return;
      }

      if (data.transcript) {
        if (data.isPartial) {
          const translation: Translation = {
            transcript: completeTranscription + " " +  data.transcript,
            translation: ""
          };

          onTranslation(translation);
        } else {
          completeTranscription += " " + data.transcript;

          const translation: Translation = {
            transcript: completeTranscription,
            translation: ""
          };

          onTranslation(translation);
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const stopRecording = () => {
    console.log("Stopping recording...");

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();

      console.log("MediaRecorder stopped");
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Track stopped:", track.kind);
      });
      streamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
      console.log("WebSocket closed");
    }

    // Clear refs
    mediaRecorderRef.current = null;
    wsRef.current = null;
    setIsRecording(false);
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    if (autoStart) {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (autoStart) {
    return null;
  }

  return (
    <ActionIcon
      size="lg"
      onClick={ handleMicrophoneClick }
      color={ isRecording ? "red" : "gray" }
      variant={ isRecording ? "filled" : "light" }
    >
      {isRecording ? <IconMicrophone /> : <IconMicrophoneOff />}
    </ActionIcon>
  );
}
