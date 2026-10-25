 
import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

import Loading from "../components/Loading";
import ErrorPage from "../components/ErrorPage";

const PublicLayout = lazy(() => import("../components/PublicLayout"));
const PrivateLayout = lazy(() => import("../components/PrivateLayout"));

const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));

const Home = lazy(() => import("../components/Home"));
const HomeSkeleton = lazy(() => import("../components/Skeleton"));

const Project = lazy(() => import("../features/project/pages/Project"));
const DetailProject = lazy(
  () => import("../features/project/pages/DetailProject"),
);

const LazyWrapper = ({ children, fallback = <Loading /> }) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: (
      <LazyWrapper>
        <PublicLayout />
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Login />
          </LazyWrapper>
        ),
      },
      {
        path: "register",
        element: (
          <LazyWrapper>
            <Register />
          </LazyWrapper>
        ),
      },
    ],
  },

  {
    path: "/dash",
    element: (
      <LazyWrapper>
        <PrivateLayout />
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper fallback={<HomeSkeleton />}>
            <Home />
          </LazyWrapper>
        ),
      },
      {
        path: "project",
        element: (
          <LazyWrapper>
            <Project />
          </LazyWrapper>
        ),
      },
      {
        path: ":projectId",
        element: (
          <LazyWrapper>
            <DetailProject />
          </LazyWrapper>
        ),
      },
    ],
  },
]);
