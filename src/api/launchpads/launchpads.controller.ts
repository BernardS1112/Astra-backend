import { Request, Response } from 'express'
import { db } from '@/App'
import { databaseDetails } from '@/config'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

export class LaunchpadsController {
  public static getLaunchpadList = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const {
        status,
        sort,
        wallet,
        filter = 'None',
        chain = 'None',
        search = '',
        type = 'all',
        page = '-1',
      } = req.query

      let WHERE = ''
      let FILTER_WHERE = ''

      const curTime = Math.floor(Date.now() / 1000)
      if (filter !== 'None' && status !== 'admin') {
        if (filter === 'requested') {
          if (status === 'coming-soon')
            FILTER_WHERE = `SALE_START_TIME > TO_TIMESTAMP(${curTime}) OR (SALE_START_TIME < TO_TIMESTAMP(${curTime}) AND SALE_END_TIME > TO_TIMESTAMP(${curTime}))`
          else FILTER_WHERE = `SALE_START_TIME > TO_TIMESTAMP(${curTime})`
        } else if (filter === 'approved') {
          FILTER_WHERE = `SALE_START_TIME < TO_TIMESTAMP(${curTime}) AND SALE_END_TIME > TO_TIMESTAMP(${curTime})`
        } else if (filter === 'finished') {
          FILTER_WHERE = `SALE_END_TIME < TO_TIMESTAMP(${curTime})`
        } else {
          FILTER_WHERE = `SALE_END_TIME < TO_TIMESTAMP(${curTime})`
        }
      }

      filter === 'None'
        ? (WHERE = `STATUS IS NOT NULL`)
        : status === 'admin'
        ? (WHERE = `STATUS = '${filter}' OR (VESTING_DEPLOYED = false AND IS_VESTING = true)`)
        : (WHERE = FILTER_WHERE)
      if (status !== 'admin' && status !== 'owner')
        WHERE =
          WHERE +
          ` AND ((SALE_START_TIME > TO_TIMESTAMP(${curTime}) AND STATUS = 'requested') OR (SALE_START_TIME > TO_TIMESTAMP(${curTime}) AND STATUS = 'approved') OR (SALE_START_TIME < TO_TIMESTAMP(${curTime}) AND SALE_END_TIME > TO_TIMESTAMP(${curTime}) AND STATUS = 'approved') OR (SALE_END_TIME < TO_TIMESTAMP(${curTime}) AND STATUS = 'finished'))`
      if (chain !== 'None') WHERE = WHERE + ` AND CHAIN = '${chain}'`
      if (type !== 'all') WHERE = WHERE + ` AND TOKEN_TYPE = '${type}'`
      if (!!wallet && status === 'owner')
        WHERE = WHERE + ` AND OWNER = '${wallet}'`
      if (search !== '')
        WHERE =
          WHERE +
          ` AND ( UPPER(LAUNCHPAD_TOKEN_NAME) LIKE UPPER('%${search}%') OR UPPER(LAUNCHPAD_TOKEN_SYMBOL)
 LIKE UPPER('%${search}%') ) `

      let query = `SELECT
          *
      FROM
          ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL}
      WHERE ${WHERE}
      ORDER BY ${sort} DESC
      `
      if (typeof page === 'string' && parseInt(page) > -1) {
        query = query + ` LIMIT 6 OFFSET ${parseInt(page) * 6};`
      } else query = query + ';'
      const [resp] = await db.query(query)
      res.status(200).json({
        status: 200,
        data: resp,
      })
    } catch (error) {
      console.error('Error while getLaunchpadList: ', error)
      res.status(500).json({
        status: 500,
        error: error,
      })
    }
  }
  public static getParticipatedLaunchpadList = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { wallet } = req.query
      if (!wallet)
        return res.status(500).json({
          status: 500,
          data: 'User wallet is required in query.',
        })

      const query = `SELECT
ld.*
FROM
ASTRA_DB_DEV.BLOCKCHAIN.LAUNCHPAD_DETAIL_TEST ld
JOIN
(
    SELECT DISTINCT
        LAUNCHPAD_INDEX,
        CONTRIBUTOR_ADDRESS
    FROM
        ASTRA_DB_DEV.BLOCKCHAIN.CONTRIBUTOR_TEST
) c ON ld.LAUNCHPAD_INDEX = c.LAUNCHPAD_INDEX
WHERE
c.CONTRIBUTOR_ADDRESS = '${wallet}';`

      const [resp] = await db.query(query)
      res.status(200).json({
        status: 200,
        data: resp,
      })
    } catch (error) {
      console.error('Error while getParticipatedLaunchpadList: ', error)
      res.status(200).json({
        status: 500,
        error: error,
      })
    }
  }
  public static getContributorList = async (req: Request, res: Response) => {
    try {
      const { launchpadAddress } = req.query
      if (!launchpadAddress)
        return res.status(500).json({
          status: 500,
          data: 'Launchpad address is required in query.',
        })

      const query = `SELECT
        * FROM  ${databaseDetails.SCHEMA_NAME}.${databaseDetails.CONTRIBUTOR}
        WHERE LAUNCHPAD_ADDRESS='${launchpadAddress}';`
      const [resp] = await db.query(query)

      res.status(200).json({
        status: 200,
        data: resp,
      })
    } catch (err) {
      console.error('Error while getContributorList: ', err)
      res.status(500).json({
        status: 500,
        error: err,
      })
    }
  }
  public static approveLaunchpads = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')

      const { approveTx, launchpadIndex, launchpadAddress } = req.body

      const query = `UPDATE
          ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL}
          SET STATUS='approved', LAUNCHPAD_ADDRESS='${launchpadAddress}', APPROVE_TRANSACTION='${approveTx}'
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
  public static getLaunchpadById = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const launchpadId = req.query['id'] // /api/...?index=1

      if (launchpadId == undefined || launchpadId == null)
        return res.status(500).json({
          status: 500,
          data: 'Launchpad ID is required in query.',
        })

      const query = `SELECT
            *
        FROM
            ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} WHERE ID='${launchpadId}';`

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
      const newId = uuidv4()

      const escapedProjectDescriptionDetail = escapeStringForSQL(
        launchpadData.projectDescriptionDetail
      )

      const queryLaunchpadDetail = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} (ID, OWNER, STATUS, LAUNCHPAD_ADDRESS, LAUNCHPAD_TOKEN_ADDRESS, LAUNCHPAD_TOKEN_NAME, LAUNCHPAD_TOKEN_SYMBOL, LAUNCHPAD_TOKEN_TOTAL_SUPPLY, LAUNCHPAD_TOKEN_DECIMAL, LAUNCHPAD_TOKEN_PRICE, LAUNCHPAD_TOKEN_FDV, TOTAL_SALE_AMOUNT, SALE_START_TIME, SALE_END_TIME, MAX_PURCHASE_BASE_AMOUNT, SOFT_CAP, HARD_CAP, INITIAL_MARKET_CAP, PROJECT_VALUATION, PROJECT_DETAIL, TEAM_INFO, METRICS, WEBSITE_URL, WHITEPAPER_URL, TWITTER, TELEGRAM, DISCORD, OTHER_URL, EMAIL, INVESTOR_DETAIL, CHAIN, LEAD_VC, MARKET_MAKER, CONTROLLED_CAP, DAO_APPROVED_METRICS, TOKEN_TYPE, IS_VESTING, BASE_TOKEN, VEST_START, VEST_CLIFF, VEST_DURATION, VEST_SLICE_PERIOD_SECONDS, VEST_INITIAL_UNLOCK, REQUEST_TRANSACTION, APPROVE_TRANSACTION, PROJECT_DESCRIPTION_DETAIL, PROJECT_IMAGE, MEDIUM, GITHUB, PROJECT_DECK, RAISED) VALUES ('${newId}', '${launchpadData.owner}', 'requested', '${launchpadData.launchpadAddress}', '${launchpadData.launchpadTokenAddress}', '${launchpadData.launchpadTokenName}', '${launchpadData.launchpadTokenSymbol}', '${launchpadData.launchpadTotalSupply}', '${launchpadData.launchpadTokenDecimal}', '${launchpadData.launchpadTokenPrice}', '${launchpadData.launchpadTokenFDV}', '${launchpadData.totalSaleAmount}', '${launchpadData.saleStartTime}', '${launchpadData.saleEndTime}', '${launchpadData.maxPurchaseBaseAmount}', '${launchpadData.softCap}', '${launchpadData.hardCap}', '${launchpadData.initialMarketCap}', '${launchpadData.projectValuation}', '${launchpadData.projectDetail}', '${launchpadData.teamInfo}', '${launchpadData.metrics}', '${launchpadData.websiteUrl}', '${launchpadData.whitepaperUrl}', '${launchpadData.twitter}', '${launchpadData.telegram}', '${launchpadData.discord}', '${launchpadData.otherUrl}', '${launchpadData.email}', '${launchpadData.investorDetail}', '${launchpadData.chain}', '${launchpadData.leadVC}', '${launchpadData.marketMaker}', '${launchpadData.controlledCap}', '${launchpadData.daoApprovedMetrics}', '${launchpadData.tokenType}', '${launchpadData.isVesting}', '${launchpadData.baseToken}', '${launchpadData.vest_start}', '${launchpadData.vest_cliff}', '${launchpadData.vest_duration}', '${launchpadData.vest_slice_period_seconds}', '${launchpadData.vest_initial_unlock}', '${launchpadData.requestTransaction}', '${launchpadData.approveTransaction}', '${escapedProjectDescriptionDetail}', '${launchpadData.projectImage}', '${launchpadData.medium}', '${launchpadData.github}', '${launchpadData.projectDeck}', '${launchpadData.raised||0}');`

      const [launchpadDetailRes] = await db.query(queryLaunchpadDetail)
      res.status(200).json({ status: 200, data: launchpadDetailRes, id: newId })
    } catch (error) {
      res.status(500).json({
        status: 500,
        error,
      })
    }
  }

  public static updateLaunchpad = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const launchpadId = req.query['id']
      let launchpadData = req.body
      if (!launchpadData.hasOwnProperty('status')) {
        launchpadData = { ...launchpadData, status: 'requested' }
      }

      const escapedProjectDescriptionDetail = escapeStringForSQL(
        launchpadData.projectDescriptionDetail
      )
      const escapedTeamDescription = escapeStringForSQL(
        launchpadData.teamDescription
      )

      const queryLaunchpadDetail = `UPDATE ${databaseDetails.SCHEMA_NAME}.${
        databaseDetails.LAUNCHPAD_DETAIL
      } 
      SET OWNER = '${launchpadData.owner}', ${
        launchpadData.launchpadIndex != null
          ? `LAUNCHPAD_INDEX = '${launchpadData.launchpadIndex}',`
          : ''
      } STATUS = '${launchpadData.status}', LAUNCHPAD_ADDRESS = '${
        launchpadData.launchpadAddress
      }', LAUNCHPAD_TOKEN_ADDRESS = '${
        launchpadData.launchpadTokenAddress
      }', LAUNCHPAD_TOKEN_NAME = '${launchpadData.launchpadTokenName}', 
          LAUNCHPAD_TOKEN_SYMBOL = '${launchpadData.launchpadTokenSymbol}', 
          LAUNCHPAD_TOKEN_TOTAL_SUPPLY = '${
            launchpadData.launchpadTotalSupply
          }', 
          LAUNCHPAD_TOKEN_DECIMAL = '${launchpadData.launchpadTokenDecimal}', 
          LAUNCHPAD_TOKEN_PRICE = '${launchpadData.launchpadTokenPrice}', 
          LAUNCHPAD_TOKEN_FDV = '${launchpadData.launchpadTokenFDV}', 
          TOTAL_SALE_AMOUNT = '${launchpadData.totalSaleAmount}', 
          SALE_START_TIME = '${launchpadData.saleStartTime}', 
          SALE_END_TIME = '${launchpadData.saleEndTime}', 
          MAX_PURCHASE_BASE_AMOUNT = '${launchpadData.maxPurchaseBaseAmount}', 
          SOFT_CAP = '${launchpadData.softCap}', 
          HARD_CAP = '${launchpadData.hardCap}', 
          INITIAL_MARKET_CAP = '${launchpadData.initialMarketCap}', 
          PROJECT_VALUATION = '${launchpadData.projectValuation}', 
          PROJECT_DETAIL = '${launchpadData.projectDetail}', 
          TEAM_INFO = '${launchpadData.teamInfo}', 
          METRICS = '${launchpadData.metrics}', 
          WEBSITE_URL = '${launchpadData.websiteUrl}', 
          WHITEPAPER_URL = '${launchpadData.whitepaperUrl}', 
          TWITTER = '${launchpadData.twitter}', 
          TELEGRAM = '${launchpadData.telegram}', 
          DISCORD = '${launchpadData.discord}', 
          OTHER_URL = '${launchpadData.otherUrl}', 
          EMAIL = '${launchpadData.email}', 
          INVESTOR_DETAIL = '${launchpadData.investorDetail}', 
          CHAIN = '${launchpadData.chain}',
          LEAD_VC = '${launchpadData.leadVC}',
          MARKET_MAKER = '${launchpadData.marketMaker}',
          CONTROLLED_CAP = '${launchpadData.controlledCap}',
          DAO_APPROVED_METRICS = '${launchpadData.daoApprovedMetrics}',
          TOKEN_TYPE = '${launchpadData.tokenType}', 
          IS_VESTING = '${launchpadData.isVesting}',
          BASE_TOKEN = '${launchpadData.baseToken}',
          VEST_START = '${launchpadData.vest_start}', VEST_CLIFF = '${
            launchpadData.vest_cliff
          }', VEST_DURATION = '${
            launchpadData.vest_duration
          }', VEST_SLICE_PERIOD_SECONDS = '${
            launchpadData.vest_slice_period_seconds
          }', VEST_INITIAL_UNLOCK = '${launchpadData.vest_initial_unlock}',
          REQUEST_TRANSACTION = '${launchpadData.requestTransaction}', 
          APPROVE_TRANSACTION = '${launchpadData.approveTransaction}',
          PROJECT_DESCRIPTION_DETAIL = '${
            escapedProjectDescriptionDetail || ''
          }',
          TEAM_DESCRIPTION = '${escapedTeamDescription || ''}',
          SALE_ROUND_DETAIL = '${launchpadData?.saleRoundDetail || ''}',
          PROJECT_IMAGE = '${launchpadData?.projectImage || ''}',
          LEAD_VC_IMAGE = '${launchpadData?.leadVCImage || ''}',
          MARKET_MAKER_IMAGE = '${launchpadData?.marketMakerImage || ''}',
          MEDIUM = '${launchpadData?.medium || ''}',
          GITHUB = '${launchpadData?.github || ''}',
          RAISED = '${launchpadData?.raised || 0}',
          PROJECT_DECK = '${launchpadData?.projectDeck || ''}'
WHERE ID = '${launchpadId}';`
      const [updateRes] = await db.query(queryLaunchpadDetail)
      res.status(200).json({ status: 200, data: updateRes })
    } catch (error) {
      res.status(500).json({
        status: 500,
        error,
      })
    }
  }

  public static followAddress = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const data = req.body
      let isFollowing = ''
      if (data.data === 'telegram') {
        isFollowing = 'IS_TELEGRAM_FOLLOWING'
      }
      if (data.data === 'twitter') {
        isFollowing = 'IS_TWITTER_FOLLOWING'
      }
      if (isFollowing !== '' && /^0x([a-fA-F0-9]{40})$/.test(data.address)) {
        const firstQuery = `SELECT *
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_FOLLOWING}
        WHERE USER = '${data.address}' AND ${isFollowing} = true;`
        const [firstRes] = await db.query(firstQuery)
        if (!_.isEmpty(firstRes)) {
          res.status(400).json({
            status: 400,
            error:
              'This address is already followed. Please try again another address',
          })
        } else {
          const query = `MERGE INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_FOLLOWING} AS target
        USING (SELECT '${data.address}' AS address) AS source
         ON target.USER = source.address
       WHEN MATCHED THEN
        UPDATE SET ${isFollowing} = TRUE
      WHEN NOT MATCHED THEN
        INSERT (USER, ${isFollowing})
        VALUES (source.address, TRUE);`
          const [insertRes] = await db.query(query)
          res.status(200).json({ status: 200, data: insertRes })
        }
      } else {
        res.status(400).json({ status: 400, error: 'request invalid' })
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        error,
      })
    }
  }

  public static updateVestAddress = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const { launchpadAddress, vestAddress } = req.body
      // update vest address and vesting deployed status in launchpad detail table
      const query = `UPDATE ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} SET VESTING_DEPLOYED = true, VEST_ADDRESS = '${vestAddress}' WHERE LAUNCHPAD_ADDRESS = '${launchpadAddress}';`
      const [updateRes] = await db.query(query)
      res.status(200).json({ status: 200, data: updateRes })
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: err,
      })
    }
  }

  public static finishLaunchpad = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          status: 400,
          error: 'id is required in query.',
        })
      }

      const query = `UPDATE ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} SET STATUS = 'finished' WHERE ID = '${id}';`
      const [updateRes] = await db.query(query)
      res.status(200).json({ status: 200, data: updateRes })
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: err,
      })
    }
  }

  public static deleteLaunchpad = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          status: 400,
          error: 'id is required in query.',
        })
      }

      const query = `DELETE FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.LAUNCHPAD_DETAIL} WHERE ID = '${id}';`
      const [updateRes] = await db.query(query)
      res.status(200).json({ status: 200, data: updateRes })
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: err,
      })
    }
  }

  public static getFollowingData = async (req: Request, res: Response) => {
    try {
      const { address } = req.query

      if (
        typeof address === 'string' &&
        /^0x([a-fA-F0-9]{40})$/.test(address)
      ) {
        const query = `SELECT USER, IS_TELEGRAM_FOLLOWING, IS_TWITTER_FOLLOWING
          FROM ASTRA_DB_DEV.BLOCKCHAIN.LAUNCHPAD_FOLLOWING_TEST
          WHERE USER = '${address}';`

        const [resp] = await db.query(query)
        res.status(200).json({
          status: 200,
          data: resp,
        })
      } else {
        return res.status(500).json({
          status: 500,
          data: 'User wallet is required in query.',
        })
      }
    } catch (error) {
      console.error('Error while getParticipatedLaunchpadList: ', error)
      res.status(200).json({
        status: 500,
        error: error,
      })
    }
  }
}

function escapeStringForSQL(str: string) {
  return str.replace(/'/g, "''") // Escape single quotes by doubling them
}
