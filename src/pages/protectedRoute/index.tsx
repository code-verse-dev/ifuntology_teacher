import { jwtDecode } from "jwt-decode";
import React, { ReactNode } from "react";
import { Navigate } from "react-router";
import Cookies from "js-cookie";

interface UserAuthCheckProps {
  children: ReactNode;
}

interface JwtPayload {
  _id: string;
  email?: string;
  firstName?: string;
  [key: string]: any;
}

const ProtectedRoute: React.FC<UserAuthCheckProps> = ({ children }) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let decoded: JwtPayload;

  try {
    decoded = jwtDecode<JwtPayload>(token);
  } catch (_error) {
    Cookies.remove("accessToken");
    return <Navigate to="/login" replace />;
  }

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    Cookies.remove("accessToken");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
