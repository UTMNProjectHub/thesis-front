import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IErrorProps {
    code?: number
    error?: string
}

function Error({ error, code }: IErrorProps) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="text-center">
        <CardHeader>
            <CardTitle className="text-4xl font-bold text-red-500">
                {code || 500}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-xl">
                {error || 'Внутренняя ошибка сервера'}
            </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Error