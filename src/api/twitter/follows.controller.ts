import { Request, Response } from 'express'
import { TwitterApi } from 'twitter-api-v2'
import crypto from 'crypto'
import querystring from 'querystring'
import { databaseDetails } from '@/config'
import { db } from '@/App'
import { v4 as uuidv4 } from 'uuid'

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID as string,
  clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
})

const callbackURL = process.env.TWITTER_CALLBACK_URL as string
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID as string

export class FollowsController {
  constructor() {}

  public static index = async (_req: Request, res: Response) => {
    return res.json({ hello: 'twitter index endpoint' })
  }

  public static loginTwitter = async (_req: Request, res: Response) => {
    // const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    //   callbackURL,
    //   {
    //     scope: [
    //       'tweet.write',
    //       'tweet.read',
    //       'users.read',
    //       'offline.access',
    //       'dm.read',
    //       'dm.write',
    //       'follows.write',
    //       'follows.read',
    //     ],
    //   }
    // )
    // sessionStore[state] = { codeVerifier, state }
    // return res.json({ url })

    const state = crypto.randomBytes(16).toString('hex')
    const codeVerifier = crypto.randomBytes(32).toString('hex')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    const sessionId = uuidv4()
    const stateWithSession = `${state}:${sessionId}`

    const url = `https://twitter.com/i/oauth2/authorize?${querystring.stringify(
      {
        response_type: 'code',
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: callbackURL,
        scope:
          'tweet.read tweet.write users.read offline.access dm.read dm.write follows.write follows.read',
        state: stateWithSession,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      }
    )}`

    // SAVE CODEvERIFIER AND STATE to snowflake database
    const query = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.${
      databaseDetails.LAUNCHPAD_TWITTER_CODE
    } (SESSION_ID, CODE_VERIFIER, STATE) VALUES ('${sessionId}', '${codeVerifier.toString()}', '${state.toString()}');`
    await db.query(query)

    res.json({ url })
  }

  public static callback = async (req: Request, res: Response) => {
    try {
      const { state, code } = req.query as {
        state: string
        code: string
      }

      if (!state || !code) return res.status(400).json({ err: 'invalid' })

      const [sessionState, sessionId] = state.split(':')

      // Select code verifier and state from snowflak database
      const query = `SELECT * FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_TWITTER_CODE} WHERE SESSION_ID='${sessionId}';`

      const [resp] = await db.query(query)
      if (resp.length === 0) {
        return res.status(400).json({ err: 'Session data not found' })
      }
      const session = resp[0]
      const dbState = session.STATE
      const codeVerifier = session.CODE_VERIFIER

      if (dbState != sessionState) {
        return res.status(400).json({ err: `Invalid state: ${session}` })
      }

      const { client: loggedClient } = await twitterClient.loginWithOAuth2({
        code: code,
        codeVerifier: codeVerifier,
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
      )
    } catch (e) {
      console.log(e)
      return res.status(500).json({ err: 'error while call back', e })
    }
  }
}
