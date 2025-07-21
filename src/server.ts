import config from 'config'
import app from './app'
import logger from './config/logger'
import { initDb } from './config/db'
import { MessageProducerBroker } from './common/types/broker'
import { createMessageProduceBroker } from './common/factories/broker.factory'

const startServer = async () => {
    const port: number = config.get('server.port') || 5502
    let messageProducerBroker: MessageProducerBroker | null = null

    try {
        await initDb()
        logger.info('Database connection established.')

        messageProducerBroker = createMessageProduceBroker()
        await messageProducerBroker.connect()

        logger.info('Kafka connection established.')

        app.listen(port, () => logger.info(`Server running  on port ${port}.`))
    } catch (error) {
        if (error instanceof Error) {
            if (messageProducerBroker) {
                await messageProducerBroker.disconnect()
            }
            logger.error(error.message)
        }
        process.exit(1)
    }
}

void startServer()
