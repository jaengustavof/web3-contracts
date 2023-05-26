
import './App.css';
import Login from './components/login/Login';
import Transaction from './components/transaction/Transaction.jsx'
import Context from './context';
import { useEffect, useContext } from 'react';

function App() {

  const {logged, result, setResult} = useContext(Context);
  
  useEffect(() => {
    logged?setResult(<Transaction/>):setResult(<Login/>);

  }, [logged, setResult]);

  return (

      <div className="App">
        {result}
      </div>

  );
}

export default App;
