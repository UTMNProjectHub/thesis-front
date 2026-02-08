import { useParams } from '@tanstack/react-router'
import QuizResultsTable from '@/components/widgets/QuizResultsTable/QuizResultsTable'

function QuizResultsTeacher() {
  const { id: quizId } = useParams({ strict: false })

  return (
    <div className="px-8 py-2">
      <QuizResultsTable quizId={quizId as string} />
    </div>
  )
}

export default QuizResultsTeacher
