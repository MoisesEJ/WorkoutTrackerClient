import React, { useState, useEffect } from 'react'
import ApiServer from '../services/accessServer'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../services/ImagesManager'
import Style from '@styles/Profile.module.css'

interface User {
  id: number
  username: string
  email: string
  photo: string
}

interface Form {
  username: string
  pass: string
  password: string
  passwordConfirm: string
}

export default function Profile() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User>(Object)
  const [formData, setFormData] = useState<Form>({username: '', pass: '', password: '', passwordConfirm: ''})
  const [showErrorUsername, setShowErrorUsername] = useState({value: true, error: ''})
  const [showErrorPassword, setShowErrorPassword] = useState({ value: true, error: '' })
  const [showErrorUserDelete, setShowErrorUserDelete] = useState({ value: true, error: '' })
  const [showErrorAvatar, setShowErrorAvatar] = useState({ value: true, error: '' })
  const [avatarSelected, setAvatarSelected] = useState(user.photo)
  const [passDelete, setPassDelete] = useState('')

  const [showNameEdit, setShowNameEdit] = useState(true)
  const [showPassEdit, setShowPassEdit] = useState(true)
  const [showUserDelete, setShowUserDelete] = useState(true)
  const [showChangeAvatar, setShowChangeAvatar] = useState(true)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleChangeAvatar = () => {
    setAvatarSelected(user.photo)
    setShowChangeAvatar(false)
  }

  const handleCancelChangeAvatar = () => {
    setAvatarSelected(user.photo)
    setShowChangeAvatar(true)
    setShowErrorAvatar({value: true, error: ''})
  }

  const handleSubmitUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (formData.username === '') {
      return setShowErrorUsername({value: false, error: 'Username cannot be empty'})
    }
    if (formData.username.length < 4) {
      return setShowErrorUsername({value: false, error: 'Username cannot be less than 4 characters'})
    }
    if (formData.pass === '' || formData.pass.length < 4) {
      return setShowErrorUsername({value: false, error: 'Password invalid (empty or less than 4 characters)'})
    }
    const res = await ApiServer.changeUsername(formData.username, formData.pass)
    if (!res.success) {
      return setShowErrorUsername({value: false, error: res.message})
    }
    navigate(0)
  }

  const handleSubmitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (formData.password !== formData.passwordConfirm) {
      return setShowErrorPassword({ value: false, error: 'The passwords not is equals' })
    }
    if (formData.password === '' || formData.passwordConfirm === '') {
      return setShowErrorPassword({ value: false, error: 'Password cannot be empty' })
    }
    if (formData.password.length < 4 || formData.passwordConfirm.length < 4) {
      return setShowErrorPassword({ value: false, error: 'Password cannot be less than 4 characters' })
    }
    const res = await ApiServer.changePassword(formData.password)
    if (!res.success) {
      return setShowErrorPassword({ value: false, error: res.message })
    }
    const logout = await ApiServer.logout()
    if (!logout.success) {
      return setShowErrorPassword({ value: false, error: logout.message })
    }
    navigate(`/pass?${logout.success}`)
  }

  const handleSubmitDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passDelete === '') {
      return setShowErrorUserDelete({ value: false, error: 'Password cannot be empty' })
    }
    if (passDelete.length < 4) {
      return setShowErrorUserDelete({ value: false, error: 'Password cannot be less than 4 characters' })
    }
    const res = await ApiServer.deleteUser(passDelete)
    if (!res.success) {
      return setShowErrorUserDelete({ value: false, error: res.message })
    }
    navigate('/')
  }

  const handleSubmitAvatar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (avatarSelected === '') {
      return setShowErrorAvatar({value: false, error: 'Error selected avatar of user'})
    }
    const res = await ApiServer.changeAvatar(avatarSelected)
    if (!res.success) {
      setShowErrorAvatar({
        value: false,
        error: res.message
      })
    }
    navigate(0)
  }

  const handleCancelUsername = () => {
    setShowErrorUsername({value: true, error: ''})
    setFormData({ username: '', pass: '', password: '', passwordConfirm: ''})
    setShowNameEdit(true)
  }

  const handleCancelPassword = () => {
    setShowErrorPassword({value: true, error: ''})
    setFormData({ username: '', pass: '', password: '', passwordConfirm: ''})
    setShowPassEdit(true)
  }

  const handleCancelDelete = () => {
    setShowErrorUserDelete({ value: true, error: '' })
    setPassDelete('')
    setShowUserDelete(true)
  }

  useEffect(() => {
    async function getSession() {
      try {
        const res = await ApiServer.verifyUser()
        if (!res.success) {
          return navigate('/')
        }
        setUser(res.user)
      } catch (error) {
        console.error('Error verifying user: ', error)
        return
      }
    }
    getSession()
  }, [navigate])

  return (
    <>
      <div className={Style.profile}>
        <h1>Profile</h1>
        <div className={Style.settings}>
          <h2>Settings</h2>
          <div className={Style.title}>
            <h3>Avatar</h3>
            <button type="button" onClick={handleChangeAvatar}>Change</button>
          </div>

          <div className={Style.title}>
            <h3>{user.username}</h3>
            <button type="button" onClick={() => setShowNameEdit(false)}>Change</button>
          </div>

          <div className={Style.title}>
            <h3>Password</h3>
            <button type="button" onClick={() => setShowPassEdit(false)}>Change password</button>
          </div>
        </div>
        
        <div className={Style.delete}>
          <h2>Delete user</h2>
          <button type="button" onClick={() => setShowUserDelete(false)}>Delete</button>
        </div>
      </div>

      <div hidden={showChangeAvatar} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <p>Change avatar</p>
            <div hidden={showErrorAvatar.value} className={Style.error}>
              <p>{showErrorAvatar.error}</p>
            </div>
            <form onSubmit={handleSubmitAvatar} className={Style.formAvatar}>
              <div>
                {Avatar.map((avatar, index) => (
                  <label key={index} className={Style.avatar}>
                    <input
                      type="radio"
                      name={avatar.name}
                      value={avatar.name}
                      checked={avatarSelected === avatar.name}
                      onChange={() => setAvatarSelected(avatar.name)}
                    />
                    <img src={avatar.src} alt={`avatar_${index}`} />
                    <div className={Style.avatarDot}></div>
                  </label>
                ))}
              </div>
              <div>
                <button type="submit">Save</button>
                <button type="button" onClick={handleCancelChangeAvatar}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div hidden={showNameEdit} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <div hidden={showErrorUsername.value} className={Style.error}>
              <p>{showErrorUsername.error}</p>
            </div>
            <form onSubmit={handleSubmitUsername} className={Style.form}>
              <label htmlFor="username">Username: </label>
              <input type="text" id="username" name="username" placeholder='Username' value={formData.username} onChange={handleChange} />
              <label htmlFor="pass">Password: </label>
              <input type="password" id="pass" name="pass" placeholder='Password' value={formData.password} onChange={handleChange} />
              <div>
                <button type="submit">Change</button>
                <button type="button" onClick={handleCancelUsername}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div hidden={showPassEdit} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <p>Change Password</p>
            <div hidden={showErrorPassword.value} className={Style.error}>
              <p>{showErrorPassword.error}</p>
            </div>
            <form onSubmit={handleSubmitPassword} className={Style.form}>
              <label htmlFor="password">Password: </label>
              <input type="password" id="password" name="password" placeholder='New Password' onChange={handleChange} />
              <label htmlFor="passwordConfirm">Confirm password: </label>
              <input type="password" id="passwordConfirm" name="passwordConfirm" placeholder='Confirm new password' onChange={handleChange} />
              <div>
                <button type="submit">Change</button>
                <button type="button" onClick={handleCancelPassword}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div hidden={showUserDelete} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <p>Sure want delete username. Once deleted, it cannot be accessed or restored.</p>
            <p>(Enter your password to confirm)</p>
            <div hidden={showErrorUserDelete.value} className={Style.error}>
              <p>{showErrorUserDelete.error}</p>
            </div>
            <form onSubmit={handleSubmitDelete} className={Style.form}>
              <label htmlFor="passDelete">Password: </label>
              <input type="password" id='passDelete' name='passDelete' placeholder='Password for Confirm' value={passDelete} onChange={(e) => setPassDelete(e.target.value)} />
              <div className={Style.formDelete}>
                <button type="submit">Delete</button>
                <button type="button" onClick={handleCancelDelete}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}