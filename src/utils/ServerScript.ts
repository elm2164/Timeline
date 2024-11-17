const ServerScript = (func: string, ...args: unknown[]) =>
  new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [func](...args)
  })

export default ServerScript
