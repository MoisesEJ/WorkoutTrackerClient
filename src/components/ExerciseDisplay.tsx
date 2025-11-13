import Style from '@styles/ExerciseDisplay.module.css'

interface Exercise {
  id: number
  name: string
  weight: number
}

export default function ExerciseDisplay({ exercise }: { exercise: Exercise }) {
  return (
    <div className={Style.exercise}>
      <p>{exercise.name}</p>
      <p>{exercise.weight} lbs</p>
    </div>
  )
}