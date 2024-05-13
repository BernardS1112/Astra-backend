import { Router } from 'express'
import { ITokensController } from './itokens.controller'

const itokensRoutes = Router()

// ROUTE: 'itokens/*'
itokensRoutes.get(`/info`, ITokensController.getITokenTotStaking)
itokensRoutes.get("/pendingBalance", ITokensController.getPendingBalance);

export { itokensRoutes }
