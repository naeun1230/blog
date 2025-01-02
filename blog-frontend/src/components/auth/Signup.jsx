import { useCallback, useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerUserThunk } from '../../features/authSlice'
import '../../styles/signup.css'

const Signup = () => {
   const [userid, setUserid] = useState('')
   const [password, setPassword] = useState('')
   const [nick, setNick] = useState('')
   const [profileImage, setProfileImage] = useState(null)
   const fileInputRef = useRef()

   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   const handleSignup = useCallback(() => {
      if (!userid.trim() || !password.trim() || !nick.trim()) {
         alert('모든 필드를 입력해주세요!')
         return
      }

      const userData = { userid, password, nick }

      dispatch(registerUserThunk({ userData, profileImage }))
         .unwrap()
         .then(() => {
            navigate('/login') // 회원가입 완료 후 로그인 페이지로 이동
         })
         .catch((error) => {
            console.error('회원가입 에러:', error)
            alert(error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
         })
   }, [userid, password, nick, profileImage, dispatch, navigate])

   const handleFileChange = (e) => {
      const file = e.target.files[0]
      if (file) {
         if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
         }
         if (file.size > 5 * 1024 * 1024) {
            alert('이미지 파일 크기는 5MB를 초과할 수 없습니다.')
            return
         }

         setProfileImage(file)
      }
   }

   useEffect(() => {
      let objectUrl
      if (profileImage) {
         objectUrl = URL.createObjectURL(profileImage)
      }
      return () => {
         if (objectUrl) {
            URL.revokeObjectURL(objectUrl) // 객체 URL 해제
         }
      }
   }, [profileImage])

   return (
      <div className="container">
         <div className="signwrap">
            <p className="sign">회원가입</p>

            <div className="signinfowrap">
               <span className="signinfo">프로필</span>
               <div
                  className="profile-thumbnail"
                  onClick={() => fileInputRef.current.click()}
                  style={{
                     width: '100px',
                     height: '100px',
                     borderRadius: '50%',
                     overflow: 'hidden',
                     backgroundColor: profileImage ? 'transparent' : '#f0f0f0',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}
               >
                  {profileImage ? (
                     <img
                        src={URL.createObjectURL(profileImage)}
                        alt="Profile Thumbnail"
                        style={{
                           width: '100%',
                           height: '100%',
                           objectFit: 'cover',
                        }}
                     />
                  ) : (
                     <span style={{ color: '#888', fontSize: '12px' }}>이미지 추가</span>
                  )}
               </div>
               <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            <div className="signinfowrap">
               <span className="signinfo">아이디</span>
               <input className="signinput" label="아이디" type="text" value={userid} onChange={(e) => setUserid(e.target.value)} />
            </div>

            <div className="signinfowrap">
               <span className="signinfo">비밀번호</span>
               <input className="signinput" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="signinfowrap">
               <span className="signinfo">닉네임</span>
               <input className="signinput" label="닉네임" type="text" value={nick} onChange={(e) => setNick(e.target.value)} />
            </div>

            <button onClick={handleSignup} className="signbutton" disabled={loading}>
               {loading ? '가입 중...' : '가입하기'}
            </button>

            {error && <p className="error-message">회원가입 중 오류가 발생했습니다. 다시 시도해주세요.</p>}
         </div>
      </div>
   )
}

export default Signup
