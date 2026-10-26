import { useEffect, useState } from 'react'
import { storage } from '../lib/storage'

/** useState that is saved to localStorage under `nexora:<key>`. */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() =>
    storage.get(key, typeof initial === 'function' ? initial() : initial),
  )
  useEffect(() => {
    storage.set(key, value)
  }, [key, value])
  return [value, setValue]
}
