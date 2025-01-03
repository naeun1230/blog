import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/create.css'

const PostForm = ({ onSubmit, initialValues = {} }) => {
   const [imgUrl, setImgUrl] = useState(initialValues.img ? process.env.REACT_APP_API_URL + initialValues.img : '') // 이미지 경로(파일명 포함)
   const [imgFile, setImgFile] = useState(null) // 이미지 파일 객체
   const [title, setTitle] = useState(initialValues.title || '') // 제목
   const [content, setContent] = useState(initialValues.content || '') // 내용
   const [isImageRemoved, setIsImageRemoved] = useState(false) // 이미지 삭제 여부
   const navigate = useNavigate()

   // 이미지 파일 업로드 및 미리보기
   const handleImageChange = useCallback((e) => {
      const file = e.target.files && e.target.files[0]
      if (!file) return

      setImgFile(file) // 업로드한 파일 객체 저장
      const reader = new FileReader()

      reader.readAsDataURL(file) // 파일을 Base64 URL로 변환
      reader.onload = (event) => {
         setImgUrl(event.target.result) // 이미지 미리보기 URL 설정
         setIsImageRemoved(false) // 이미지 삭제 상태 초기화
      }
   }, [])

   // 이미지 삭제 처리
   const handleImageRemove = useCallback(() => {
      setImgFile(null) // 이미지 파일 초기화
      setImgUrl('') // 미리보기 URL 초기화
      setIsImageRemoved(true) // 이미지 삭제 상태 설정
   }, [])

   // 취소
   const handleCancel = () => {
      if (window.history.length > 1) {
         navigate(-1) // 이전 화면으로 이동
      } else {
         navigate('/') // 메인 화면으로 이동
      }
   }

   // 게시물 전송
   const handleSubmit = useCallback(
      (e) => {
         e.preventDefault()

         if (!title.trim()) {
            alert('제목을 입력하세요.')
            return
         }

         if (!content.trim()) {
            alert('내용을 입력하세요.')
            return
         }

         const formData = new FormData()
         formData.append('title', title)
         formData.append('content', content)
         formData.append('removeImg', isImageRemoved) // 이미지 삭제 여부 추가

         if (imgFile) {
            const encodedFile = new File([imgFile], encodeURIComponent(imgFile.name), { type: imgFile.type })
            formData.append('img', encodedFile) // 업로드된 파일 추가
         }

         onSubmit(formData) // 부모 컴포넌트에 데이터 전달
      },
      [title, content, imgFile, isImageRemoved, onSubmit]
   )

   // Enter 키 동작 처리
   const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
         e.preventDefault() // 기본 Enter 동작 방지
         handleSubmit(e) // 등록 함수 실행
      } else if (e.key === 'Enter') {
         e.preventDefault() // 기본 Enter 동작 방지
         setContent((prevContent) => prevContent + '\n') // 줄바꿈 추가
      }
   }

   return (
      <form encType="multipart/form-data" className="createform">
         <div>
            <input type="text" placeholder="제목을 입력하세요." value={title} onChange={(e) => setTitle(e.target.value)} className="contentinput" style={{ width: '620px', height: '50px', marginBottom: '20px', textAlign: 'left' }} />
         </div>

         {/* 이미지와 텍스트를 하나의 border로 감싸는 영역 */}
         <div className="contentinput" style={{ padding: '20px', textAlign: 'left' }}>
            {imgUrl && (
               <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                  <img src={imgUrl} alt="업로드 이미지 미리보기" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '5px' }} />
               </div>
            )}
            <textarea
               placeholder="내용을 입력하세요."
               value={content}
               onChange={(e) => setContent(e.target.value)}
               onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
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
