"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/store";
import { Frames } from "@/utils/constant";
import { fetchKnowledgeBalance } from "@/lib/api";

export const Navigation = () => {
  const {
    mainFrame,
    setMainFrame,
    walletAddress,
    setWalletAddress,
    setKnowledgeBalance,
    knowledgeBalance,
  } = useGlobalContext();

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (walletAddress !== "") {
      fetchKnowledgeBalance(walletAddress).then((res) => {
        setKnowledgeBalance(res);
      });
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    console.log("Connecting wallet");
    if (window && window.arweaveWallet) {
      console.log("Wallet found");
      // check if the wallet is connected
      try {
        console.log("Connecting wallet");
        await window.arweaveWallet.connect([
          "ACCESS_ADDRESS",
          "SIGN_TRANSACTION",
          "DISPATCH",
        ]);
        const activeWalletAddress =
          await window.arweaveWallet.getActiveAddress();
        setWalletAddress(activeWalletAddress);
      } catch (error) {
        alert("Error connecting wallet");
      }
    } else {
      alert("Wallet not found");
      return;
    }
  };

  return (
    <nav className="h-screen w-1/6 border-r p-8 border-gray-800">
      <ul className="h-full w-full flex flex-col gap-y-3 text-center">
        <li
          className={`w-full py-2 rounded-md hover:bg-gray-700 cursor-pointer ${
            mainFrame.key === 1 && "bg-gray-700"
          }`}
          onClick={() => setMainFrame(Frames[0])}
        >
          Feeds
        </li>
        <li
          className={`w-full py-2 rounded-md hover:bg-gray-700 cursor-pointer ${
            mainFrame.key === 2 && "bg-gray-700"
          }`}
          onClick={() => setMainFrame(Frames[1])}
        >
          Topics
        </li>
        <li
          className={`w-full py-2 rounded-md hover:bg-gray-700 cursor-pointer ${
            mainFrame.key === 3 && "bg-gray-700"
          }`}
          onClick={() => setMainFrame(Frames[2])}
        >
          Users
        </li>
        {walletAddress === "" ? (
          <button
            className="w-full py-2 border-2 border-gray-500 rounded-xl hover:border-gray-600 cursor-pointer"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : (
          <li
            className="w-full py-2 border-2 border-gray-500 rounded-xl hover:border-gray-600"
            onClick={connectWallet}
          >
            {walletAddress.substring(0, 5) + "..." + walletAddress.slice(-5)}
          </li>
        )}
        <li className="w-full py-2">
          Knowledge: {knowledgeBalance.toFixed(2)}
        </li>
      </ul>
    </nav>
  );
};
