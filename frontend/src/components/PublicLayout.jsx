 
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "./Loading";

const PublicLayout = () => {
  const { authData, isLoading } = useAuth();
  if (isLoading) {
    return <Loading />;
  }

  return authData ? <Navigate to={"/dash"} /> : <Outlet />;
};

export default PublicLayout;
