import { Request, Response } from 'express'
import { TwitterApi } from 'twitter-api-v2'

const sessionStore: {
  [key: string]: { codeVerifier: string; state: string }
} = {}

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID as string,
  clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
})

const callbackURL = process.env.TWITTER_CALLBACK_URL as string

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
    sessionStore[state] = { codeVerifier, state }
    return res.json({ url })
  }
  public static callback = async (req: Request, res: Response) => {
    try {
      const { state, code } = req.query
      if (!state || !code) return res.json({ err: 'invalid' })

      const session = sessionStore[state as string]
      if (!session || session.state !== state) {
        return res.status(400).send('Invalid state')
      }

      const { codeVerifier } = session
      const { client: loggedClient } = await twitterClient.loginWithOAuth2({
        code: code as string,
        codeVerifier: codeVerifier as string,
        redirectUri: callbackURL,
      })

      const { data } = await loggedClient.v2.me()
      const followResult = await loggedClient.v2.follow(
        data.id,
        process.env.TWITTER_ASTRADAO_APP_ID as string
      )

      return res.redirect(
        `${process.env.FRONTEND_URL}/apicallback_?i=${
          followResult.data.following ? data.username : ''
        }`
      ) //EDIT THIS URL TO SEND BACK TO FRONTEND
    } catch (e) {
      console.log(e)
      return res.json({ err: e })
    }
  }
}
