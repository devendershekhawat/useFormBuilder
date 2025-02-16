import { ReactNode } from 'react'

export interface UseFormBuilderInput<T extends DefaultValues> {
  defaultValues: T
  validationSchema?: {
    parse: (values: any) => any
  }
  onSubmit?: (data: T) => Promise<void> | void
}

export type DefaultValues = Record<string, any>

type SubmitHandler<T extends DefaultValues> = (data: T) => void

// Define basic field types
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'checkbox'
  | 'radio'

// Field validation rules
export type ValidationRule = {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

// Field configuration
export type FieldConfig = {
  type: FieldType
  label: string
  placeholder?: string
  validation?: ValidationRule
  options?: { label: string; value: any }[] // For select, radio, etc.
}

// Schema definition
export type Schema<T extends DefaultValues> = {
  [K in keyof T]: FieldConfig
}

// Form errors type
export type FormErrors<T extends DefaultValues> = {
  [K in keyof T]?: string
}

// Extend UseFormBuilderOutput
export type UseFormBuilderOutput<T extends DefaultValues> = {
  validateForm: (submitHandler: SubmitHandler<T>) => void
  schema: Schema<T>
  errors: FormErrors<T>
  setFieldValue: (field: keyof T, value: any) => void
  getFieldValue: (field: keyof T) => any
  reset: () => void
  isDirty: boolean
  isValid: boolean
}

export interface FormConfig {
  submitText?: string
  grid?: {
    columns: number
    gap?: string
  }
  className?: string
  children?: ReactNode
}
