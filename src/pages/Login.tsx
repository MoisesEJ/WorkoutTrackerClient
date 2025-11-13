import React, { useEffect, useState } from "react"
import Api from "../services/accessServer"
import { useNavigate } from "react-router-dom"
import Style from '@styles/Login.module.css'

export default function Login() {
  const [formData, setFormData] = useState({user: '', password: ''})
  const [showError, setShowError] = useState({value: true, error: ''})
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!formData.user || !formData.password) {
        return setShowError({
          value: false,
          error: 'User or password invalid'
        })
      }
      if (formData.password.length < 4) {
        return setShowError({value: false, error: 'Password cannot be empty'})
      }
      if (formData.user.length < 4 && !formData.user.includes('@')) {
        return setShowError({ value: false, error: 'Username cannot must be at least 4 characters long' })
      }
      if (formData.user.length < 4 && formData.user.includes('@')) {
        return setShowError({ value: false, error: 'Email is invalid' })
      }
      if (formData.user.includes('@')) {
        const res = await Api.loginWithEmail(formData.user, formData.password)
        if (!res.success) {
          return setShowError({
            value: false,
            error: 'User is invalid or not exist'
          })
        }
        navigate('/')
      }
      const res = await Api.loginWithUser(formData.user, formData.password)
      if (!res.success) {
        return setShowError({
          value: false,
          error: res.message
        })
      }
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  useEffect(() => {
    async function getSession() {
      try {
        const res = await Api.verifyUser()
        if (!res.success) {
          return navigate('/login')
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
            <h2>Login</h2>
          </div>
          <div hidden={showError.value} className={Style.error}>
            <p>{showError.error}</p>
          </div>
          <form onSubmit={handleSubmit} className={Style.form}>
            <label htmlFor="user">Username or email</label>
            <input
              type="text"
              id="user"
              name="user"
              value={formData.user}
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
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  )
}