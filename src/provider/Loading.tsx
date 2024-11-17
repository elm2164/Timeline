import React, { createContext, useCallback, useState } from "react"
import { Backdrop, CircularProgress } from "@mui/material"

export const LoadingContext = createContext({
  open: () => {},
  close: () => {},
  loading: false,
})

const Loading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])
  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        open: handleOpen,
        close: handleClose,
        loading: open,
      }}
    >
      {open && (
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={open}
          // onClick={handleClose}
        >
          <CircularProgress color="inherit" />
          <div style={{ marginLeft: 10 }}>loading...</div>
        </Backdrop>
      )}
      {children}
    </LoadingContext.Provider>
  )
}

export default Loading
