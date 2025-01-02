import React, { useEffect, useState } from 'react'
import { getPosts } from '../api/blogApi'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import '../styles/board.css'

const BoardPage = () => {
   const [posts, setPosts] = useState([]) // 게시글 데이터
   const [loading, setLoading] = useState(false) // 로딩 상태
   const [page, setPage] = useState(1) // 현재 페이지
   const [totalPages, setTotalPages] = useState(1) // 총 페이지 수

   // 게시글 데이터 요청
   useEffect(() => {
      const fetchPosts = async (currentPage) => {
         setLoading(true)
         try {
            const response = await getPosts(currentPage, 5)
            setPosts(response.posts || []) // 게시글 데이터 저장
            setPage(response.pagination?.currentPage || 1)
            setTotalPages(response.pagination?.totalPages || 1)
         } catch (error) {
            console.error('게시글 불러오기 실패:', error)
         } finally {
            setLoading(false)
         }
      }

      fetchPosts(page)
   }, [page])

   // 페이지 변경 핸들러
   const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
         setPage(newPage) // 페이지 상태 업데이트
      }
   }

   if (loading) return <p>로딩 중...</p>

   return (
      <div className="board-container">
         <h1 className="board-title">Live My Life</h1>
         <table className="board-table">
            <thead>
               <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>작성일</th>
               </tr>
            </thead>
            <tbody>
               {posts.length > 0 ? (
                  posts.map((post) => (
                     <tr key={post.id}>
                        <td>{post.number}</td>
                        <td>
                           <Link to={`/post/${post.id}`} className="board-link">
                              {post.title || '제목 없음'}
                           </Link>
                        </td>
                        <td>
                           <Link to={`/my/${post.User.id}`} className="board-link" style={{ color: '#555' }}>
                              {post.User?.nick}
                           </Link>
                        </td>
                        <td>{dayjs(post.createdAt).format('YYYY-MM-DD')}</td>
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td colSpan="4" style={{ textAlign: 'center' }}>
                        게시글이 없습니다.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
         <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="pagination-button">
               이전
            </button>
            <span className="pagination-info">
               {page} / {totalPages}
            </span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="pagination-button">
               다음
            </button>
         </div>
      </div>
   )
}

export default BoardPage
