import { Router } from 'express'
import { UsersController } from '.'

const usersRoutes = Router()

// ROUTE: 'users/*'
// usersRoutes.get(
//   `/gaseless/vote/:proposalId/:walletAddress/:signature/:sigV/:sigR/:sigS/:support`,
//   SignaturesController.saveGaselessVoteSignature
// )
// usersRoutes.get(`/:proposalId`, SignaturesController.users)
usersRoutes.get(`/subscribe/:email`, UsersController.addEmail)
usersRoutes.get(`/:userAddress/indices`, UsersController.getUserIndices)

export { usersRoutes }
