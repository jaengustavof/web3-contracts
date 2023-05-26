import React, { useContext }  from 'react';
import Context from '../../context';
import { useForm } from "react-hook-form";
import Web3 from 'web3';
import './sendTrx.scss';
import { useNavigate } from "react-router-dom";



const SendTrx = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const {setBalance, wallet, mmLogged} = useContext(Context);
    const navigate = useNavigate();

    const web3 = new Web3();

    web3.setProvider(
        new web3.providers.HttpProvider('https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903')
    );

    const sendTrx = async (rawData, wallet) =>{

        if(mmLogged){

            window.ethereum
            .request({
            method: 'eth_sendTransaction',
            params: [
                {
                from: rawData.from, 
                to: rawData.to, 
                value: rawData.value, 
                gasPrice: rawData.gasPrice, 
                gas: rawData.gas,
                },
            ],
            })
            .then((txHash) => {
                console.log(wallet.address)
                web3.eth.getBalance(wallet.address, (error, result) => {
                    var balance = web3.utils.fromWei(result, 'ether');
                    console.log(balance)
                    setBalance(balance)
                });
                console.log(txHash)
            } )
            .catch((error) => console.error(error));
    

        }else {
            await web3.eth.accounts.signTransaction(rawData, wallet.privateKey.toString('hex')).then(response =>{
                web3.eth.sendSignedTransaction(response.rawTransaction).then(
                    receipt => {
                        console.log(receipt)
                        web3.eth.getBalance(wallet.address, (error, result) => {
                            var balance = web3.utils.fromWei(result, 'ether');
                            setBalance(balance)
                        });
                    },
                    error => {
                        console.log(error)
                    }
                );
            });
        }
           
    }

    const onSubmit = (data) => {
        const rawData = {
            from: wallet.address,
            to: data.to,
            value:  web3.utils.toHex(data.amount*1000000000000000000),
            gasPrice: web3.utils.toHex(10000000000),
            gasLimit: web3.utils.toHex(1000000),
            nonce: web3.eth.getTransactionCount(wallet.address)
        };
        sendTrx(rawData, wallet)
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} id='send-trx-form'>
                
                <label>Amount</label>
                <input {...register("amount", { required: true })} placeholder="0 ETH"/>
                {errors.amount && <span>This field is required</span>}

                <label>to</label>
                <input {...register("to", { required: true })} placeholder="Ei: 0x2853817e2e6e3d51776af01..." />
                {errors.to && <span>This field is required</span>}
                
                <input type="submit" value="Send"/>
            </form> 
        <button onClick={()=>navigate("/queries")}>MarketPayAudit Contract</button>  
        </>
       
    );
}

export default SendTrx;
