import { Request, Response } from 'express'
import { db } from '@/App'
import { databaseDetails } from '@/config'

export class StakersController {
  public static getTopStakers = async (_req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select * from ${databaseDetails.SCHEMA_NAME}.TOP_STAKERS_LATEST_DETAILS`
      const [resp] = await db.query(query)
      // const query = `select * from ${databaseDetails.SCHEMA_NAME}."TOP_STAKERS_LATEST_DETAILS"`
      // const [resp] = await bigQuery.query(query)
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
  // const query = `select * from ${databaseDetailsGCP.SCHEMA_NAME}.TOP_STAKERS_LATEST_DETAILS`
  // const resp = await bigQuery.query(query)

  public static getTopStakersFromAllPools = async (
    _req: Request,
    res: Response
  ) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      // const query = `select * from ${databaseDetails.SCHEMA_NAME}.${databaseDetails.STAKERS_DETAILS_LATEST_VIEW} ORDER BY STAKINGSCORE DESC LIMIT 100`
      const query = `
        SELECT
          POOL_ID,
          DEPOSITED,
          ADDRESS,
          REWARDMULTIPLER,
          CAST (STAKINGSCORE AS BIGINT) / POW(10, 18) AS STAKINGSCORE,
          DATE,
          CREATED_AT
        FROM
          ${databaseDetails.SCHEMA_NAME}.STAKERS_DETAILS
        WHERE
          CREATED_AT=(
          SELECT
            MAX(CREATED_AT)
          FROM
            ${databaseDetails.SCHEMA_NAME}.STAKERS_DETAILS)
        ORDER BY
          STAKINGSCORE DESC
        LIMIT 100`
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
