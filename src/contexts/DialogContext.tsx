import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Dialog, type DialogAction } from '@/components/common/Dialog'

interface DialogOptions {
  title: string
  message: string
  actions?: DialogAction[]
}

interface DialogContextValue {
  showDialog: (options: DialogOptions) => void
  confirm: (title: string, message: string) => Promise<boolean>
  alert: (title: string, message: string) => Promise<void>
}

const DialogContext = createContext<DialogContextValue | null>(null)

interface DialogProviderProps {
  children: ReactNode
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialog, setDialog] = useState<(DialogOptions & { resolve?: (value: boolean) => void }) | null>(null)

  const closeDialog = useCallback(() => {
    setDialog(null)
  }, [])

  const showDialog = useCallback((options: DialogOptions) => {
    setDialog(options)
  }, [])

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        resolve,
        actions: [
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => {
              resolve(false)
              closeDialog()
            },
          },
          {
            label: 'Confirm',
            variant: 'danger',
            onClick: () => {
              resolve(true)
              closeDialog()
            },
          },
        ],
      })
    })
  }, [closeDialog])

  const alert = useCallback((title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        actions: [
          {
            label: 'OK',
            variant: 'primary',
            onClick: () => {
              resolve()
              closeDialog()
            },
          },
        ],
      })
    })
  }, [closeDialog])

  const handleClose = useCallback(() => {
    if (dialog?.resolve) {
      dialog.resolve(false)
    }
    closeDialog()
  }, [dialog, closeDialog])

  return (
    <DialogContext.Provider value={{ showDialog, confirm, alert }}>
      {children}
      {dialog && dialog.actions && (
        <Dialog
          title={dialog.title}
          message={dialog.message}
          actions={dialog.actions}
          onClose={handleClose}
        />
      )}
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return context
}
