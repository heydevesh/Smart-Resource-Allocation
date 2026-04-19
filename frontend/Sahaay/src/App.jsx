import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import "../src/index.css"
import Dashboard from "./pages/Dashboard";
import NeedsMap from "./pages/NeedsMap";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<NeedsMap />} />
      </Routes>
    </>
  );
}

export default App;