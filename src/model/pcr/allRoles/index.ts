import PcrRolesData from '../../../assets/pcr-roles'
import PcrRole from "../role";
import axios from "axios";
import FormData from "form-data"
import Log from "../../../utils/log";
import { dateFtt, random } from "@utils";

const schedule = require('node-schedule');
const allRoles = PcrRolesData.map(item => new PcrRole(item))

async function getRoles() {
  const res = await axios('http://api.yobot.xyz/v2/nicknames/?type=csv')
  return res.data.split('\n').map((item: string) => item.split(',')).map((item: any) => new PcrRole(item))
}

class AllRoles {
  allRoles: PcrRole[]

  constructor() {
    this.allRoles = allRoles
    this._updateRoleMap()
    this._startJob()
  }

  _updateRoleMap() {
    getRoles().then(res => {
      Log.Info('已更新角色表')
      this.allRoles = res
    })
  }

  _startJob() {
    let rule = new schedule.RecurrenceRule();
    rule.date = 1
    rule.hour = 0
    rule.minute = 0
    rule.second = 0
    schedule.scheduleJob(rule, async () => {
      Log.Info('开始更新角色数据表')
      this._updateRoleMap()
    })
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
