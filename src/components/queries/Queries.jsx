import React, {useState, useContext} from 'react';
import './queries.scss'
import Web3 from 'web3';
import * as ABI from '../../abi.json'
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Context from '../../context';

const Queries = () => {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const { register: registerMint, handleSubmit:handleSubmitMint, formState: { errors: errorsMint } } = useForm();
    const [currentBalance, setCurrentBalance] = useState(null);

    const {wallet, logged} = useContext(Context);
    const navigate = useNavigate();

    if(!logged) {
        navigate("/");
    }
    //Contract
    let web3 = new Web3();

    web3.setProvider(
        new web3.providers.HttpProvider('https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903')
    );

    let contractAddress = "0x88CdDf322037d8d7bd013E478aCDf23A19081d6e"; //Change the address of the deployed contract
    let contract = new web3.eth.Contract(ABI.default, contractAddress);

    const showBalance = async (contract, selected) => {
    
        let balance = await contract.methods.balanceOf(selected).call(); //wallet address
        return balance;
    }
    
    const mint = async(contract, selected, amount) => {

        let result = await contract.methods.mint(selected, amount).encodeABI(); //wallet address
        var rawData = {
            from: selected,
            to: contractAddress,
            value: 0,
            gasPrice: web3.utils.toHex(10000000000),
            gasLimit: web3.utils.toHex(1000000),
            nonce: await web3.eth.getTransactionCount(selected),
            data: result
        };
        
       var signed = await web3.eth.accounts.signTransaction(rawData, wallet.privateKey.toString('hex'));
        
       web3.eth.sendSignedTransaction(signed.rawTransaction).then(
            receipt => {
                console.log(receipt)
            },
            error => {
                console.log(error)
            }
        );
    }

    const viewBalance = async (data) => {
        setCurrentBalance(await showBalance(contract, data.balanceOf));
    };

    const mintAmount = async (data) => {
            await mint(contract, data.address, data.amount)
    };

    return (
        <div id='queries-container'>
            <h1>MarketPayAudit Contract</h1>
            <div className='Methods-container'>
            <>
                <form onSubmit={handleSubmit(viewBalance)}>
                    <input {...register("balanceOf", { required: true })} placeholder='Enter Address'/>
                    {errors.balanceOf && <span>This field is required</span>}
                    
                    <input type="submit" value="BalanceOf" />
                </form>
                {currentBalance != null?<p>Current Balance: {currentBalance}</p>:''}
            </>

            <>
                <form onSubmit={handleSubmitMint(mintAmount)}>
                    <input {...registerMint("address", { required: true })} placeholder='Enter Address'/>
                    {errorsMint.address && <span>This field is required</span>}

                    <input {...registerMint("amount", { required: true })} placeholder='Enter the Amount'/>
                    {errorsMint.amount && <span>This field is required</span>}
                    
                    <input type="submit" value="Mint" />
                </form>
    
            </>
                
            </div>
        </div>
    );
}

export default Queries;
