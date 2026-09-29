import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjectUser, projectCreateUser } from "../state/projectAction";

export const useProject = () => {
  const { projectData, isLoading, error } = useSelector(
    (state) => state.project,
  );

  const dispatch = useDispatch();

  const createProjectByUser = useCallback((data) => {
    return dispatch(projectCreateUser(data)).unwrap();
  },[dispatch]);

  const getProjectByUser = useCallback(()=>{

      return dispatch(getProjectUser()).unwrap()
  },[dispatch])


  return { createProjectByUser, projectData,isLoading,error,getProjectByUser };
};
