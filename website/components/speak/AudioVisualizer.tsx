import { useEffect, useId, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const NUM_BARS = 255;

export function AudioVisualizer({ analyser, isActive }: AudioVisualizerProps) {
  const uniqueId = useId();
  const maskGroupRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number>(0);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(NUM_BARS));

  useEffect(() => {
    const maskGroup = maskGroupRef.current;
    if (!maskGroup) return;

    // Create 255 path elements on mount
    for (let i = 0; i < NUM_BARS; i++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke-dasharray", "4,1");
      path.setAttribute("d", `M ${i},255 l 0,0`);
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
    const frequencyData = frequencyDataRef.current;

    const animate = () => {
      if (analyser && isActive) {
        analyser.getByteFrequencyData(frequencyData);
        for (let i = 0; i < NUM_BARS; i++) {
          const adjustedLength = Math.floor(frequencyData[i]) - (Math.floor(frequencyData[i]) % 5);
          paths[i]?.setAttribute("d", `M ${i},255 l 0,-${adjustedLength}`);
        }
      } else {
        // Draw flat lines when inactive
        for (let i = 0; i < NUM_BARS; i++) {
          paths[i]?.setAttribute("d", `M ${i},255 l 0,0`);
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
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 255 255"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        borderRadius: "8px",
        backgroundColor: "#222"
      }}
    >
      <defs>
        <mask id={maskId}>
          <g
            ref={maskGroupRef}
            style={{
              strokeLinecap: "square",
              stroke: "white",
              strokeWidth: 0.5
            }}
          />
        </mask>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#db6247" />
          <stop offset="40%" stopColor="#f6e5d1" />
          <stop offset="60%" stopColor="#5c79c7" />
          <stop offset="85%" stopColor="#b758c0" />
          <stop offset="100%" stopColor="#222" />
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
  );
}
