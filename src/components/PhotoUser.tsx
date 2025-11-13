import { useEffect, useState } from "react"
import { Avatar } from "../services/ImagesManager"
import '@styles/PhotoUser.css'

export default function PhotoUser({avatar}: {avatar: string}) {
  const [avatarUser, setAvatarUser] = useState('#')

  useEffect(() => {
    function photo() {
      switch(avatar) {
        case 'deafult': {
          setAvatarUser(Avatar[0].src)
          break
        }
        case 'dumbbell': {
          setAvatarUser(Avatar[1].src)
          break
        }
        case 'muscle': {
          setAvatarUser(Avatar[2].src)
          break
        }
      }
    }
    photo()
  })

  return (
    <>
      <img src={avatarUser} alt="avatar of user"/>
    </>
  )
}