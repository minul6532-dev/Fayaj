import test from 'node:test'
import assert from 'node:assert/strict'

import {
  businessConfig,
  getOfficeDayHoursLabel,
  getOfficeHoursSummary,
} from '../src/config/business.js'

test('office schedule displays the confirmed weekly hours', () => {
  assert.deepEqual(
    businessConfig.officeSchedule.map(({ day }) => day),
    ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  )
  assert.ok(businessConfig.officeSchedule.slice(0, 6).every((day) => getOfficeDayHoursLabel(day) === '9:30 AM – 10:00 PM'))
  assert.equal(getOfficeDayHoursLabel(businessConfig.officeSchedule[6]), 'Closed')
  assert.equal(getOfficeHoursSummary(), 'Saturday–Thursday · 9:30 AM – 10:00 PM · Friday closed')
})

test('null schedule times are not treated as closed', () => {
  const friday = { day: 'Friday', open: null, close: null, closed: false }

  assert.equal(friday.closed, false)
  assert.equal(getOfficeDayHoursLabel(friday), 'Contact to confirm')
})

test('configured open times and explicit closures update day labels and summary', () => {
  const schedule = businessConfig.officeSchedule.map((day) => (
    day.day === 'Friday'
      ? { ...day, closed: true }
      : { ...day, open: '9:00 AM', close: '5:00 PM' }
  ))

  assert.equal(getOfficeDayHoursLabel(schedule[0]), '9:00 AM – 5:00 PM')
  assert.equal(getOfficeDayHoursLabel(schedule[6]), 'Closed')
  assert.equal(getOfficeHoursSummary(schedule), 'Saturday–Thursday · 9:00 AM – 5:00 PM · Friday closed')
})
