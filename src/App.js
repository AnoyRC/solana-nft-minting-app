import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { useEffect, useState } from 'react';

const App = () => {
  const[walletAddress, setWalletAddress] = useState(null)

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
