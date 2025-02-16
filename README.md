### useFormBuilder hook

This is a custom hook that provides a simple way to create forms in React. It is inspired by the react-hook-form library, but it is not a direct replacement.

The hook can be found in the `src/lib/form-builder/useFormBuilder.tsx` file.

To use the hook, you can import it like this:

```tsx
import { useFormBuilder } from '@/lib/form-builder/useFormBuilder'
```

And use it to build a form like this:

```tsx
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
      }
      if (!values.rating) {
        errors.rating = 'Rating is required'
      }
      if (!values.comment) {
        errors.comment = 'Comment is required'
      }
      return errors
    },
  },
  onSubmit: (values) => {
    console.log(values)
  },
})

return form.render({
  submitText: 'Submit Review',
  grid: { columns: 1, gap: '1rem' },
})
```
