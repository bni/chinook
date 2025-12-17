import { useEffect, useId, useRef } from "react";
import { Paper } from "@mantine/core";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const NUM_BARS = 8;
const VIEWBOX_WIDTH = 100;
const BAR_SPACING = VIEWBOX_WIDTH / NUM_BARS;
const BAR_WIDTH = BAR_SPACING - 2;

export function AudioVisualizer({ analyser, isActive }: AudioVisualizerProps) {
  const uniqueId = useId();
  const maskGroupRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const maskGroup = maskGroupRef.current;
    if (!maskGroup) return;

    // Create path elements on mount
    for (let i = 0; i < NUM_BARS; i++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const x = i * BAR_SPACING + BAR_SPACING / 2;
      path.setAttribute("d", `M ${x},255 l 0,0`);
      maskGroup.appendChild(path);
    }

    return () => {
      // Cleanup paths on unmount
      while (maskGroup.firstChild) {
        maskGroup.removeChild(maskGroup.firstChild);
      }
    };
  }, []);

  useEffect(() => {
    const maskGroup = maskGroupRef.current;
    if (!maskGroup) return;

    const paths = maskGroup.getElementsByTagName("path");
    const fullFrequencyData = new Uint8Array(512);

    const animate = () => {
      if (analyser && isActive) {
        analyser.getByteFrequencyData(fullFrequencyData);
        for (let i = 0; i < NUM_BARS; i++) {
          // Sample from lower frequency range where most audio energy is
          const dataIndex = Math.floor(i * (128 / NUM_BARS));
          const value = fullFrequencyData[dataIndex];
          // Scale up the value to use more of the height range
          const scaled = Math.min(255, value * 2.0);
          const adjustedLength = Math.floor(scaled) - (Math.floor(scaled) % 5);
          const x = i * BAR_SPACING + BAR_SPACING / 2;
          paths[i]?.setAttribute("d", `M ${x},255 l 0,-${adjustedLength}`);
        }
      } else {
        // Draw flat lines when inactive
        for (let i = 0; i < NUM_BARS; i++) {
          const x = i * BAR_SPACING + BAR_SPACING / 2;
          paths[i]?.setAttribute("d", `M ${x},255 l 0,0`);
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [ analyser, isActive ]);

  const maskId = `mask-${uniqueId}`;
  const gradientId = `gradient-${uniqueId}`;

  return (
    <Paper shadow="sm" p={0} withBorder style={{ flex: 1, overflow: "hidden", margin: 0, backgroundColor: "#FFF8F0" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <svg
          preserveAspectRatio="none"
          viewBox={`0 0 ${VIEWBOX_WIDTH} 255`}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            backgroundColor: "#222"
          }}
        >
          <defs>
            <mask id={maskId}>
              <g
                ref={maskGroupRef}
                style={{
                  strokeLinecap: "butt",
                  stroke: "white",
                  strokeWidth: BAR_WIDTH
                }}
              />
            </mask>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e53935" />
              <stop offset="50%" stopColor="#ff9800" />
              <stop offset="100%" stopColor="#1e88e5" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${gradientId})`}
            mask={`url(#${maskId})`}
          />
        </svg>
      </div>
    </Paper>
  );
}
