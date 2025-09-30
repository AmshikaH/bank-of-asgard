import { createContext, useContext } from "react";

export const SwitchTokenContext = createContext(null);
export const useSwitchToken = () => useContext(SwitchTokenContext);
