import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "../../redux/store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.user.userToken);
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  return <>{children}</>;
};

export default ProtectedRoute;
