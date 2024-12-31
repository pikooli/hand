import GUI from 'lil-gui';
import { useEffect } from 'react';

export const guiObject = {
  showHelper: true,
  positionDirt: {
    x: 0,
    y: 0,
    z: 0,
  },
};

interface GuiProps {
  guiRef: React.RefObject<typeof guiObject>;
}
export const useGuiDisplay = ({ guiRef }: GuiProps) => {
  useEffect(() => {
    const gui = new GUI();
    gui.add(guiRef.current, 'showHelper');
    gui.add(guiRef.current.positionDirt, 'x', 0, 1);
    gui.add(guiRef.current.positionDirt, 'y', 0, 1);
    gui.add(guiRef.current.positionDirt, 'z', 0, 1);
    return () => {
      gui.destroy();
    };
  }, [guiRef]);
};
