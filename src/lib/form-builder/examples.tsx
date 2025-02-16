'use client'

import { useFormBuilder } from './useFormBuilder'
import { useState } from 'react'

// Basic Contact Form
function ContactForm() {
  const form = useFormBuilder({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
    validationSchema: {
      parse: (values) => {
        const errors: Record<string, string> = {}
        if (!values.name) errors.name = 'Name is required'
        if (!values.email) errors.email = 'Email is required'
        if (!values.message) errors.message = 'Message is required'
        if (Object.keys(errors).length)
          throw {
            errors: Object.entries(errors).map(([path, message]) => ({
              path: [path],
              message,
            })),
          }
        return values
      },
    },
    onSubmit: async (data) => {
      console.log('Contact Form Submit:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    },
  })

  return form.render({
    submitText: 'Send Message',
    grid: { columns: 2, gap: '1rem' },
    children: (
      <>
        <div>
          <label>Name</label>
          <input
            value={form.values.name}
            onChange={(e) => form.setValue('name', e.target.value)}
            className={form.errors.name ? 'error' : ''}
          />
          {form.errors.name && (
            <span className="error-text">{form.errors.name}</span>
          )}
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.values.email}
            onChange={(e) => form.setValue('email', e.target.value)}
            className={form.errors.email ? 'error' : ''}
          />
          {form.errors.email && (
            <span className="error-text">{form.errors.email}</span>
          )}
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label>Message</label>
          <textarea
            value={form.values.message}
            onChange={(e) => form.setValue('message', e.target.value)}
            className={form.errors.message ? 'error' : ''}
            rows={4}
          />
          {form.errors.message && (
            <span className="error-text">{form.errors.message}</span>
          )}
        </div>
      </>
    ),
  })
}

// Multi-step Registration Form
function RegistrationForm() {
  const [step, setStep] = useState(1)

  const form = useFormBuilder({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      address: '',
      phone: '',
    },
    validationSchema: {
      parse: (values) => {
        const errors: Record<string, string> = {}

        // Step 1 validations
        if (step === 1) {
          if (!values.username) errors.username = 'Username is required'
          if (!values.password) errors.password = 'Password is required'
          if (values.password !== values.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
          }
        }

        // Step 2 validations
        if (step === 2) {
          if (!values.firstName) errors.firstName = 'First name is required'
          if (!values.lastName) errors.lastName = 'Last name is required'
          if (!values.phone) errors.phone = 'Phone is required'
        }

        if (Object.keys(errors).length)
          throw {
            errors: Object.entries(errors).map(([path, message]) => ({
              path: [path],
              message,
            })),
          }
        return values
      },
    },
    onSubmit: async (data) => {
      if (step === 1) {
        setStep(2)
        return
      }
      console.log('Registration Complete:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    },
  })

  return form.render({
    submitText: step === 1 ? 'Next' : 'Complete Registration',
    grid: { columns: 2, gap: '1rem' },
    children: (
      <>
        {step === 1 ? (
          // Step 1: Account Details
          <>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Username</label>
              <input
                value={form.values.username}
                onChange={(e) => form.setValue('username', e.target.value)}
                className={form.errors.username ? 'error' : ''}
              />
              {form.errors.username && (
                <span className="error-text">{form.errors.username}</span>
              )}
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={form.values.password}
                onChange={(e) => form.setValue('password', e.target.value)}
                className={form.errors.password ? 'error' : ''}
              />
              {form.errors.password && (
                <span className="error-text">{form.errors.password}</span>
              )}
            </div>
            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.values.confirmPassword}
                onChange={(e) =>
                  form.setValue('confirmPassword', e.target.value)
                }
                className={form.errors.confirmPassword ? 'error' : ''}
              />
              {form.errors.confirmPassword && (
                <span className="error-text">
                  {form.errors.confirmPassword}
                </span>
              )}
            </div>
          </>
        ) : (
          // Step 2: Personal Details
          <>
            <div>
              <label>First Name</label>
              <input
                value={form.values.firstName}
                onChange={(e) => form.setValue('firstName', e.target.value)}
                className={form.errors.firstName ? 'error' : ''}
              />
              {form.errors.firstName && (
                <span className="error-text">{form.errors.firstName}</span>
              )}
            </div>
            <div>
              <label>Last Name</label>
              <input
                value={form.values.lastName}
                onChange={(e) => form.setValue('lastName', e.target.value)}
                className={form.errors.lastName ? 'error' : ''}
              />
              {form.errors.lastName && (
                <span className="error-text">{form.errors.lastName}</span>
              )}
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Address</label>
              <input
                value={form.values.address}
                onChange={(e) => form.setValue('address', e.target.value)}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Phone</label>
              <input
                value={form.values.phone}
                onChange={(e) => form.setValue('phone', e.target.value)}
                className={form.errors.phone ? 'error' : ''}
              />
              {form.errors.phone && (
                <span className="error-text">{form.errors.phone}</span>
              )}
            </div>
          </>
        )}
      </>
    ),
  })
}

// Example usage component
export function FormExamples() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2>Contact Form</h2>
      <ContactForm />

      <h2 style={{ marginTop: '3rem' }}>Multi-step Registration</h2>
      <RegistrationForm />

      <h2 style={{ marginTop: '3rem' }}>Product Review Form</h2>
      <ProductReviewForm />

      <style>{`
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        input, textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        input.error, textarea.error {
          border-color: red;
        }
        
        .error-text {
          color: red;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }
        
        button {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #ccc;
        }
      `}</style>
    </div>
  )
}

function ProductReviewForm() {
  const form = useFormBuilder({
    defaultValues: {
      title: '',
      rating: 0,
      comment: '',
    },
    validationSchema: {
      parse: (values) => {
        const errors: Record<string, string> = {}

        if (!values.title) {
          errors.title = 'Title is required'
        } else if (values.title.length < 5) {
          errors.title = 'Title must be at least 5 characters'
        }

        if (!values.rating) {
          errors.rating = 'Rating is required'
        } else if (isNaN(values.rating)) {
          errors.rating = 'Must be a number'
        } else if (values.rating < 1 || values.rating > 5) {
          errors.rating = 'Rating must be between 1 and 5'
        }

        if (Object.keys(errors).length) {
          throw {
            errors: Object.entries(errors).map(([path, message]) => ({
              path: [path],
              message,
            })),
          }
        }
        return values
      },
    },
    onSubmit: async (data) => {
      console.log('Product Review Submit:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    },
  })

  return form.render({
    submitText: 'Submit Review',
    grid: { columns: 1, gap: '1rem' },
    children: (
      <>
        <div>
          <label>Review Title</label>
          <input
            value={form.values.title}
            onChange={(e) => form.setValue('title', e.target.value)}
            className={form.errors.title ? 'error' : ''}
          />
          {form.errors.title && (
            <span className="error-text">{form.errors.title}</span>
          )}
        </div>

        <div>
          <label>Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={form.values.rating}
            onChange={(e) => form.setValue('rating', parseInt(e.target.value))}
            className={form.errors.rating ? 'error' : ''}
          />
          {form.errors.rating && (
            <span className="error-text">{form.errors.rating}</span>
          )}
        </div>

        <div>
          <label>Comment (optional)</label>
          <textarea
            value={form.values.comment}
            onChange={(e) => form.setValue('comment', e.target.value)}
            rows={4}
          />
        </div>
      </>
    ),
  })
}
