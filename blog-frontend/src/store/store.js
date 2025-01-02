import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import postReducer from '../features/postSlice'
import pageReducer from '../features/pageSlice'
import commentReducer from '../features/commentSlice'

const store = configureStore({
   reducer: {
      auth: authReducer,
      posts: postReducer,
      page: pageReducer,
      comments: commentReducer,
   },
})

export default store
