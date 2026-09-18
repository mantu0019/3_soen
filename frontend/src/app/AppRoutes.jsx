import { createBrowserRouter } from "react-router";
import PublicLayout from "../components/PublicLayout";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import PrivateLayout from "../components/PrivateLayout";
import Home from "../components/Home";
 
export const router =createBrowserRouter([
    {path:"/",
    element:<PublicLayout/>,
        children:[
            {
                path:"",
                element:<Login/>
            },
            {
                path:"register",
                element:<Register/>
            }
        ]
    },{
        path:"/dash",
        element:<PrivateLayout/>,
        children:[
            {
                path:"",
                element:<Home/>
            }
        ]
    }
])


