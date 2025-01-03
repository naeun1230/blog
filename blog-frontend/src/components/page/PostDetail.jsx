import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostByIdThunk, deletePostThunk } from '../../features/postSlice'
import { fetchCommentsThunk } from '../../features/commentSlice'
import dayjs from 'dayjs'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-regular-svg-icons'

library.add(faComment)

const PostDetail = () => {
   const { id } = useParams()
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const { user } = useSelector((state) => state.auth)
   const { post, loading, error } = useSelector((state) => state.posts)
   const totalComments = useSelector((state) => state.comments.totalComments)

   useEffect(() => {
      if (!user) {
         navigate('/')
      }
   }, [user, navigate])

   useEffect(() => {
      if (id) {
         dispatch(fetchPostByIdThunk(id))
         dispatch(fetchCommentsThunk({ postId: id }))
      }
   }, [id, dispatch])

   if (loading) return <p>로딩 중...</p>
   if (error) return <p>오류 발생: {error}</p>
   if (!post) return <p>게시물을 찾을 수 없습니다.</p>
   if (!user) return null // 사용자 정보가 없으면 렌더링 중단

   // 게시물 삭제 핸들러
   const handleDelete = async () => {
      const confirmDelete = window.confirm('정말로 이 게시물을 삭제하시겠습니까?')
      if (confirmDelete) {
         try {
            await dispatch(deletePostThunk(id)).unwrap()
            alert('게시물이 삭제되었습니다.')
            navigate('/')
         } catch (err) {
            alert(err || '게시물 삭제 중 오류가 발생했습니다.')
         }
      }
   }

   // 게시물 수정 핸들러
   const handleEdit = () => {
      navigate(`/posts/edit/${id}`)
   }

   return (
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
            {/* 게시물 제목 */}
            <h1 style={{ textAlign: 'center' }}>{post.title}</h1>

            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
               }}
            >
               {/* 프로필 이미지 및 작성자 정보 */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                     style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                     }}
                  >
                     <img src={post.User.profile.startsWith('/uploads/') ? `${process.env.REACT_APP_API_URL}${post.User.profile}` : post.User.profile} alt={`${post.User.nick} 프로필`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                     <Link to={`/my/${post.User.id}`} className="board-link" style={{ color: '#555' }}>
                        <span>{post.User?.nick}님</span>
                     </Link>
                     <p style={{ margin: '0', fontSize: '14px', color: '#888' }}>{dayjs(post.createdAt).format('YYYY.MM.DD HH:mm')}</p>
                  </div>
               </div>
               {/* 수정 및 삭제 버튼 */}
               {post.UserId === user.id && (
                  <div>
                     <button className="detailbutton" onClick={handleEdit}>
                        수정
                     </button>
                     <button className="detailbutton" style={{ color: 'red' }} onClick={handleDelete}>
                        삭제
                     </button>
                  </div>
               )}
            </div>
            <hr />
            <div style={{ minHeight: '600px' }}>
               {/* 게시물 이미지 */}
               {post.img && (
                  <img
                     src={post.img.startsWith('/uploads/posts/') ? `${process.env.REACT_APP_API_URL}${post.img}` : `${process.env.REACT_APP_API_URL}/uploads/posts/${post.img}`}
                     alt={post.title}
                     style={{
                        maxWidth: '600px',
                        maxHeight: '600px',
                        marginTop: '20px',
                        borderRadius: '10px',
                     }}
                  />
               )}

               {/* 게시물 내용 */}
               <p
                  style={{
                     marginTop: '20px',
                     lineHeight: '1.6',
                     fontSize: '16px',
                     whiteSpace: 'pre-line', // 줄바꿈 적용
                  }}
               >
                  {post.content}
               </p>
            </div>
            <hr />

            {/* 댓글 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <FontAwesomeIcon icon={['far', 'comment']} style={{ color: '#74C0FC', cursor: 'pointer' }} size="2x" onClick={() => navigate(`/post/${id}/comments`)} />
               {totalComments}
            </div>
         </div>
      </div>
   )
}

export default PostDetail
