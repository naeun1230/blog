import PostForm from '../components/post/PostForm'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { createPostThunk } from '../features/postSlice'

const PostCreatePage = () => {
   const navigate = useNavigate()
   const dispatch = useDispatch()

   const handleSubmit = useCallback(
      (postData) => {
         dispatch(createPostThunk(postData))
            .unwrap()
            .then(() => {
               navigate('/') //게시물 등록 후 메인페이지로 이동
            })
            .catch((error) => {
               console.error('게시물 등록 에러: ', error)
               alert('게시물 등록에 실패했습니다.')
            })
      },
      [dispatch, navigate]
   )

   return (
      <div>
         <p className="sign">게시물 작성</p>
         <PostForm onSubmit={handleSubmit} />
      </div>
   )
}

export default PostCreatePage
