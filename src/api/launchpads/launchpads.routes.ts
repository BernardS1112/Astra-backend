// @ts-ignore
import { Router } from 'express'
import { LaunchpadsController } from './launchpads.controller'

const launchpadsRoutes = Router()

launchpadsRoutes.get(`/list`, LaunchpadsController.getLaunchpadList)
launchpadsRoutes.get(
  `/participatedList`,
  LaunchpadsController.getParticipatedLaunchpadList
)
launchpadsRoutes.get('/detail', LaunchpadsController.getLaunchpadByIndex)
launchpadsRoutes.get('/detailById', LaunchpadsController.getLaunchpadById)
launchpadsRoutes.get(
  '/contributorList',
  LaunchpadsController.getContributorList
)
launchpadsRoutes.post('/addContributor', LaunchpadsController.addContributor)
launchpadsRoutes.post('/request', LaunchpadsController.requestLaunchpad)
launchpadsRoutes.post('/update', LaunchpadsController.updateLaunchpad)
launchpadsRoutes.post('/approve', LaunchpadsController.approveLaunchpads)
launchpadsRoutes.post('/follow', LaunchpadsController.followAddress)
launchpadsRoutes.post(
  '/deleteFollowAddress',
  LaunchpadsController.deleteAddress
)
launchpadsRoutes.post(
  '/updateVestAddress',
  LaunchpadsController.updateVestAddress
)
launchpadsRoutes.get('/follow/check', LaunchpadsController.getFollowingData)
launchpadsRoutes.post('/finish', LaunchpadsController.finishLaunchpad)
launchpadsRoutes.post('/delete', LaunchpadsController.deleteLaunchpad)

launchpadsRoutes.post(
  '/getWeightedAverageMultiplier',
  LaunchpadsController.getWeightedAverageMultiplier
)

export { launchpadsRoutes }
