import { Binds } from 'snowflake-sdk'

export type TToken = {
  chainId?: number
  logoURI?: string
  address?: string
  img: string
  name: string
  symbol: string
  contractAddress: string
  isBaseToken: boolean
  balanceLoaded: boolean
}

export interface SnowflakeQueryInterface {
  readonly query: string
  readonly binds?: Binds
  readonly startIndex?: number | null
  readonly endIndex?: number | null
  readonly count?: number
}

export interface SnowflakeResultInterface<T> {
  readonly total: number
  readonly pageSize: number
  readonly hasNextPage: boolean
  readonly results: T[]
}

export type TChainConfig = Record<
  number,
  {
    chainStackHTTPS: string
    chainStackWS: string
    CrosschainSaleManagerAddress: `0x${string}`
    iTokenStakingContractAddress: `0x${string}`
    chefContractAddress: `0x${string}`
    astraContractAddress: `0x${string}`
    DAOContractAddress: `0x${string}`
    DAAContractAddress: `0x${string}`
    nftContractAddress: `0x${string}`
    utilityContractAddress: `0x${string}`
    USDCContractAddress: `0x${string}`
    WETHContractAddress: `0x${string}`
  }
>
