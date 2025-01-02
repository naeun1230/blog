import MyProfile from '../components/page/MyProfile'

const MyPage = ({ auth }) => {
   return (
      <div>
         <MyProfile auth={auth} />
      </div>
   )
}

export default MyPage
