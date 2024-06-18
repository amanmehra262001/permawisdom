import { useGlobalContext } from "@/context/store";
import { arweave, fetchFeedData, fetchFeeds, fetchSubFeeds } from "@/lib/api";
import {
  APP_IDENTIFIER,
  DOWNVOTE_IDENTIFIER,
  FEED_IDENTIFIER,
  Frames,
  KNOWLEDGE_IDENTIFIER,
  KNOWLEDGE_MINT_IDENTIFIER,
  SUB_FEED_IDENTIFIER,
  UPVOTE_IDENTIFIER,
} from "@/utils/constant";
import { useEffect, useState } from "react";

import BounceLoader from "react-spinners/BounceLoader";

export const MainFrame = () => {
  const { mainFrame, setMainFrame, loading } = useGlobalContext();
  useEffect(() => {
    setMainFrame(Frames[0]);
  }, []);

  return (
    <div className="relative w-5/6 h-full overflow-y-scroll overflow-x-hidden scrollbarWidth p-8">
      {loading && (
        <div className="flex w-full h-full absolute justify-center items-center backdrop-blur-sm overflow-hidden">
          <BounceLoader color="#fff" />
        </div>
      )}
      <section className="flex flex-col gap-y-6 ">
        <p className="text-3xl font-bold">PermaWisdom</p>
        {mainFrame.key === 1 && <Feeds />}
        {mainFrame.key === 2 && <Topics />}
        {mainFrame.key === 3 && <Users />}
      </section>
    </div>
  );
};

const NewFeed = ({ fetchFeedsData }: { fetchFeedsData: any }) => {
  const [newFeed, setNewFeed] = useState<string>("");
  const { setWalletAddress, setLoading } = useGlobalContext();

  const handlePost = async () => {
    if (newFeed.length === 0) return;
    console.log("Post Feed:", newFeed);

    setLoading(true);
    try {
      if (!window.arweaveWallet) {
        alert("Please install ArConnect to post feeds.");
        setLoading(false);
        return;
      }

      // Connect wallet if haven't already
      await connectWallet();

      // Get wallet address
      const _walletAddress = await window.arweaveWallet.getActiveAddress();

      // Create proper transaction
      const feed = {
        id: _walletAddress + "_" + Date.now().toString(),
        author: _walletAddress,
        content: newFeed,
        created_at: Date.now(),
        upvotes: 0,
        downvotes: 0,
        subFeeds: [],
      };
      console.log("Feed:", feed);

      // Sign and send transaction
      let tx = await arweave.createTransaction({ data: JSON.stringify(feed) });
      tx.addTag("App-Name", APP_IDENTIFIER);
      tx.addTag("Content-Type", FEED_IDENTIFIER);
      tx.addTag("Feed-ID", feed.id);

      try {
        // dispatch the tx
        const res = await window.arweaveWallet.dispatch(tx);
        console.log("Transaction response:", res);
      } catch (error) {
        alert("Error signing transaction");
        setLoading(false);
        return;
      }

      setNewFeed("");
      setLoading(false);
      await fetchFeedsData();
      await handleKnowledgeMint(feed.id, 0.5);
    } catch (error) {
      alert("Please install & connect ArConnect to post feeds.");
      setLoading(false);
      return;
    }
  };

  const handleKnowledgeMint = async (feedId: string, amount: number) => {
    console.log("Minting knowledge");
    setLoading(true);
    try {
      if (!window.arweaveWallet) {
        alert("Please install ArConnect to mint knowledge.");
        setLoading(false);
        return;
      }

      // Connect wallet if haven't already
      await connectWallet();

      // Get wallet address
      const _walletAddress = await window.arweaveWallet.getActiveAddress();

      // Create proper transaction
      const knowledge = {
        id: _walletAddress + "_" + Date.now().toString(),
        author: _walletAddress,
        feedId,
        created_at: Date.now(),
        amount,
      };
      console.log("Knowledge object:", knowledge);

      // Sign and send transaction
      let tx = await arweave.createTransaction({
        data: JSON.stringify(knowledge),
      });
      tx.addTag("App-Name", KNOWLEDGE_IDENTIFIER);
      tx.addTag("Content-Type", KNOWLEDGE_MINT_IDENTIFIER);
      tx.addTag("User-Address", _walletAddress);

      try {
        // dispatch the tx
        const res = await window.arweaveWallet.dispatch(tx);
        console.log("Transaction response:", res);
      } catch (error) {
        alert("Error signing transaction");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      alert("Please install & connect ArConnect to mint knowledge.");
      setLoading(false);
      return;
    }
  };

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
        setLoading(false);
      } catch (error) {
        alert("Error connecting wallet");
        setLoading(false);
        throw new Error("Error connecting wallet");
      }
    } else {
      alert("Wallet not found");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="flex w-full gap-x-2">
      <textarea
        className="w-full bg-transparent border border-slate-800 rounded-lg p-2 scrollbarWidth"
        onChange={(e) => setNewFeed(e.target.value)}
        value={newFeed}
        rows={2}
        placeholder="What's on your mind?"
      ></textarea>
      <button
        className={`w-2/12 ${
          newFeed.length === 0 ? "bg-gray-700" : "bg-blue-500"
        } rounded-full fit-content h-50`}
        onClick={handlePost}
      >
        Post
      </button>
    </div>
  );
};

const Feeds = () => {
  const [feedsData, setFeedsData] = useState<Array<any>>([]);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const { setWalletAddress, setLoading } = useGlobalContext();

  useEffect(() => {
    fetchFeedsData();
  }, []);

  useEffect(() => {
    console.log("Feeds data", feedsData, feedsData.length);
  }, [feedsData]);

  const fetchFeedsData = async () => {
    setLoading(true);
    const feedIdsArray: Array<string> = await fetchFeeds();
    const _feedsData: Array<any> = [];
    for (let i = 0; i < feedIdsArray.length; i++) {
      const _feedData = await fetchFeedData(feedIdsArray[i]);
      _feedData.subFeeds = await fetchSubFeedsData(_feedData.id);
      _feedsData.push(_feedData);
    }
    setFeedsData(_feedsData);
    setLoading(false);
    // console.log("Feeds data", _feedsData);
  };

  const fetchSubFeedsData = async (feedId: string) => {
    return await fetchSubFeeds(feedId);
  };

  const handleReplyChange = (id: string, value: string) => {
    setReplyInputs((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleReply = async (id: string) => {
    console.log("Reply to:", id);

    // Create subfeed transaction
    if (replyInputs[id]?.length === 0) return;
    console.log("Reply:", replyInputs[id]);

    setLoading(true);
    try {
      if (!window.arweaveWallet) {
        alert("Please install ArConnect to post feeds.");
        setLoading(false);
        return;
      }

      // Connect wallet if haven't already
      await connectWallet();

      // Get wallet address
      const _walletAddress = await window.arweaveWallet.getActiveAddress();

      // Create proper transaction
      const subFeed = {
        id: _walletAddress + "_" + Date.now().toString(),
        author: _walletAddress,
        content: replyInputs[id],
        created_at: Date.now(),
        upvotes: 0,
        downvotes: 0,
        parentFeedId: id,
      };
      console.log("SubFeed:", subFeed);

      // Sign and send transaction
      let tx = await arweave.createTransaction({
        data: JSON.stringify(subFeed),
      });
      tx.addTag("App-Name", APP_IDENTIFIER);
      tx.addTag("Content-Type", SUB_FEED_IDENTIFIER);
      tx.addTag("Feed-ID", subFeed.id);
      tx.addTag("Parent-Feed-ID", id);

      try {
        // dispatch the tx
        const res = await window.arweaveWallet.dispatch(tx);
        console.log("Transaction response:", res);
      } catch (error) {
        alert("Error signing transaction");
        setLoading(false);
        return;
      }

      setReplyInputs((prevState) => {
        delete prevState[id];
        return prevState;
      });
      setLoading(false);

      // Update the feed data
      await fetchFeedsData();
      await handleKnowledgeMint(subFeed.id, 0.1);
    } catch (error) {
      alert("Please install & connect ArConnect to post feeds.");
      return;
    }
  };

  const handleVoting = async (id: string, type: string) => {
    console.log("Voting:", id, type);
    setLoading(true);
    try {
      if (!window.arweaveWallet) {
        alert("Please install ArConnect to post feeds.");
        setLoading(false);
        return;
      }

      // Connect wallet if haven't already
      await connectWallet();

      // Get wallet address
      const _walletAddress = await window.arweaveWallet.getActiveAddress();

      // Create proper transaction
      const vote = {
        id: _walletAddress + "_" + Date.now().toString(),
        author: _walletAddress,
        type: type,
        created_at: Date.now(),
        feedId: id,
      };
      console.log("Vote:", vote);

      // Sign and send transaction
      let tx = await arweave.createTransaction({ data: JSON.stringify(vote) });
      tx.addTag("App-Name", APP_IDENTIFIER);
      tx.addTag("Content-Type", type);
      tx.addTag("Assoc-Feed-ID", id);

      try {
        // dispatch the tx
        const res = await window.arweaveWallet.dispatch(tx);
        console.log("Transaction response:", res);
      } catch (error) {
        alert("Error signing transaction");
        setLoading(false);
        return;
      }

      setLoading(false);
      // Update the feed data
      await fetchFeedsData();
    } catch (error) {
      alert("Please install & connect ArConnect to post feeds.");
      return;
    }
  };

  const handleKnowledgeMint = async (feedId: string, amount: number) => {
    console.log("Minting knowledge");
    setLoading(true);
    try {
      if (!window.arweaveWallet) {
        alert("Please install ArConnect to mint knowledge.");
        setLoading(false);
        return;
      }

      // Connect wallet if haven't already
      await connectWallet();

      // Get wallet address
      const _walletAddress = await window.arweaveWallet.getActiveAddress();

      // Create proper transaction
      const knowledge = {
        id: _walletAddress + "_" + Date.now().toString(),
        author: _walletAddress,
        feedId,
        created_at: Date.now(),
        amount,
      };
      console.log("Knowledge object:", knowledge);

      // Sign and send transaction
      let tx = await arweave.createTransaction({
        data: JSON.stringify(knowledge),
      });
      tx.addTag("App-Name", KNOWLEDGE_IDENTIFIER);
      tx.addTag("Content-Type", KNOWLEDGE_MINT_IDENTIFIER);
      tx.addTag("User-Address", _walletAddress);

      try {
        // dispatch the tx
        const res = await window.arweaveWallet.dispatch(tx);
        console.log("Transaction response:", res);
      } catch (error) {
        alert("Error signing transaction");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      alert("Please install & connect ArConnect to mint knowledge.");
      setLoading(false);
      return;
    }
  };

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
        throw new Error("Error connecting wallet");
      }
    } else {
      alert("Wallet not found");
      return;
    }
  };

  return (
    <section className="flex flex-col w-full gap-8">
      <NewFeed fetchFeedsData={fetchFeedsData} />

      <div className="flex flex-col gap-4">
        {feedsData.map((f) => (
          <div
            key={f.id}
            className="flex flex-col gap-4 p-4 bg-slate-700 rounded-lg"
          >
            <div className="flex gap-4">
              <img
                src="/avatar.jpg"
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex flex-col gap-2">
                <p className="text-lg font-bold">
                  {f?.author.substring(0, 5) + "..." + f?.author.slice(-5)}
                </p>
              </div>
            </div>
            <p className="text-lg">{f?.content}</p>
            <div className="flex gap-4">
              <p className="text-sm text-slate-400">
                {new Date(f?.created_at)?.toLocaleString()}
              </p>
              <div className="flex gap-4">
                <p
                  className="text-sm text-slate-400 cursor-pointer hover:underline"
                  onClick={() => handleVoting(f?.id, UPVOTE_IDENTIFIER)}
                >
                  {f?.upvotes} Upvotes
                </p>
                <p
                  className="text-sm text-slate-400 cursor-pointer hover:underline"
                  onClick={() => handleVoting(f?.id, DOWNVOTE_IDENTIFIER)}
                >
                  {f?.downvotes} Downvotes
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                className="w-full bg-transparent border border-gray-500 rounded-lg p-2"
                placeholder="Reply to this feed..."
                onChange={(e) => handleReplyChange(f.id, e.target.value)}
                value={replyInputs[f.id] || ""}
              />
              <button
                className="border border-gray-500 p-2 rounded-lg hover:bg-white hover:text-black"
                onClick={() => handleReply(f?.id)}
              >
                Reply
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {f.subFeeds.map((sf: any) => (
                <div
                  key={sf.id}
                  className="flex gap-4 p-4 bg-slate-600 rounded-lg"
                >
                  <img
                    src="/avatar.jpg"
                    alt="avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold">
                      {sf?.author.substring(0, 5) +
                        "..." +
                        sf?.author.slice(-5)}
                    </p>
                  </div>
                  <p className="text-sm">{sf?.content}</p>
                  <div className="flex gap-4">
                    <p className="text-xs text-slate-400">
                      {new Date(sf?.created_at)?.toLocaleString()}
                    </p>
                    <div className="flex gap-4">
                      <p
                        className="text-xs text-slate-400 cursor-pointer hover:underline"
                        onClick={() => handleVoting(sf.id, UPVOTE_IDENTIFIER)}
                      >
                        {sf?.upvotes} Upvotes
                      </p>
                      <p
                        className="text-xs text-slate-400 cursor-pointer hover:underline"
                        onClick={() => handleVoting(sf.id, DOWNVOTE_IDENTIFIER)}
                      >
                        {sf?.downvotes} Downvotes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Topics = () => {
  return (
    <section className="flex gap-8">This is Topics, more to come here.</section>
  );
};

const Users = () => {
  return (
    <section className="flex gap-8">This is Users, more to come here.</section>
  );
};
