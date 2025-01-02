import '../../styles/common.css'
import { Link, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { logoutUserThunk } from '../../features/authSlice'

const Navbar = ({ isAuthenticated, user }) => {
   const dispatch = useDispatch() // Redux 상태를 변경할 수 있는 dispatch 함수를 컴포넌트에서 사용하려는 경우에 사용됩니다.
   const navigate = useNavigate() // 경로로 이동

   const handleLogout = useCallback(() => {
      dispatch(logoutUserThunk())
         .unwrap()
         //unwrap()은 Redux Toolkit에서 제공하는 함수로, thunk가 반환하는 Promise의 결과를 "언랩"해서 성공적인 결과를 직접 얻거나 실패한 결과를 처리할 수 있도록 합니다.
         // unwrap()을 호출하면, 해당 Promise가 성공하면 .then()으로 처리되고, 실패하면 .catch()로 오류를 처리할 수 있습니다.
         .then(() => {
            navigate('/') //로그아웃 완료 후 메인페이지로 이동
         })
         .catch((error) => {
            alert(error)
         })
   }, [dispatch, navigate])

   return (
      <div className="navbarwrap">
         <div className="logo">
            <Link to="/" className="logotxt">
               <img src="/images/LML_logo.png" alt="로고" className="logoimg" />
               &nbsp; Live My Life
            </Link>
         </div>

         {isAuthenticated ? (
            <div className="loginwrap">
               <Link to="/my" style={{ textDecoration: 'none' }}>
                  <span id="nick">{user.nick}님</span>
               </Link>
               <Link to="/posts/create" style={{ textDecoration: 'none' }}>
                  <button id="writebutton">글쓰기</button>
               </Link>
               <button onClick={handleLogout} id="logoutbutton">
                  로그아웃
               </button>
            </div>
         ) : (
            <div className="loginwrap">
               <Link to="/login">
                  <button className="loginbutton">로그인</button>
               </Link>
            </div>
         )}
      </div>
   )
}
export default Navbar
