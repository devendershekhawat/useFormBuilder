import { DefaultValues, UseFormBuilderInput, FormConfig } from './types'
import { useState, useCallback, ReactNode } from 'react'

/**
/**
 * Form rendering utility inspired by react-hook-form's developer experience.
 * 
 * This hook implementation draws inspiration from react-hook-form's API design philosophy
 * while adding a built-in render method to simplify form creation. The integrated render
 * method handles common form layout patterns, error state management, and submission
 * handling out of the box.
 * 
 * Key differences/features:
 * - Built-in render prop pattern for rapid form development
 * - Simplified grid layout configuration
 * - Automatic error message placement
 * - Submission state management integrated with render output
 * 
 * While less flexible than fully headless solutions, this approach reduces boilerplate
 * for common form patterns and enforces consistent form styling across the application.
 * 
 */
function renderForm({
  handleSubmit,
  isSubmitting,
  isDirty,
  errors,
  config = {},
}: {
  handleSubmit: () => Promise<void>
  isSubmitting: boolean
  isDirty: boolean
  errors: Record<string, string | undefined>
  config: FormConfig
}) {
  const {
    submitText = 'Submit',
    grid = { columns: 1 },
    className = '',
    children,
  } = config

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
        gap: grid.gap || '1rem',
      }}
    >
      {children}

      <div
        style={{
          gridColumn: grid.columns > 1 ? `span ${grid.columns}` : 'auto',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="submit"
          disabled={
            isSubmitting || (!isDirty && Object.keys(errors).length > 0)
          }
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
      </div>
    </form>
  )
}

export function useFormBuilder<T extends DefaultValues>(
  input: UseFormBuilderInput<T>,
) {
  const { defaultValues, validationSchema, onSubmit } = input
  const [values, setValues] = useState<T>(defaultValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      setIsDirty(true)

      // Validate field if schema exists
      if (validationSchema) {
        try {
          validationSchema.parse({ [field]: value })
          setErrors((prev) => ({ ...prev, [field]: undefined }))
        } catch (error) {
          if (error instanceof Error) {
            setErrors((prev) => ({ ...prev, [field]: error.message }))
          }
        }
      }
    },
    [validationSchema],
  )

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)

    // Validate all fields if schema exists
    if (validationSchema) {
      try {
        validationSchema.parse(values)
        setErrors({})
      } catch (error) {
        // Assuming the validation error has a specific shape
        if (error && typeof error === 'object' && 'errors' in error) {
          const validationError = error as {
            errors: Array<{ path: string[]; message: string }>
          }
          setErrors(
            validationError.errors.reduce(
              (acc, curr) => ({
                ...acc,
                [curr.path[0]]: curr.message,
              }),
              {},
            ),
          )
        }
        setIsSubmitting(false)
        return
      }
    }

    if (onSubmit) {
      await onSubmit(values)
    }
    setIsSubmitting(false)
  }, [values, validationSchema, onSubmit])

  const reset = useCallback(() => {
    setValues(defaultValues)
    setErrors({})
    setIsDirty(false)
  }, [defaultValues])

  const render = useCallback(
    (config: FormConfig = {}) => {
      return renderForm({
        handleSubmit,
        isSubmitting,
        isDirty,
        errors,
        config,
      })
    },
    [handleSubmit, isSubmitting, isDirty, errors],
  )

  return {
    values,
    setValue,
    errors,
    isDirty,
    isSubmitting,
    handleSubmit,
    reset,
    render,
  }
}
