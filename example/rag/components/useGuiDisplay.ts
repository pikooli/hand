"use client";
import GUI from 'lil-gui';
import { useEffect } from 'react';

export const guiObject = {
  showHelper: false,
  volume: 0.1,
};

interface GuiProps {
  guiRef: React.RefObject<typeof guiObject>;
  isDebug: boolean;
}

export const useGuiDisplay = ({ guiRef , isDebug}: GuiProps) => {
  useEffect(() => {
    if(isDebug) {
      const gui = new GUI();
      gui.add(guiRef.current, 'showHelper');
      gui.add(guiRef.current, 'volume', 0, 1);
      return () => {
        gui.destroy();
      };
    }
  }, [guiRef, isDebug]);
};
