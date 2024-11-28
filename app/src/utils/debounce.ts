export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  return (...args: Parameters<T>) => {
    // Clear the previous timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout to invoke the function after the delay
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
