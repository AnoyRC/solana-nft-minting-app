import './App.css';
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl,PublicKey, Keypair } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import * as anchor from "@project-serum/anchor";

const connection = new Connection(clusterApiUrl("devnet"));
const wallet = Keypair.generate();
const opts = {
  preFlightCommitment: "processed"
}
export const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
  "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
);

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage());



const App = () => {
  const[walletAddress, setWalletAddress] = useState(null)
 
  

  const getProvider = () => {
    const Provider = new anchor.AnchorProvider(
      connection,
      window.solana,
      opts.preFlightCommitment
    );
    return Provider;
  }

  const getCandyMachineId = () => {
    try {
      return new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID);
    } catch (e) {
      console.log("Failed to construct CandyMachineId", e);
      return undefined;
    }
  };

  const candyMachineId = getCandyMachineId();
  const getProgramState = async () => {
    const provider = getProvider();
    const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);
    const program = new anchor.Program(idl, CANDY_MACHINE_PROGRAM, provider);
    const state = await program.account.candyMachine.fetch(candyMachineId);
    console.log(state.data.itemsAvailable.toNumber())
    return [program, state];
  };


  const checkIfWalletConnected = async() => {
    try {
      const {solana} = window;
      if(solana){
        if(solana.isPhantom){
          console.log("Phantom Wallet found !")
          const response = await solana.connect({
            onlyIfTrusted : true,
          })
          console.log("Connected to Public Key : ",
            response.publicKey.toString()
          )
          setWalletAddress(response.publicKey.toString())
          getProgramState()
        }
      }else{
        alert("Solana object not found! Get a phantom wallet")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async() => {
    const { solana } = window;
    if(solana){
      const response = await solana.connect();
      console.log("Connected to Public Key : ",
            response.publicKey.toString()
      )
      setWalletAddress(response.publicKey.toString())
    }
  }

  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletConnected();
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  },[])

  const renderNotConnectedContainer = () => {
    return <button onClick = {connectWallet}> Connect Wallet </button>
  }

  const renderConnectedContainer = () => {
    return <></>
  }

  return(
    <>
      {(!walletAddress && renderNotConnectedContainer()) || renderConnectedContainer()}
    </>
  );
}

export default App;
