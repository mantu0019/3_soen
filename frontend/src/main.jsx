import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./app/AppRoutes.jsx";

import { store } from "./app/store.js";
import { Provider } from "react-redux";
import AuthInitializer from "./components/AuthInitializer.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthInitializer>
      <RouterProvider router={router} />
    </AuthInitializer>
  </Provider>,
);
