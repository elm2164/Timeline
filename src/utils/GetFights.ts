import GetUTCTime from "utils/GetUTCTime"
import ServerScript from "utils/ServerScript"
import { IsObject } from "utils/Validate"

type GetFightsProps = [
  string,
  {
    logId: string
    fight: string | number
  },
]

type FightsType = {
  logStartTime: number
  logEndTime: number
  fights: {
    logId: string
    id: number
    text: string
    startTime: number
    endTime: number
    kill: boolean
  }[]
}

const GetFights = (...[auth, { logId, fight }]: GetFightsProps) =>
  new Promise<FightsType>((resolve, rejects) => {
    const data: FightsType = {
      logStartTime: 0,
      logEndTime: 0,
      fights: [],
    }

    ServerScript("getFights", auth, {
      logId,
      fight,
    })
      .then((e) => {
        if (
          IsObject(e, "fights", "startTime", "endTime") &&
          typeof e.startTime === "number" &&
          typeof e.endTime === "number"
        ) {
          const { fights, startTime, endTime } = e
          data.logStartTime = startTime
          data.logEndTime = endTime

          if (Array.isArray(fights)) {
            fights.forEach((fight) => {
              if (
                IsObject(
                  fight,
                  "id",
                  "combatTime",
                  "kill",
                  "startTime",
                  "endTime",
                  "gameZone",
                ) &&
                IsObject(fight.gameZone, "name") &&
                typeof fight.id === "number" &&
                typeof fight.startTime === "number" &&
                typeof fight.endTime === "number" &&
                typeof fight.combatTime === "number" &&
                typeof fight.kill === "boolean"
              ) {
                const {
                  //
                  id,
                  startTime,
                  endTime,
                  kill,
                  gameZone,
                  combatTime,
                } = fight

                data.fights.push({
                  logId,
                  text: `wipe:${id} - ${gameZone.name} ${GetUTCTime(new Date(combatTime))}`,
                  id,
                  startTime,
                  endTime,
                  kill,
                })
              }
            })
          }

          resolve(data)
        } else {
          rejects("data error")
        }
      })
      .catch((e) => rejects(e))
  })

export default GetFights
