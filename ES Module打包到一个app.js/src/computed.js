export default function (...rest) {
    return rest.reduce((prev, current, index, array) => {
        return prev + current
    })
}