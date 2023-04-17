const static = 21
const hour = 16

// for testing
const schedule = [
    // year, month, day, hours, minutes, seconds, ms
    new Date(2023, 03, 17, hour, static+1, 0, 0),
    new Date(2023, 03, 17, hour, static+1, 10, 0),
    new Date(2023, 03, 17, hour, static+1, 20, 0),
    new Date(2023, 03, 17, hour, static+1, 30, 0)
]

module.exports = {
    schedule
}