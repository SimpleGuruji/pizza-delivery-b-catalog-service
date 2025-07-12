import {
    v2 as cloudinary,
    UploadApiResponse,
    UploadApiErrorResponse,
} from 'cloudinary'
import config from 'config'
import { FileData, FileStorage } from '../types/storage'
import createHttpError from 'http-errors'
import logger from '../../config/logger'

export class CloudinaryStorage implements FileStorage {
    constructor() {
        cloudinary.config({
            cloud_name: config.get('cloudinary.cloud_name'),
            api_key: config.get('cloudinary.api_key'),
            api_secret: config.get('cloudinary.api_secret'),
        })
    }

    async upload(data: FileData): Promise<void> {
        try {
            const buffer = data.fileData

            // Upload to Cloudinary using upload_stream with proper types
            await new Promise<void>((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            public_id: data.filename,
                            resource_type: 'auto',
                        },
                        (
                            error: UploadApiErrorResponse | undefined,
                            result: UploadApiResponse | undefined,
                        ) => {
                            if (error) {
                                reject(
                                    createHttpError(
                                        500,
                                        `Cloudinary upload failed: ${error.message}`,
                                    ),
                                )
                            } else if (result) {
                                resolve()
                            } else {
                                reject(
                                    createHttpError(
                                        500,
                                        'Cloudinary upload failed: No result returned',
                                    ),
                                )
                            }
                        },
                    )
                    .end(buffer)
            })
        } catch (error) {
            if (error instanceof Error) {
                throw createHttpError(
                    500,
                    `Failed to upload file to Cloudinary: ${error.message}`,
                )
            }
            throw createHttpError(
                500,
                'Failed to upload file to Cloudinary: Unknown error',
            )
        }
    }

    async delete(filename: string): Promise<void> {
        try {
            if (!filename) {
                throw createHttpError(400, 'Filename is required for deletion')
            }

            // Ensure the filename is properly formatted
            if (typeof filename !== 'string' || filename.trim() === '') {
                throw createHttpError(400, 'Invalid filename provided')
            }

            // Attempt to delete the file from Cloudinary
            const result = (await cloudinary.uploader.destroy(filename, {
                resource_type: 'image',
            })) as UploadApiResponse | UploadApiErrorResponse

            // Check if deletion was successful
            if (result.result === 'ok') {
                logger.info(
                    `File deleted successfully from Cloudinary: ${filename}`,
                )
                return
            } else if (result.result === 'not found') {
                logger.info(`File not found in Cloudinary: ${filename}`)
                // If the file was not found,
                return
            } else {
                throw createHttpError(
                    500,
                    `Failed to delete file from Cloudinary. Result: ${result.result}`,
                )
            }
        } catch (error) {
            // Handle Cloudinary API errors
            if (error instanceof Error) {
                throw createHttpError(
                    500,
                    `Failed to delete file from Cloudinary: ${error.message}`,
                )
            }

            // Handle unknown errors
            throw createHttpError(
                500,
                `Failed to delete file from Cloudinary: Unknown error - ${JSON.stringify(error)}`,
            )
        }
    }

    getObjectUri(filename: string): string {
        // Example output:
        // https://res.cloudinary.com/<cloud-name>/image/upload/5962624d-1b9e-4c96-b1d6-395ca9ef4933

        const cloudName = config.get('cloudinary.cloud_name')

        if (typeof cloudName === 'string') {
            return `https://res.cloudinary.com/${cloudName}/image/upload/${filename}`
        }

        const error = createHttpError(500, 'Invalid Cloudinary configuration')
        throw error
    }
}
