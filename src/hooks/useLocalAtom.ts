import { atom, useAtom } from 'jotai'
import { useMemo, type DependencyList } from 'react'

export function useLocalAtom<T>(createInitialValue: () => T, deps: DependencyList) {
  // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  const localAtom = useMemo(() => atom(createInitialValue()), deps)
  return useAtom(localAtom)
}
