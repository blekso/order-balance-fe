/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

const AMOY_CHAIN_ID = "0x13882";
const AMOY_PARAMS = {
  chainId: AMOY_CHAIN_ID,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://www.oklink.com/amoy"],
};

function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const switchToAmoy = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_PARAMS],
        });
      } else {
        console.error("Failed to switch network:", switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await switchToAmoy();

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const ethersProvider = new BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      setAccount(accounts[0]);

      const network = await ethersProvider.getNetwork();
      setChainId(Number(network.chainId));

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] ?? null);
      });

      window.ethereum.on("chainChanged", async (chain: string) => {
        setChainId(parseInt(chain, 16));
        if (chain.toLowerCase() !== AMOY_CHAIN_ID) {
          await switchToAmoy();
        } else {
          window.location.reload();
        }
      });
    } catch (error) {
      console.error("User denied account access:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum && provider === null) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(async (accounts: string[]) => {
          if (accounts.length > 0) {
            await switchToAmoy();
            connectWallet();
          }
        });
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {account ? (
        <div>
          <p>
            Connected: <b>{account}</b>
            {chainId !== null ? ` (chain ${chainId})` : ""}
          </p>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnect;
