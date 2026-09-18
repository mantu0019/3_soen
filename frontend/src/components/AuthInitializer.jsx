 

import React, { useEffect, useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "./Loading";

const AuthInitializer = ({ children }) => {
  const { getMeByUser } = useAuth();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getMeByUser();
      } catch (error) {
        console.log("User is not authenticated");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [getMeByUser]);

  if (checkingAuth) {
    return <Loading />;
  }

  return children;
};

export default AuthInitializer;