import { useParams, useNavigate } from 'react-router-dom' // useNavigate 추가
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'
import { getProfileThunk, getProfileIdThunk } from '../../features/pageSlice'
import { getPostsByUserId } from '../../api/blogApi'
import dayjs from 'dayjs'

const MyProfile = () => {
   const { id } = useParams() // URL에서 사용자 ID 가져오기
   const navigate = useNavigate() // useNavigate 훅 사용
   const dispatch = useDispatch()
   const { user } = useSelector((state) => state.page) // 사용자 정보 가져오기
   const [posts, setPosts] = useState([]) // 게시글 상태
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)

   // 사용자 프로필 데이터 가져오기
   const fetchProfileData = useCallback(() => {
      if (id) {
         // 게시물의 이름을 클릭해서 들어온 경우
         dispatch(getProfileIdThunk(id))
            .unwrap()
            .catch((error) => {
               console.error('사용자 정보 가져오는 중 오류 발생:', error)
               alert('사용자 정보 가져오기를 실패했습니다.', error)
            })
      } else {
         // navbar의 이름을 클릭해서 들어온 경우
         dispatch(getProfileThunk())
            .unwrap()
            .catch((error) => {
               console.error('사용자 정보 가져오는 중 오류 발생:', error)
               alert('사용자 정보 가져오기를 실패했습니다.', error)
            })
      }
   }, [dispatch, id])

   // 사용자 게시글 데이터 가져오기
   const fetchPostsData = useCallback(async () => {
      try {
         setLoading(true)
         const userId = id || user?.id // URL에 ID가 없으면 로그인한 사용자의 ID 사용
         if (!userId) return

         const response = await getPostsByUserId(userId)
         setPosts(response.data.posts)
      } catch (err) {
         console.error('게시글 가져오는 중 오류 발생:', err)
         setError(err.message)
      } finally {
         setLoading(false)
      }
   }, [id, user?.id])

   // 프로필과 게시글 데이터 가져오기
   useEffect(() => {
      fetchProfileData()
      fetchPostsData()
   }, [fetchProfileData, fetchPostsData])

   // 게시글 클릭 시 상세 페이지로 이동
   const handlePostClick = (postId) => {
      navigate(`/post/${postId}`) // 게시글 상세 페이지로 이동
   }

   if (loading) return <p>데이터를 불러오는 중입니다...</p>
   if (error) return <p>오류 발생: {error}</p>

   return (
      <div
         style={{
            display: 'flex',
            justifyContent: 'center', // 수평 정렬
            alignItems: 'center', // 수직 정렬
            flexDirection: 'column', // 세로 방향으로 정렬
         }}
      >
         {/* 사용자 정보 */}
         {user && (
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px', textAlign: 'center', width: '1000px' }}>
               <h2>{user.nick}님의 프로필</h2>
               {user.profile && <img src={user.profile} alt={`${user.nick}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
               <p>안녕하세요 {user?.nick}입니다!</p>
            </div>
         )}

         {/* 사용자 게시글 목록 */}
         <div
            style={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               paddingBottom: 0,
            }}
         >
            <div
               style={{
                  margin: '0 20px 0 20px',
                  textAlign: 'center',
                  width: '1000px',
                  backgroundColor: '#fff',
                  padding: '0 20px 0 20px',
                  borderRadius: '10px',
               }}
            >
               <h3>게시글 목록</h3>
               {posts.length > 0 ? (
                  posts.map((post) => (
                     <div
                        key={post.id}
                        style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}
                        onClick={() => handlePostClick(post.id)} // 게시글 클릭 이벤트 추가
                     >
                        <h4>{post.title}</h4>
                        <p>작성일: {dayjs(post.createdAt).format('YYYY.MM.DD HH:mm')}</p>
                     </div>
                  ))
               ) : (
                  <p>게시글이 없습니다.</p>
               )}
            </div>
         </div>
      </div>
   )
}

export default MyProfile
