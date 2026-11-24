const productCatalog = [
  { category: 'AGRICULTURAL PRODUCTS', name: 'Agricultural Products', image: '/images/products/agricultural-products.png', description: 'Fresh agricultural products sourced to meet local and international market requirements.', items: ['Ginger', 'Garlic', 'Chili', 'Fresh Agricultural Products'] },
  { category: 'FOOD & AGRICULTURAL SUPPLY', name: 'Food & Agricultural Supply', image: '/images/products/food-agricultural-supply.png', description: 'Food and agricultural supply products for commercial, agricultural and livestock requirements.', items: ['Sunflower Oil', 'Cattle Feed', 'Wheat Bran'] },
  { category: 'AUTOMOTIVE PRODUCTS', name: 'Automotive Products', image: '/images/products/automotive-products.png', description: 'Automotive components, engines, spare parts and car paint for diverse vehicle requirements.', items: ['Car Engines', 'Car Spare Parts', 'Car Paint'] },
  { category: 'ELECTRONICS & MOBILE ACCESSORIES', name: 'Electronics & Mobile Accessories', image: '/images/products/electronics-mobile.png', description: 'Mobile accessories and selected electronic products for everyday and commercial requirements.', items: ['Mobile Accessories', 'Other Electronics Products'] },
  { category: 'FRESH FRUIT', name: 'Fresh Fruits', image: '/images/products/fresh-fruits.png', description: 'Fresh fruit sourcing and seasonal product supply for different market requirements.', items: ['Imported Fresh Fruits', 'Seasonal Fruits'] },
  { category: 'COMPUTERS & TECHNOLOGY EQUIPMENT', name: 'Computers & Technology Equipment', image: 'picture/img6.png', description: 'Computer equipment, digital devices and technology accessories for personal and commercial requirements.', items: ['Laptops & Monitors', 'Digital Cameras', 'Gaming Accessories', 'Computer Peripherals', 'Networking Devices'] },
]

const officeSchedule = [
  { day: 'Saturday', open: '9:30 AM', close: '10:00 PM', closed: false },
  { day: 'Sunday', open: '9:30 AM', close: '10:00 PM', closed: false },
  { day: 'Monday', open: '9:30 AM', close: '10:00 PM', closed: false },
  { day: 'Tuesday', open: '9:30 AM', close: '10:00 PM', closed: false },
  { day: 'Wednesday', open: '9:30 AM', close: '10:00 PM', closed: false },
  { day: 'Thursday', open: '9:30 AM', close: '10:00 PM', closed: false },
  { day: 'Friday', open: null, close: null, closed: true },
]

const unconfirmedOfficeHoursMessage = 'Please contact us to confirm visiting hours.'

export const businessConfig = {
  companyName: 'IRHAM ENTERPRISE',
  founderName: 'Omar Fayaj Chy',
  phone: '+88 01815-677521',
  phoneRaw: '+8801815677521',
  whatsapp: '8801815677521',
  email: 'enterpriseirham@gmail.com',
  address: '7th Floor, Orient Tower, North Laldigi, Kotowali, Chattogram, Bangladesh.',
  addressLines: [
    '7th Floor, Orient Tower',
    'North Laldigi, Kotowali',
    'Chattogram, Bangladesh.',
  ],
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=7th%20Floor%20Orient%20Tower%20North%20Laldigi%20Kotowali%20Chattogram%20Bangladesh',
  officeSchedule,
  products: productCatalog,
  categories: productCatalog.map(({ name }) => name),
}

export function getOfficeDayHoursLabel({ open, close, closed }) {
  if (closed === true) return 'Closed'
  if (typeof open === 'string' && open.trim() && typeof close === 'string' && close.trim()) {
    return `${open.trim()} – ${close.trim()}`
  }
  return 'Contact to confirm'
}

export function getOfficeHoursSummary(schedule = businessConfig.officeSchedule) {
  if (!schedule.length) return unconfirmedOfficeHoursMessage

  const unconfirmedDays = schedule.filter((day) => getOfficeDayHoursLabel(day) === 'Contact to confirm').length
  if (unconfirmedDays === schedule.length) return unconfirmedOfficeHoursMessage
  if (unconfirmedDays > 0) {
    const confirmedDays = schedule.length - unconfirmedDays
    return `${confirmedDays} of ${schedule.length} days confirmed · contact us to confirm remaining hours`
  }

  const openDays = schedule.filter((day) => day.closed !== true)
  const closedDays = schedule.filter((day) => day.closed === true)
  if (!openDays.length) return 'Closed all week'

  const hours = new Set(openDays.map(getOfficeDayHoursLabel))
  const closedSummary = closedDays.length
    ? ` · ${closedDays.map(({ day }) => `${day} closed`).join(', ')}`
    : ''
  if (hours.size > 1) return `See weekly schedule below${closedSummary}`

  const openIndexes = openDays.map((day) => schedule.indexOf(day))
  const isContiguous = openIndexes.every((index, position) => position === 0 || index === openIndexes[position - 1] + 1)
  const scheduleLabel = openDays.length === 7
    ? 'Daily'
    : isContiguous && openDays.length > 1
      ? `${openDays[0].day}–${openDays[openDays.length - 1].day}`
      : openDays.map(({ day }) => day).join(', ')
  return `${scheduleLabel} · ${hours.values().next().value}${closedSummary}`
}
