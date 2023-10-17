import React, { useState, useEffect } from 'react';
import { Button, Input, Form } from 'antd';
import { useSDK } from '@metamask/sdk-react';
import { BrowserProvider, ethers } from 'ethers';
import { abi, contractAddress } from './const';
import './App.css';

const App = () => {
  const { sdk } = useSDK();
  const [provider, setProvider] = useState<BrowserProvider>();
  const [contract, setContract] = useState<any>();
  const connect = async () => {
    try {
      await sdk?.connect();
      // provider to the blockChain
      const provider = new ethers.BrowserProvider(window.ethereum);
      // signer to sign the transcation
      const signer = await provider.getSigner();
      // contract address and ABI
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setProvider(provider);
      setContract(contract);
    } catch (err) {
      console.warn('failed to connect..', err);
    }
  };
  const fund = async ({ ethAmount }: { ethAmount: string }) => {
    try {
      const transcationResponse = await contract.fund({
        value: ethers.parseEther(ethAmount),
      });
      console.log(transcationResponse);
      provider?.once(transcationResponse.hash, (receipt) => {
        console.log(receipt);
      });
    } catch (err) {
      console.warn('fund failed', err);
    }
  };
  const getBalance = async () => {
    try {
      const address = await contract.getAddress();
      const balance = await provider?.getBalance(address);
      console.log(ethers.formatEther(balance as bigint));
    } catch (err) {
      console.warn('get balance failed', err);
    }
  };
  const withdraw = async () => {
    try {
      const transcationResponse = await contract.withdraw();
      await transcationResponse.wait(1);
      await getBalance();
    } catch (err) {
      console.warn('withdraw failed', err);
    }
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className='container'>
      <Form onFinish={fund}>
        <Form.Item name='ethAmount' label='fund'>
          <Input />
        </Form.Item>
        <Button type='primary' htmlType='submit'>
          Fund
        </Button>
      </Form>
      <Button onClick={getBalance}>GetBalance</Button>
      <Button onClick={withdraw}>Withdraw</Button>
    </div>
  );
};

export default App;
