import { Request, Response } from 'express'
import geoip from 'geoip-lite'

export class CheckIPController {
  constructor() {}

  public static checkip = async (req: Request, res: Response) => {
    const { clientIp } = req.query
    const geo = geoip.lookup(clientIp as string)

    if (geo && geo.country === 'US') {
      return res.status(403).json({
        code: 'error',
        data: 'Access denied',
        location: geo?.country || 'local',
      })
    } else {
      return res.status(200).json({
        code: 'success',
        data: 'Access granted',
        location: geo?.country || 'local',
      })
    }
  }
}
