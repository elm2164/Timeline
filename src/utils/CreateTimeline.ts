import ServerScript from "utils/ServerScript"
import { IsObject } from "utils/Validate"

const CreateTimeline = async (
  auth: string,
  { logId, id, startTime, endTime },
) => {
  const resp = await ServerScript("getEvents", auth, {
    logId,
    startTime,
    endTime,
  })
  console.log({ resp })

  if (
    IsObject(
      resp,
      "startTimestamp",
      "enemyCasts",
      "damageTaken",
      "abilities",
      "actors",
      "abilitiesType",
      "eventsType",
    ) &&
    Array.isArray(resp.damageTaken) &&
    Array.isArray(resp.enemyCasts) &&
    typeof resp.startTimestamp === "number"
  ) {
    const {
      startTimestamp,
      enemyCasts,
      damageTaken,
      abilities,
      actors,
      abilitiesType,
      eventsType,
    } = resp

    const name = `${logId}_${id}`

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

    return url
  }
}

export default CreateTimeline
