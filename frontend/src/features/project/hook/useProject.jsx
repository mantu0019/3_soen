import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectCreateUser } from "../state/projectAction";

export const useProject = () => {
  const { projectData, isLoading, error } = useSelector(
    (state) => state.project,
  );

  const dispatch = useDispatch();

  const createProjectByUser = useCallback((data) => {
    return dispatch(projectCreateUser(data)).unwrap();
  },[dispatch]);

  return { createProjectByUser, projectData,isLoading,error };
};
