import {
  APP_IDENTIFIER,
  DOWNVOTE_IDENTIFIER,
  FEED_IDENTIFIER,
  KNOWLEDGE_IDENTIFIER,
  KNOWLEDGE_MINT_IDENTIFIER,
  UPVOTE_IDENTIFIER,
} from "@/utils/constant";
import Arweave from "arweave";

export const arweave = new Arweave({
  host: "ar-io.net",
  port: 443,
  protocol: "https",
});

export const fetchFeeds = async () => {
  const query = {
    op: "and",
    expr1: {
      op: "equals",
      expr1: "App-Name",
      expr2: APP_IDENTIFIER,
    },
    expr2: {
      op: "equals",
      expr1: "Content-Type",
      expr2: FEED_IDENTIFIER,
    },
  };

  const res = await arweave.arql(query);
  console.log("Feeds:", res);

  return res;
};

// Fetch Feed Data
export const fetchFeedData = async (feedId: string) => {
  const res = await arweave.transactions.getData(feedId, {
    decode: true,
    string: true,
  });

  // @ts-ignore
  const votes = await fetchVotes(JSON.parse(res).id);
  console.log("Votes:", votes);

  if (typeof res == "string")
    return {
      ...JSON.parse(res),
      downvotes: votes.downVotes.length,
      upvotes: votes.upVotes.length,
    };
  else
    return {
      res,
      downvotes: votes.downVotes.length,
      upvotes: votes.upVotes.length,
    };
};

// Fetch Sub Feeds
export const fetchSubFeeds = async (feedId: string) => {
  console.log("Feed ID:", feedId);
  const query = {
    op: "and",
    expr1: {
      op: "equals",
      expr1: "App-Name",
      expr2: APP_IDENTIFIER,
    },
    expr2: {
      op: "equals",
      expr1: "Parent-Feed-ID",
      expr2: feedId,
    },
  };

  const res = await arweave.arql(query);
  console.log("Sub Feeds:", res);

  let _subFeeds: Array<any> = [];
  for (let i = 0; i < res.length; i++) {
    const _feedId = res[i];
    const feedData = await fetchSubFeedData(_feedId);
    const _votes = await fetchVotes(feedData.id);
    console.log("Votes:", _votes);
    feedData.downvotes = _votes.downVotes.length;
    feedData.upvotes = _votes.upVotes.length;
    _subFeeds.push(feedData);
  }

  console.log("Sub Feeds Data:", _subFeeds);
  return _subFeeds;
};

// Fetch Sub Feed Data
const fetchSubFeedData = async (feedId: string) => {
  const res = await arweave.transactions.getData(feedId, {
    decode: true,
    string: true,
  });

  if (typeof res == "string") return JSON.parse(res);
  else return res;
};

// Fetch Votes
const fetchVotes = async (feedId: string) => {
  const upVotes = await fetchUpVotes(feedId);
  const downVotes = await fetchDownVotes(feedId);

  // console.log("Up Votes:", upVotes);
  // console.log("Down Votes:", downVotes);
  return { upVotes, downVotes };
};

// Fetch UpVotes
const fetchUpVotes = async (feedId: string) => {
  const query = {
    op: "and",
    expr1: {
      op: "equals",
      expr1: "App-Name",
      expr2: APP_IDENTIFIER,
    },
    expr2: {
      op: "and",
      expr1: {
        op: "equals",
        expr1: "Content-Type",
        expr2: UPVOTE_IDENTIFIER,
      },
      expr2: {
        op: "equals",
        expr1: "Assoc-Feed-ID",
        expr2: feedId,
      },
    },
  };

  const res = await arweave.arql(query);
  console.log("Votes:", res);

  let _votes: Array<any> = [];
  for (let i = 0; i < res.length; i++) {
    const voteId = res[i];
    const voteData = await fetchVotesData(voteId);
    _votes.push(voteData);
  }

  return _votes;
};

// Fetch DownVotes
const fetchDownVotes = async (feedId: string) => {
  const query = {
    op: "and",
    expr1: {
      op: "equals",
      expr1: "App-Name",
      expr2: APP_IDENTIFIER,
    },
    expr2: {
      op: "and",
      expr1: {
        op: "equals",
        expr1: "Content-Type",
        expr2: DOWNVOTE_IDENTIFIER,
      },
      expr2: {
        op: "equals",
        expr1: "Assoc-Feed-ID",
        expr2: feedId,
      },
    },
  };

  const res = await arweave.arql(query);
  console.log("Votes:", res);

  let _votes: Array<any> = [];
  for (let i = 0; i < res.length; i++) {
    const voteId = res[i];
    const voteData = await fetchVotesData(voteId);
    _votes.push(voteData);
  }

  return _votes;
};

// Fetch Votes Data
export const fetchVotesData = async (voteId: string) => {
  const res = await arweave.transactions.getData(voteId, {
    decode: true,
    string: true,
  });

  if (typeof res == "string") return JSON.parse(res);
  else return res;
};

// Fetch Knowledge Balance
export const fetchKnowledgeBalance = async (walletAddress: string) => {
  const query = {
    op: "and",
    expr1: {
      op: "equals",
      expr1: "App-Name",
      expr2: KNOWLEDGE_IDENTIFIER,
    },
    expr2: {
      op: "and",
      expr1: {
        op: "equals",
        expr1: "Content-Type",
        expr2: KNOWLEDGE_MINT_IDENTIFIER,
      },
      expr2: {
        op: "equals",
        expr1: "User-Address",
        expr2: walletAddress,
      },
    },
  };

  const res = await arweave.arql(query);
  console.log("Knowledge Balance:", res);

  let _totalKnowledge = 0;
  for (let i = 0; i < res.length; i++) {
    const balanceId = res[i];
    const balanceData = await fetchKnowledgeBalanceData(balanceId);
    _totalKnowledge += balanceData.amount;
    console.log("Knowledge Balance Data:", balanceData);
  }

  console.log("Total Knowledge Balance:", _totalKnowledge);
  return _totalKnowledge;
};

// Fetch Knowledge Token Balance data
export const fetchKnowledgeBalanceData = async (balanceId: string) => {
  const res = await arweave.transactions.getData(balanceId, {
    decode: true,
    string: true,
  });

  if (typeof res == "string") return JSON.parse(res);
  else return res;
};
