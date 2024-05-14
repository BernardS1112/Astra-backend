import express, { Application } from 'express'
import cors from 'cors'
import bodyparser from 'body-parser'
import cron from 'node-cron'
import { appConfig } from './config/app.config'
import {
  ProposalsController,
  TokensController,
  TransactionsController,
  indexRoutes,
  indicesRoutes,
  itokensRoutes,
  poolsRoutes,
  proposalsRoutes,
  signaturesRoutes,
  stakersRoutes,
  tokensRoutes,
  transactionsRoutes,
  usersRoutes,
  launchpadsRoutes,
} from './api'
import { SnowflakeServiceAbstract } from './lib/snowflake'
import dotenv from 'dotenv'
import path from 'path'
import { configureChains, createConfig } from '@wagmi/core'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'
import { arbitrum } from 'viem/chains'
import { chainConfigs } from './config/chain.config'
import axios from 'axios'

class App {
  public express: Application
  public db: SnowflakeServiceAbstract

  constructor() {
    dotenv.config({
      path: path.join(
        __dirname,
        `../.env.${process.env.NODE_ENV ? process.env.NODE_ENV : 'development'}`
      ),
    })
    this.express = express()
    this.express.use(
      cors({
        origin: '*',
      })
    )
    this.initRouters()
    this.cronJobs()
    this.db = new SnowflakeServiceAbstract()

    const { publicClient, webSocketPublicClient } = configureChains(
      [arbitrum],
      [
        jsonRpcProvider({
          rpc: (chain) => ({
            webSocket: chainConfigs[chain.id].chainStackWS,
            http: chainConfigs[chain.id].chainStackHTTPS,
          }),
        }),
        publicProvider(),
      ]
    )
    createConfig({
      autoConnect: true,
      publicClient,
      webSocketPublicClient,
    })
    axios.interceptors.request.use((config) => {
      if (
        config.url &&
        config.url.startsWith('https://pro-api.coingecko.com/')
      ) {
        config.headers['x-cg-pro-api-key'] = process.env.COINGECKO_API_KEY
        if (!appConfig.prod) config.url.replace('pro-api', 'api')
      }
      return config
    })

  }

  private async initRouters(): Promise<void> {
    this.express.use(bodyparser.json())
    this.express.use('/proposals', proposalsRoutes)
    this.express.use('/pools', poolsRoutes)
    this.express.use('/tokens', tokensRoutes)
    this.express.use('/indices', indicesRoutes)
    this.express.use('/itokens', itokensRoutes)
    this.express.use('/index', indexRoutes)
    this.express.use('/stakers', stakersRoutes)
    this.express.use('/transactions', transactionsRoutes)
    this.express.use('/signatures', signaturesRoutes)
    this.express.use('/users', usersRoutes)
    this.express.use('/public', express.static('public'))
    this.express.use('/launchpads', launchpadsRoutes)
  }

  private async cronJobs(): Promise<void> {
    if (appConfig.prod) {
      cron.schedule('*/15 * * * * ', async (): Promise<void> => {
        TokensController.updateAPRFile()
      })
      cron.schedule('*/40 * * * * ', async () => {
        TransactionsController.updateLiquidityMiningFile()
      })
      cron.schedule('*/5 * * * * ', async () => {
        ProposalsController.updateProposalEndTime()
      })
    } else {
      cron.schedule('*/* 1 * * * ', async () => {
        ProposalsController.updateProposalEndTime()
      })
    }
    cron.schedule('*/1 * * * * ', async (): Promise<void> => {
      TokensController.updateAstraPrice()
    })
    // cron.schedule('*/1 * * * * ', async (): Promise<void> => {
    //  IndicesController.updateProposalEndTime();
    // })

    // IndicesController.updateTokenListJson();

    // IndicesController.prepareuniswapv3PairAddresses();
    // IndicesController.prepareuniswapv2PairAddresses();
    // IndicesController.preparesushiswapPairAddresses();
    // IndicesController.prepareUSDCValidatedTokenData();
    // IndicesController.sortTokens();
  }
}

const { express: appExpress, db } = new App()

export { db }
export default appExpress
