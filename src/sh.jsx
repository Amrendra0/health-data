import React, { useState } from 'react';
import Web3 from 'web3';

const contractAbi = [/* Your contract ABI here */];
const contractAddress = '0xYourContractAddressHere';

const HealthDataApp = () => {
    const [account, setAccount] = useState('');
    const [healthData, setHealthData] = useState({
        data_type: '',
        value: '',
        timestamp: '',
    });
    const [consent, setConsent] = useState({
        researcher: '',
        data_type: '',
        start_date: '',
        end_date: '',
    });
    const [requestDataId, setRequestDataId] = useState('');
    const [requestedData, setRequestedData] = useState(null);
    const web3 = new Web3(Web3.givenProvider);

    const connectWallet = async () => {
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
    };

    const submitData = async () => {
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const { data_type, value, timestamp } = healthData;
        await contract.methods.submit_data(account, { data_type, value, timestamp }).send({ from: account });
    };

    const grantConsent = async () => {
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const { researcher, data_type, start_date, end_date } = consent;
        await contract.methods.grant_consent(account, { researcher, data_type, start_date, end_date }).send({ from: account });
    };

    const requestData = async () => {
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        try {
            const data = await contract.methods.request_data(account, requestDataId).call({ from: account });
            setRequestedData(data);
        } catch (error) {
            console.error("Access denied or other error:", error);
        }
    };

    return (
        <div>
            <button onClick={connectWallet}>Connect Wallet</button>
            <div>
                <h2>Submit Health Data</h2>
                <input type="text" placeholder="Data Type" onChange={e => setHealthData({ ...healthData, data_type: e.target.value })} />
                <input type="text" placeholder="Value" onChange={e => setHealthData({ ...healthData, value: e.target.value })} />
                <input type="text" placeholder="Timestamp" onChange={e => setHealthData({ ...healthData, timestamp: e.target.value })} />
                <button onClick={submitData}>Submit Data</button>
            </div>
            <div>
                <h2>Grant Consent</h2>
                <input type="text" placeholder="Researcher" onChange={e => setConsent({ ...consent, researcher: e.target.value })} />
                <input type="text" placeholder="Data Type" onChange={e => setConsent({ ...consent, data_type: e.target.value })} />
                <input type="text" placeholder="Start Date" onChange={e => setConsent({ ...consent, start_date: e.target.value })} />
                <input type="text" placeholder="End Date" onChange={e => setConsent({ ...consent, end_date: e.target.value })} />
                <button onClick={grantConsent}>Grant Consent</button>
            </div>
            <div>
                <h2>Request Data</h2>
                <input type="text" placeholder="Data ID" onChange={e => setRequestDataId(e.target.value)} />
                <button onClick={requestData}>Request Data</button>
                {requestedData && (
                    <div>
                        <h3>Requested Data</h3>
                        <p>Data Type: {requestedData.data_type}</p>
                        <p>Value: {requestedData.value}</p>
                        <p>Timestamp: {requestedData.timestamp}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthDataApp;

const grantConsent = async () => {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    const { researcher, data_type, start_date, end_date } = consent;
    await contract.methods.grant_consent(account, { researcher, data_type, start_date, end_date }).send({ from: account });
};

const requestData = async () => {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    try {
        const data = await contract.methods.request_data(account, requestDataId).call({ from: account });
        setRequestedData(data);
    } catch (error) {
        console.error("Access denied or other error:", error);
    }
};

const connectWallet = async () => {
    const accounts = await web3.eth.requestAccounts();
    setAccount(accounts[0]);
};


const submitData = async () => {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    const { data_type, value, timestamp } = healthData;
    await contract.methods.submit_data(account, { data_type, value, timestamp }).send({ from: account });
};
