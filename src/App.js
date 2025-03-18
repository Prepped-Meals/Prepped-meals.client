import { Outlet } from "react-router-dom";
import NavBar from "./components/navbar";
import Footer from "./components/footer";

function App() {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
