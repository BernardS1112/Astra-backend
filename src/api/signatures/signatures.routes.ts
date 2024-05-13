import { Router } from 'express'
import { SignaturesController } from './signatures.controller'

const signaturesRoutes = Router()

// ROUTE: 'signatures/*'
signaturesRoutes.get(
  `/gaseless/vote/:proposalId/:walletAddress/:signature/:sigV/:sigR/:sigS/:support`,
  SignaturesController.saveGaselessVoteSignature
)
signaturesRoutes.get(`/:proposalId`, SignaturesController.signatures)
export { signaturesRoutes }
