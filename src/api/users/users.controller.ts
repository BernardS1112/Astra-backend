import { databaseDetails } from '@/config'
import { Request, Response } from 'express'
import { db } from '@/App'
import { DAAAbi, indiceAbi } from '@/abi'
import _ from 'lodash'
import { erc20ABI, readContract } from '@wagmi/core'
import { chainConfig } from '@/config/chain.config'

export class UsersController {
  constructor() {}

  public static addEmail = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const email = req.params['email']
      const [emails] = await db.query(
        `select * from ${databaseDetails.SCHEMA_NAME}.BETA_USERS where EMAIL='${email}'`
      )
      if (emails.length <= 0) {
        res.send({
          status: 200,
          message: 'email already exist',
        })
      } else {
        const insertEmailQuery = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.BETA_USERS ("EMAIL") VALUES ('${email}')`
        const [insertRes] = await db.query(insertEmailQuery)
        res.send({
          status: 200,
          data: insertRes,
          message: 'Inserted Successfully',
        })
      }
    } catch (err) {
      res.status(500).send({
        error: err,
      })
    }
  }

  public static getUserIndices = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const userAddress = req.params['userAddress']
      const queryTxs = `select * from ${databaseDetails.SCHEMA_NAME}.${
        databaseDetails.TRANSACTION
      } where (LOWER(_FROM)='${_.toLower(
        userAddress
      )}' OR LOWER(_TO)='${_.toLower(
        userAddress
      )}') AND TYPE='INDICE' AND EVENT='POOLIN' ORDER BY TRANSACTION_DATE_TIME DESC`
      const [respTx] = await db.query(queryTxs)
      const arrIds = respTx.map(
        (item) => item.DECODED_INPUT.split("_poolIndex': ")[1].split('}')[0]
      )
      const ids = arrIds
        .filter((item, idx) => arrIds.indexOf(item) === idx)
        .reduce((acc, curr) => {
          if (curr) {
            acc += `'${curr}',`
          }
          return acc
        }, '')
        .slice(0, -1)

      const where = ids ? `IA.ITOKEN_INDEX IN (${ids}) OR ` : ''
      const query = `WITH LatestCumulativeROI AS (
                        SELECT 
                            IA.ITOKEN_ADDR AS ITOKEN_ADDR, 
                            IA.INDEX_CUMULATIVE_ROI * 100 AS ROI_NEW, 
                            ROW_NUMBER() OVER(PARTITION BY IA.ITOKEN_ADDR ORDER BY IA.DATE DESC) AS rn
                        FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_CUMULATIVE_ROI_VIEW} IA
                    )
                    SELECT 
                        ID.*, 
                        IA.*,
                        LC.ROI_NEW
                    FROM 
                        ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_DETAILS_LATEST_SNAPSHOT_VIEW} IA
                    LEFT JOIN 
                        ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDICES_AGGREGATES_LATEST_SNAPSHOT_VIEW} ID 
                    ON 
                        ID.ITOKEN_ADDR = IA.ITOKEN_ADDR
                    LEFT JOIN 
                        LatestCumulativeROI LC 
                    ON 
                        LC.ITOKEN_ADDR = IA.ITOKEN_ADDR AND LC.rn = 1
                    WHERE 
                        ${where} IA.OWNER = '${userAddress}'
                    ORDER BY 
                        IA.CREATED_AT DESC;`
      const [resp] = await db.query(query)
      const baseStableCoinAddress = await readContract({
        address: chainConfig.DAAContractAddress,
        abi: DAAAbi,
        functionName: 'baseStableCoin',
      })
      const decimals = await readContract({
        address: baseStableCoinAddress,
        abi: erc20ABI,
        functionName: 'decimals',
      })
      const myIndices = await Promise.all(
        resp.map(async (element) => {
          element.IS_DEPOSITED = false
          const contractAddress = element['ITOKEN_ADDR']
          const iTokenIndex = element['ITOKEN_INDEX']
          if (!contractAddress) return element
          try {
            const totalDepostiedBalanceDetails = await readContract({
              address: chainConfig.DAAContractAddress,
              abi: indiceAbi,
              functionName: 'poolUserInfo',
              args: [iTokenIndex, userAddress as `0x${string}`],
            })

            element.IS_OWNER =
              _.toLower(element['OWNER']) === _.toLower(userAddress)

            const pendingBalance = totalDepostiedBalanceDetails
              ? Number(totalDepostiedBalanceDetails[2]) /
                Math.pow(10, Number(decimals.valueOf()))
              : 0
            const currentBalance = totalDepostiedBalanceDetails
              ? Number(totalDepostiedBalanceDetails[0]) /
                Math.pow(10, Number(decimals.valueOf()))
              : 0
            const totalDepostiedBalance = pendingBalance + currentBalance
            element.DEPOSITED_AMOUNT = totalDepostiedBalance
            element.IS_DEPOSITED = totalDepostiedBalance > 0

            const indiceDelistedDate = `SELECT * FROM ${
              databaseDetails.SCHEMA_NAME
            }.${
              databaseDetails.DELIST_INDEX
            }  WHERE LOWER(ITOKEN_ADDRESS) = '${_.toLower(
              contractAddress
            )}' LIMIT 1`
            const [/* [record],  */ [delistedRecords]] = await Promise.all([
              // db.query(indiceCreateDate),
              db.query(indiceDelistedDate),
            ])
            const thresold = element.THRESHOLD / Math.pow(10, 6)
            const TVLCount = element.TVL / Math.pow(10, 6)
            element.TVL_REQUIRED_TO_START_INDEX_PER =
              TVLCount > 0
                ? thresold === 0
                  ? 100
                  : _.round((TVLCount * 100) / thresold)
                : 0
            element.thresold_display = thresold
            element['IS_DELISTED'] = !_.isEmpty(delistedRecords) ? true : false
            return element
          } catch (err) {
            console.error('Error while get my indies from mapping: ', err)
            return element
          }
        })
      )
      res.send({
        status: 200,
        data: myIndices,
        address: userAddress,
      })
    } catch (error) {
      console.log('Error on /:userAddress/indices routes: ', error)
      res.status(500).send({
        error,
      })
    }
  }
}
