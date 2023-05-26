import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Queries from './components/queries/Queries';
import Context from './context';
import Login from './components/login/Login';
import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route} from "react-router-dom";

const Container = () => {
  const [logged, setLogged] = useState(false);
  const [balance, setBalance] = useState(0);
  const [wallet, setWallet] = useState();
  const [result, setResult] = useState(<Login/>);
  const [mmLogged, setMmLogged] = useState(false);

  return (
    
    <Context.Provider value={{
      logged, setLogged,
      balance, setBalance,
      wallet, setWallet,
      mmLogged, setMmLogged,
      result, setResult
      }}>
      <BrowserRouter >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/queries" element={<Queries />} />
        </Routes>
      </BrowserRouter>
    </Context.Provider>
  );

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Container />
  </React.StrictMode>
);