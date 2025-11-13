import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Style from '@styles/App.module.css'


export default function ChangedPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const success = Boolean(queryParams.get('success') || false)

  const handleLogin = async () => {
    navigate('/login')
  }

  useEffect(() => {
    if (success) {
      navigate('/')
    }
  }, [success, navigate])

  return (
    <>
      <div className={Style.notfound}>
        <p>Your password was successfully changed, and you are now logged out. Please log in again.</p>
        <button type="button" onClick={handleLogin}>Login</button>
      </div>
    </>
  )
}