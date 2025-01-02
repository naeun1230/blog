import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getComments, createCommentApi, updateComment, deleteComment } from '../api/blogApi'
import dayjs from 'dayjs'
import '../styles/commentpage.css'

const CommentPage = () => {
   const { id } = useParams()
   const navigate = useNavigate()
   const { user } = useSelector((state) => state.auth)
   const [comments, setComments] = useState([])
   const [newComment, setNewComment] = useState('')
   const [page, setPage] = useState(1)
   const [totalPages, setTotalPages] = useState(1)
   const [loading, setLoading] = useState(false)
   const [editingCommentId, setEditingCommentId] = useState(null)
   const [editingContent, setEditingContent] = useState('')

   const fetchComments = async (currentPage) => {
      setLoading(true)
      try {
         const response = await getComments(id, currentPage, 5) // 페이지당 5개의 댓글 가져오기
         setComments(response.comments)
         setPage(response.pagination.page)
         setTotalPages(response.pagination.totalPages)
      } catch (error) {
         console.error('댓글 불러오기 실패:', error)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchComments(page)
   }, [id, page])

   const handleAddComment = async () => {
      if (!newComment.trim()) {
         alert('댓글 내용을 입력해주세요.')
         return
      }

      try {
         await createCommentApi(id, newComment)
         setNewComment('')
         fetchComments(page)
      } catch (error) {
         console.error('댓글 추가 실패:', error)
         alert('댓글 추가 중 문제가 발생했습니다.')
      }
   }

   const handleEdit = (id, content) => {
      setEditingCommentId(id)
      setEditingContent(content)
   }

   const saveEdit = async () => {
      if (!editingContent.trim()) {
         alert('수정할 내용을 입력해주세요.')
         return
      }

      try {
         await updateComment(editingCommentId, editingContent)
         alert('댓글이 수정되었습니다.')
         setEditingCommentId(null)
         setEditingContent('')
         fetchComments(page)
      } catch (error) {
         console.error('댓글 수정 실패:', error)
         alert('댓글 수정 중 문제가 발생했습니다.')
      }
   }

   const handleDelete = async (id) => {
      if (window.confirm('댓글을 삭제하시겠습니까?')) {
         try {
            await deleteComment(id)
            alert('댓글이 삭제되었습니다.')
            fetchComments(page)
         } catch (error) {
            console.error('댓글 삭제 실패:', error)
         }
      }
   }

   const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
         setPage(newPage)
      }
   }

   return (
      <div className="comment-page">
         <div className="comment-header">
            <button className="back-button" onClick={() => navigate(-1)}>
               &lt;
            </button>
            <h2 className="comment-page-title">댓글</h2>
         </div>

         {loading ? (
            <p>로딩 중...</p>
         ) : (
            <div className="comment-list">
               {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                     <div className="comment-content">
                        <p>
                           <strong>{comment.User.nick}</strong> {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                        </p>
                        {editingCommentId === comment.id ? (
                           <div className="comment-edit">
                              <input type="text" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="comment-input" maxLength={100} />
                              <button onClick={saveEdit} className="save-button">
                                 저장
                              </button>
                              <button onClick={() => setEditingCommentId(null)} className="cancel-button" style={{ color: 'red' }}>
                                 취소
                              </button>
                           </div>
                        ) : (
                           <p>{comment.content}</p>
                        )}
                     </div>
                     {comment.UserId === user.id && (
                        <div className="comment-actions">
                           {editingCommentId !== comment.id && (
                              <>
                                 <button onClick={() => handleEdit(comment.id, comment.content)} className="comment-button">
                                    수정
                                 </button>
                                 <button onClick={() => handleDelete(comment.id)} className="comment-button delete">
                                    삭제
                                 </button>
                              </>
                           )}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}

         <div className="comment-add">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력해주세요. (100자 이내)" maxLength={100} className="comment-input" />
            <button onClick={handleAddComment} id="regbutton">
               등록
            </button>
         </div>
         <p style={{ textAlign: 'right', fontSize: '12px', color: '#888' }}>{newComment.length} / 100</p>

         <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="pagination-button">
               이전
            </button>
            <span className="pagination-info">
               {page} / {totalPages > 0 ? totalPages : 1}
            </span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="pagination-button">
               다음
            </button>
         </div>
      </div>
   )
}

export default CommentPage
