import { createBrowserRouter } from "react-router-dom";
// import ProtectedRoute from "./protectedRoute";
import { AuthProvider } from "../context/authContext";
import App from "../App";
import Home from "../pages/home";
import Menu from "../pages/menu";
import Cart from "../pages/cart";
import Payment from "../pages/payment";
import SignIn from "../pages/signIn";
import SignUp from "../pages/signUp";
import MealsAdmin from "../pages/mealsAdmin";
import AddMeals from "../pages/addMeals";
import { ROUTES } from "./paths";
import CardPayment from "../pages/cardPayment";
import CustomerProfile from "../pages/customerProfile";
import ResetPassword from "../pages/ResetPassword";
import OrdersPage from "../pages/orders"; 
import DashboardAdmin from "../pages/adminDashboard";
import FeedbackPage from "../pages/feedback"; 
import AdminFeedbackPage from "../pages/adminFeedbacks";



export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.MENU, element: <Menu /> },
      { path: ROUTES.SIGN_IN, element: <SignIn /> },
      { path: ROUTES.SIGN_UP, element: <SignUp /> },
      {
        path: ROUTES.CART,
        element: (
          //<ProtectedRoute>
          <Cart />
          //</ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PAYMENT,
        element: (
          // <ProtectedRoute>
          <Payment />
          // </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.MEALS_ADMIN,
        element: <MealsAdmin />,
      },
      {
        path: ROUTES.ADD_MEALS,
        element: <AddMeals />,
      },
      {
        path: ROUTES.CARDPAYMENT,
        element: <CardPayment/>,
      },

      {
        path: ROUTES.CUSTOMER_PROFILE,
        element: <CustomerProfile />,
      },

      {
        path: ROUTES.RESET_PASSWORD,
        element: <ResetPassword />,
      },

      {
        path: ROUTES.DASHBOARD_ADMIN,
        element: <DashboardAdmin/>
      },
      
      {
        path: ROUTES.MYORDERS,
        element: <OrdersPage />, 
      },

      {
        path: ROUTES.CUSTOMER_FEEDBACK,
        element: <FeedbackPage />,
        
      },

      {
        path: ROUTES.LOGOUT_ADMIN,
        element: <SignIn />,
      },

      {
        path: ROUTES.ADMIN_FEEDBACK,
        element : <AdminFeedbackPage/>,
      },


    ],
  },
]);
