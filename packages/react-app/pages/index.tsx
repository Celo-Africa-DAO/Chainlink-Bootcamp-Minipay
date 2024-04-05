//This code shows the interaction with the celo blockchain, the alfajores testnet
//It allows users to send cusd (celo stablecoin) to an address, and to sign a message

import PrimaryButton from "@/components/Button";
import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http, parseEther, stringToHex } from "viem";
import { useAccount } from "wagmi";
import StableTokenABI from "../abis/cusd-abi.json";
import { celoAlfajores } from "viem/chains";

// Initialize a public client for interacting with the blockchain without needing a user's wallet.
// This is particularly useful for reading data or waiting for transactions to be mined.
const publicClient = createPublicClient({
  chain: celoAlfajores,  // Specifies the Celo Alfajores testnet as the blockchain network.
  transport: http(),
});

// Define the main functional component for the home page.
export default function Home() {
  // useState hook to store the user's blockchain address and transaction details.
  const [userAddress, setUserAddress] = useState("");
  const { address, isConnected } = useAccount();
  const [tx, setTx] = useState<any>(undefined);

  const cUSDTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Testnet

  // useEffect hook to update the userAddress state when the wallet connects or disconnects.
  useEffect(() => {
    if (isConnected && address) {
      setUserAddress(address);
    }
  }, [address, isConnected]);

   // Function to send cUSD to a specified address. It uses the wallet client to interact with the cUSD token contract. 
  const sendCUSD = async (to: string, amount: string) => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const amountInWei = parseEther(amount);

    const tx = await walletClient.writeContract({
      address: cUSDTokenAddress,
      abi: StableTokenABI.abi,
      functionName: "transfer",
      account: address,
      args: [to, amountInWei],
    });

    let receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  // Function to sign a message using the user's wallet. This demonstrates non-transactional blockchain interaction.
  const signTransaction = async () => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    // Retrieves the user's wallet address.
    let [address] = await walletClient.getAddresses();

    const res = await walletClient.signMessage({
      account: address,
      message: stringToHex("Hello from Celo Composer MiniPay Template!"),
    });

    return res;
  };




  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h1">
        There you go... a canvas for your next Celo project!
      </div>
      {isConnected && (
        <div className="h2 text-center">Your address: {userAddress}</div>
      )}

      {address && (
        <>

          {tx && (
            <p className="font-bold mt-4">
              Tx Completed:{" "}
              {(tx.transactionHash as string).substring(0, 6)}
              ...
              {(tx.transactionHash as string).substring(
                tx.transactionHash.length - 6,
                tx.transactionHash.length
              )}
            </p>
          )}
          <div className="w-full px-3 mt-7">
            <PrimaryButton

              onClick={()=>sendCUSD(address, "0.01")}
              title="Send 0.1 cUSD to your own address"
              widthFull
            />
          </div>

          <div className="w-full px-3 mt-6">
            <PrimaryButton

              onClick={signTransaction}
              title="Sign a Message"
              widthFull
            />
          </div>




        </>
      )}
    </div>
  );
}
