const GetUTCTime = (d: Date): string => {
  const [hours, minutes, seconds, milliseconds] = [
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  ]
  const h = `0${hours}`.slice(-2)
  const m = `0${minutes}`.slice(-2)
  const s = `0${seconds}`.slice(-2)
  const ms = `00${milliseconds}`.slice(-3)
  const str = `${h}:${m}:${s}.${ms}`
  return str
}

export default GetUTCTime
