import { Router } from 'express'
import { PoolsController } from './pools.controller'

const poolsRoutes = Router()

// ROUTE: 'pools/*'
poolsRoutes.get(`/liquidity`, PoolsController.getAllPools)

export { poolsRoutes }
