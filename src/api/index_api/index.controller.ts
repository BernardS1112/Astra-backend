import { databaseDetails } from '@/config'
import _ from 'lodash'
import moment from 'moment'
import { Request, Response } from 'express'
import { db } from '@/App'
import axios from 'axios'

export class IndexController {
  constructor() {}

  public static addUpdateDelistIndex = async (req: Request, res: Response) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const indexId = req.params['indexId']
      const iTokenAddress = req.params['iTokenAddress']
      let delistDate = req.params['delistDate']

      const existQueryCheck = `SELECT * FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.DELIST_INDEX} WHERE ITOKEN_ADDRESS = '${iTokenAddress}'`

      const [existDataCheck] = await db.query(existQueryCheck)
      if (!_.isEmpty(existDataCheck)) {
        res.send({
          status: 200,
          message: 'Indice is already delisted. Please refresh page.',
        })
      } else {
        if (!indexId || !iTokenAddress || !delistDate) {
          res.send({
            status: 200,
            message: 'Invalid request. Please try after some time.',
          })
        } else {
          delistDate = moment(delistDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
          const query = `INSERT INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.DELIST_INDEX}("INDEX_ID", "ITOKEN_ADDRESS", "DELIST_DATE") VALUES ('${indexId}', '${iTokenAddress}', '${delistDate}')`
          const [resp] = await db.query(query)
          console.log('resp: ', resp)
          res.send({
            status: 200,
            message: 'Index has been shutdown successfully.',
          })
        }
      }
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  }

  public static coinGeckoPrice = async (req: Request, res: Response) => {
    try {
      const response = await axios.get(
        'https://pro-api.coingecko.com/api/v3/simple/price',
        {
          params: req.query,
        }
      )
      res.send(response.data)
    } catch (error) {
      const errData =
        axios.isAxiosError(error) && error.response
          ? error.response.data
          : error
      console.error(errData)
      res.status(500).json(errData)
    }
  }
}
