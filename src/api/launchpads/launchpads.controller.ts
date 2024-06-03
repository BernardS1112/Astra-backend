// @ts-ignore
import { Request, Response } from 'express'
import { db } from '@/App'
import { databaseDetails } from '@/config'

export class LaunchpadsController {
  public static getLaunchpadList = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const { status = 'approved', sort } = req.query
      const query = `SELECT
          *
      FROM
          ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL}
      WHERE STATUS='${status}'
      ORDER BY ${sort} ASC
      `
      const [resp] = await db.query(query)
      res.status(200).json({
        status: 200,
        data: resp,
      })
    } catch (error) {
      console.error('Error while getLaunchpadList: ', error)
      res.status(200).json({
        status: 500,
        error: error,
      })
    }
  }
  public static approveLaunchpads = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')

      const { approveTx, launchpadIndex } = req.body

      const query = `UPDATE
          ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL}
          SET STATUS='approved', APPROVE_TRANSACTION=${approveTx}
          WHERE LAUNCHPAD_INDEX='${launchpadIndex}'
          ;`

      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: resp,
      })
    } catch (error) {
      console.log(error)
      res.send({
        status: 500,
        error: error,
      })
    }
  }
  public static getLaunchpadByIndex = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const launchpadIndex = Number(req.query['index']) // /api/...?index=1

      if (launchpadIndex == undefined || launchpadIndex == null)
        return res.status(500).json({
          status: 500,
          data: 'Launchpad index is required in query.',
        })

      const query = `SELECT
            *
        FROM
            ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} WHERE LAUNCHPAD_INDEX=${launchpadIndex};`

      const [resp] = await db.query(query)
      res.status(200).json({
        status: 200,
        data: resp,
      })
    } catch (error) {
      res.status(500).json({
        status: 500,
        error,
      })
    }
  }
  public static addContributor = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const buyData = req.body

      // add contributor to contributor table
      const query = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.CONTRIBUTOR} (LAUNCHPAD_INDEX, LAUNCHPAD_ADDRESS, CONTRIBUTOR_ADDRESS, CONTRIBUTED_AMOUNT, CONTRIBUTE_TRANSACTION) VALUES ('${buyData.launchpadIndex}', '${buyData.launchpadAddress}', '${buyData.contributorAddress}', '${buyData.contributedAmount}', '${buyData.contributeTransaction}');`
      const [insertRes] = await db.query(query)

      res.status(200).json({ status: 200, data: insertRes })
    } catch (error) {
      res.status(500).json({
        status: 500,
        error,
      })
    }
  }
  public static requestLaunchpad = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const launchpadData = req.body

      console.log('backend recieve launchpad data: ', launchpadData)

      const queryLaunchpadDetail = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} (OWNER, STATUS, LAUNCHPAD_INDEX, LAUNCHPAD_ADDRESS, LAUNCHPAD_TOKEN_ADDRESS, LAUNCHPAD_TOKEN_NAME, LAUNCHPAD_TOKEN_SYMBOL, LAUNCHPAD_TOKEN_TOTAL_SUPPLY, LAUNCHPAD_TOKEN_DECIMAL, LAUNCHPAD_TOKEN_PRICE, LAUNCHPAD_TOKEN_FDV, TOTAL_SALE_AMOUNT, SALE_START_TIME, SALE_END_TIME, MAX_PURCHASE_BASE_AMOUNT, SOFT_CAP, HARD_CAP, INITIAL_MARKET_CAP, PROJECT_VALUATION, PROJECT_DETAIL, TEAM_INFO, METRICS, WEBSITE_URL, WHITEPAPER_URL, TWITTER, TELEGRAM, DISCORD, OTHER_URL, EMAIL, INVESTOR_DETAIL, CHAIN, REQUEST_TRANSACTION, APPROVE_TRANSACTION) VALUES ('${launchpadData.owner}', 'requested', '${launchpadData.launchpadIndex}', '${launchpadData.launchpadAddress}', '${launchpadData.launchpadTokenAddress}', '${launchpadData.launchpadTokenName}', '${launchpadData.launchpadTokenSymbol}', '${launchpadData.launchpadTotalSupply}', '${launchpadData.launchpadTokenDecimal}', '${launchpadData.launchpadTokenPrice}', '${launchpadData.launchpadTokenFDV}', '${launchpadData.totalSaleAmount}', '${launchpadData.saleStartTime}', '${launchpadData.saleEndTime}', '${launchpadData.maxPurchaseBaseAmount}', '${launchpadData.softCap}', '${launchpadData.hardCap}', '${launchpadData.initialMarketCap}', '${launchpadData.projectValuation}', '${launchpadData.projectDetail}', '${launchpadData.teamInfo}', '${launchpadData.metrics}', '${launchpadData.websiteUrl}', '${launchpadData.whitepaperUrl}', '${launchpadData.twitter}', '${launchpadData.telegram}', '${launchpadData.discord}',  '${launchpadData.otherUrl}', '${launchpadData.email}', '${launchpadData.investorDetail}', '${launchpadData.chain}', '${launchpadData.requestTransaction}', '${launchpadData.approveTransaction}');`

      const [launchpadDetailRes] = await db.query(queryLaunchpadDetail)
      res.status(200).json({ status: 200, data: launchpadDetailRes })
    } catch (error) {
      res.status(500).json({
        status: 500,
        error,
      })
    }
  }
}
