export const dbConfig = {
  prodConfig: {
    account: 'bta69289.us-east-1',
    username: 'ASTRA_DI_USER',
    password: 'Astra123#',
    database: 'ASTRA_DB_PROD',
    schema: 'BLOCKCHAIN',
    warehouse: 'TM_DI_WH',
    clientSessionKeepAlive: true,
  },
  devConfig: {
    account: 'bta69289.us-east-1',
    username: 'ASTRA_DI_USER',
    password: 'Astra123#',
    database: 'ASTRA_DB_DEV',
    schema: 'BLOCKCHAIN',
    warehouse: 'TM_DI_WH',
    clientSessionKeepAlive: true,
  },
}

export enum Schema {
  TOKENMETRICS = 'TOKENMETRICS',
  BLOCKCHAIN = 'BLOCKCHAIN',
}

export enum Database {
  ASTRA_DB_DEV = 'ASTRA_DB_PROD',
}

export enum Endpoints {
  // INDICES ENDPOINTS
  INDICES_PRICE_DAILY_SNAPSHOT_VIEW = 'INDICES_PRICE_DAILY_SNAPSHOT_VIEW',
  INDICES_LATEST_SNAPSHOT_VIEW = 'INDICES_LATEST_SNAPSHOT_VIEW',
  INDEX_BTC_VALUE_DAILY_SNAPSHOT_VIEW = 'INDEX_BTC_VALUE_DAILY_SNAPSHOT_VIEW',
  TOKEN_INFO_REF_ARBI = 'TOKEN_INFO_REF_ARBI',
  INDICES_DETAILS_LATEST_SNAPSHOT_VIEW = 'INDICES_DETAILS_LATEST_SNAPSHOT_VIEW',
}
