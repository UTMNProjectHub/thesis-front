export interface Subject {
  id: number
  name: string
  shortName: string
  description: string
  yearStart: number
  yearEnd: number
}

export interface Theme {
  id: number
  name: string
  description: string
  subjectId: number
}

export interface SubjectFile {
  id: string
  name: string
  s3Index: string
  userId: string | null
}
