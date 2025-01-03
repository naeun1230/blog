import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL

// axios 인스턴스 생성
const blogApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true, // 세션 쿠키를 요청에 포함
})

// 공통 에러 핸들러
const handleApiError = (error) => {
   console.error(`API Request 오류: ${error.message}`)
   if (error.response) {
      console.error('Response Data:', error.response.data)
      console.error('Status Code:', error.response.status)
      console.error('Headers:', error.response.headers)
   }
   throw error
}

// 회원가입
export const registerUser = async (userData, profileImage) => {
   try {
      const formData = new FormData()
      Object.keys(userData).forEach((key) => formData.append(key, userData[key]))

      if (profileImage) {
         formData.append('profileImage', profileImage)
      }

      const response = await blogApi.post('/auth/join', formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      })
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 로그인
export const loginUser = async (credentials) => {
   try {
      const response = await blogApi.post('/auth/login', credentials)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 로그아웃
export const logoutUser = async () => {
   try {
      const response = await blogApi.get('/auth/logout')
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 로그인 상태 확인
export const checkAuthStatus = async () => {
   try {
      const response = await blogApi.get('/auth/status')
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 포스트 등록
export const createPost = async (postData) => {
   try {
      const response = await blogApi.post('/post', postData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 포스트 수정
export const updatePost = async (id, postData) => {
   try {
      const response = await blogApi.put(`/post/${id}`, postData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 포스트 삭제
export const deletePost = async (id) => {
   try {
      const response = await blogApi.delete(`/post/${id}`)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 특정 포스트 가져오기
export const getPostById = async (id) => {
   try {
      const response = await blogApi.get(`/post/${id}`)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 전체 게시글 가져오기
export const getPosts = async (page = 1, limit = 5) => {
   try {
      const response = await blogApi.get('/post', {
         params: { page, limit }, // page와 limit을 query string으로 전달
      })
      return response.data // 서버에서 { posts, pagination } 구조 반환
   } catch (error) {
      console.error('게시글 가져오기 실패:', error.message)
      throw error
   }
}

// 특정 사용자의 게시글 가져오기
export const getPostsByUserId = async (userId) => {
   try {
      const response = await blogApi.get(`/post/user/${userId}`)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 내 프로필 가져오기
export const getProfile = async () => {
   try {
      const response = await blogApi.get(`/page/profile`)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 특정 사용자 프로필 가져오기
export const getProfileId = async (id) => {
   try {
      const response = await blogApi.get(`/page/profile/${id}`)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 프로필 수정
export const updateProfile = async (formData) => {
   try {
      const response = await blogApi.put('/page/profile', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 댓글 가져오기 (페이징)
export const getComments = async (postId, page = 1, limit = 5) => {
   try {
      const response = await blogApi.get(`/comment`, {
         params: { postId, page, limit },
      })
      return response.data
   } catch (error) {
      console.error('댓글 가져오기 실패:', error.message)
      throw error
   }
}

// 댓글 작성
export const createCommentApi = async (postId, content) => {
   try {
      if (!postId || !content) {
         throw new Error('postId와 content는 필수입니다.')
      }

      console.log('보낼 데이터:', { postId, content })
      const response = await blogApi.post(`/comment`, { postId, content })
      return response.data.comment // 댓글 데이터만 반환
   } catch (error) {
      console.error('댓글 작성 실패:', error.response?.data?.message || error.message)
      throw error
   }
}

// 댓글 삭제
export const deleteComment = async (commentId) => {
   try {
      const response = await blogApi.delete(`/comment/${commentId}`)
      return response
   } catch (error) {
      handleApiError(error)
   }
}

// 댓글 수정
export const updateComment = async (commentId, content) => {
   try {
      const response = await blogApi.put(`/comment/${commentId}`, { content })
      return response
   } catch (error) {
      handleApiError(error)
   }
}
