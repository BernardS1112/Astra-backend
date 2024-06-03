import { gql } from 'graphql-request'
import { Schema, Endpoints } from '.'

export const sqlQueries = {
  indicesPriceDaily: `${Schema.BLOCKCHAIN}.${Endpoints.INDICES_PRICE_DAILY_SNAPSHOT_VIEW}`,
  // This view could be used for end of the day index value/btc value till yesterday. (This will be used for Graph)
  indicesLatestSnapshot: `${Schema.BLOCKCHAIN}.${Endpoints.INDICES_LATEST_SNAPSHOT_VIEW}`,
  // This view contains latest snapshot of data received in latest  15 mins data load.
  indexBTCValueDaily: `${Schema.BLOCKCHAIN}.${Endpoints.INDEX_BTC_VALUE_DAILY_SNAPSHOT_VIEW}`,
  // This view can be used for getting the recent index value/btc value till yesterday.
  tokenInfo: `${Schema.BLOCKCHAIN}.${Endpoints.TOKEN_INFO_REF_ARBI}`,
  // Reference View for all the token details (i.e. token_id ) and corresponding Contract details .
  indicesDetailsLatest: `${Schema.BLOCKCHAIN}.${Endpoints.INDICES_DETAILS_LATEST_SNAPSHOT_VIEW}`,
  // Latest current view of Itoken as received by  latest 15 mins data load
}

export const v2Query = gql`
  query getpool($poolid: ID!) {
    pair(id: $poolid) {
      id
      token0 {
        id
      }
      token1 {
        id
      }
      reserve0
      reserve1
      totalSupply
      volumeUSD
      untrackedVolumeUSD
      volumeToken0
      volumeToken1
    }
  }
`

export const sushiQuery = gql`
  query getpool($poolid: ID!) {
    pair(id: $poolid) {
      id
      token0 {
        id
      }
      token1 {
        id
      }
      reserve0
      reserve1
      totalSupply
      volumeUSD
      untrackedVolumeUSD
      volumeToken0
      volumeToken1
    }
  }
`

export const lpAPRQuery = gql`
  query getpool($tokenid: ID!) {
    position(id: $tokenid) {
      pool {
        id
      }
      owner
      token0 {
        id
      }
      token1 {
        id
      }
      tickLower {
        id
        tickIdx
        liquidityNet
        liquidityGross
        price0
        price1
        volumeToken0
        volumeToken1
        volumeUSD
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      tickUpper {
        id
        tickIdx
        liquidityNet
        liquidityGross
        price0
        price1
        volumeToken0
        volumeToken1
        volumeUSD
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      liquidity
      depositedToken0
      depositedToken1
      withdrawnToken0
      withdrawnToken1
      collectedFeesToken0
      collectedFeesToken1
      transaction {
        id
      }
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`
