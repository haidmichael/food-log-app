// Local-timezone date helpers. Always use these for "what day is it" / date
// math on the client — `new Date().toISOString()` reports the UTC date, which
// rolls over hours before local midnight and silently logs food to the wrong day.

export function toDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function getToday() {
    return toDateString(new Date())
}

export function addDays(dateStr, days) {
    const date = new Date(dateStr + 'T12:00:00')
    date.setDate(date.getDate() + days)
    return toDateString(date)
}
