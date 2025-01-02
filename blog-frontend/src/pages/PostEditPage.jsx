import PostForm from '../components/post/PostForm'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { fetchPostByIdThunk, updatePostThunk } from '../features/postSlice'

const PostEditPage = () => {
   const { id } = useParams() // post의 id
   const navigate = useNavigate() // 리다이렉트를 위한 useNavigate
   const dispatch = useDispatch()
   const { post, loading, error } = useSelector((state) => state.posts)

   // 게시물 데이터 불러오기
   useEffect(() => {
      dispatch(fetchPostByIdThunk(id))
   }, [dispatch, id])

   // 게시물 수정
   const handleSubmit = useCallback(
      (postData) => {
         dispatch(updatePostThunk({ id, postData }))
            .unwrap()
            .then(() => {
               navigate(`/post/${id}`) // 수정 후 상세 페이지로 이동
            })
            .catch((error) => {
               console.error('게시물 수정 중 오류 발생:', error)
               alert('게시물 수정에 실패했습니다.', error)
            })
      },
      [dispatch, id, navigate]
   )

   if (loading) return <p>로딩 중...</p>
   if (error) return <p>에러 발생: {error}</p>

   return (
      <div>
         <p className="sign">게시물 수정</p>
         {post && <PostForm onSubmit={handleSubmit} initialValues={post} />}
      </div>
   )
}

export default PostEditPage
