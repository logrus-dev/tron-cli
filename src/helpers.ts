export const delay = (delayMs: number) => new Promise(resolve => setTimeout(resolve, delayMs));

export const passwordTransformer = (input: string) => {
  if (input.length === 0) {
    return '';
  }

  if (input.length < 10) {
    return String('*').repeat(input.length);
  }

  // For better display on mobile screen
  return '*********...';
};
