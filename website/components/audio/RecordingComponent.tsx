import type { AllowedLanguage, ClientCommand, Translation } from "@lib/audio/types";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@mantine/core";

interface RecordingComponentProps {
  onRecordingStart: () => void;
  // eslint-disable-next-line no-unused-vars
  onTranslation: (translation: Translation) => void;
  autoStart?: boolean;
  sourceLanguage?: AllowedLanguage;
  targetLanguage?: AllowedLanguage;
}

export function RecordingComponent({
  onTranslation,
  onRecordingStart,
  autoStart = false,
  sourceLanguage,
  targetLanguage
}: RecordingComponentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  const playNextAudio = () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioBuffer = audioQueueRef.current.shift();
    if (!audioBuffer) return;

    isPlayingRef.current = true;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      isPlayingRef.current = false;
      playNextAudio(); // Play next audio in queue
    };

    source.start(0);
    console.log("Playing audio buffer");
  };

  const handleBinaryAudio = async (data: Blob) => {
    try {
      const arrayBuffer = await data.arrayBuffer();

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioQueueRef.current.push(audioBuffer);

      console.log("Received audio buffer, queue length:", audioQueueRef.current.length);

      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playNextAudio();
      }
    } catch (error) {
      console.error("Error decoding audio data:", error);
    }
  };

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

        // Now we can send commands

        // Send ping
        const pingCommand: ClientCommand = { event: "ping" };
        ws.send(JSON.stringify(pingCommand));
        console.log("Sent ping...");

        // Send language selection
        const selectLanguagesCommand: ClientCommand = {
          event: "selectLanguages",
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage
        };
        ws.send(JSON.stringify(selectLanguagesCommand));
        console.log("Sent selectLanguages command:", sourceLanguage, targetLanguage);
      }).catch((error) => {
        console.error("Error accessing media devices:", error);

        ws.close();
      });
    };

    ws.onmessage = async (event) => {
      // Check if the message is binary audio data
      if (event.data instanceof Blob) {
        console.log("Received binary audio data:", event.data.size, "bytes");
        await handleBinaryAudio(event.data);
      } else {
        // Handle text/JSON message (translation)
        console.log("Message received:", event.data);

        const translation = JSON.parse(event.data) as Translation;

        onTranslation(translation);
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

    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;

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

    // Cleanup on unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().then();
        console.log("AudioContext closed");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRecording) {
      console.log("Language changed, restarting recording...");
      stopRecording();
      // Use setTimeout to ensure cleanup completes before restarting
      setTimeout(() => {
        startRecording();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLanguage, targetLanguage]);

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
