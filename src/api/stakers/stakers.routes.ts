import { Router } from 'express'
import { StakersController } from './stakers.controller'

const stakersRoutes = Router()

// ROUTE: 'stakers/*'
stakersRoutes.get(`/top`, StakersController.getTopStakers)
stakersRoutes.get(`/pools/top`, StakersController.getTopStakersFromAllPools)

export { stakersRoutes }
