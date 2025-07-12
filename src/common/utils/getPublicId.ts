export const getPublicId = (url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/)
    return match ? match[1] : null
}
