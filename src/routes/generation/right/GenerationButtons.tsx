import { Button } from "@/components/ui/button"

function GenerationButtons() {
  return (
    <div className="flex gap-2">
      <Button variant={"outline"}>Сгенерировать конспект</Button>
      <Button variant={"outline"}>Сгенерировать квиз</Button>
    </div>
  )
}

export default GenerationButtons