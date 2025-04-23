import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/navbar";
import Footer from "./components/footer";

function App() {
  const location = useLocation();

  // Check if current path starts with /admin
  const shouldHideNav =
  location.pathname.startsWith("/admin") ||
  location.pathname === "/DashboardAdmin" ||
  location.pathname === "/addMeals" ||
  location.pathname === "/mealsAdmin" ;

  return (
    <>
      {!shouldHideNav && <NavBar />}
      <Outlet />
      {!shouldHideNav && <Footer />}
    </>
  );
}

export default App;
