import React from 'react';

import { directive } from "@babel/types";
import { useForm } from "react-hook-form";
import './login.scss';
import * as Mnemonic from 'bitcore-mnemonic';
import { hdkey } from 'ethereumjs-wallet';
import Wallet from 'ethereumjs-wallet';
import * as bip39 from 'bip39';
import * as util from '@ethereumjs/util';
import Web3 from 'web3';
import * as CryptoJS from 'crypto-js';
import { useState, useContext } from 'react';
import Context from '../../context';


export default function App() {
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const {logged, setLogged, setWallet, setMmLogged} = useContext(Context);
  const [error, setError] = useState(null);
  let encrypted = localStorage.getItem('seeds'); 
  
  const initWallet = async (origin) => {
    var mnemonic = new Mnemonic(origin);
    var seed = await bip39.mnemonicToSeed(mnemonic.toString());
    var path = "m/44'/60'/0'/0/0";
    var wallet = hdkey.fromMasterSeed(seed).derivePath(path).getWallet();
    var privateKey = wallet.getPrivateKey();
    var publicKey = util.privateToPublic(privateKey);
    var address = '0x' + util.pubToAddress(publicKey).toString('hex');

    let response = {
      privateKey: privateKey.toString('hex'),
      publicKey: publicKey.toString('hex'),
      address: address
    };
    return response;
  };

  const onSubmit = async (data) => {
    let seed = data.seed;
    let pass = data.password;

    if (encrypted) {

      setLogged(true)

      try {

        let decrypted = CryptoJS.AES.decrypt(encrypted, "1234");
        const response = await initWallet(decrypted.toString(CryptoJS.enc.Utf8));
        encrypted = window.localStorage.getItem('seeds'); 

        setLogged(true);
        setWallet(response);

      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
      
    } else {
      
      if (Mnemonic.isValid(data.seed)) {

        let toLocal = CryptoJS.AES.encrypt(seed, pass, "1234").toString();
        localStorage.setItem('seeds', toLocal);
  
        try {
         
          const response = await initWallet(data.seed);
          encrypted = window.localStorage.getItem('seeds');

          setLogged(true);
          setWallet(response);

        } catch (error) {
          console.error('Error initializing wallet:', error);
        }

      } else {
        alert('Incorrect Seeds');
      }
    }

  };

  const loginMetamask = async () => {
    try {

      if (!window.ethereum || !window.ethereum.isMetaMask) {

        setError('MetaMask extension not detected.');
        return;
        
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
    
      setWallet({address: walletAddress});
      setLogged(true);
      setMmLogged(true);


    } catch (error) {
      if (error.code === 4001) {
        
        console.log('Please connect to MetaMask.');

      } else {

        console.error(error);

      }
      throw error;
    }
  };

  return (
    <div id="form-container">
        
        <form onSubmit={handleSubmit(onSubmit)}>
        <h3>Log in / Sign U {logged}</h3>

            {encrypted == null?<input {...register("seed", { required: true })}/>: ''}
            <input {...register("password", { required: true })} />
            {errors.exampleRequired && <span>This field is required</span>}
            
            <input type="submit" />
            <button onClick={() => loginMetamask()}> LogIn Metamask</button>
        </form>
    </div>

  );
}