import path from 'path'
import dotenv from 'dotenv'

dotenv.config({
  path: path.join(__dirname, '../../.env'),
})

const ENVIRONMENT: string = process.env.PROD_ENV ?? 'development'

console.log('========= STAGING ENV ON APP CONFIG ============')
console.log(process.env.PROD_ENV)
console.log('- ENVIRONTMENT: ', ENVIRONMENT)

export const appConfig = {
  prod: ENVIRONMENT === 'production' ? true : false,
  infuraToken:
    ENVIRONMENT === 'production'
      ? 'bf18b01d017c4dbf8e15a1e633e3c68a'
      : 'b8091fc239d74e67b92711d292ae152a',
  infuraBaseURL:
    ENVIRONMENT === 'production'
      ? 'https://production.infura.io/v3/'
      : 'https://rpc-mumbai.maticvigil.com/',
  minimumUSDCApprovalAmount: 50000,
  jsonFilepathInitials:
    ENVIRONMENT === 'production' ? '../../../public/' : '../../../public/',
  explorerAPIUrl:
    ENVIRONMENT === 'production'
      ? 'https://api.etherscan.io/api'
      : 'https://api-sepolia.arbiscan.io/api',
  fastTrackBlocks: ENVIRONMENT === 'production' ? 6500 : 500,
  requiredGovernorsForProposal: ENVIRONMENT === 'production' ? 33 : 1,
  usdcAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  wethAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  blocksPerDay: 7175,
  astrastakingStartBlockPhase2: 17166145,
  numberofBlocksInYear: 105120000,
  sixDecimalMultiplier: 1000000,
}

export const databaseDetails = {
  DATABASE_NAME:
    ENVIRONMENT === 'production' ? 'ASTRA_DB_PROD' : 'ASTRA_DB_DEV',
  SCHEMA_NAME:
    ENVIRONMENT === 'production'
      ? 'ASTRA_DB_PROD.BLOCKCHAIN'
      : 'ASTRA_DB_DEV.BLOCKCHAIN',
  BETA_USERS: 'BETA_USERS',
  INDICES_DETAILS_LATEST_SNAPSHOT_VIEW: 'INDICES_DETAILS_LATEST_SNAPSHOT_VIEW',
  INDICES_AGGREGATES_LATEST_SNAPSHOT_VIEW:
    'INDICES_AGGREGATES_LATEST_SNAPSHOT_VIEW',
  INDEX_ROI_DTLS_LATEST_VIEW: 'INDEX_ROI_DTLS_LATEST_VIEW',
  TOKEN_ROI_DTLS_LATEST_VIEW: 'TOKEN_ROI_DTLS_LATEST_VIEW',
  INDEX_TOKEN_DETAILS: 'INDEX_TOKEN_DETAILS',
  PROPOSAL_DETAILS_LATEST_VIEW: 'PROPOSAL_DETAILS_LATEST_VIEW',
  PROPOSAL_CREATED_VIEW: 'PROPOSAL_CREATED_VIEW',
  TOP_STAKERS_DETAILS_VIEW: 'TOP_STAKERS_DETAILS_VIEW',
  TOP_STAKERS_LATEST_DETAILS: 'TOP_STAKERS_LATEST_DETAILS',
  INDICES_TRANSACTIONS_VIEW: 'INDICES_TRANSACTIONS_VIEW',
  LP_POOLS_DETAILS_VIEW: 'LP_POOLS_DETAILS_VIEW',
  INDICES_AGGREGATES_LATEST_SNAPSHOT: 'INDICES_AGGREGATES_LATEST_SNAPSHOT',
  PROPOSAL_CASTVOTE_DETAILS: 'PROPOSAL_CASTVOTE_DETAILS',
  DELIST_INDEX: 'DELIST_INDEX',
  STAKINGS_USER_DEPOSIT_DETAILS_VIEW: 'STAKINGS_USER_DEPOSIT_DETAILS_VIEW',
  STAKERS_DETAILS_LATEST_VIEW: 'STAKERS_DETAILS_LATEST_VIEW',
  CLAIMS_TRANSACTIONS_VIEW: 'CLAIMS_TRANSACTIONS_VIEW',
  TRANSACTION: 'TRANSACTION',
  INDEX_DETAILS: 'INDEX_DETAILS',
  ITOKEN_DETAILS: 'ITOKEN_DETAILS',
  PROPOSAL_SIGNATURES: 'PROPOSAL_SIGNATURES',
  INVESTMENT_TOKEN_DETAILS: 'INVESTMENT_TOKEN_DETAILS',
  PROPOSAL_CREATED_DETAILS: 'PROPOSAL_CREATED_DETAILS',
  TOKEN_ROI_DETAILS_LATEST_VIEW: 'TOKEN_ROI_DETAILS_LATEST_VIEW',
  LAUNCHPAD: 'LAUNCHPAD_TEST',
  LAUNCHPAD_DETAIL: 'LAUNCHPAD_DETAIL_TEST',
  CONTRIBUTOR: 'CONTRIBUTOR_TEST',
  INDEX_CUMULATIVE_ROI_VIEW: 'INDEX_CUMULATIVE_ROI_VIEW',
  TOKEN_ROI_DETAILS_LATEST_VIEW_GRAPH: 'TOKEN_ROI_DETAILS_LATEST_VIEW_GRAPH',
  INDEX_RISK_SCORE_PERCENTAGE: 'INDEX_RISK_SCORE_PERCENTAGE',
  LAUNCHPAD_FOLLOWING: 'LAUNCHPAD_FOLLOWING_TEST',
}

console.log('============= DATABASE NAME ON STAGING =============')
console.log(databaseDetails.SCHEMA_NAME)
