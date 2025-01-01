import GUI from 'lil-gui';
import { useEffect } from 'react';

export const guiObject = {
  showHelper: false,
  volume: 0.1,
};

interface GuiProps {
  guiRef: React.RefObject<typeof guiObject>;
}
export const useGuiDisplay = ({ guiRef }: GuiProps) => {
  useEffect(() => {
    const gui = new GUI();
    gui.add(guiRef.current, 'showHelper');
    gui.add(guiRef.current, 'volume', 0, 1);
    return () => {
      gui.destroy();
    };
  }, [guiRef]);
};
