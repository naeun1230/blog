import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProfileThunk, getProfileIdThunk, updateProfileThunk } from '../../features/pageSlice'
import { getPostsByUserId, updateProfile } from '../../api/blogApi'
import dayjs from 'dayjs'

const MyProfile = () => {
   // URL에서 id 파라미터를 가져옵니다.
   const { id } = useParams()

   // 페이지 이동을 위한 navigate 훅
   const navigate = useNavigate()

   // Redux의 dispatch와 store에서 page 상태를 가져옵니다.
   const dispatch = useDispatch()

   // 프로필 데이터
   const { user, loading, error } = useSelector((state) => state.page)

   // 로그인한 사용자 데이터
   const { user: authUser } = useSelector((state) => state.auth)

   // 상태 관리
   const [posts, setPosts] = useState([]) // 게시글 목록
   const [profileImg, setProfileImg] = useState(null) // 프로필 이미지 파일
   const [profileText, setProfileText] = useState(user?.profileText || '') // 프로필 문구
   const [isEditing, setIsEditing] = useState(false) // 프로필 수정 모드 여부
   const [removeImg, setRemoveImg] = useState(false) // 프로필 이미지 삭제 여부

   // 프로필 데이터를 서버에서 가져오는 함수
   const fetchProfileData = useCallback(() => {
      const action = id ? getProfileIdThunk(id) : getProfileThunk()
      dispatch(action)
         .unwrap()
         .catch((error) => {
            console.error('사용자 정보 가져오는 중 오류 발생:', error)
         })
   }, [dispatch, id])

   // 게시글 데이터를 서버에서 가져오는 함수
   const fetchPostsData = useCallback(async () => {
      try {
         const userId = id || user?.id
         if (!userId) return
         const response = await getPostsByUserId(userId)
         setPosts(response.data.posts)
      } catch (err) {
         console.error('게시글 가져오는 중 오류 발생:', err)
      }
   }, [id, user?.id])

   // 컴포넌트가 처음 렌더링될 때 실행되는 함수
   useEffect(() => {
      fetchProfileData()
      fetchPostsData()
   }, [fetchProfileData, fetchPostsData])

   // user 정보가 업데이트되면 프로필 문구를 기본값으로 설정
   useEffect(() => {
      if (user) {
         setProfileText(user.profileText || `안녕하세요! ${user.nick}입니다!`)
      }
   }, [user])

   // 게시글 클릭 시 게시글 상세 페이지로 이동
   const handlePostClick = (postId) => {
      navigate(`/post/${postId}`)
   }

   // 프로필 이미지 변경 시 실행되는 함수
   const handleImageChange = (e) => {
      const file = e.target.files && e.target.files[0]
      if (file) {
         setProfileImg(file) // 새 이미지를 상태에 저장
         setRemoveImg(false) // 이미지 삭제 상태 해제
      }
   }

   // 프로필 이미지를 삭제하는 함수
   const handleDeleteImage = async () => {
      try {
         const formData = new FormData()
         formData.append('removeImg', 'true') // 삭제 요청 데이터 추가

         await updateProfile(formData) // 서버에 이미지 삭제 요청
         alert('프로필 이미지가 삭제되었습니다.')
         fetchProfileData() // 최신 프로필 데이터를 다시 불러옴
      } catch (err) {
         console.error('프로필 이미지 삭제 중 오류 발생:', err)
         alert('프로필 이미지 삭제에 실패했습니다.')
      }
   }

   // 프로필 수정 내용을 저장하는 함수
   const handleSave = async () => {
      const formData = new FormData()
      formData.append('removeImg', removeImg) // 삭제 여부 추가

      if (profileImg instanceof File) {
         formData.append('profile', profileImg) // 업로드된 새 이미지 추가
      }

      const updatedProfileText = profileText.trim() || `안녕하세요! ${user.nick}입니다!`
      formData.append('profileText', updatedProfileText) // 기본 프로필 문구 설정

      if (removeImg) {
         formData.append('removeImg', 'true') // 삭제 요청 추가
      }

      try {
         await dispatch(updateProfileThunk(formData)).unwrap()
         alert('프로필이 수정되었습니다.')
         setIsEditing(false) // 수정 모드 해제
         fetchProfileData() // 데이터 새로고침
      } catch (err) {
         console.error('프로필 수정 중 오류 발생:', err)
         alert('프로필 수정에 실패했습니다.')
      }
   }

   // 로딩 중일 때 표시
   if (loading) return <p>데이터를 불러오는 중입니다...</p>

   // 오류 발생 시 표시
   if (error) return <p>오류 발생: {error}</p>

   // 로그인한 사용자와 프로필 사용자 ID 비교
   const isOwner = !id || authUser?.id === parseInt(id)

   return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
         {user && (
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px', textAlign: 'center', width: '1000px' }}>
               <h2>{user.nick}님의 프로필</h2>
               {isOwner && isEditing ? (
                  // 수정 모드
                  <div>
                     <div style={{ textAlign: 'center' }}>
                        {profileImg instanceof File ? (
                           <div style={{ marginTop: '10px' }}>
                              <img src={URL.createObjectURL(profileImg)} alt="미리보기" className="profileimg" />
                           </div>
                        ) : user.profile ? (
                           <div style={{ marginTop: '10px' }}>
                              <img src={`http://localhost:8000${user.profile}`} alt="기존 프로필 이미지" className="profileimg" />
                           </div>
                        ) : (
                           <p>이미지가 없습니다.</p>
                        )}
                        <div className="profilebuttonwrap">
                           <label htmlFor="fileInput" className="inputbutton">
                              변경
                           </label>
                           <input type="file" id="fileInput" name="profileImg" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                           <button type="button" className="delbutton" onClick={handleDeleteImage}>
                              삭제
                           </button>
                        </div>
                     </div>

                     <div className="profilebuttonwrap">
                        <input type="text" value={profileText} onChange={(e) => setProfileText(e.target.value)} placeholder="프로필 문구를 50자 이내로 입력하세요." className="comment-input" maxLength={50} style={{ width: '500px' }} />
                        <button onClick={handleSave} className="inputbutton">
                           저장
                        </button>
                        <button onClick={() => setIsEditing(false)} className="delbutton">
                           취소
                        </button>
                     </div>
                  </div>
               ) : (
                  // 보기 모드
                  <>
                     {user.profile ? <img src={`http://localhost:8000${user.profile}`} alt={`${user.nick}`} className="profileimg" /> : <img src="/default-profile.png" alt="기본 프로필" className="profileimg" />}
                     <p>{user.profileText || `안녕하세요! ${user.nick}입니다!`}</p>

                     {/* 수정 버튼은 로그인한 사용자와 프로필 사용자가 동일한 경우에만 보이도록 설정 */}
                     {isOwner && (
                        <button onClick={() => setIsEditing(true)} id="profileeditbutton">
                           프로필 수정
                        </button>
                     )}
                  </>
               )}
            </div>
         )}
         <div style={{ textAlign: 'center', width: '1000px' }}>
            <h3>게시글 목록</h3>
            {posts.length > 0 ? (
               posts.map((post) => (
                  <div key={post.id} style={{ border: '1px solid #4ea0ff', padding: '10px', marginBottom: '10px', cursor: 'pointer' }} onClick={() => handlePostClick(post.id)}>
                     <h4>{post.title}</h4>
                     <p>작성일: {dayjs(post.createdAt).format('YYYY.MM.DD HH:mm')}</p>
                  </div>
               ))
            ) : (
               <p>게시글이 없습니다.</p>
            )}
         </div>
      </div>
   )
}

export default MyProfile
