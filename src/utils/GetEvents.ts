import ServerScript from "utils/ServerScript"
import { IsObject } from "utils/Validate"

type GetEventsProps = [
  string,
  {
    logId: string
    startTime: number
    endTime: number
  },
]

type GetEvents = {
  startTimestamp: number
  enemyCasts: EventsType[]
  damageTaken: EventsType[]
  abilities: unknown
  actors: unknown
  abilitiesType: unknown
  eventsType: unknown
}

type EventsType = {
  timestamp: number
  type: string
  sourceID: number
  abilityGameID: number
  targetID: number
  unmitigatedAmount?: number
  count?: number
}

const GetEvents = (...[auth, { logId, startTime, endTime }]: GetEventsProps) =>
  new Promise<GetEvents>((resolve, rejects) => {
    ServerScript("getEvents", auth, {
      logId,
      startTime,
      endTime,
    })
      .then((e) => {
        console.log({ e })

        if (
          IsObject(
            e,
            "startTimestamp",
            "enemyCasts",
            "damageTaken",
            "abilities",
            "actors",
            "abilitiesType",
            "eventsType",
          ) &&
          Array.isArray(e.damageTaken) &&
          Array.isArray(e.enemyCasts) &&
          typeof e.startTimestamp === "number"
        ) {
          const {
            startTimestamp,
            enemyCasts,
            damageTaken,
            abilities,
            actors,
            abilitiesType,
            eventsType,
          } = e

          resolve({
            startTimestamp,
            enemyCasts,
            damageTaken,
            abilities,
            actors,
            abilitiesType,
            eventsType,
          })
        } else {
          rejects("data error")
        }
      })
      .catch((e) => rejects(e))
  })

export default GetEvents
