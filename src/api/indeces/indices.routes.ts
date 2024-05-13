import { Router } from 'express'
import { IndicesController } from './indices.controller'

const indicesRoutes = Router()

// ROUTE: 'indeces/*'
indicesRoutes.get(`/`, IndicesController.allIndices)
indicesRoutes.get(`/paginated`, IndicesController.allIndicesPaginated)

// TODO: Create necessarry controllers.
indicesRoutes.get(`/mostInvested`, IndicesController.mostInvested)
indicesRoutes.get(`/highestEarner`, IndicesController.highestEarner)
indicesRoutes.get(`/lowestRisk`, IndicesController.lowestRisk)

indicesRoutes.get(`/indicesBTCPriceDaily`, IndicesController.indicesPriceDaily)
indicesRoutes.get(
  `/indicesLatestSnapshot`,
  IndicesController.indicesLatestSnapshot
)
indicesRoutes.get(`/indexBTCDailyPrice`, IndicesController.indexBTCPriceDaily)
indicesRoutes.get(
  `/indicesDetailsLatest`,
  IndicesController.indicesDetailsLatest
)
indicesRoutes.get(`/categories/`, IndicesController.getIndexByCategory)
indicesRoutes.get(
  `/tokens/:iTokenAddress`,
  IndicesController.getTokensOfIndices
)
indicesRoutes.get(
  `/performance/:iTokenAddress/dates`,
  IndicesController.indexChartDataDates
)
indicesRoutes.get(
  `/performance/:iTokenAddress`,
  IndicesController.indexChartData
)
indicesRoutes.get(`/:iTokenAddress`, IndicesController.getIndex)

export { indicesRoutes }
