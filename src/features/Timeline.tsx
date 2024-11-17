import React, { useCallback, useState } from "react"
import {
  Box,
  TextField,
  Button,
  FormGroup,
  FormHelperText,
  List,
  ListItem,
  Link,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import CreateTimeline from "utils/CreateTimeline"
import GetToken from "utils/GetToken"
import GetUTCTime from "utils/GetUTCTime"
import ServerScript from "utils/ServerScript"
// import TestPromise from "utils/TestPromise"
import { IsObject } from "utils/Validate"

const Timeline = () => {
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [url, setUrl] = useState("")
  const [timelineUrl, setTimelineUrl] = useState("")
  const [message, setMessage] = useState("")
  const [header, setHeader] = useState("")
  const [fightsList, setFightsList] = useState<
    {
      logId: string
      id: number
      text: string
      startTime: number
      endTime: number
      kill: boolean
    }[]
  >([])

  const handleClick = useCallback(() => {
    setBtnDisabled(true)
    setMessage("")
    setHeader("")
    setTimelineUrl("")
    setFightsList([])

    if (url.length > 0) {
      const match = url.match(
        /fflogs.com\/reports\/(\w+)(?:#.*(?<=fight=)([1-9][0-9]*|last))?/,
      )
      if (match) {
        console.log(match)
        const [, logId, fight] = match

        try {
          GetToken((auth) => {
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
                  setHeader(
                    `${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`,
                  )
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
                        )
                      ) {
                        const {
                          id,
                          startTime,
                          endTime,
                          kill,
                          gameZone,
                          combatTime,
                        } = fight

                        if (
                          IsObject(gameZone, "name") &&
                          typeof id === "number" &&
                          typeof startTime === "number" &&
                          typeof endTime === "number" &&
                          typeof combatTime === "number" &&
                          typeof kill === "boolean"
                        ) {
                          console.log({ fights, startTime, endTime })
                          setFightsList((item) => {
                            return [
                              ...item,
                              {
                                logId,
                                text: `wipe:${id} - ${gameZone.name} ${GetUTCTime(new Date(combatTime))}`,
                                id,
                                startTime,
                                endTime,
                                kill,
                              },
                            ]
                          })
                        }
                      }
                    })
                  }
                }
              })
              .finally(() => {
                setBtnDisabled(false)
              })
          })
        } catch (e) {
          setMessage(e.message)
        }
      } else {
        setMessage("Error: URLの形式が間違っています！")
        setBtnDisabled(false)
      }
    } else {
      setMessage("Error: URLが入力されていません！")
      // setFightsList([
      //   {
      //     logId: "hoge",
      //     text: "hogehoge",
      //     startTime: 123,
      //     endTime: 456,
      //     kill: false,
      //     id: 1,
      //   },
      //   {
      //     logId: "hoge",
      //     text: "hogehoge",
      //     startTime: 123,
      //     endTime: 456,
      //     kill: true,
      //     id: 2,
      //   },
      // ])
      // setTimelineUrl(
      //   "https://docs.google.com/spreadsheets/d/110ab8c8fUZXRgnq2wwPz3Wdcb63XY9e1U-IifaQzumI/edit?gid=124743270#gid=124743270",
      // )
      setBtnDisabled(false)
    }
  }, [url])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage("")
      setHeader("")
      setTimelineUrl("")
      setFightsList([])
      setUrl(e.target.value)
    },
    [],
  )

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormGroup row>
            <TextField
              name="fflogs-url"
              size="small"
              sx={{ marginRight: 2 }}
              value={url}
              onChange={handleInputChange}
            />
            <Button
              variant="contained"
              onClick={handleClick}
              disabled={btnDisabled}
            >
              ログ検索！
            </Button>
          </FormGroup>
          <FormHelperText>
            FFLogsのURLを入力してボタンを押してください
          </FormHelperText>
          <FormHelperText
            sx={{
              fontWeight: 700,
            }}
          >
            {timelineUrl && (
              <Link href={timelineUrl} target="_brank">
                タイムライン作成しました！
              </Link>
            )}
          </FormHelperText>
          <FormHelperText
            sx={{
              color: "red",
              fontWeight: 700,
            }}
          >
            {message}
          </FormHelperText>
        </Grid>
        <Grid size={12}>
          <h3>{header}</h3>
          <List>
            {fightsList
              .sort((a, b) => (a.id > b.id ? -1 : 1))
              .map((fight, i) => {
                return (
                  <div key={i} style={{ backgroundColor: "#333" }}>
                    <ListItem
                      sx={{
                        display: "block",
                        margin: "auto",
                        borderBottom: "1px solid #333",
                        backgroundColor: fight.kill ? "#b8ffd5" : "#ffb8b8",
                        color: fight.kill ? "#033e00" : "#7f0404",
                        "&:hover": {
                          opacity: 0.9,
                          transition: "0.3s",
                        },
                      }}
                    >
                      <Grid container>
                        <Grid size={8}>
                          <Box sx={{ lineHeight: 2 }}>{fight.text}</Box>
                        </Grid>
                        <Grid size={4}>
                          <Button
                            variant="contained"
                            disabled={btnDisabled}
                            onClick={() => {
                              console.log(fight.startTime, fight.endTime)
                              const { logId, id, startTime, endTime } = fight
                              setBtnDisabled(true)
                              setMessage("")
                              setTimelineUrl("")

                              GetToken((auth) => {
                                CreateTimeline(auth, {
                                  logId,
                                  id,
                                  startTime,
                                  endTime,
                                })
                                  .then((e) => {
                                    setTimelineUrl(String(e))
                                  })
                                  .catch((e) => {
                                    setMessage(e.message)
                                  })
                                  .finally(() => {
                                    setBtnDisabled(false)
                                  })
                              })
                            }}
                          >
                            タイムライン作成！
                          </Button>
                        </Grid>
                      </Grid>
                    </ListItem>
                  </div>
                )
              })}
          </List>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Timeline
