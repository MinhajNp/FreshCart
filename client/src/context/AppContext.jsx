import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate()
    const [user, setUser]= useState(null)
    const [isSeller, setIsSeller]= useState(false)
    const [showUserLogin, setShowUserLogin]= useState(false)
    const [products, setProducts] = useState([])

    const [cartItems, SetCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({})

    // fetch all products
    const fetchProducts = async()=>{
        setProducts(dummyProducts)
    }

    // add product to cart
    const addToCart=(itemId)=>{
        let cartData = structuredClone(cartItems)

        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId]=1;
        }
        SetCartItems(cartData);
        toast.success("Added to Cart")
    }

    // Update cart item quantity
    const updateCartItem = (itemId, quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId]=quantity;
        SetCartItems(cartData);
        toast.success("Cart Updated")
    }

    // Remove Product from cart
    const removeFromCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] == 0){
                delete cartData[itemId];
            }
        }
        toast.success("Removed from Cart")
        SetCartItems(cartData);
    }

    // Get cart item count
    const getCartCount = () => {
        return Object.keys(cartItems).length;
    };

    // Get cart total Amount
    const getCartAmount =()=>{
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=> product._id ===items)
            if(cartItems[items]>0){
                totalAmount +=itemInfo.offerPrice*cartItems[items]
            }
        }
        return Math.floor(totalAmount*100)/100;
    }


    useEffect(()=>{
        fetchProducts();
    },[])

    const value = {navigate, user, setUser, setIsSeller, isSeller, 
        showUserLogin, setShowUserLogin, products, currency,
         addToCart, updateCartItem, removeFromCart, cartItems,
        searchQuery, setSearchQuery,  getCartAmount, getCartCount}
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{  //this is a custom hook to simplyfy accessing the context. 
    return useContext(AppContext)    //Instead of writing useContext(AppContext) everywhere, we just use useAppContext().
}