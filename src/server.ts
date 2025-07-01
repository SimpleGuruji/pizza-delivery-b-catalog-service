import config from 'config'
import app from './app'
import logger from './config/logger'
import { initDb } from './config/db'

const startServer = async () => {
    const port: number = config.get('server.port') || 5502

    try {
        await initDb()
        logger.info('Database connection established.')
        app.listen(port, () => logger.info(`Server running  on port ${port}.`))
    } catch (error) {
        console.error('Error starting server', error)
        process.exit(1)
    }
}

void startServer()
