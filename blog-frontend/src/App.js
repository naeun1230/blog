import { Route, Routes } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Footer from './components/shared/Footer'
import Home from './pages/Home'
import Signup from './components/auth/Signup'
import Login from './components/auth/Login'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { checkAuthStatusThunk } from './features/authSlice'
import PostCreatePage from './pages/PostCreatePage'
import PostEditPage from './pages/PostEditPage'
import MyPage from './pages/MyPage'
import PostDetail from './components/page/PostDetail'
import CommentPage from './pages/CommentPage'
import BoardPage from './pages/BoardPage'

function App() {
   const dispatch = useDispatch()
   const { isAuthenticated, user } = useSelector((state) => state.auth)

   useEffect(() => {
      dispatch(checkAuthStatusThunk())
   }, [dispatch])

   return (
      <div className="app-container">
         <Navbar isAuthenticated={isAuthenticated} user={user} />
         <main className="main-content">
            <Routes>
               <Route path="/" element={<Home isAuthenticated={isAuthenticated} user={user} />} />
               <Route path="/signup" element={<Signup />} />
               <Route path="/login" element={<Login />} />
               <Route path="/posts/create" element={<PostCreatePage />} />
               <Route path="/posts/edit/:id" element={<PostEditPage />} />
               <Route path="/post/:id" element={<PostDetail />} />
               <Route path="/my" element={<MyPage auth={user} />} />
               <Route path="/my/:id" element={<MyPage auth={user} />} />
               <Route path="/post/:id/comments" element={<CommentPage />} />
               <Route path="/board" element={<BoardPage />} />
            </Routes>
         </main>
         <Footer />
      </div>
   )
}

export default App
