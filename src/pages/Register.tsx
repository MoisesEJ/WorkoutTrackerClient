import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import Api from "../services/accessServer"
import Style from '@styles/Register.module.css'

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [showError, setShowError] = useState({ value: true, error: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!formData.username || !formData.password || !formData.email) {
        return setShowError({ value: false, error: 'User or password invalid' })
      }
      if (formData.password.length < 4) {
        return setShowError({ value: false, error: 'Password cannot be empty' })
      }
      if (formData.username.length < 4 && !formData.username.includes('@')) {
        return setShowError({ value: false, error: 'Username cannot must be at least 4 characters long' })
      }
      if (formData.email.length < 4 && formData.email.includes('@')) {
        return setShowError({ value: false, error: 'Email is invalid' })
      }
      const res = await Api.createUser(formData.username, formData.email, formData.password)
      if (!res.success) {
        setShowError({
          value: false,
          error: 'User data is invalid'
        })
        return
      }
      navigate('/login')
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    async function getSession() {
      try {
        const res = await Api.verifyUser()
        if (!res.success) {
          return navigate('/register')
        }
        navigate('/')
      } catch (error) {
        console.error('Error verifying user: ', error)
        return
      }
    }
    getSession()
  }, [navigate])

  return (
    <>
      <div className={Style.login}>
        <div>
          <div className={Style.title}>
            <h1>Workout Tracker</h1>
            <h2>Register</h2>
          </div>
          <div hidden={showError.value} className={Style.error}>
            <p>{showError.error}</p>
          </div>
          <form onSubmit={handleSubmit} className={Style.form}>
            <label htmlFor="user">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              placeholder="Username example"
              onChange={handleChange}
            />
            <label htmlFor="user">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder="example@gmail.com"
              onChange={handleChange}
            />
            <label htmlFor="password">Password</label>
            <input
              type='password'
              id="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
              minLength={4}
              maxLength={30}
            >
            </input>
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </>
  )
}