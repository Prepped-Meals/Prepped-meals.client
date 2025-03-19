import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./protectedRoute";
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
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
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
        element:<MealsAdmin/>
      },
      {
        path: ROUTES.ADD_MEALS,
        element:<AddMeals/>
      },
    ],
  },
]);
