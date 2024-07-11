import { Request, Response } from 'express'
import { JSONFilePreset } from 'lowdb/node'
import { TwitterApi } from 'twitter-api-v2'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.join(__dirname, `../../../.env`),
})
const defaultData = { codeVerifier: [], state: [] }
let db: any
;(async () => {
  db = await JSONFilePreset('db.json', defaultData)
  db.data.state = []
  db.data.codeVerifier = []
  await db.write()
})()

const twitterClient = new TwitterApi({
  clientId: process.env.CLIENT_ID as string,
  clientSecret: process.env.CLIENT_SECRET as string,
})

const callbackURL = process.env.CALLBACK_URL as string

export class FollowsController {
  constructor() {}
  public static index = async (_req: Request, res: Response) => {
    return res.json({ hello: 'world' })
  }
  public static loginTwitter = async (_req: Request, res: Response) => {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      callbackURL,
      {
        scope: [
          'tweet.write',
          'tweet.read',
          'users.read',
          'offline.access',
          'dm.read',
          'dm.write',
          'follows.write',
          'follows.read',
        ],
      }
    )
    db.data.codeVerifier.push(codeVerifier)
    db.data.state.push(state)
    await db.write()
    return res.json({ url })
  }
  public static callback = async (req: Request, res: Response) => {
    try {
      const { state, code } = req.query
      if (!state || !code) return res.json({ err: 'invalid' })
      // const codeVerifier = db.data.codeVerifier.pop()
      // const savedState = db.data.state.pop()
      // if (state !== savedState) {
      if (!db.data.state.includes(state)) {
        return res.status(400).send('Invalid state')
      }
      const codeVerifier = db.data.codeVerifier[db.data.state.indexOf(state)]
      const { client: loggedClient } = await twitterClient.loginWithOAuth2({
        code: code as string,
        codeVerifier: codeVerifier as string,
        redirectUri: callbackURL,
      })

      // db.data.state = []
      // db.data.codeVerifier = []
      await db.write()
      const { data } = await loggedClient.v2.me()
      const followResult = await loggedClient.v2.follow(
        data.id,
        '1445297898317570048'
      )
      console.log({ data, followResult })

      // Fetch followers of the user with ID '1445297898317570048'
      const followers = await loggedClient.v2.followers('1445297898317570048')
      console.log('============== followers of astradao_org ===============')
      console.log({ followers })

      // Check if the user follows the specific account
      const following = await loggedClient.v2.following(data.id)
      const isFollowing = following.data.find(
        (user: any) => user.id === '1445297898317570048'
      )
      console.log(`${data.username} is following the account: ${isFollowing}`)

      return res.redirect(
        `${process.env.FRONTEND_URL}/apicallback_?i=${
          followResult.data.following ? data.username : ''
        }`
      ) //EDIT THIS URL TO SEND BACK TO FRONTEND
    } catch (e) {
      console.log(e)
      return res.json({ err: 'fail' })
    }
  }
}
