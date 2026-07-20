// Autor: Mohamad Haj Ahmad und Wajdy Eleyan
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-white border border-gray-200 shadow-lg rounded-xl text-gray-900',
          description: 'text-gray-500',
          actionButton: 'bg-primary text-white',
          cancelButton: 'bg-gray-100 text-gray-700',
          success: 'border-l-4 border-l-success',
          error: 'border-l-4 border-l-red-500',
          info: 'border-l-4 border-l-primary',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
