import axios from 'axios'
import Log from "./log";

const downloadImageToBase64 = (url: string) => {
  return axios({
    url,
    responseType: 'arraybuffer'
  }).then(res => {
    const img64 = res.data.toString('base64')
    return {
      img64,
      src64: `data:${res.headers["content-type"]};base64,${img64}`,
    }
  })
}

export {
  downloadImageToBase64
}
