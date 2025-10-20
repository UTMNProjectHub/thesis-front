export interface Subject {
  id: number
  name: string
  shortName: string
  description: string
}

export interface Theme {
  id: number
  name: string
  description: string
  subjectId: number
}
