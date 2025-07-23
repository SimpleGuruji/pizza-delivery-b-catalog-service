import { PriceConfigurationValue } from './product/poduct.types'

// Define a type for the object that can contain nested structures
type MappedObject = {
    [key: string]: PriceConfigurationValue | MappedObject
}

export function mapToObject(
    input:
        | Map<string, PriceConfigurationValue>
        | { [key: string]: PriceConfigurationValue },
): MappedObject {
    if (input instanceof Map) {
        const obj: MappedObject = {}
        for (const [key, value] of input) {
            obj[key] = value instanceof Map ? mapToObject(value) : value
        }
        return obj
    } else {
        // If it's already a plain object, return it as is (or process if needed)
        return input as MappedObject
    }
}
