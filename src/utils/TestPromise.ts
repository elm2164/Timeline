import FightsData from "dummy/FightsData.json"

const TestPromise = (...args: unknown[]) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(FightsData)
    }, 5000)
  })

export default TestPromise
