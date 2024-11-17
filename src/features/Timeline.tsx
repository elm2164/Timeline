import React, { useCallback, useContext, useState } from "react"
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
import { LoadingContext } from "provider/Loading"
import CreateTimeline from "utils/CreateTimeline"
import GetFights from "utils/GetFights"
import GetToken from "utils/GetToken"

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

  const loading = useContext(LoadingContext)

  const handleClick = useCallback(() => {
    loading.open()
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

        GetToken()
          .then((auth) => {
            GetFights(auth, { logId, fight })
              .then((e) => {
                console.log(e)
                setFightsList(e.fights)
              })
              .catch((e) => console.error(e))
              .finally(() => {
                setBtnDisabled(false)
                loading.close()
              })
          })
          .catch((e) => {
            setBtnDisabled(false)
            loading.close()
            console.error(e)
          })

        // TestPromise()
        //   .then((e: any) => {
        //     console.log(e)
        //     setFightsList(e.fights)
        //   })
        //   .finally(() => {
        //     setBtnDisabled(false)
        //     loading.close()
        //   })
      } else {
        setMessage("Error: URLの形式が間違っています！")
        loading.close()
        setBtnDisabled(false)
      }
    } else {
      setMessage("Error: URLが入力されていません！")
      loading.close()
      setBtnDisabled(false)
    }
  }, [loading, url])

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
                              loading.open()

                              setMessage("")
                              setTimelineUrl("")

                              GetToken()
                                .then((auth) => {
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
                                      loading.close()
                                    })
                                })
                                .catch((e) => {
                                  setBtnDisabled(false)
                                  loading.close()
                                  console.error(e)
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
