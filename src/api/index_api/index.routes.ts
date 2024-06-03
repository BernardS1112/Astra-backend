import { Router } from 'express'
import { IndexController } from './index.controller'

const indexRoutes = Router()

// ROUTE: 'index/*'
indexRoutes.get(
  `/delistAnIndex/:indexId/:iTokenAddress/:delistDate`,
  IndexController.addUpdateDelistIndex
)

indexRoutes.get(`/coinGeckoPrice`, IndexController.coinGeckoPrice)

export { indexRoutes }
