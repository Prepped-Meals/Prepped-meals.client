import { Outlet } from "react-router-dom";
import NavBar from "./components/navbar";

function App() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

export default App;
