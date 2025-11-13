import { useNavigate } from "react-router-dom"
import ApiServer from "../services/accessServer"
import { useState } from "react"
import Style from '@styles/Exercise.module.css'


export default function Exercise({exercise}: {exercise: {id: number, name: string, weight: number}}) {
  const [editedExercise, setEditedExercise] = useState(exercise)
  const [showError, setShowError] = useState({value: true, error: ''})
  const [showForm, setShowForm] = useState(true)
  const [showDelete, setShowDelete] = useState(true)

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedExercise({...editedExercise, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      editedExercise.weight = Number(editedExercise.weight)
      if (!editedExercise.name || !editedExercise.weight) {
        return setShowError({
          value: false,
          error: 'Please fill in all fields'
        })
      }
      const res = await ApiServer.updateExercise(editedExercise)
      if (!res.success) {
        console.error('Error updating exercise: ', res.message)
        return
      }
      navigate(0)
    } catch (error) {
      console.error('Error updating exercise: ', error)
    }
  }

  const handleShowForm = () => {
    setShowForm(!showForm)
    setShowError({value: true, error: ''})
    setEditedExercise(exercise)
  }

  const handleDelete = async () => {
    try {
      const res = await ApiServer.deleteExercise(exercise)
      if (!res.success) {
        console.error('Error deleting exercise: ', res.message)
        return
      }
      navigate(0)
    } catch (error) {
      console.error('Error deleting exercise: ', error)
    }
  }

  return (
    <>
      <div className={Style.exercise} title={`${exercise.name} ${exercise.weight} lbs`}>
        <p><span>Name: </span>{exercise.name}</p>
        <p><span>Weight: </span>{`${exercise.weight} lbs`}</p>
        <div>
          <button type="button" onClick={handleShowForm}>Edit</button>
          <button type="button" onClick={() => setShowDelete(false)}>Delete</button>
        </div>
      </div>

      <div hidden={showForm} className={Style.formBG}>
        <div>
          <dialog className={Style.dialog}>
            <p>Edit exercise</p>
            <button type="button" onClick={handleShowForm}>Close</button>
            <div hidden={showError.value} className={Style.error}>
              <p>{showError.error}</p>
            </div>
            <form onSubmit={handleSubmit} className={Style.form}>
              <label htmlFor="name">Exercise:
                <input type="text" name="name" id="name" placeholder="Name" onChange={handleChange} value={editedExercise.name} />
              </label>
              <label htmlFor="weight">Weight:
                <input type="number" name="weight" id="weight" placeholder="Weight" onChange={handleChange} value={editedExercise.weight} />
              </label>
              <button type="submit">Save</button>
            </form>
          </dialog>
        </div>
      </div>

      <div hidden={showDelete} className={Style.formBG}>
        <div>
          <dialog className={Style.dialog}>
            <form className={Style.form}>
              <p>Are you sure you want to delete this exercise?</p>
              <div className={Style.formDelete}>
                <button type="button" onClick={handleDelete}>Yes</button>
                <button type="button" onClick={() => setShowDelete(true)}>No</button>
              </div>
            </form>
          </dialog>
        </div>
      </div>
    </>
  )
}