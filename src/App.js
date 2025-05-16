import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import NavBar from "./components/navbar";
import Footer from "./components/footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loader from "./components/loader";

function App() {
  const location = useLocation();
   const [loading, setLoading] = useState(false);

  // Show loader on route change
  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 800); // adjust timing as needed

    return () => clearTimeout(timeout);
  }, [location.pathname]);


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
         {loading ? (
        <Loader />
      ) : (
        <>
      {!shouldHideNav && <NavBar />}
      <Outlet />
      <ToastContainer />
      {!shouldHideNav && <Footer />}
    </>
      )}
    </>
  );
}

export default App;
