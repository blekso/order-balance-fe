import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
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

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      console.error("User denied account access:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum && provider === null) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
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
