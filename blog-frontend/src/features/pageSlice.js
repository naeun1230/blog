import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getProfile, getProfileId, updateProfile } from '../api/blogApi' // updateProfile API 추가

// 내 프로필 정보 가져오기
export const getProfileThunk = createAsyncThunk('page/getProfile', async (_, { rejectWithValue }) => {
   try {
      const response = await getProfile()
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '내 프로필 정보 가져오기 실패')
   }
})

// 특정인의 프로필 정보 가져오기
export const getProfileIdThunk = createAsyncThunk('page/getProfileId', async (id, { rejectWithValue }) => {
   try {
      const response = await getProfileId(id)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '사용자 프로필 정보 가져오기 실패')
   }
})

// 내 프로필 수정
export const updateProfileThunk = createAsyncThunk('page/updateProfile', async (formData, { rejectWithValue }) => {
   try {
      const response = await updateProfile(formData) // 프로필 수정 API 호출
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '프로필 수정 실패')
   }
})

const pageSlice = createSlice({
   name: 'page',
   initialState: {
      user: null,
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      // 내 프로필 가져오기
      builder
         .addCase(getProfileThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getProfileThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(getProfileThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
      // 특정인의 프로필 가져오기
      builder
         .addCase(getProfileIdThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getProfileIdThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(getProfileIdThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
      // 프로필 수정
      builder
         .addCase(updateProfileThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(updateProfileThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(updateProfileThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export default pageSlice.reducer
