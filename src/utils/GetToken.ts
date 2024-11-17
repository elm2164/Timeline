import ServerScript from "utils/ServerScript"
import { IsObject } from "utils/Validate"

const GetToken = (
  callback = (auth: string) => {
    console.log("callback: " + auth)
  },
) => {
  console.log("GetToken start")

  const execCallback = (token_type, access_token) => {
    const auth = `${token_type} ${access_token}`
    callback(auth)
  }

  try {
    const token = JSON.parse(localStorage.getItem("token"))
    if (IsObject(token, "expires_in", "token_type", "access_token")) {
      const { expires_in, token_type, access_token } = token
      console.log("token", { expires_in, token_type, access_token })

      if (new Date() >= new Date(String(expires_in))) {
        throw new Error(`token expired ${expires_in}`) //トークン期限切れ
      } else {
        execCallback(token_type, access_token)
      }
    } else {
      throw new Error(`no token`) //トークン無し
    }
  } catch (e) {
    console.warn(e)

    ServerScript("getToken").then((token) => {
      console.log("token(new)", token)
      if (IsObject(token, "expires_in", "token_type", "access_token")) {
        const { expires_in, token_type, access_token } = token

        const exp = typeof expires_in === "number" ? expires_in : 0

        localStorage.setItem(
          "token",
          JSON.stringify({
            expires_in: new Date(
              new Date().getTime() + exp * 1000,
            ).toLocaleString(),
            token_type,
            access_token,
          }),
        )

        execCallback(token_type, access_token)
      }
    })
  }
}

export default GetToken
