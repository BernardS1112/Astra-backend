import { db } from '@/App'
import { appConfig, databaseDetails } from '@/config'
import { fetchBlockNumber } from '@wagmi/core'
import axios from 'axios'
import { Request, Response } from 'express'
import fs from 'fs'
import _ from 'lodash'
import moment from 'moment'
import path from 'path'

export class ProposalsController {
  constructor() {}

  public static updateProposalEndTime = async () => {
    const finalData: Record<string, string> = {}
    // const queryBk = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}."PROPOSAL_DETAILS_LATEST_VIEW" A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}."PROPOSAL_CREATED_VIEW" B ON A.ID = B.ID`

    try {
      const currentBlockNumber = await fetchBlockNumber()
      if (!currentBlockNumber) {
        return
      }
      const query = `SELECT * FROM ${
        databaseDetails.SCHEMA_NAME
      }.PROPOSAL_CREATED_DETAILS WHERE CAST(ENDBLOCK AS INT) > ${Number(
        currentBlockNumber
      )}`
      const [proposals] = await db.query(query)
      const fileData: Record<string, string> = JSON.parse(
        fs
          .readFileSync(
            path.resolve(
              __dirname,
              `${appConfig.jsonFilepathInitials}proposalblocks.json`
            )
          )
          .toString()
      )
      // const fileData = JSON.parse(jsonData)

      await Promise.all(
        proposals.map(async (value) => {
          if (fileData[value.ID]) {
            return
          }
          const compoundTokensList = await axios.get(
            `${appConfig.explorerAPIUrl}?module=block&action=getblockcountdown&blockno=${value.ENDBLOCK}`
          )
          const duration =
            compoundTokensList.data && compoundTokensList.data.result
              ? compoundTokensList.data.result.EstimateTimeInSec
              : ''
          if (duration) {
            const endDate = moment()
              .second(duration)
              .utc()
              .format('DD MMM YYYY HH:mm A')
            finalData[value.ID] = endDate
          }
          const jsonData = JSON.stringify(finalData)
          fs.writeFileSync(
            path.resolve(
              __dirname +
                `/${appConfig.jsonFilepathInitials}proposalblocks.json`
            ),
            jsonData
          )
        })
      )
    } catch (err) {
      console.log({ err })
      // /* console.log('err', err); */
    }
  }

  public static getProposals = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const limit = Number(req.query['limit'])
      // const proposalId = appConfig.prod ? 0 : 165
      let query = ''
      let qLimit = ''
      if (limit !== 0) {
        qLimit = ` LIMIT ${limit}`
      }
      if (appConfig.prod) {
        query = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_DETAILS_LATEST_VIEW} A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_CREATED_VIEW} B ON A.ID = B.ID${qLimit}`
      } else {
        // query = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_DETAILS_LATEST_VIEW} A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_CREATED_VIEW} B ON A.ID = B.ID WHERE CAST(A.ID as INTEGER) > ${proposalId}${qLimit}`
        query = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_DETAILS_LATEST_VIEW} A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_CREATED_VIEW} B ON A.ID = B.ID WHERE CAST(B.BLOCKNUMBER as INTEGER) > 41568210 ORDER BY B.CREATED_AT DESC${qLimit}`
      }

      const [resp] = await db.query(query)
      const fileData: Record<string, string> = JSON.parse(
        fs
          .readFileSync(
            path.resolve(
              __dirname,
              `${appConfig.jsonFilepathInitials}proposalblocks.json`
            )
          )
          .toString()
      )

      const result = resp.map((element) => {
        if (fileData[element['ID']] && element) {
          element['END_DATETIME'] = fileData[element['ID']]
        }
        let parsedDescription: Record<string, string> = {}
        try {
          parsedDescription = JSON.parse(
            element.DESCRIPTION.substring(1, element.DESCRIPTION.length - 1)
          )
        } catch (e) {
          try {
            try {
              parsedDescription = JSON.parse(element.DESCRIPTION)
            } catch (e) {}
          } catch {}
        }
        element.title = parsedDescription?.title
        element.description = parsedDescription?.description

        return element
      })
      res.send({
        status: 200,
        data: result,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getAPY = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const proposalId = req.params['proposalId']
      const query = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}.PROPOSAL_DETAILS_LATEST_VIEW A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}."PROPOSAL_CREATED_VIEW" B ON A.ID = B.ID where A.ID=${proposalId}`
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: _.first(resp),
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getVoters = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const proposalId = req.params['proposalId']
      let query = ''
      if (appConfig.prod) {
        query = `select * from ${databaseDetails.SCHEMA_NAME}.PROPOSAL_CASTVOTE_DETAILS where PROPOSALID='${proposalId}'`
      } else {
        query = `select * from ${databaseDetails.SCHEMA_NAME}.PROPOSAL_CASTVOTE_DETAILS where PROPOSALID='${proposalId}' AND CAST(BLOCKNUMBER as INTEGER) > 41568210`
      }
      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: resp,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getProposalsDetails = async (req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const proposalId = Number(req.params['proposalId'])
      let query = ''
      if (appConfig.prod) {
        query = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_DETAILS_LATEST_VIEW} A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_CREATED_VIEW} B ON A.ID=B.ID where A.ID='${proposalId}'`
      } else {
        query = `select A.*, B.* from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_DETAILS_LATEST_VIEW} A RIGHT JOIN ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_CREATED_VIEW} B ON A.ID=B.ID WHERE A.ID='${proposalId}' AND CAST(B.BLOCKNUMBER as INTEGER) > 41568210`
      }
      const existQueryCheck = `SELECT COUNT(*) as total FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.PROPOSAL_SIGNATURES} WHERE PROPOSAL_ID='${proposalId}' AND STATUS = 'PENDING'`

      const [[gaselessVoteCount], [resp]] = await Promise.all([
        db.query(existQueryCheck),
        db.query(query),
      ])

      const fileData: Record<string, string> = JSON.parse(
        fs
          .readFileSync(
            path.resolve(
              __dirname,
              `${appConfig.jsonFilepathInitials}proposalblocks.json`
            )
          )
          .toString()
      )

      if (fileData && fileData[proposalId] && resp[0]) {
        resp[0]['END_DATETIME'] = fileData[proposalId]
      }

      resp[0]['GASELESS_COUNTER'] = !_.isEmpty(gaselessVoteCount)
        ? gaselessVoteCount[0]['TOTAL']
        : 0

      resp[0]['CONTRACT_VERIFIED_TEXT'] = resp[0]['TEXT']

      let parsedDescription: Record<string, string> = {}
      try {
        parsedDescription = JSON.parse(
          resp[0].DESCRIPTION.substring(1, resp[0].DESCRIPTION.length - 1)
        )
      } catch (e) {
        try {
          try {
            parsedDescription = JSON.parse(resp[0].DESCRIPTION)
          } catch (e) {}
        } catch {}
      }
      resp[0].title = parsedDescription?.title
      resp[0].description = parsedDescription?.description
      resp[0].links = parsedDescription?.links

      res.send({
        status: 200,
        data: _.first(resp),
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getAllPools = async (_req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')

      if (appConfig.prod === false) {
        const testingPair = [
          {
            CHAINID: 'ethereum',
            EXCHANGE: 'uniswap',
            DEX_SCREENER_URL:
              'https://dexscreener.com/ethereum/0x39a1ad3b33db6fa77755fcff2fd4fbec5ce4643d',
            PAIRADDRESS: '0x83772d7418f6a7045a9AA38E31B303d0ceD83ABA',
            PRICE_NATIVE: '0.0000000001744',
            PRICE_USD: '0.0000002695',
            FULLY_DILUTED_VALUATION: '26951421.6',
            PAIRCREATEDAT: '1661113939000',
            TOKEN0_ID: '0x68A27491Efe143D86cA2EA65B21Cc45997447E4e',
            TOKEN0_NAME: 'Astra DAO',
            TOKEN0_SYMBOL: 'ASTRA',
            TOKEN1_ID: '0xbDA0504cb108d27885acbE5755465234980606aD',
            TOKEN1_NAME: 'USD coin',
            TOKEN1_SYMBOL: 'USDC',
            TXNS_H24_BUYS: '0',
            TXNS_H24_SELLS: '4',
            TXNS_H6_BUYS: '0',
            TXNS_H6_SELLS: '3',
            TXNS_H1_BUYS: '0',
            TXNS_H1_SELLS: '0',
            TXNS_M5_BUYS: '0',
            TXNS_M5_SELLS: '0',
            VOLUME_H24: '5966.9',
            VOLUME_H6: '4339.85',
            VOLUME_H1: '0',
            VOLUME_M5: '0',
            PRICECHANGE_H24: '-0.85',
            PRICECHANGE_H6: '-0.85',
            PRICECHANGE_H1: '0',
            PRICECHANGE_M5: '0',
            LIQUIDITY: '619366',
            TOKEN0_LIQUIDITY: '',
            TOKEN1_LIQUIDITY: '',
            DATE: '2023-03-12',
            CREATED_AT: '2023-03-12 19:15:07.000',
          },
        ]

        res.send({
          status: 200,
          data: testingPair,
        })
      } else {
        const query = `select * from ${databaseDetails.SCHEMA_NAME}.LP_POOLS_DETAILS_VIEW WHERE LOWER(TOKEN0_SYMBOL) = 'astra' or LOWER(TOKEN1_SYMBOL) = 'astra' or LOWER(TOKEN0_SYMBOL) = 'astradao' or LOWER(TOKEN1_SYMBOL) = 'astradao'`
        const [resp] = await db.query(query)
        res.send({
          status: 200,
          data: resp,
        })
      }
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static apyDetails = async (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send({
      status: 200,
      data: {
        liquidityMiningAPY: 122,
        stakingRewardsAPY: 123,
        iTokenAPY: 124,
        stakingAPY: 125,
      },
    })
  }

  public static getAPYPerc = async (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    // '../../../public'
    const jsonData = JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          `${appConfig.jsonFilepathInitials}${
            process.env.PROD_ENV === 'production'
              ? 'aprdetails.json'
              : 'aprdetails-test.json'
          }`
        ),
        'utf-8'
      )
    )
    res.send({
      status: 200,
      data: jsonData,
    })
  }
}
