import { useEffect, useState } from 'react'
import ApiServer from '../services/accessServer'
import RoutineTable from '../components/RoutineTable'
import ExerciseList from '../components/ExerciseList'
import { useNavigate } from 'react-router-dom'
import Exercise from '../components/ExerciseList'
import Style from '@styles/User.module.css'

interface Exercise {
  id: number,
  name: string,
  weight: number
}

interface Days {
  id: number,
  name: string,
  exercises: Exercise[]
}

interface Routine {
  id: number,
  name: string,
  days: Days[]
}

export default function User() {
  const [formDataRoutine, setFormDataRoutine] = useState({ name: '' })
  const [formDataExercise, setFormDataExercise] = useState({ name: '', weight: 0 })

  const [routineData, setRoutineData] = useState(Object)
  const [exerciseData, setExerciseData] = useState(Object)

  const [isShowExercises, setIsShowExercises] = useState(true)
  const [isShowRoutines, setIsShowRoutines] = useState(true)

  const [isShowCreateRoutine, setIsShowCreateRoutine] = useState(true)
  const [isShowCreateExercise, setIsShowCreateExercise] = useState(true)

  const [showError, setShowError] = useState({ value: true, error: '' })

  const navigate = useNavigate()

  const handleSubmitRoutineCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (!formDataRoutine.name || formDataRoutine.name.length === 0) {
        return setShowError({ value: false, error: 'Routine name cannot be empty' })
      }
      if (formDataRoutine.name.length < 4) {
        return setShowError({ value: false, error: 'The routine name must be at least 4 characters long' })
      }
      const res = await ApiServer.createRoutine(formDataRoutine.name)
      if (!res.success) {
        console.error('Error creating routine: ', res.error)
        return setShowError({
          value: false,
          error: res.message
        })
      }
      setIsShowCreateRoutine(true)
      navigate(0)
    } catch (error) {
      console.error('Error creating routine: ', error)
    }
  }

  const handleSubmitExercise = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      formDataExercise.weight = Number(formDataExercise.weight)
      if (!formDataExercise.name || !formDataExercise.weight || formDataExercise.name.length === 0) {
        return setShowError({ value: false, error: 'Please fill in all fields' })
      }
      if (formDataExercise.weight <= 0) {
        return setShowError({ value: false, error: 'The weight of exercise cannot be less than 0' })
      }
      if (formDataExercise.name.length < 4) {
        return setShowError({ value: false, error: 'The exercise name must be at least 4 characters long' })
      }
      const res = await ApiServer.createExercise(formDataExercise)
      if (!res.success) {
        console.error('Error creating exercise: ', res.error)
        return
      }
      setIsShowCreateExercise(true)
      navigate(0)
    } catch (error) {
      console.error('Error creating exercise: ', error)
    }
  }

  const handleChangeRoutineName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormDataRoutine(prev => ({ ...prev, [name]: value }))
  }

  const handleChangeExercise = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormDataExercise(prev => ({ ...prev, [name]: value }))
  }

  const handleCancelRoutine = () => {
    setIsShowCreateRoutine(true)
    setFormDataRoutine({ name: '' })
    setShowError({ value: true, error: '' })
  }

  const handleCancelExercise = () => {
    setIsShowCreateExercise(true)
    setFormDataExercise({ name: '', weight: 0 })
    setShowError({ value: true, error: '' })
  }

  useEffect(() => {
    async function getData() {
      try {
        const resRoutine = await ApiServer.getRoutine()
        const resExercise = await ApiServer.getExercise()
        if (resRoutine.success) {
          setRoutineData(resRoutine)
        }
        if (resExercise.success) {
          setExerciseData(resExercise)
        }
      } catch (error) {
        console.error('Error getting routine data: ', error)
        return
      }
    }
    getData()
  }, [])

  return (
    <>
      <div>
        <aside>
          <ul className={Style.menu}>
            <li>
              <div className={Style.title}>
                <p>Routines</p>
                <button type='button' onClick={() => setIsShowCreateRoutine(false)}>Add</button>
                <button type='button' onClick={() => setIsShowRoutines(!isShowRoutines)}>{isShowRoutines ? 'Hide' : 'Show'}</button>
              </div>
              <ul>
                {isShowRoutines && routineData.success && routineData.routines.map((routine: Routine) => (
                  <li key={routine.id}>{routine.name}</li>
                ))}
              </ul>
            </li>
            <li>
              <div className={Style.title}>
                <p>Exercises</p>
                <button type='button' onClick={() => setIsShowCreateExercise(false)}>Add</button>
                <button type='button' onClick={() => setIsShowExercises(!isShowExercises)}>{isShowExercises ? 'Hide' : 'Show'}</button>
              </div>
              <ul>
                {isShowExercises && exerciseData.success && exerciseData.exercises.map((exercise: Exercise) => (
                  <li key={exercise.id}><ExerciseList exercise={exercise} /></li>
                ))}
              </ul>
            </li>
          </ul>
        </aside>
        <div className={Style.main}>
          <div className={Style.headerRoutine}>
            <h2>Routines</h2>
            <button type='button' onClick={() => setIsShowCreateExercise(false)}>Add Routine</button>
          </div>
          {routineData.success && routineData.routines.map((routine: Routine, id: number) => (
            <RoutineTable key={id} routineData={routine} exercisesData={exerciseData.exercises} />
          ))}
        </div>
      </div>

      <div hidden={isShowCreateRoutine} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <p>Add new routine</p>
            <button type='button' onClick={handleCancelRoutine}>Close</button>
            <div hidden={showError.value} className={Style.error}>
              <p>{showError.error}</p>
            </div>
            <form onSubmit={handleSubmitRoutineCreate} className={Style.form}>
              <label htmlFor="name">Routine:
                <input type='text' name='name' placeholder='Routine name' value={formDataRoutine.name} onChange={handleChangeRoutineName} />
              </label>
              <button type='submit'>Create</button>
            </form>
          </div>
        </div>
      </div>

      <div hidden={isShowCreateExercise} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <p>Add new exercise</p>
            <button type='button' onClick={handleCancelExercise}>Close</button>
            <div hidden={showError.value} className={Style.error}>
              <p>{showError.error}</p>
            </div>
            <form onSubmit={handleSubmitExercise} className={Style.form}>
              <label htmlFor="name">Exercise:
                <input type='text' name='name' placeholder='Exercise name' value={formDataExercise.name} onChange={handleChangeExercise} />
              </label>
              <label htmlFor="weight">Weight (lbs):
                <input type='number' name='weight' placeholder='Weight (lbs)' value={formDataExercise.weight} onChange={handleChangeExercise} />
              </label>
              <button type='submit'>Create</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}