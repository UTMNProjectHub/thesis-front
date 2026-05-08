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

export interface SubjectFile {
  id: string
  name: string
  s3Index: string
  userId: string | null
}
