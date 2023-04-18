const minute = 13
const hour = 12

// for testing
const schedule = [
    // year, month, day, hours, minutes, seconds, ms
    new Date(2023, 03, 18, hour, minute+1, 0, 0),
    new Date(2023, 03, 18, hour, minute+1, 20, 0),
    new Date(2023, 03, 18, hour, minute+1, 40, 0),
    new Date(2023, 03, 18, hour, minute+2, 00, 0)
]

module.exports = {
    schedule
}