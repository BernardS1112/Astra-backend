import { Request, Response } from 'express'
import { db } from '@/App'
import { databaseDetails } from '@/config'

export class ITokensController {
  public static getITokenTotStaking = async (_req: Request, res: Response) => {
    try {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      const query = `select * from ${databaseDetails.SCHEMA_NAME}.STAKINGS_USER_DEPOSIT_DETAILS_VIEW where USER='0x3C0579211A530ac1839CC672847973182bd2da31'`
      const [resp] = await db.query(query)
      let value = 0
      resp.forEach((element) => {
        value = Number(element.AMOUNT) / Math.pow(10, 18)
      })

      res.send({
        status: 200,
        value,
        data: resp,
      })
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static getPendingBalance = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const itokenAddr = req.query['itokenAddr']

      const query = `SELECT POOLPENDINGBALANCE 
      FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.INDEX_TOKEN_DETAILS} 
      WHERE ITOKEN_ADDR ='${itokenAddr}' 
      AND CREATED_AT BETWEEN 
          (SELECT MAX(CREATED_AT) FROM ASTRA_DB_PROD.BLOCKCHAIN.INDEX_TOKEN_DETAILS) - INTERVAL '5 SECONDS' 
      AND 
          (SELECT MAX(CREATED_AT) FROM ASTRA_DB_PROD.BLOCKCHAIN.INDEX_TOKEN_DETAILS) + INTERVAL '5 SECONDS';`

      const [resp] = await db.query(query)
      res.status(200).json({
        status: 200,
        data: resp,
      })
    } catch (err) {
      res.status(500).send({
        status: 500,
        data: err,
      })
    }
  }
}
