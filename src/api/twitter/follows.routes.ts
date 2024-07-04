import { Router } from 'express'
import { FollowsController } from './follows.controller'
const followsRoutes = Router()

followsRoutes.get(
  `/`,
  FollowsController.index
)

followsRoutes.post(
  `/login`,
  FollowsController.loginTwitter
)

followsRoutes.get(
  `/callback`,
  FollowsController.callback
)

export { followsRoutes }