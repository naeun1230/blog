const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Post, User } = require('../models')
const { isLoggedIn } = require('./middlewares')
const router = express.Router()
const { sequelize } = require('../models') // sequelize 인스턴스 가져오기

//uploads폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

//이미지 업로드를 위한 multer 설정
const upload = multer({
   //저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      //cb: multer에 파일을 어디에 저장할지를 알려주는 콜백 함수입니다. 이 함수는 cb(null, 'uploads/')와 같이 호출되며, 'uploads/' 디렉토리에 파일을 저장하도록 multer에 지시합니다.
      destination(req, file, cb) {
         cb(null, 'uploads/') //uploads폴더에 저장
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname) //파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodedFileName) //확장자 추출
         const basename = path.basename(decodedFileName, ext) //확장자 제거한 파일명 추출

         // 파일명 설정: 기존이름 + 업로드 날짜시간 + 확장자
         // dog.jpg
         // ex) dog + 1231342432443 + .jpg
         cb(null, basename + Date.now() + ext)
      },
   }),
   //파일 크기 제한
   limits: { fileSize: 5 * 1024 * 1024 },
})

//게시물 등록
router.post('/', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      // 이미지가 없는 경우 img 필드를 null 또는 빈 문자열로 처리
      const imgPath = req.file ? `/${req.file.filename}` : null

      // 게시물 생성
      const post = await Post.create({
         title: req.body.title, // 게시물 제목
         content: req.body.content, // 게시물 내용
         img: imgPath, // 이미지 url (없으면 null)
         UserId: req.user.id,
         nick: req.user.nick,
         profile: req.user.profile,
      })

      res.json({
         success: true,
         post: {
            id: post.id,
            title: post.title,
            content: post.content,
            img: post.img,
            UserId: post.UserId,
            nick: req.user.nick,
            profile: req.user.profile,
         },
         message: '게시물이 등록되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 등록 중 오류가 발생했습니다.', error })
   }
})

// 게시물 수정
router.put('/:id', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.user.id } })
      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      const { title, content, removeImg } = req.body
      let imgPath = post.img

      if (removeImg === 'true') {
         imgPath = null // 이미지 경로 제거
         const fs = require('fs')
         if (post.img) {
            const filePath = `./uploads${post.img}`
            if (fs.existsSync(filePath)) {
               fs.unlinkSync(filePath) // 서버에서 파일 삭제
            }
         }
      } else if (req.file) {
         imgPath = `/${req.file.filename}` // 새 이미지 업로드 처리
      }

      await post.update({
         title,
         content,
         img: imgPath,
      })

      res.json({
         success: true,
         message: '게시물이 수정되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 수정 중 오류가 발생했습니다.', error })
   }
})

//게시물 삭제 localhost:8000/post/:id
router.delete('/:id', isLoggedIn, async (req, res) => {
   try {
      //삭제할 게시물 존재 여부 확인
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.user.id } })
      if (!post) {
         return res.status(400).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      //게시물 삭제
      await post.destroy()

      res.json({
         success: true,
         message: '게시물이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 삭제 중 오류가 발생했습니다.', error })
   }
})

//특정 게시물 불러오기
router.get('/:id', async (req, res) => {
   try {
      const post = await Post.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: User,
               attributes: ['id', 'userid', 'nick', 'profile'],
            },
         ],
      })
      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      res.json({
         success: true,
         post,
         message: '게시물을 불러왔습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물을 불러오는 중 오류가 발생했습니다.', error })
   }
})

// 특정 사용자의 게시글 가져오기
router.get('/user/:userId', async (req, res) => {
   try {
      const { userId } = req.params
      const posts = await Post.findAll({
         where: { userId },
         order: [['createdAt', 'DESC']],
      })
      res.status(200).json({ success: true, posts })
   } catch (error) {
      console.error('게시글 가져오기 오류:', error)
      res.status(500).json({ success: false, message: '게시글을 가져오는 중 오류가 발생했습니다.', error })
   }
})

//전체 게시물 불러오기(페이징 기능) localhost:8000/post
router.get('/', async (req, res) => {
   try {
      const page = parseInt(req.query.page, 10) || 1 // page 번호(기본값: 1)
      const limit = parseInt(req.query.limit, 10) || 5 // 한 페이지당 나타낼 게시물 수
      const offset = (page - 1) * limit // 오프셋 계산
      const count = await Post.count() // 전체 게시물 개수

      const posts = await Post.findAll({
         limit, // 한 페이지당 표시할 게시글 수
         offset, // 페이지 오프셋 계산
         order: [['createdAt', 'DESC']], // 오래된 게시글 순으로 정렬
         attributes: [
            'id', // 기본 속성
            'title',
            'content',
            'createdAt',
            [
               sequelize.literal(`ROW_NUMBER() OVER (ORDER BY "createdAt" ASC)`),
               'number', // 번호를 계산하여 number로 출력
            ],
         ],
         include: [
            {
               model: User, // 작성자 정보 포함
               attributes: ['id', 'userid', 'nick', 'profile'],
            },
         ],
      })

      res.json({
         success: true,
         posts,
         pagination: {
            totalPosts: count, // 전체 게시물 수
            currentPage: page, // 현재 페이지
            totalPages: Math.ceil(count / limit), // 총 페이지 수
         },
         message: '전체 게시물 리스트를 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 리스트를 불러오는 중 오류가 발생했습니다.', error })
   }
})

module.exports = router
