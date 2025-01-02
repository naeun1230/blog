const express = require('express')
const { Comment, User } = require('../models')
const { isLoggedIn } = require('./middlewares')
const router = express.Router()

// 공통 에러 처리 함수
const handleError = (res, error, message) => {
   console.error(message, error)
   res.status(500).json({ success: false, message, error })
}

// 댓글 생성
router.post('/', isLoggedIn, async (req, res) => {
   try {
      console.log('댓글 요청 데이터:', req.body) // 요청 데이터 로깅
      const { content, postId } = req.body
      if (!content || !postId) {
         return res.status(400).json({ success: false, message: '내용과 게시물 ID가 필요합니다.' })
      }

      const comment = await Comment.create({
         content,
         PostId: postId, // 주의: 모델에서 정의된 컬럼 이름에 맞게 PostId로 작성
         UserId: req.user.id,
      })

      const createdComment = {
         id: comment.id,
         content: comment.content,
         postId: comment.PostId,
         UserId: comment.UserId,
         nick: req.user.nick,
         profile: req.user.profile,
      }

      res.json({
         success: true,
         comment: createdComment,
         message: '댓글이 성공적으로 등록되었습니다.',
      })
   } catch (error) {
      handleError(res, error, '댓글 생성 중 오류가 발생했습니다.')
   }
})

// 특정 게시물의 댓글 가져오기 (페이징 포함)
router.get('/', async (req, res) => {
   try {
      console.log('댓글 조회 요청 데이터:', req.query) // 로그 추가
      const { postId, page = 1, limit = 10 } = req.query

      if (!postId) {
         return res.status(400).json({ success: false, message: '게시물 ID가 필요합니다.' })
      }

      const offset = (page - 1) * limit

      const { count, rows } = await Comment.findAndCountAll({
         where: { PostId: postId }, // 주의: 모델 정의에 따라 PostId로 수정
         include: [
            {
               model: User,
               attributes: ['id', 'nick', 'profile'],
            },
         ],
         limit: parseInt(limit, 10),
         offset: parseInt(offset, 10),
         order: [['createdAt', 'DESC']],
      })

      res.json({
         success: true,
         comments: rows,
         pagination: {
            total: count,
            page: parseInt(page, 10),
            totalPages: Math.ceil(count / limit),
            limit: parseInt(limit, 10),
         },
         message: '댓글을 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      handleError(res, error, '댓글 불러오기 중 오류가 발생했습니다.')
   }
})

// 댓글 수정
router.put('/:id', isLoggedIn, async (req, res) => {
   try {
      const { id } = req.params
      const { content } = req.body

      const comment = await Comment.findOne({ where: { id, UserId: req.user.id } })
      if (!comment) {
         return res.status(404).json({ success: false, message: '댓글을 찾을 수 없거나 권한이 없습니다.' })
      }

      await comment.update({ content })

      res.json({
         success: true,
         comment,
         message: '댓글이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      handleError(res, error, '댓글 수정 중 오류가 발생했습니다.')
   }
})

// 댓글 삭제
router.delete('/:id', isLoggedIn, async (req, res) => {
   try {
      const { id } = req.params

      const comment = await Comment.findOne({ where: { id, UserId: req.user.id } })
      if (!comment) {
         return res.status(404).json({ success: false, message: '댓글을 찾을 수 없거나 권한이 없습니다.' })
      }

      await comment.destroy()

      res.json({
         success: true,
         message: '댓글이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      handleError(res, error, '댓글 삭제 중 오류가 발생했습니다.')
   }
})

module.exports = router
