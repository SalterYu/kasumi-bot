import PcrRolesData from '../../../assets/pcr-roles'
import PcrRole from "../role";
import axios from "axios";
import FormData from "form-data"

const allRoles = PcrRolesData.map(item => new PcrRole(item))

async function getRoles() {
  const res = await axios('http://api.yobot.xyz/v2/nicknames/?type=csv')
  return res.data.split('\n').map((item: string) => item.split(','))
}

class AllRoles {
  allRoles: PcrRole[]

  constructor() {
    this.allRoles = allRoles
  }

  searchRoleByAlia(key: string) {
    return this.allRoles.find((role) => {
      return role.alias.includes(key.toLowerCase())
    })
  }

  async getBattleResult(keys: string[]) {
    const form = new FormData({ maxDataSize: 20971520 });
    const url = 'https://nomae.net/princess_connect/public/_arenadb/receive.php'
    form.append('type', 'search')
    form.append('userid', 0)
    form.append('public', 1)
    form.append('page', 0)
    form.append('sort', 0)
    keys.forEach(item => {
      form.append('def[]', item)
    })
    return axios.post(url, form, {
      headers: form.getHeaders({
        "authority": "nomae.net",
        "x-from": "https://nomae.net/arenadb/"
      })
    })
  }
}

const pcrRoles = new AllRoles()

export default pcrRoles
