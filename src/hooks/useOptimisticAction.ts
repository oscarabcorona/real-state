import { useState, useCallback, useTransition } from "react";

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
  const [error, setError] = useState<E | null>(null);
  const [isPending, startTransition] = useTransition();

  const executeAction = useCallback(() => {
    const runAction = async () => {
      try {
        const result = await action(initialState);
        startTransition(() => {
          setError(result);
        });
      } catch (e) {
        startTransition(() => {
          setError(e as E);
        });
      }
    };
    runAction();
  }, [action, initialState, startTransition]);

  return [error, executeAction, isPending];
}
