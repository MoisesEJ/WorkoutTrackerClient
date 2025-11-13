


const apiUrl = import.meta.env.VITE_API_URL;

interface Days {
  name: string
  exercises: number[]
}

async function createUser(user: string, email: string, password: string) {
  const res = await fetch(`${apiUrl}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      username: user,
      email: email,
      password: password,
    })
  })

  const data = await res.json()
  return data
}

async function loginWithUser(user: string, pass: string) {
  const res = await fetch(`${apiUrl}/login/user`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user, password: pass })
  })

  const data = await res.json()
  return data
}

async function loginWithEmail(email: string, pass: string) {
  const res = await fetch(`${apiUrl}/login/email`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, password: pass })
  })

  const data = await res.json()
  return data
}

async function logout() {
  try {
    const res = await fetch(`${apiUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    const data = await res.json()
    return data
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at logout'
    })
  }
}

async function verifyUser() {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      method: 'GET',
      credentials: 'include',
    })

    const data = await res.json()
    return data
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at verify user token'
    })
  }
}

async function changeUsername(username: string, password: string) {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
    })
    const data = await res.json()
    return data
  } catch {
    return ({
      success: false,
      message: 'Error fetch username confirm'
    })
  }
}

async function changePassword(password: string) {
  try {
    const res = await fetch(`${apiUrl}/pass`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({newpassword: password})
    })
    const data = await res.json()
    return data
  } catch {
    return ({
      success: false,
      message: 'Error fetch password confirm'
    })
  }
}

async function changeAvatar(avatar: string) {
  try {
    const res = await fetch(`${apiUrl}/photo`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({avatar: avatar})
    })
    const data = await res.json()
    return data
  } catch {
    return {
      success: false,
      message: 'Error at updated avatar'
    }
  }
}

async function deleteUser(password: string) {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({password: password})
    })
    const data = await res.json()
    return data
  } catch {
    return ({
      success: false,
      message: 'Error fetch user delete'
    })
  }
}


async function createRoutine(name: string) {
  try {
    const res = await fetch(`${apiUrl}/routines`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ routine: {name: name} })
    })

    const data = await res.json()
    return data
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at create routine'
    })
  }
}

async function getRoutine() {
  try {
    const routinesFetch = await fetch(`${apiUrl}/routines`, {
      method: 'GET',
      credentials: 'include',
    })
    const exercisesFetch = await fetch(`${apiUrl}/exercises`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!routinesFetch.ok || !exercisesFetch.ok)  {
      return {
        success: false,
        message: 'Error fetching routine data'
      }
    }
    const routinesData = await routinesFetch.json()
    const exercisesData = await exercisesFetch.json()

    const routines = []

    for await (const routine of routinesData.routines) {
      const daysFetch = await fetch(`${apiUrl}/days?routine=${routine.id}`, {
        method: 'GET',
        credentials: 'include',
      })
      const ExerciseByDay = []
      const daysData = await daysFetch.json()
      if (daysFetch.ok && daysData.success) {
        for await (const day of daysData.days) {
          const exercisesInDay = day.exercises.map((exercisesDay: number) => {
            return exercisesData.exercises.find((exercise: { id: number }) => exercise.id === exercisesDay)
          })
          ExerciseByDay.push({
            name: day.name,
            exercises: exercisesInDay
          })
        }
      }
      routines.push({
        ...routine,
        days: ExerciseByDay
      })
    }
    return {
      success: true,
      message: 'Routine data fetched successfully',
      routines: routines
    }
  } catch (error) {
    console.error('Error fetching routine: ', error)
    return {
      success: false,
      message: 'Error fetching routine data',
    }
  }
}

async function updateRoutine(routine: {id: number, name: string, days: Days[]}) {
  const routineReq = {
    routine: {
      id: routine.id,
      name: routine.name
    },
    days: routine.days.map((day: {name: string, exercises: number[]}) => ({
      name: day.name,
      exercises: day.exercises
    }))
  }

  try {
    const routineUpdate = await fetch(`${apiUrl}/routines`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ routine: routineReq.routine })
    })

    const dayUpdate = await fetch(`${apiUrl}/days`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ routine: {id: routine.id, days: routineReq.days} })
    })

    if (!dayUpdate.ok) {
      const errText = await dayUpdate.text().catch(() => '')
      return {
        success: false,
        message: `Error updating day: ${errText}`
      }
    }

    const dayData = await dayUpdate.json()
    if (!dayData.success) {
      return {
        success: false,
        message: `Error updating day: ${dayData.message}`
      }
    }

    if (!routineUpdate.ok) {
      const errText = await routineUpdate.text().catch(() => '')
      return {
        success: false,
        message: `Error updating routine (${routineUpdate.status}): ${errText}`
      }
    }

    const routineData = await routineUpdate.json()

    if (!routineData.success) {
      return {
        success: false,
        message: 'Error updating routine data'
      }
    }

    return {
      success: true,
      message: 'Routine updated successfully',
    }
  } catch (error) {
    console.error('Error at updateRoutine:', error)
    return {
      success: false,
      message: 'Error at update routine'
    }
  }
}

async function deleteRoutine(routine: object) {
  try {
    const res = await fetch(`${apiUrl}/routines`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ routine: routine})
    })
    const data = await res.json()
    return data
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at delete routine'
    })
  }
}


async function createExercise(exercise: object) {
  try {
    const res = await fetch(`${apiUrl}/exercises`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ exercise: exercise })
    })
    const createdExercise = await res.json()
    return createdExercise
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at create exercise'
    })
  }
}

async function getExercise() {
  try {
    const res = await fetch(`${apiUrl}/exercises`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!res.ok) {
      return {
        success: false,
        message: 'Error fetching exercise data'
      }
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error getting user data: ', error)
    return {
      success: false,
      message: 'Error getting user data'
    }
  }
}

async function updateExercise(exercise: object) {
  try {
    const res = await fetch(`${apiUrl}/exercises`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ exercise: exercise })
    })
    const data = await res.json()
    return data
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at update exercise'
    })
  }
}

async function deleteExercise(exercise: object) {
  try {
    const res = await fetch(`${apiUrl}/exercises`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ exercise: exercise })
    })
    const data = await res.json()
    return data
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Error at delete exercise'
    })
  }
}


export default {
  createUser,
  loginWithUser,
  loginWithEmail,
  logout,
  verifyUser,
  changeUsername,
  changePassword,
  changeAvatar,
  deleteUser,
  createRoutine,
  getRoutine,
  updateRoutine,
  deleteRoutine,
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise
}