import { createContext, useContext } from 'react';

type PlaygroundLayoutContextValue = {
  isAnimating: boolean;
  isFullscreen: boolean;
};

export const PlaygroundLayoutContext = createContext<PlaygroundLayoutContextValue>({
  isAnimating: false,
  isFullscreen: false,
});

export const PlaygroundLayoutProvider = PlaygroundLayoutContext.Provider;

export function usePlaygroundLayout(): PlaygroundLayoutContextValue {
  return useContext(PlaygroundLayoutContext);
}
