import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BoardPage from './BoardPage' // 게시판 컴포넌트 import
import '../styles/common.css'

const Home = () => {
   const { isAuthenticated } = useSelector((state) => state.auth) // 로그인 상태 확인

   return (
      <>
         {isAuthenticated ? (
            // 로그인 상태: 게시판 페이지 렌더링
            <BoardPage />
         ) : (
            // 비로그인 상태: 홈 화면 렌더링
            <div className="content">
               <div>당신의 일상을 공유해보세요.</div>
               <Link to="/signup">
                  <button className="joinbutton">가입하기</button>
               </Link>
            </div>
         )}
      </>
   )
}

export default Home
