"use client";

import { Frame } from "@/utils/constant";
import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

interface Props {
  mainFrame: Frame;
  setMainFrame: Dispatch<SetStateAction<Frame>>;
  walletAddress: string;
  setWalletAddress: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  knowledgeBalance: number;
  setKnowledgeBalance: Dispatch<SetStateAction<number>>;
}

const GlobalContext = createContext<Props | undefined>({
  mainFrame: { key: 0, label: "" },
  setMainFrame: () => {},
  walletAddress: "",
  setWalletAddress: () => {},
  loading: false,
  setLoading: () => {},
  knowledgeBalance: 0,
  setKnowledgeBalance: () => {},
});

export const GlobalContextProvider = ({ children }: any) => {
  const [mainFrame, setMainFrame] = useState<Frame>({ key: 0, label: "" });
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [knowledgeBalance, setKnowledgeBalance] = useState<number>(0);

  return (
    <GlobalContext.Provider
      value={{
        mainFrame,
        setMainFrame,
        walletAddress,
        setWalletAddress,
        loading,
        setLoading,
        knowledgeBalance,
        setKnowledgeBalance,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
};
