import { Router } from 'express'
import { ProposalsController } from './proposals.controller'

const proposalsRoutes = Router()

// ROUTE: 'proposals/*'
proposalsRoutes.get(`/`, ProposalsController.getProposals)
proposalsRoutes.get(`/:proposalId`, ProposalsController.getProposalsDetails)
proposalsRoutes.get(`/APY/details`, ProposalsController.getAPYPerc)

proposalsRoutes.get(`/apy`, ProposalsController.getAPY)
proposalsRoutes.get(`/getVoters/:proposalId`, ProposalsController.getVoters)

export { proposalsRoutes }
