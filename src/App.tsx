
import Home from './pages/Home'
import User from './pages/User'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Login from './pages/Login'
import ChangedPassword from './pages/ChangedPassword.tsx'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Api from './services/accessServer'
import PhotoUser from './components/PhotoUser'
import Style from '@styles/App.module.css'

function App() {
  const [isLogin, setLogin] = useState(false)
  const [user, setUser] = useState(Object)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await Api.logout()
      if (!isLogin) {
        return
      }
      setLogin(false)
      setUser(Object)
      navigate('/')
    } catch (error) {
      console.error('Error logging out: ', error)
    }
  }

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        document.title = 'Workout Tracker - Home'
        break
      case "/profile":
        document.title = 'Workout Tracker - Profile'
        break
      case "/login":
        document.title = 'Workout Tracker - Login'
        break
      case "/register":
        document.title = 'Workout Tracker - Register'
        break
      case "/pass":
        document.title = 'Workout Tracker'
        break
      default:
        document.title = 'Workout Tracker'
        navigate("/")
        break
    }
    async function getSession() {
      try {
        const res = await Api.verifyUser()
        if (!res.success) {
          return setLogin(false)
        }
        setLogin(true)
        setUser(res.user)
      } catch (error) {
        console.error('Error verifying user: ', error)
        return
      }
    }
    getSession()
  }, [navigate, location.pathname])

  return (
    <>
      <header>
        <Link to='/'>
          <h1>Workout Tracker</h1>
        </Link>
        {isLogin ? 
          <div className={Style.nav}>
            <div className={Style.user}>
              <PhotoUser avatar={user.photo} />
              <span>{user.username}</span>
            </div>
            <nav>
              <ul className={Style.menu}>
                <li><Link to='/profile'>Profile</Link></li>
                <li><button type='button' onClick={handleLogout}>Logout</button></li>
              </ul>
            </nav>
          </div> :
          <div className={Style.login}>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
          </div>
        }
      </header>
      <main>
        {isLogin ? (
          <Routes>
            <Route path='/' element={<User />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        ) : (
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='pass' element={<ChangedPassword />} />
          </Routes>
        )}
      </main>
    </>
  )
}

export default App
