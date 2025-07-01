import config from 'config'
import app from './app'
import logger from './config/logger'

const startServer = () => {
    const port: number = config.get('server.port') || 5502

    try {
        app.listen(port, () => logger.info(`Server running  on port ${port}.`))
    } catch (error) {
        console.error('Error starting server', error)
        process.exit(1)
    }
}

startServer()
