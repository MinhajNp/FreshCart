import React, { useEffect } from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import { useAppContext } from '../context/AppContext'
import Loading from '../components/Loading'

const Home = () => {
  const {loading, setLoading} = useAppContext()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // After 2 seconds, stop loading
    }, 1000);

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, []);

  if(loading){
    return ( <Loading/> )
 }
  return (
    <div className='mt-10'>
        <MainBanner/>
        <Categories/>
        <BestSeller/>
        <BottomBanner/>
        <NewsLetter/>
    </div>
  )
}

export default Home