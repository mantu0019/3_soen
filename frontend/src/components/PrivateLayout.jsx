 
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import Loading from './Loading'

const PrivateLayout = () => {
  
   const {authData,isLoading}  = useAuth()
   if(isLoading){
    return <Loading/>
   }

  return authData ?   <Outlet/> : <Navigate to={"/"}/> 

}

export default PrivateLayout