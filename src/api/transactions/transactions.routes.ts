import { Router } from 'express'
import { TransactionsController } from './transactions.controller'

const transactionsRoutes = Router()

// ROUTE: 'transactions/*'
transactionsRoutes.get(
  `/:userAddress`,
  TransactionsController.getUserTransactions
)
transactionsRoutes.get(
  `/liquidity/mining/details`,
  TransactionsController.getLiquidityMiningDetails
)
transactionsRoutes.get(
  `/claim/:walletAddress`,
  TransactionsController.listOfClaimTransactions
)

export { transactionsRoutes }
