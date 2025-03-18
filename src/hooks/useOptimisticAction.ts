import { useState, useCallback, useTransition, use } from "react";

export function useOptimistic<T>(initialState: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialState);
  const [, startTransition] = useTransition();

  const setOptimisticState = useCallback(
    (value: T) => {
      startTransition(() => {
        setState(value);
      });
    },
    [startTransition]
  );

  return [state, setOptimisticState];
}

export function useActionState<T, E = Error>(
  action: (prevState: T | null) => Promise<E | null>,
  initialState: T | null = null
): [E | null, () => void, boolean] {
  const [promise, setPromise] = useState<Promise<E | null> | null>(null);
  const [isPending, startTransition] = useTransition();
  const error = promise ? use(promise) : null;

  const executeAction = useCallback(() => {
    startTransition(() => {
      setPromise(action(initialState));
    });
  }, [action, initialState]);

  return [error, executeAction, isPending];
}
