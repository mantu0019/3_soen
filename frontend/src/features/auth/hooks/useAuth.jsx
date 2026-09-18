import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMeUser,
  loginUser,
  logOutUser,
  registerUser,
} from "../state/authAction";

export const useAuth = () => {
  const { authData, isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const registerByUser = useCallback(
    (data) => {
      return dispatch(registerUser(data)).unwrap();
    },
    [dispatch],
  );

  const loginByUser = useCallback(
    (data) => {
      return dispatch(loginUser(data)).unwrap();
    },
    [dispatch],
  );

  const getMeByUser = useCallback(() => {
    return dispatch(getMeUser()).unwrap();
  }, [dispatch]);

  const logOutByUser = useCallback(() => {
    return dispatch(logOutUser()).unwrap();
  }, [dispatch]);

  return {
    authData,
    isLoading,
    error,
    logOutByUser,
    registerByUser,
    loginByUser,
    getMeByUser,
  };
};
