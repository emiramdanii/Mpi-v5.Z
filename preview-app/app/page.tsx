"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState("100vh");

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        src="/index.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          overflow: "auto",
        }}
        title="Authoring Tool v3"
      />
    </div>
  );
}
