import { Request, Response } from 'express'
import geoip from 'geoip-lite'

export class CheckIPController {
  constructor() {}

  public static checkip = async (req: Request, res: Response) => {
    const ip = req.clientIp
    // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    console.log('server ip: ', ip)

    const geo = geoip.lookup(ip as string)
    console.log('geo: ', geo)

    if (geo && geo.country === 'US') {
      return res
        .status(403)
        .json({ code: 'error', data: 'Access denied', location: geo?.country || "local" })
    } else {
      return res.status(200).json({
        code: 'success',
        data: 'Access granted',
        location: geo?.country || "local",
      })
    }
  }
}
