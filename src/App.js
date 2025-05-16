import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/navbar";
import Footer from "./components/footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const location = useLocation();

  // Check if current path starts with /admin
  const shouldHideNav =
  location.pathname.startsWith("/admin") ||
  location.pathname === "/DashboardAdmin" ||
  location.pathname === "/addMeals" ||
  location.pathname === "/mealsAdmin"||
  location.pathname === "/CustomersList"||
  location.pathname === "/RegistrationReport" ;
  
 

  return (
    <>
      {!shouldHideNav && <NavBar />}
      <Outlet />
      <ToastContainer />
      {!shouldHideNav && <Footer />}
    </>
  );
}

export default App;
