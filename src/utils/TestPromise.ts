const TestPromise = (...args: unknown[]) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(args)
    }, 5000)
  })

export default TestPromise
