import { createContext, useContext } from "react";
import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import { app, analytics } from "../firebase";

interface FirebaseContextValue {
  app: FirebaseApp;
  analytics: Analytics;
}

const FirebaseContext = createContext<FirebaseContextValue>({ app, analytics });

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FirebaseContext.Provider value={{ app, analytics }}>
    {children}
  </FirebaseContext.Provider>
);

export const useFirebase = () => useContext(FirebaseContext);
