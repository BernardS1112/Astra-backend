import { appConfig, databaseDetails } from '@/config'
import { Request, Response } from 'express'
import { db } from '@/App'

export class PoolsController {
  constructor() {}

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
}
