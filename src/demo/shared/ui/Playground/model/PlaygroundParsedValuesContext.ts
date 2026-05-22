import { createContext, useContext } from 'react';

type PlaygroundParsedValuesContextValue = { show: boolean };

const PlaygroundParsedValuesContext = createContext<PlaygroundParsedValuesContextValue>({ show: true });

export function usePlaygroundParsedValues(): PlaygroundParsedValuesContextValue {
  return useContext(PlaygroundParsedValuesContext);
}

export { PlaygroundParsedValuesContext };
