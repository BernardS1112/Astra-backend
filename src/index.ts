import app from './App'
import { Request, Response, NextFunction } from 'express'

const port = Number(process?.env.PORT || 3000)

const logger = (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const { method, url, ip } = req
  console.log(`
          ${timestamp}
          ${method} ${url}
          ${ip}`)
  next()
}

app.use(logger)
app.listen(port, '', () => {
  return console.error(`server is listening on port ${port}`)
})
