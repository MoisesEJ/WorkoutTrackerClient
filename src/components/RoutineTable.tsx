import ExerciseDisplay from './ExerciseDisplay'
import ApiServer from '../services/accessServer'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import Style from '@styles/Routine.module.css'

interface Exercise {
  id: number
  name: string
  weight: number
}

interface Day {
  name: string
  exercises: Exercise[]
}

interface Routine {
  id: number
  name: string
  days: Day[]
}

interface Days {
  name: string,
  exercises: number[]
}

export default function RoutineTable({ routineData, exercisesData }: { routineData: Routine; exercisesData: Exercise[] }) {
  const [routine] = useState(routineData)
  const [exercises] = useState(exercisesData)
  const [routineEditName, setRoutineEditName] = useState(routineData.name)
  const [isShowDelete, setIsShowDelete] = useState(true)
  const [isShowForm, setIsShowForm] = useState(true)
  const [modeExerciseForm, setModeExerciseForm] = useState('')
  const [showError, setShowError] = useState({ value: true, error: '' })
  const [selected, setSelected] = useState<Days[]>([])


  const navigate = useNavigate()
  const daysOfWeek = [{
    id: 'monday',
    name: 'Mon'
  }, {
    id: 'tuesday',
    name: 'Tue'
  }, {
    id: 'wednesday',
    name: 'Wed'
  }, {
    id: 'thursday',
    name: 'Thu'
  }, {
    id: 'friday',
    name: 'Fri'
  }, {
    id: 'saturday',
    name: 'Sat'
  }, {
    id: 'sunday',
    name: 'Sun'
  }]

  const handleShowFormAdd = () => {
    setIsShowForm(false)
    setModeExerciseForm('Add')
    setSelected(routine.days.map((day) => ({
      name: day.name,
      exercises: day.exercises.flatMap(e => e.id)
    })))
  }

  const handleShowFormEdit = () => {
    setIsShowForm(false)
    setModeExerciseForm('Edit')
    setSelected(routine.days.map((day) => ({
      name: day.name,
      exercises: day.exercises.flatMap(e => e.id)
    })))
  }

  const handleCancelForm = () => {
    setIsShowForm(true)
    setShowError({value: true, error: ''})
  }

  const handleDelete = async () => {
    try {
      const res = await ApiServer.deleteRoutine(routine)
      if (!res.success) {
        return
      }
      navigate(0)
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  const handleEditRoutine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!routineEditName.trim()) {
      setShowError({value: false, error: 'Routine name cannot be empty'})
      return
    }

    const updatedRoutine = {
      id: routine.id,
      name: routineEditName.trim(),
      days: selected.filter(d => d.exercises.length > 0)
    }

    const res = await ApiServer.updateRoutine(updatedRoutine)
    if (!res.success) {
      return setShowError({
        value: false,
        error: res.message
      })
    }
    navigate(0)
  }

  const toggleCheckbox = (prev: Days[], dayId: string, exerciseId: number): Days[] => {
    const dayIndex = prev.findIndex(d => d.name === dayId)

    if (dayIndex !== -1) {
      const day = prev[dayIndex];
      const exerciseExists = day.exercises.includes(exerciseId);
      const updatedExercises = exerciseExists
        ? day.exercises.filter(e => e !== exerciseId)
        : [...day.exercises, exerciseId];
        console.log(updatedExercises)
      return prev.map(d => 
        d.name === dayId ? {...d, exercises: updatedExercises} : d
      )
    } else {
      return [...prev, {name: dayId, exercises: [exerciseId]}]
    }
  }

  return (
    <div>
      <div className={Style.routine}>
        <div className={Style.title}>
          <h3>{routine.name}</h3>
          <div className={Style.titleDelete}>
            <button type="button" onClick={handleShowFormEdit}>Edit</button>
            <button type="button" onClick={() => setIsShowDelete(false)}>Delete</button>
          </div>
        </div>
        <table className={Style.routineTable}>
          <thead>
            <tr>
              {daysOfWeek.map((day) => (
                <th key={day.id}>{day.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {routine.days && routine.days.length > 0 ? (
                daysOfWeek.map((day) => (
                  <td key={day.id}>
                    <div>
                      {routine.days.find((d) => d.name === day.id)?.exercises.map((exercise: Exercise) => (
                        <ExerciseDisplay key={exercise.id} exercise={exercise} />
                      )) ?? null}
                    </div>
                  </td>
                ))
              ) : (
                <td colSpan={7} className={Style.noExercise}>
                  <p>No exercises added to this routine yet.</p>
                  <button type="button" onClick={handleShowFormAdd}>Add Exercise</button>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      <div hidden={isShowDelete} className={Style.formBG}>
        <div>
          <div className={Style.dialog}>
            <form className={Style.form}>
              <p>Are you sure you want to delete this routine: <span>{routine.name}</span>?</p>
              <div className={Style.formDelete}>
                <button type="button" onClick={handleDelete}>Yes</button>
                <button type="button" onClick={() => setIsShowDelete(true)}>No</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div hidden={isShowForm} className={Style.formBG}>
        <div>
          <dialog className={Style.dialog}>
            <p>{modeExerciseForm} exercise</p>
            <button type="button" onClick={handleCancelForm}>Close</button>
            <div hidden={showError.value} className={Style.error}>
              <p>{showError.error}</p>
            </div>
            <form onSubmit={handleEditRoutine} className={Style.form}>
              <label htmlFor="name">Routine Name:
                <input
                  type="text"
                  id="name"
                  name="name"
                  disabled={modeExerciseForm === 'Edit' ? false : true}
                  value={routineEditName}
                  onChange={(e) => setRoutineEditName(e.target.value)}
                />
              </label>
              <table className={Style.table}>
                <thead>
                  <tr>
                    {daysOfWeek.map((day) => (
                      <th key={day.id}>{day.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {daysOfWeek.map((day) => (
                      <td key={day.id}>
                        <div>
                          {exercises.map((exercise) => (
                            <div key={exercise.id} className={Style.exercise}>
                              <input
                                type="checkbox"
                                id={`${routine.id}-${day.id}-${exercise.id}`}
                                name={`${routine.id}-${day.id}-${exercise.id}`}
                                value={exercise.id}
                                checked={selected.some(d =>
                                  d.name === day.id && d.exercises.some(e => e === exercise.id)
                                )}
                                onChange={() => setSelected(prev => toggleCheckbox(prev, day.id, exercise.id))}
                              />
                              <label htmlFor={`${routine.id}-${day.id}-${exercise.id}`}>
                                <div>
                                  <p>{exercise.name}</p>
                                  <p>{exercise.weight} lbs</p>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div>
                <button type="submit">Save</button>
                <button type="button" onClick={handleCancelForm}>Cancel</button>
              </div>
            </form>
          </dialog>
        </div>
      </div>
    </div>
  )
}