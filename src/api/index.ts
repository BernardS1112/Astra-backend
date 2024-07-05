// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request, Response } from 'express'

class BaseController {
  public static welcomeView = async (_req: Request, res: Response) => {
    res.send('Welcome to the Astra Apis')
  }
}
export default BaseController
export * from './indeces'
export * from './itokens'
export * from './proposals'
export * from './signatures'
export * from './stakers'
export * from './users'
export * from './tokens'
export * from './transactions'
export * from './index_api'
export * from './pools'
export * from './launchpads'
export * from './checkip'
export * from './twitter'
