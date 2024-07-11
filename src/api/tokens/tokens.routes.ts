import { Router } from 'express'
import { TokensController } from './tokens.controller'

const tokensRoutes = Router()

// ROUTE: 'tokens/*'
tokensRoutes.get(`/`, TokensController.tokenlist)
tokensRoutes.get(`/all`, TokensController.uniswapTokensList)
tokensRoutes.get(`/tokenDetail`, TokensController.uniswapTokenDetail)
tokensRoutes.get(`/astra/price`, TokensController.getAstraPrice)
tokensRoutes.get(`/investment`, TokensController.investmentTokens)
tokensRoutes.get(`/:contractAddress`, TokensController.tokenInfo)

export { tokensRoutes }
