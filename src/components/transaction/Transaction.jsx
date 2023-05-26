import React from 'react';

import Web3 from 'web3';
import { useState, useContext } from 'react';
import Context from '../../context';
import SendTrx from '../send/SendTrx';


const Transaction = () => {
    
    const {balance, setBalance, wallet, setWallet} = useContext(Context);
    const web3 = new Web3();
    console.log(wallet)

    web3.setProvider(
        new web3.providers.HttpProvider('https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903')
    );

    //TODO: Cambiar el string por el seed que ingresa en el login
    web3.eth.getBalance(wallet.address, (error, result) => {
        var balance = web3.utils.fromWei(result, 'ether');
        setBalance(balance)
    });

    return (
        <div id="transaction-continer">
            <h1>Transaction Details</h1>
            <h3>Wallet Address: {wallet.address}</h3>
            <h3>Wallet Balance: {balance}</h3>
            <SendTrx></SendTrx>
            <div id="section-container">
                
            </div>
        </div>
    );
}

export default Transaction;
