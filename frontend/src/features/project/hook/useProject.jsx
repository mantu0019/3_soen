import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUsers,
  getProjectUser,
  projectCreateUser,
  removeProjectUser,
} from "../state/projectAction";

export const useProject = () => {
  const { projectData, isLoading, error } = useSelector(
    (state) => state.project,
  );

  const dispatch = useDispatch();

  const createProjectByUser = useCallback(
    (data) => {
      return dispatch(projectCreateUser(data)).unwrap();
    },
    [dispatch],
  );

  const getProjectByUser = useCallback(() => {
    return dispatch(getProjectUser()).unwrap();
  }, [dispatch]);

  const addUserInCollaborator = useCallback(
    (data) => {
      return dispatch(addUsers(data)).unwrap();
    },
    [dispatch],
  );

  const removeProjectByUser = useCallback((data) => {
    return dispatch(removeProjectUser(data)).unwrap();
  });

  return {
    createProjectByUser,
    projectData,
    isLoading,
    error,
    getProjectByUser,
    addUserInCollaborator,
    removeProjectByUser,
  };
};
