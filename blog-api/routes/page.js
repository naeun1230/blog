const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('./middlewares')
const { User } = require('../models')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 필요한 디렉토리를 생성하는 함수
const ensureDirectoryExistence = (dir) => {
   if (!fs.existsSync(dir)) {
      console.log(`${dir} 디렉토리가 없어 생성합니다.`)
      fs.mkdirSync(dir, { recursive: true }) // 하위 디렉토리도 생성
   }
}

// uploads/profiles 디렉토리 생성 확인
ensureDirectoryExistence('uploads/profiles')

// 파일 업로드 설정
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'uploads/profiles/') // 파일 업로드 경로
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`) // 파일명 설정
   },
})
const upload = multer({ storage })

// 내 프로필 조회 localhost:8000/page/profile
router.get('/profile', isLoggedIn, async (req, res) => {
   const user = req.user
   if (!user.profile) {
      user.profile = '/uploads/profiles/default_profile.png'
   }
   res.json({
      success: true,
      user,
      message: '프로필 정보를 성공적으로 가져왔습니다.',
   })
})

// 특정인 프로필 조회 localhost:8000/page/profile/:id
router.get('/profile/:id', isLoggedIn, async (req, res) => {
   try {
      const userId = req.params.id
      const user = await User.findOne({
         where: { id: userId },
         attributes: ['id', 'userid', 'nick', 'profile', 'profileText', 'createdAt', 'updatedAt'],
      })

      if (!user) {
         return res.status(404).json({
            success: false,
            message: '사용자를 찾을 수 없습니다.',
         })
      }

      if (!user.profile) {
         user.profile = '/uploads/profiles/default_profile.png'
      }

      res.json({
         success: true,
         user,
         message: '프로필 정보를 성공적으로 가져왔습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({
         success: false,
         message: '특정 사용자 정보를 불러오는 중 오류가 발생했습니다.',
         error,
      })
   }
})

// 프로필 수정
router.put('/profile', isLoggedIn, upload.single('profile'), async (req, res) => {
   try {
      const { profileText, removeImg } = req.body
      const user = req.user

      if (!user) {
         return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' })
      }

      // 업데이트 데이터를 담을 객체
      const updates = {}

      // 기본 프로필 문구 설정
      updates.profileText = profileText?.trim() || `안녕하세요 ${user.nick}입니다.`

      // 기존 프로필 이미지 삭제 또는 기본 이미지로 설정
      const defaultProfilePath = '/uploads/profiles/default_profile.png'
      const currentProfilePath = `./uploads${user.profile}`
      const shouldDeleteFile = removeImg === 'true' && user.profile && user.profile !== defaultProfilePath

      if (shouldDeleteFile) {
         if (fs.existsSync(currentProfilePath)) {
            fs.unlinkSync(currentProfilePath) // 기존 이미지 삭제
         }
         updates.profile = defaultProfilePath // 기본 이미지 설정
      }

      // 새로운 프로필 이미지 업로드 처리
      if (req.file) {
         updates.profile = `/uploads/profiles/${req.file.filename}`
         if (user.profile && user.profile !== defaultProfilePath) {
            if (fs.existsSync(currentProfilePath)) {
               fs.unlinkSync(currentProfilePath) // 이전 이미지 삭제
            }
         }
      }

      // 사용자 정보 업데이트
      const [updated] = await User.update(updates, { where: { id: user.id } })
      if (!updated) {
         return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' })
      }

      // 업데이트된 사용자 정보 반환
      const updatedUser = await User.findByPk(user.id, {
         attributes: ['id', 'userid', 'nick', 'profile', 'profileText', 'createdAt', 'updatedAt'],
      })

      res.json({
         success: true,
         user: updatedUser,
         message: '프로필이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      console.error('프로필 수정 중 오류 발생:', error)
      res.status(500).json({
         success: false,
         message: '프로필 수정 중 오류가 발생했습니다.',
         error,
      })
   }
})

module.exports = router
