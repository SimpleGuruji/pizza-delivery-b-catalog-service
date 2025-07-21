import config from 'config'
import { MessageProducerBroker } from '../types/broker'
import { KafkaProducerBroker } from '../../config/kafka'

let messageProducerBroker: MessageProducerBroker | null = null

export const createMessageProduceBroker = (): MessageProducerBroker => {
    if (!messageProducerBroker) {
        messageProducerBroker = new KafkaProducerBroker('catalog-service', [
            config.get('kafka.brokers'),
        ])
    }
    return messageProducerBroker
}
