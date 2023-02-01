import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import FDKEnkel from "./output/FDK-datadeling-enkel.svg"

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <img src={FDKEnkel}  />
      
    </div>
  );
}

export default App;
