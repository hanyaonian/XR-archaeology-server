import { BaseSyntheticEvent, useCallback, useRef, useState } from "react";

export function useLongPress(
  onLongPress: (event?: BaseSyntheticEvent) => void,
  onClick: (event?: BaseSyntheticEvent) => void,
  { shouldPreventDefault = true, delay = 300 } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout | undefined>();
  const target = useRef();

  const start = useCallback(
    (event: BaseSyntheticEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touched", preventDefault, { passive: false });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: BaseSyntheticEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onClick();
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        event.target.addEventListener("touched", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: BaseSyntheticEvent) => start(e),
    onTouchStart: (e: BaseSyntheticEvent) => start(e),
    onMouseUp: (e: BaseSyntheticEvent) => clear(e),
    onMouseLeave: (e: BaseSyntheticEvent) => clear(e, false),
    onTouchEnd: (e: BaseSyntheticEvent) => clear(e),
  };
}

const isTouchEvent = (event: BaseSyntheticEvent) => {
  return "touches" in event;
};

const preventDefault = (event) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};
