import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const navigate = useNavigate()
    const [user, setUser]= useState(null)
    const [isSeller, setIsSeller]= useState(false)
    const [showUserLogin, setShowUserLogin]= useState(false)

    const value = {navigate, user, setUser, setIsSeller, isSeller, showUserLogin, setShowUserLogin}
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{  //this is a custom hook to simplyfy accessing the context. 
    return useContext(AppContext)    //Instead of writing useContext(AppContext) everywhere, we just use useAppContext().
}