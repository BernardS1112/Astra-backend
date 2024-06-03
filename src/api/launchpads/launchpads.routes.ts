// @ts-ignore
import { Router } from 'express'
import { LaunchpadsController } from './launchpads.controller'

const launchpadsRoutes = Router()

launchpadsRoutes.get(`/list`, LaunchpadsController.getLaunchpadList)
launchpadsRoutes.get('/detail', LaunchpadsController.getLaunchpadByIndex)
launchpadsRoutes.post('/addContributor', LaunchpadsController.addContributor)
launchpadsRoutes.post('/request', LaunchpadsController.requestLaunchpad)
launchpadsRoutes.post('/approve', LaunchpadsController.approveLaunchpads)

export { launchpadsRoutes }
