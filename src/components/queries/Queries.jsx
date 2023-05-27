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
    const { register: registerTransfer, handleSubmit:handleSubmitTransfer, formState: { errors: errorsTransfer } } = useForm();
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

    let contractAddress = "0xb0fac10355e52b65265116db35519ccd7a726530"; //Change the address of the deployed contract
    let contract = new web3.eth.Contract(ABI.default, contractAddress);
    
    //Contract Methods
    const showBalance = async (contract, selected) => {
    
        let balance = await contract.methods.balanceOf(selected).call(); //wallet address
        return balance;
    }
    
    const mint = async(contract, selected, amount) => {
        //TODO: sign transaction using Metamask
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

    const transfer = async(to, amount) => {
        
        let result = await contract.methods.transfer(to, amount).encodeABI();
        var rawData = {
            from: wallet.address,
            to: contractAddress,
            value: 0,
            gasPrice: web3.utils.toHex(10000000000),
            gasLimit: web3.utils.toHex(1000000),
            nonce: await web3.eth.getTransactionCount(wallet.address),
            data: result
        }

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

    //Form HandleSubmits
    const viewBalance = async (data) => {
        setCurrentBalance(await showBalance(contract, data.balanceOf));
    };

    const mintAmount = async (data) => {
        await mint(contract, data.address, data.amount)
    };

    const transferAmount = async (data) => {
       await transfer(data.to, data.amount);
       //console.log(data)
    }

    return (
        <div id='queries-container'>
            <h1>MarketPayAudit Contract</h1>
            <div className='methods-container'>
            <>
                <h3>BalanceOf</h3>
                <form onSubmit={handleSubmit(viewBalance)}>
                    
                    <input {...register("balanceOf", { required: true })} placeholder='Enter Address'/>
                    {errors.balanceOf && <span>This field is required</span>}
                    
                    <input type="submit" value="BalanceOf" />
                    {currentBalance != null?<p>Current Balance: {currentBalance}</p>:''}
                </form>
                
            </>

            <>  
                <h3>Mint</h3>
                <form onSubmit={handleSubmitMint(mintAmount)}>
                    <input {...registerMint("address", { required: true })} placeholder='Enter Address'/>
                    {errorsMint.address && <span>This field is required</span>}

                    <input {...registerMint("amount", { required: true })} placeholder='Enter the Amount'/>
                    {errorsMint.amount && <span>This field is required</span>}
                    
                    <input type="submit" value="Mint" />
                </form>
    
            </>

            <>
                <h3>Transfer</h3>
                <form onSubmit={handleSubmitTransfer(transferAmount)}>
                    <input {...registerTransfer("to", { required: true })} placeholder='Destination Address'/>
                    {errorsTransfer.to && <span>This field is required</span>}

                    <input {...registerTransfer("amount", { required: true })} placeholder='Enter the Amount'/>
                    {errorsTransfer.amount && <span>This field is required</span>}
                    
                    <input type="submit" value="Transfer" />
                </form>
            </>
                
            </div>
        </div>
    );
}

export default Queries;
