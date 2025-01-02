const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')
const User = require('../models/user')

const router = express.Router()

const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/profiles/')
      },
      filename(req, file, cb) {
         const ext = path.extname(file.originalname)
         const basename = path.basename(file.originalname, ext)
         cb(null, `${basename}-${Date.now()}${ext}`)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 },
   fileFilter(req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
         cb(null, true)
      } else {
         cb(new Error('이미지 파일만 업로드할 수 있습니다.'))
      }
   },
})

// 회원가입 라우터
router.post(
   '/join',
   isNotLoggedIn,
   (req, res, next) => {
      upload.single('profileImage')(req, res, (err) => {
         if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: '파일 업로드 오류', error: err.message })
         } else if (err) {
            return res.status(400).json({ success: false, message: err.message })
         }
         next()
      })
   },
   async (req, res) => {
      try {
         const { userid, password, nick } = req.body
         const profile = req.file ? `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}` : `${req.protocol}://${req.get('host')}/uploads/profiles/default-profile.png`

         if (!userid || !password || !nick) {
            return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' })
         }

         const exUser = await User.findOne({ where: { userid } })
         if (exUser) {
            return res.status(409).json({ success: false, message: '이미 존재하는 아이디입니다.' })
         }

         const hash = await bcrypt.hash(password, 12)
         const newUser = await User.create({ userid, password: hash, nick, profile })

         console.log('회원가입 성공:', newUser)

         res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다!',
            user: { id: newUser.id, userid: newUser.userid, nick: newUser.nick, profile: newUser.profile },
         })
      } catch (error) {
         console.error('회원가입 에러:', error)
         res.status(500).json({ success: false, message: '회원가입 중 오류가 발생했습니다.', error })
      }
   }
)

//로그인 localhost:8000/auth/login
router.post('/login', isNotLoggedIn, async (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         return res.status(500).json({ success: false, message: '인증 중 오류 발생', error: authError })
      }

      if (!user) {
         return res.status(401).json({
            success: false,
            message: info.message || '로그인 실패',
         })
      }

      req.login(user, (loginError) => {
         if (loginError) {
            return res.status(500).json({ success: false, message: '로그인 중 오류 발생', error: loginError })
         }

         res.json({
            success: true,
            message: '로그인 성공!',
            user: {
               id: user.id,
               userid: user.userid,
               nick: user.nick,
            },
         })
      })
   })(req, res, next)
})

//로그아웃 localhost:8000/auth/logout
router.get('/logout', isLoggedIn, async (req, res, next) => {
   try {
      await new Promise((resolve, reject) => req.logout((err) => (err ? reject(err) : resolve())))
      req.session.destroy(() => {
         res.clearCookie('connect.sid')
         res.json({ success: true, message: '로그아웃에 성공했습니다.' })
      })
   } catch (err) {
      console.error('로그아웃 에러:', err)
      res.status(500).json({ success: false, message: '로그아웃 중 오류가 발생했습니다.', error: err })
   }
})

//로그인 상태 확인
router.get('/status', async (req, res) => {
   if (req.isAuthenticated()) {
      res.json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            userid: req.user.userid,
            nick: req.user.nick,
            profile: req.user.profile,
         },
      })
   } else {
      res.json({ isAuthenticated: false })
   }
})

module.exports = router
