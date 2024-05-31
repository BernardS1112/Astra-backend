import { Router } from 'express'
import { CheckIPController } from './checkip.controller'

const checkIPRoutes = Router()

checkIPRoutes.get('/', CheckIPController.checkip)

export { checkIPRoutes }
