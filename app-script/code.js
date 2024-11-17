function test(...args) {
  console.log("test")
  return args.join("-")
}

const setValues = (name, values) => {
  // シート取得
  const sheets = getSheetById(0)

  // テンプレートコピー
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const copySheets = sheets.copyTo(ss)

  try {
    copySheets.setName(name)

    // 値セット
    if (values.length > 0) {
      const maxColumns = Math.max(...values.map((e) => e.length))
      values.forEach((e) => {
        if (maxColumns > e.length) {
          const n = maxColumns - e.length
          e.push(...new Array(n))
        }
      })
      copySheets.getRange(1, 1, values.length, maxColumns).setValues(values)
    }

    return `${ss.getUrl()}?gid=${copySheets.getSheetId()}#gid=${copySheets.getSheetId()}`
  } catch (e) {
    ss.deleteSheet(copySheets)
    throw e
  }
}

const getSheetById = (id) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheets = ss.getSheets().filter((e) => e.getSheetId() === id)
  if (sheets.length === 0) throw new Error(`id:${id} sheets not found`)
  return sheets[0]
}

/**
 *
 * @param {string} auth
 * @param {{logId: string, startTime: number, endTime: number}}
 * @return {{
 *  enemyCasts: [{
 *   	"timestamp": number,
 *    "type": "cast" | "begincast",
 *    "sourceID": number,
 *    "targetID": number,
 *    "abilityGameID": number,
 *    "fight": number
 *  }]
 *  damageTaken:[{
 *    "timestamp": number,
 *    "type": "damage",
 *    "sourceID": number,
 *    "targetID": number,
 *    "abilityGameID": number,
 *    "fight": number,
 *    "buffs": string,
 *    "hitType": number,
 *    "amount": number,
 *    "unmitigatedAmount": number,
 *    "multiplier": number,
 *    "packetID": number
 *  }]
 *  abilities: any
 *  actors: any
 * }}
 */
const getEvents = (auth, { logId, startTime, endTime, translate }) => {
  const query = `
  {
    reportData{
      report(code:"${logId}"){
        code
        startTime
        endTime
        masterData(translate: false){
          abilities{
            gameID
            name
						type
          }
          actors {
            id
            name
          }
        }
				enemyDamageTaken: events(dataType:DamageTaken,hostilityType:Enemies,startTime:${startTime},endTime:${endTime}){
					nextPageTimestamp
					data
        }
      }
    }
  }`

  const data = RequestFFLogsAPI({ auth, query })
  const { masterData, enemyDamageTaken } = data?.reportData?.report ?? {
    masterData: { abilities: [], actors: [] },
    enemyDamageTaken: { data: [] },
  }

  const { abilities, actors } = masterData
  const firstDamage =
    enemyDamageTaken.data.filter((e) => e.type === "damage")[0] ?? {}

  const { enemyCasts, damageTaken } = getAllEvents(auth, {
    logId,
    startTime,
    endTime,
  })

  const compactEnemyCasts = {}
  enemyCasts.forEach((e) => {
    const key = `${e.timestamp}${e.type}${e.sourceID}`
    if (key in compactEnemyCasts) {
      compactEnemyCasts[key].count = compactEnemyCasts[key].count + 1
    } else {
      compactEnemyCasts[key] = {
        ...e,
        count: 1,
      }
    }
  })

  /**
   * @param {[any]} array
   */
  const toMap = (array, key) => {
    const map = {}
    array.forEach((e) => {
      map[e[key]] = e
    })
    return map
  }

  return {
    startTimestamp: firstDamage?.timestamp ?? startTime,
    enemyCasts: Object.keys(compactEnemyCasts).map(
      (key) => compactEnemyCasts[key],
    ),
    damageTaken,
    abilities: toMap(abilities, "gameID"), //abilities.sort((a, b) => a.gameID > b.gameID ? 1 : -1),
    actors: toMap(actors, "id"), //actors.sort((a, b) => a.id > b.id ? 1 : -1),
    abilitiesType: {
      1: "状態変化",
      64: "DoT",
      128: "物理",
      1024: "魔法",
    },
    eventsType: {
      cast: "⚡",
      begincast: "💬",
      damage: "💥",
    },
  }
}

const getAllEvents = (auth, { logId, startTime, endTime }, getEvents) => {
  // 最大リクエスト回数
  let maxRequest = 10

  const allEnemyCasts = {
    data: [],
    nextPageTimestamp: startTime,
  }

  const allDamageTaken = {
    data: [],
    nextPageTimestamp: startTime,
  }

  while (
    (allEnemyCasts.nextPageTimestamp || allDamageTaken.nextPageTimestamp) &&
    maxRequest > 0
  ) {
    const query = `
    {
      reportData{
        report(code:"${logId}"){
          code
          startTime
          endTime
      ${
        allEnemyCasts.nextPageTimestamp
          ? `enemyCasts: events(dataType:Casts,hostilityType:Enemies,startTime:${allEnemyCasts.nextPageTimestamp},endTime:${endTime}){
              data
              nextPageTimestamp
            }`
          : ""
      }
      ${
        allDamageTaken.nextPageTimestamp
          ? `damageTaken: events(dataType:DamageTaken,startTime:${allDamageTaken.nextPageTimestamp},endTime:${endTime}){
              data
              nextPageTimestamp
            }`
          : ""
      }
        }
      }
    }`

    console.log("getAllEvents", { query })

    const data = RequestFFLogsAPI({ auth, query })
    const { enemyCasts, damageTaken } = data?.reportData?.report ?? {
      enemyCasts: { data: [], nextPageTimestamp: null },
      damageTaken: { data: [], nextPageTimestamp: null },
    }

    allEnemyCasts.data.push(...(enemyCasts?.data ?? []))
    allEnemyCasts.nextPageTimestamp = enemyCasts?.nextPageTimestamp

    allDamageTaken.data.push(...(damageTaken?.data ?? []))
    allDamageTaken.nextPageTimestamp = damageTaken?.nextPageTimestamp

    maxRequest = maxRequest - 1
  }

  if (allEnemyCasts.nextPageTimestamp || allDamageTaken.nextPageTimestamp) {
    throw new Error(
      JSON.stringify({
        message: "data still available.",
        enemyCasts: allEnemyCasts.nextPageTimestamp,
        damageTaken: allDamageTaken.nextPageTimestamp,
      }),
    )
  }

  return {
    enemyCasts: allEnemyCasts.data,
    damageTaken: allDamageTaken.data.filter((e) => e.type === "damage"),
  }
}

const getFights = (auth, { logId, fight }) => {
  // curl --header "Authorization: Bearer <access_token>" <GRAPHQL API URL>

  const query = `
    {
      reportData{
        report(code: "${logId}"){
          code
          startTime
          endTime
          fights{
            id
            startTime
            endTime
            combatTime
            kill
            gameZone{
              name
            }
          }
        }
      }
    }`

  console.log("getFights", { query })

  const data = RequestFFLogsAPI({ auth, query })
  console.log(data)
  const { fights, startTime, endTime } = data?.reportData?.report ?? {
    fights: [],
    startTime: 0,
    endTime: 0,
  }

  if (fight) {
    const filtered = fights.filter((e) =>
      !isNaN(parseInt(fight))
        ? e.id === parseInt(fight)
        : fight === "last"
          ? e.id === fights.length
          : false,
    )
    return {
      startTime,
      endTime,
      fights: filtered.length > 0 ? filtered : fights,
    }
  }

  return { fights, startTime, endTime }
}

const RequestFFLogsAPI = ({ auth, query }) => {
  console.log(query)

  const resp = UrlFetchApp.fetch("https://ja.fflogs.com/api/v2/client", {
    contentType: "application/json",
    headers: {
      Authorization: auth,
    },
    payload: JSON.stringify({
      query,
    }),
  })

  const content = JSON.parse(resp.getContentText())
  const { data, errors } = content
  if (errors) {
    throw new Error(JSON.stringify(errors))
  }
  return data
}

const getToken = () => {
  //curl -u {client_id}:{client_secret} -d grant_type=client_credentials https://ja.fflogs.com/oauth/token
  const auth = Utilities.base64Encode(`${CLIENT_ID}:${CLIENT_SECRET}`)
  const resp = UrlFetchApp.fetch("https://ja.fflogs.com/oauth/token", {
    contentType: "application/json",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    payload: JSON.stringify({
      grant_type: "client_credentials",
    }),
  })
  const token = JSON.parse(resp.getContentText())
  console.log(token)
  return token
}
