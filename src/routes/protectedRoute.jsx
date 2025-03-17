import { Navigate } from "react-router-dom";

import { useAuth } from "../context/authContext";
import { ROUTES } from "./paths";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  return user ? children : <Navigate to={ROUTES.SIGN_IN} replace />;
};

export default ProtectedRoute;
