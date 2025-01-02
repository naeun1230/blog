import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUserThunk } from '../../features/authSlice'
import '../../styles/login.css'

const Login = () => {
   const [userid, setUserid] = useState('') // 아이디 상태
   const [password, setPassword] = useState('') // 비밀번호 상태
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   const handleLogin = useCallback(
      async (e) => {
         e.preventDefault()
         if (!userid.trim() || !password.trim()) {
            alert('아이디와 비밀번호를 모두 입력해주세요!')
            return
         }

         try {
            await dispatch(loginUserThunk({ userid, password })).unwrap()
            setUserid('') // 로그인 성공 후 상태 초기화
            setPassword('')
            navigate('/board') // 메인 페이지로 이동
         } catch (err) {
            console.error('로그인 실패:', err)
            alert(err.message || '로그인에 실패했습니다. 다시 시도해주세요.')
         }
      },
      [userid, password, dispatch, navigate]
   )

   return (
      <div className="container">
         <div className="signwrap">
            <form onSubmit={handleLogin}>
               <p className="sign">로그인</p>
               <div className="signinfowrap">
                  <span className="signinfo">아이디</span>
                  <input className="signinput" type="text" name="userid" placeholder="아이디를 입력하세요" onChange={(e) => setUserid(e.target.value)} value={userid} />
               </div>
               <div className="signinfowrap">
                  <span className="signinfo">비밀번호</span>
                  <input className="signinput" type="password" name="password" placeholder="비밀번호를 입력하세요" onChange={(e) => setPassword(e.target.value)} value={password} />
               </div>
               <div className="buttonwrap">
                  {error && <p className="error">로그인 실패: {error}</p>} {/* 에러 메시지 */}
                  <button type="submit" disabled={loading} id="loginbutton">
                     {loading ? '로딩중...' : '로그인'}
                  </button>
                  <Link to="/signup" style={{ textDecoration: 'none' }}>
                     <button type="button" id="signupbutton">
                        가입하기
                     </button>
                  </Link>
               </div>
            </form>
         </div>
      </div>
   )
}

export default Login
