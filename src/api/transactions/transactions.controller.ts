import { appConfig, databaseDetails } from '@/config'
import { Request, Response } from 'express'
import { db } from '@/App'
import _ from 'lodash'
import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'

const basePath = appConfig.jsonFilepathInitials

const dataSources = [
  {
    path: `${basePath}/vesting-schedules/advisors.json`,
    type: 'Advisor',
  },
  {
    path: `${basePath}/vesting-schedules/affiliates.json`,
    type: 'Early Supporter - Affiliate',
  },
  {
    path: `${basePath}/vesting-schedules/customer.json`,
    type: 'Early Supporter - Customer',
  },
  {
    path: `${basePath}/vesting-schedules/investor.json`,
    type: 'Early Supporter - Investor',
  },
  {
    path: `${basePath}/vesting-schedules/startegicpartners.json`,
    type: 'Strategic partner',
  },
  {
    path: `${basePath}/vesting-schedules/team.json`,
    type: 'Early Contributor',
  },
]

export class TransactionsController {
  public static listOfClaimTransactions = async (
    req: Request,
    res: Response
  ) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const userAddress = req.params['walletAddress'].toLowerCase()

      const vestingTypes: Record<string, string> = {}
      await Promise.all(
        dataSources.map(async (data) => {
          const file = await fs.readFile(path.resolve(__dirname, data.path), {
            encoding: 'utf8',
          })
          const json = JSON.parse(file.toString())
          const vesting = Object.fromEntries(
            Object.entries(json).map(([k, v]) => [k.toLowerCase(), v])
          ) as Record<string, string>

          if (vesting && !_.isEmpty(vesting) && vesting[userAddress]) {
            vestingTypes[vesting[userAddress]] = data.type
          }
        })
      )

      const query = `select * from ${
        databaseDetails.SCHEMA_NAME
      }.CLAIMS_TRANSACTIONS_VIEW where LOWER(_FROM)='${userAddress.toLowerCase()}' AND METHODID = '0x66afd8ef' ORDER BY TIMESTAMP DESC`

      const [resp] = await db.query(query)
      res.send({
        status: 200,
        data: {
          transactions: resp,
          categories: vestingTypes,
        },
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getLiquidityMiningDetails = async (
    _req: Request,
    res: Response
  ) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      let jsonData = await fs.readFile(
        path.resolve(
          __dirname,
          `${appConfig.jsonFilepathInitials}liquidityMining.json`
        ),
        { encoding: 'utf8' }
      )
      jsonData = JSON.parse(jsonData.toString())
      res.send({
        status: 200,
        data: jsonData,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static updateLiquidityMiningFile = async () => {
    try {
      const astraTokenDetails = await axios.get(
        `https://pro-api.coingecko.com/api/v3/coins/astra-dao-2?tickers=false&community_data=true&sparkline=false`
      )
      const astraTokenCGDetails = astraTokenDetails.data
      const totalVolume =
        astraTokenCGDetails &&
        astraTokenCGDetails.market_data &&
        astraTokenCGDetails.market_data.total_volume
          ? astraTokenCGDetails.market_data.total_volume.usd
          : 0
      let tokenPrice: number | string =
        astraTokenCGDetails &&
        astraTokenCGDetails.market_data &&
        astraTokenCGDetails.market_data.current_price
          ? Number(astraTokenCGDetails.market_data.current_price.usd)
          : 0
      tokenPrice = Number(tokenPrice)
        .toFixed(12)
        .replace(/\.?0+$/, '')
      const query = `select * from ${databaseDetails.SCHEMA_NAME}."LP_POOLS_DETAILS_VIEW" WHERE LOWER(TOKEN0_SYMBOL) = 'astra' or LOWER(TOKEN1_SYMBOL) = 'astra' or LOWER(TOKEN0_SYMBOL) = 'astradao' or LOWER(TOKEN1_SYMBOL) = 'astradao'`
      const [poolRecords] = await db.query(query)
      let totalLiquidity = 0
      if (!_.isEmpty(poolRecords)) {
        poolRecords.forEach((element) => {
          totalLiquidity += Number(element.LIQUIDITY)
        })
      }

      const circulatingSupplyDetails = await axios.get(
        'https://r23g9ibja7.execute-api.us-east-1.amazonaws.com/main?q=circulating_supply'
      )
      const circulatingSupply = circulatingSupplyDetails.data

      const readAPRDATA: {
        liquidityMiningAPR: string
        stakingRewardsAPR: string
        astraStakingAmount: number
      } = JSON.parse(
        await fs.readFile(
          path.resolve(
            __dirname,
            `${appConfig.jsonFilepathInitials}aprdetails.json`
          ),
          'utf8'
        )
      )

      let percentageOfAstraStacked: string | number =
        readAPRDATA.astraStakingAmount
          ? (readAPRDATA.astraStakingAmount / circulatingSupply) * 100
          : 0
      percentageOfAstraStacked = percentageOfAstraStacked.toFixed(2)
      const finalData = {
        totalVolume: totalVolume,
        tokenPrice: tokenPrice,
        totalLiquidity: totalLiquidity,
        averageAPY: readAPRDATA.liquidityMiningAPR,
        percentageOfAstraStacked,
      }
      const jsonData = JSON.stringify(finalData)
      await fs.writeFile(
        path.resolve(
          __dirname,
          `${appConfig.jsonFilepathInitials}liquidityMining.json`
        ),
        jsonData
      )
    } catch (err) {
      console.log('err', err)
    }
  }

  public static getUserTransactions = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      let userAddress = req.params['userAddress']
      userAddress = _.toLower(userAddress)
      const transactionType = req.params['type']

      if (!userAddress) {
        res.send({
          status: 204,
          error: 'Invalid Params.',
        })
      }

      let whereCondition = ''
      if (transactionType) {
        whereCondition = 'TYPE = "' + transactionType + '" AND '
      }

      const query = `SELECT *
      FROM (
        SELECT *,
               ROW_NUMBER() OVER(PARTITION BY TRANSACTION_HASH ORDER BY TRANSACTION_DATE_TIME DESC) AS rn
        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.TRANSACTION}
        WHERE ${whereCondition} (LOWER(_FROM) = LOWER('${userAddress}') 
          OR LOWER(_TO) = LOWER('${userAddress}'))
          AND TYPE IN('ASTRA_STAKING', 'CLAIM', 'INDICE', 'LP_STAKING', 'LM_STAKING')
      ) AS subquery
      WHERE rn = 1
      ORDER BY TRANSACTION_DATE_TIME DESC`

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
}
