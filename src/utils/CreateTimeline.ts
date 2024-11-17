import GetEvents from "utils/GetEvents"
import ServerScript from "utils/ServerScript"

const CreateTimeline = async (
  auth: string,
  { logId, id, startTime, endTime },
): Promise<string> => {
  const name = `${logId}_${id}`

  const resp = await GetEvents(auth, { logId, startTime, endTime })
  const {
    startTimestamp,
    enemyCasts,
    damageTaken,
    abilities,
    actors,
    abilitiesType,
    eventsType,
  } = resp

  const values = [...damageTaken, ...enemyCasts]
    .map((e) => [
      (e.timestamp - startTimestamp) / 1000,
      eventsType[e.type] ?? "",

      actors[e.sourceID]?.name ?? "[unknown]", //ソース
      abilities[e.abilityGameID]?.name ?? "[unknown]", //アビリティ
      (e.count ? (e.count !== 1 ? `x${e.count}` : undefined) : undefined) ??
        actors[e.targetID]?.name ??
        "[unknown]", //ターゲット

      abilitiesType[abilities[e.abilityGameID]?.type] ?? "",
      e.unmitigatedAmount ?? "",
    ])
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))

  values.unshift(
    [],
    [],
    [],
    [`https://ja.fflogs.com/reports/${logId}#fight=${id}`],
    [
      "秒",
      "タイプ",
      "ソース",
      "アビリティ",
      "ターゲット",
      "ダメージタイプ",
      "ダメージ",
    ],
  )
  console.log({ values })

  const url = await ServerScript("setValues", name, values)
  console.log(`end: ${url}`)

  return String(url)
}

export default CreateTimeline
