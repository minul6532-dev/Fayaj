import { businessConfig, getOfficeHoursSummary } from '../config/business.js'

export const businessKnowledge = {
  name: businessConfig.companyName,
  phone: businessConfig.phone,
  phoneRaw: businessConfig.phoneRaw,
  email: businessConfig.email,
  address: businessConfig.address,
  founderName: businessConfig.founderName,
  sections: {
    Home: '#home',
    About: '#about',
    Products: '#products',
    Services: '#services',
    Contact: '#contact',
    Location: '#location',
  },
  company: {
    name: businessConfig.companyName,
    activities: ['Export', 'Import', 'Auction Bidding', 'Supplier Connections', 'International Product Sourcing', 'Product Supply'],
  },
  founder: {
    name: businessConfig.founderName,
    designation: 'Founder',
    qualifications: "BSS (Hon's), MSS (CU), LLB (NU)",
  },
  contact: {
    phone: businessConfig.phone,
    phoneRaw: businessConfig.phoneRaw,
    whatsapp: `+${businessConfig.whatsapp}`,
    email: businessConfig.email,
  },
  location: {
    address: businessConfig.address,
    googleMapsUrl: businessConfig.googleMapsUrl,
  },
  officeVisitingHours: getOfficeHoursSummary(),
  categories: businessConfig.products.map(({ name, items }) => ({ name, products: items })),
  services: ['International Product Sourcing', 'Import', 'Export', 'Auction Bidding', 'Supplier Connections', 'Product Supply'],
  faqs: [
    { topic: 'product availability', answerPolicy: 'Catalogue listings are not a guarantee of current stock; ask the team to confirm.' },
    { topic: 'pricing', answerPolicy: 'Prices depend on product and quantity and must be confirmed by the business team.' },
    { topic: 'office visiting hours', answerPolicy: businessConfig.officeSchedule.map(({ day, open, close, closed }) => `${day}: ${closed ? 'Closed' : `${open} – ${close}`}`).join('; ') },
  ],
  sections: {
    Home: '#home',
    About: '#about',
    Products: '#products',
    Services: '#services',
    Contact: '#contact',
    Location: '#location',
  },
}

const banglaProductNames = {
  Ginger: 'আদা',
  Garlic: 'রসুন',
  Chili: 'মরিচ',
  'Wheat Bran': 'Wheat Bran (গরুর ভুষি)',
}
const formatProductCatalogue = (bangla) => {
  const items = businessKnowledge.categories
    .map(({ name, products }, index) => {
      const localizedProducts = products.map((product) => bangla ? banglaProductNames[product] || product : product)
      return `${index + 1}. ${name} — ${localizedProducts.join(', ')}`
    })
    .join('\n')
  return bangla
    ? `অবশ্যই! IRHAM ENTERPRISE-এর ${businessKnowledge.categories.length}টি প্রধান পণ্য বিভাগ হলো:\n\n${items}\n\nআপনি কোন পণ্য বা বিভাগ সম্পর্কে জানতে চান?`
    : `IRHAM ENTERPRISE's catalogue has ${businessKnowledge.categories.length} categories:\n\n${items}\n\nWhich product or category would you like to know more about?`
}
const banglaProductList = formatProductCatalogue(true)
const englishProductList = formatProductCatalogue(false)

const isBangla = (text = '') => /[\u0980-\u09FF]/.test(text)
const isBanglish = (text = '') => /\b(tomader|apnader|apnara|ki|ase|ache|pawa|kothay|kothae|office|pro[dt]uct|dam|daam|founder|protistha|jogajog|khola|thake|lagbe|diben|dao|ache)\b/i.test(text)
const inBangla = (message, history = []) => isBangla(message) || isBanglish(message) || (history.some((entry) => isBangla(entry.content)) && /^(yes|okay|and|price|how much|details)\b/i.test(message))

export function detectLanguage(message = '') {
  if (isBangla(message)) return 'bn'
  if (isBanglish(message)) return 'banglish'
  return 'en'
}

export function isContactQuestion(question = '') {
  return /\b(contact|phone|telephone|call|email|mail|whatsapp)\b|হোয়াটসঅ্যাপ|হোয়াটসঅ্যাপ|নম্বর|নাম্বার|ইমেইল|ফোন|যোগাযোগ/i.test(question)
}

export function isFounderQuestion(question = '') {
  return /\b(founder|who (?:is|founded)|omar)\b|প্রতিষ্ঠাতা|ফাউন্ডার|কে প্রতিষ্ঠা|ওমর/i.test(question)
}

export function isLocationQuestion(question = '') {
  return /\b(location|where|address|office|kothay|kothae)\b|ঠিকানা|কোথায়|কোথায়|অফিস কোথা/i.test(question)
}

export function isOpeningStatusQuestion(question = '') {
  return /\b(open|closed|opening hours|office hours|visiting hours|friday|saturday|khola|khola thake)\b|বন্ধ|খোলা|সময়|সময়|কয়টায়|কতক্ষণ|শুক্রবার|শনিবার|অফিস টাইম|অফিস সময়/i.test(question)
}

export function getOpeningStatus(question = '') {
  const schedule = businessKnowledge.officeVisitingHours
  const message = inBangla(question)
    ? `IRHAM ENTERPRISE-এর নিশ্চিত অফিস ভিজিটিং সময়: ${schedule}।`
    : `IRHAM ENTERPRISE's confirmed office visiting hours are ${schedule}.`
  return { message, link: { label: inBangla(question) ? 'যোগাযোগ করুন' : 'Contact Us', url: businessKnowledge.sections.Contact } }
}

export function getDhakaDateParts(date = new Date()) {
  return { date: date.toISOString() }
}

export function isProductsQuestion(question = '') {
  const text = question.toLocaleLowerCase()
  const includesCatalogueItem = businessKnowledge.categories.some(({ name, products }) => (
    text.includes(name.toLocaleLowerCase())
    || products.some((product) => text.includes(product.toLocaleLowerCase()))
  ))
  return includesCatalogueItem || /(product|catalog|category|categories|supply|provide|offer|available|automotive|electronics|mobile|fruit|computer|technology|laptop|monitor|camera|gaming|peripheral|network|ginger|garlic|chili|cattle|feed|wheat|bran|engine|spare|paint|পণ্য|প্রোডাক্ট|কি কি|কী কী|কোন কোন|আদা|রসুন|মরিচ|ইঞ্জিন|গাড়ি|গাড়ি|ফল|কম্পিউটার|প্রযুক্তি|ল্যাপটপ|মনিটর|ক্যামেরা|গেমিং|নেটওয়ার্ক|নেটওয়ার্ক|সরবরাহ|আছে|ase|ache|ase\?|ki ki|ki ki product|product ase|product ache|pawa jay)/i.test(question)
}

function isUnlistedCategoryQuestion(question = '') {
  return /\b(textile|textiles|garment|garments|fabric|fabrics|apparel|clothes|clothing)\b|টেক্সটাইল|গার্মেন্ট|কাপড়|কাপড়|পোশাক/i.test(question)
}

export function isPriceQuestion(question = '') {
  return /\b(price|pricing|cost|how much|dam|daam)\b|দাম|মূল্য|কত টাকা|কত লাগবে/i.test(question)
}

export function isBusinessActivityQuestion(question = '') {
  return /\b(services?|business activities|what do you do|import|export|auction|supplier connections|international sourcing|product supply)\b|কার্যক্রম|সেবা|আমদানি|রপ্তানি|নিলাম|সরবরাহকারী সংযোগ/i.test(question)
}

export function getProductAnswer(question = '', history = []) {
  const text = String(question || '').toLowerCase()
  const bangla = inBangla(question, history)
  const categoriesRequested = /(all|list|what products|which products|catalog|categories|explore our products|what do you sell|কি কি|কী কী|সব পণ্য|সব প্রোডাক্ট|tomader kache ki|apnader kache ki|product ase|product ache)/i.test(text)
  if (categoriesRequested) return bangla ? banglaProductList : englishProductList

  const mappings = [
    { test: /(computers?|technology|laptops?|monitors?|digital cameras?|gaming accessories|computer peripherals|networking devices|peripherals|networking|কম্পিউটার|প্রযুক্তি|ল্যাপটপ|মনিটর|ক্যামেরা|গেমিং|নেটওয়ার্ক|নেটওয়ার্ক)/i, category: businessKnowledge.categories[5] },
    { test: /(automotive|car engine|spare part|car paint|গাড়ি|গাড়ি|ইঞ্জিন|স্পেয়ার|স্পেয়ার|অটোমোটিভ)/i, category: businessKnowledge.categories[2] },
    { test: /(electronics|mobile|ইলেকট্রনিক|মোবাইল|electronics পাওয়া|electronics পাওয়া)/i, category: businessKnowledge.categories[3] },
    { test: /(fresh fruit|seasonal fruit|fruit|ফল|ফ্রুট)/i, category: businessKnowledge.categories[4] },
    { test: /(sunflower|cattle|wheat|bran|feed|সূর্যমুখী|গরুর ভুষি|ভুষি|খাদ্য)/i, category: businessKnowledge.categories[1] },
    { test: /(agricultural|ginger|garlic|chili|ada|rosun|morich|আদা|রসুন|মরিচ|কৃষি)/i, category: businessKnowledge.categories[0] },
  ]
  const match = mappings.find(({ test: pattern }) => pattern.test(text))
  if (!match) return null

  if (/(quantity|need|want|looking for|interested in|require|order|buy|take|lagbe|dorkar|চাই|নিতে|কেজি|কিলো|টন|লাগবে|প্রয়োজন|প্রয়োজন)/i.test(text)) {
    const quantity = text.match(/(?:\d+|[০-৯]+)\s*(?:kg|kgs|kilo(?:gram)?s?|ton(?:nes?)?|কেজি|কিলো|টন)?/i)?.[0]?.trim()
    return bangla
      ? `আপনার ${quantity ? `${quantity} ` : ''}${match.category.name} পণ্যের প্রয়োজনটি নোট করেছি। পণ্যের বর্তমান মজুত নিশ্চিত নয়; পরিমাণ ও সরবরাহের বিস্তারিত জানতে অনুগ্রহ করে inquiry form দিয়ে আমাদের সঙ্গে যোগাযোগ করুন।`
      : `I understand you need ${quantity ? `${quantity} of ` : ''}a product from ${match.category.name}. Current stock is not confirmed. Please send your quantity and requirements through the inquiry form so our team can confirm.`
  }

  if (bangla) {
    const banglaProducts = {
      'Agricultural Products': 'আদা, রসুন, মরিচ এবং অন্যান্য কৃষিপণ্য',
      'Food & Agricultural Supply': 'Sunflower Oil, Cattle Feed এবং Wheat Bran (গরুর ভুষি)',
      'Automotive Products': 'Car Engines, Car Spare Parts এবং Car Paint',
      'Electronics & Mobile Accessories': 'Mobile Accessories এবং অন্যান্য Electronics Products',
      'Fresh Fruits': 'Imported Fresh Fruits এবং Seasonal Fruits',
      'Computers & Technology Equipment': 'Laptops & Monitors, Digital Cameras, Gaming Accessories, Computer Peripherals এবং Networking Devices',
    }
    return `জি, ${match.category.name} বিভাগে ${banglaProducts[match.category.name]} রয়েছে। বর্তমান মজুত বা সরবরাহের বিস্তারিত জানতে অনুগ্রহ করে আমাদের সঙ্গে যোগাযোগ করুন।`
  }
  return `IRHAM ENTERPRISE lists ${match.category.products.join(', ')} under ${match.category.name}. Please contact our team to confirm current availability and requirements.`
}

export function getKnowledgeAnswer(question = '', history = []) {
  const bangla = inBangla(question, history)
  if (isUnlistedCategoryQuestion(question)) {
    return bangla
      ? `দুঃখিত, এই পণ্যগুলো IRHAM ENTERPRISE-এর বর্তমান পণ্য তালিকায় নেই। আমাদের তালিকাভুক্ত ${businessKnowledge.categories.length}টি বিভাগের কোনো পণ্য সম্পর্কে জানতে চাইলে বলুন।`
      : `Sorry, those items are not currently listed in IRHAM ENTERPRISE’s catalogue. I can help with any of our ${businessKnowledge.categories.length} listed product categories instead.`
  }
  if (isFounderQuestion(question)) {
    return bangla
      ? `IRHAM ENTERPRISE-এর প্রতিষ্ঠাতা হলেন ${businessKnowledge.founder.name}। তাঁর যোগ্যতা: ${businessKnowledge.founder.qualifications}.`
      : `${businessKnowledge.founder.name} is the founder of IRHAM ENTERPRISE. Qualifications: ${businessKnowledge.founder.qualifications}.`
  }
  if (isOpeningStatusQuestion(question)) return getOpeningStatus(question).message
  if (isContactQuestion(question)) {
    if (/(whatsapp|হোয়াটসঅ্যাপ|হোয়াটসঅ্যাপ)/i.test(question)) {
      return bangla ? `আমাদের WhatsApp নম্বর: ${businessKnowledge.contact.phone}` : `Our WhatsApp number is ${businessKnowledge.contact.phone}.`
    }
    if (/(email|mail|ইমেইল)/i.test(question)) {
      return bangla ? `আমাদের ইমেইল: ${businessKnowledge.contact.email}` : `Our email address is ${businessKnowledge.contact.email}.`
    }
    return bangla
      ? `IRHAM ENTERPRISE-এর সঙ্গে যোগাযোগ করুন: ফোন/WhatsApp ${businessKnowledge.contact.phone}, ইমেইল ${businessKnowledge.contact.email}.`
      : `Contact IRHAM ENTERPRISE by phone or WhatsApp at ${businessKnowledge.contact.phone}, or email ${businessKnowledge.contact.email}.`
  }
  if (isLocationQuestion(question)) {
    return bangla
      ? `IRHAM ENTERPRISE-এর অফিসের ঠিকানা: ${businessKnowledge.location.address}`
      : `IRHAM ENTERPRISE's office address is ${businessKnowledge.location.address}`
  }
  if (isPriceQuestion(question)) {
    return bangla
      ? 'পণ্যের দাম নির্দিষ্ট পণ্য ও পরিমাণের ওপর নির্ভর করে। আমাদের কাছে নিশ্চিত মূল্যতথ্য নেই—আপনার প্রয়োজনীয় পণ্য ও পরিমাণ জানালে ব্যবসায়িক দল বিস্তারিত নিশ্চিত করবে।'
      : 'Pricing depends on the product and quantity. I do not have confirmed price information; our business team can confirm it if you share the product and required quantity.'
  }
  if (/(stock|in stock|currently available|available now|brand|specification|origin|country of origin|delivery time|delivery date|minimum order|moq|warranty|certification|license|লাইসেন্স|মজুত|স্টক|ব্র্যান্ড|স্পেসিফিকেশন|উৎপত্তি|ডেলিভারি|ওয়ারেন্টি|ওয়ারেন্টি|সার্টিফিকেট)/i.test(question)) {
    return bangla
      ? 'এই তথ্যটি আমাদের কাছে নিশ্চিতভাবে নেই। পণ্য ও আপনার প্রয়োজনের বিস্তারিত জানালে IRHAM ENTERPRISE-এর ব্যবসায়িক দল সঠিক তথ্য নিশ্চিত করবে।'
      : 'I do not have confirmed information about that detail. Share the product and your requirements, and the IRHAM ENTERPRISE business team can confirm it.'
  }
  if (/(partnership|partner|distribution|distributor|commission|exclusive|contract|agreement|অংশীদার|পার্টনারশিপ|চুক্তি|ডিস্ট্রিবিউশন)/i.test(question)) {
    return bangla
      ? 'IRHAM ENTERPRISE-এর নির্দিষ্ট partnership বা distribution arrangement সম্পর্কে নিশ্চিত তথ্য প্রকাশ করা হয়নি। নিশ্চিত ব্যবসায়িক কার্যক্রম হলো export, import, auction bidding, supplier connections এবং product sourcing ও supply। বিস্তারিত জানতে আমাদের সঙ্গে যোগাযোগ করুন।'
      : 'IRHAM ENTERPRISE has not published confirmed details about partnership or distribution arrangements. Its confirmed activities include export, import, auction bidding, supplier connections, product sourcing and supply. Please contact the team to discuss your proposal.'
  }
  if (isProductsQuestion(question)) {
    const answer = getProductAnswer(question, history)
    if (answer) return answer
  }
  if (isBusinessActivityQuestion(question)) {
    return bangla
      ? 'IRHAM ENTERPRISE-এর ব্যবসায়িক কার্যক্রমের মধ্যে রয়েছে Export, Import, Auction Bidding, Supplier Connections, International Product Sourcing এবং Product Supply. বিস্তারিত জানতে আমাদের সঙ্গে যোগাযোগ করুন।'
      : 'IRHAM ENTERPRISE works in export, import, auction bidding, supplier connections, international product sourcing and product supply. Contact our team to discuss your requirements.'
  }
  if (/\b(hello|hi|hey)\b|হ্যালো|আসসালামু আলাইকুম|সালাম/i.test(question)) {
    return bangla
      ? 'ওয়ালাইকুম আসসালাম! IRHAM ENTERPRISE-এর পণ্য, আমদানি-রপ্তানি বা ব্যবসায়িক সেবা সম্পর্কে কী জানতে চান?'
      : 'Hello! How can I help with IRHAM ENTERPRISE products, import/export or business services?'
  }
  const isBusinessQuery = /\b(business|company|product|supply|import|export|supplier|founder|price|stock|availability|delivery|origin|brand|specification|warranty|certification|partnership|inquiry|quote|computer|technology|laptop|monitor|camera|gaming|peripheral|network)\b|অফিস|প্রতিষ্ঠান|ব্যবসা|পণ্য|দাম|মজুত|সরবরাহ|যোগাযোগ|আমদানি|রপ্তানি|প্রতিষ্ঠাতা|কম্পিউটার|প্রযুক্তি|ল্যাপটপ|মনিটর|ক্যামেরা|গেমিং|নেটওয়ার্ক|নেটওয়ার্ক/i.test(question)
  if (isBusinessQuery) return null
  return bangla
    ? 'আমি IRHAM ENTERPRISE-এর পণ্য ও ব্যবসায়িক অনুসন্ধানে সহায়তা করি। আমাদের পণ্য, আমদানি-রপ্তানি বা ব্যবসায়িক যোগাযোগ নিয়ে কী জানতে চান?'
    : 'I focus on IRHAM ENTERPRISE products and business inquiries. What would you like to know about our products, import/export services or contacting the team?'
}

export function getContactResponse() {
  return {
    message: `Contact IRHAM ENTERPRISE by phone or WhatsApp at ${businessKnowledge.contact.phone}, or email ${businessKnowledge.contact.email}.`,
    link: { label: 'Contact IRHAM ENTERPRISE', url: businessKnowledge.sections.Contact },
  }
}

export function getLocationResponse() {
  return {
    message: `IRHAM ENTERPRISE is located at ${businessKnowledge.location.address}`,
    link: { label: 'View Location', url: businessKnowledge.sections.Location },
  }
}
