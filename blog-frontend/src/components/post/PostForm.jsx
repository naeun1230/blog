import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/create.css'

const PostForm = ({ onSubmit, initialValues = {} }) => {
   const [imgUrl, setImgUrl] = useState(initialValues.img ? `${process.env.REACT_APP_API_URL}${initialValues.img}` : null)
   const [imgFile, setImgFile] = useState(null) // 새로 업로드된 이미지 파일
   const [title, setTitle] = useState(initialValues.title || '') // 제목
   const [content, setContent] = useState(initialValues.content || '') // 내용
   const [isImageRemoved, setIsImageRemoved] = useState(false) // 이미지 삭제 여부
   const navigate = useNavigate()

   // 이미지 파일 변경 핸들러
   const handleImageChange = useCallback((e) => {
      const file = e.target.files && e.target.files[0]
      if (file) {
         setImgFile(file) // 파일 객체 저장
         setImgUrl(URL.createObjectURL(file)) // 로컬 미리보기 URL 설정
         setIsImageRemoved(false) // 이미지 삭제 상태 초기화
      }
   }, [])

   // 이미지 삭제 핸들러
   const handleImageRemove = useCallback(() => {
      setImgFile(null) // 이미지 파일 초기화
      setImgUrl('') // 미리보기 URL 초기화
      setIsImageRemoved(true) // 이미지 삭제 상태 설정
   }, [])

   // 취소 버튼 핸들러
   const handleCancel = () => {
      navigate(-1) // 이전 페이지로 이동
   }

   // 폼 제출 핸들러
   const handleSubmit = useCallback(
      (e) => {
         e.preventDefault()

         if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력하세요.')
            return
         }

         const formData = new FormData()
         formData.append('title', title)
         formData.append('content', content)
         formData.append('removeImg', isImageRemoved)

         if (imgFile) {
            formData.append('img', imgFile) // 업로드된 파일 추가
         }

         onSubmit(formData) // 부모 컴포넌트로 데이터 전달
      },
      [title, content, imgFile, isImageRemoved, onSubmit]
   )

   return (
      <form encType="multipart/form-data" className="createform">
         <div>
            <input type="text" placeholder="제목을 입력하세요." value={title} onChange={(e) => setTitle(e.target.value)} className="contentinput" style={{ width: '620px', height: '50px', marginBottom: '20px', textAlign: 'left' }} />
         </div>
         <div className="contentinput" style={{ padding: '20px', textAlign: 'center' }}>
            {imgUrl && <img src={imgFile ? URL.createObjectURL(imgFile) : imgUrl} alt="미리보기 이미지" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />}

            <textarea
               placeholder="내용을 입력하세요."
               value={content}
               onChange={(e) => setContent(e.target.value)}
               style={{
                  height: '250px',
                  width: '580px',
                  fontSize: 'large',
                  border: 'none',
               }}
            ></textarea>
         </div>
         <div className="buttonwrap">
            <label htmlFor="fileInput" id="uploadbutton">
               이미지 업로드
            </label>
            <input type="file" id="fileInput" name="img" accept="image/*" hidden onChange={handleImageChange} />
            <button type="button" onClick={handleImageRemove} id="cancelbutton">
               이미지 삭제
            </button>
            <button type="submit" id="registrationbutton" onClick={handleSubmit}>
               등록
            </button>
            <button type="button" id="cancelbutton" onClick={handleCancel}>
               취소
            </button>
         </div>
      </form>
   )
}

export default PostForm
