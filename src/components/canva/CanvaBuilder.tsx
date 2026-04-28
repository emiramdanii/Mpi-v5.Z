'use client';

import { useState, useCallback } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import IconRail from './IconRail';
import LeftPanel from './LeftPanel';
import Stage from './Stage';
import RightPanel from './RightPanel';

export default function CanvaBuilder() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((x: number, y: number) => {
    setMousePos({ x, y });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main builder row */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Icon Rail */}
        <IconRail />

        {/* Left Panel */}
        <LeftPanel />

        {/* Stage Canvas Area */}
        <Stage onMouseMove={handleMouseMove} />

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Status Bar */}
      <StatusBar mousePos={mousePos} />
    </div>
  );
}
