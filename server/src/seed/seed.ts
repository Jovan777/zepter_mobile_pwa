import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { Category } from '../modules/categories/category.model';
import { Client } from '../modules/clients/client.model';
import { Offer } from '../modules/offers/offer.model';
import { Order } from '../modules/orders/order.model';
import { Product } from '../modules/products/product.model';
import { Region } from '../modules/regions/region.model';
import { User } from '../modules/users/user.model';
import { Wishlist } from '../modules/wishlist/wishlist.model';
import { ZepterClubPlan } from '../modules/zepter-club/zepterClub.model';
import { createPublicId } from '../utils/publicId';

function makeSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, locale: 'sr' });
}

const image = (name: string) => `/assets/images/products/${name}`;
const banner = (name: string) => `/assets/images/banners/${name}`;

const categories = [
  {
    publicId: 'CAT-CLEANING',
    name: 'Sistemi za čišćenje',
    slug: 'sistemi-za-ciscenje',
    description: 'Uređaji i dodaci za čišćenje i zdraviji dom.',
    imageUrl: banner('therapy-air-ion-banner.jpg'),
    sortOrder: 1,
    isFeatured: true
  },
  {
    publicId: 'CAT-AIR',
    name: 'Prečišćavanje vazduha',
    slug: 'preciscavanje-vazduha',
    description: 'TherapyAir i MyIon uređaji za kvalitetniji vazduh.',
    imageUrl: banner('therapy-air-ion-banner.jpg'),
    sortOrder: 2,
    isFeatured: true
  },
  {
    publicId: 'CAT-WATER',
    name: 'Prečišćavanje vode',
    slug: 'preciscavanje-vode',
    description: 'Aqueena i Edel Wasser sistemi za vodu.',
    imageUrl: banner('edelwasser-new-banner-mobile.jpg'),
    sortOrder: 3,
    isFeatured: true
  },
  {
    publicId: 'CAT-BIOPTRON',
    name: 'Bioptron',
    slug: 'bioptron',
    description: 'Svetlosna terapija i medicinski uređaji.',
    imageUrl: banner('bioptron.jpg'),
    sortOrder: 4,
    isFeatured: true
  },
  {
    publicId: 'CAT-HYPERLIGHT',
    name: 'Hyperlight Optics®',
    slug: 'hyperlight-optics',
    description: 'Hyperlight naočare i optika.',
    imageUrl: banner('hyperlight-aviator-black-1.jpg'),
    sortOrder: 5,
    isFeatured: true
  },
  {
    publicId: 'CAT-COOKWARE',
    name: 'Posuđe',
    slug: 'posudje',
    description: 'Zepter setovi posuđa i kuhinjska oprema.',
    imageUrl: banner('porcelain-banner-mobile-gray.jpg'),
    sortOrder: 6,
    isFeatured: true
  }
];

const products = [
  {
    publicId: 'PRD-MYIONZ-PRO',
    name: 'Nosivi sterilizator vazduha MyIonZ® Pro',
    code: 'MYIONZ-PRO',
    categorySlug: 'preciscavanje-vazduha',
    categoryName: 'Prečišćavanje vazduha',
    images: [image('myionz-pro.png'), image('myionz-pro-2.png')],
    badges: ['Najprodavanije'],
    shortDescription: 'Nosivi sterilizator vazduha za ličnu zaštitu i svakodnevnu upotrebu.',
    description: 'MyIonZ® Pro je kompaktan uređaj za ličnu zonu vazduha, namenjen korisnicima koji žele mobilno rešenje za zdravije okruženje.',
    presentation: 'Predstavlja moderno, nosivo rešenje za korisnike koji žele da kombinuju mobilnost, zaštitu i jednostavnost upotrebe.',
    historyDetails: 'Proizvod pripada liniji Zepter rešenja za kvalitet vazduha i zdraviji životni prostor.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'MYIONZ-PRO' },
      { label: 'PRIMENA', value: 'Lična zona vazduha i mobilna upotreba' }
    ],
    prices: { retail: 22420, clubMember: 21523, clubPartner: 20178 },
    discounts: { clubMemberPercent: 4, clubPartnerPercent: 10 },
    currency: 'RSD',
    isFeatured: true,
    isNew: false,
    sortOrder: 1
  },
  {
    publicId: 'PRD-THERAPYAIR-SMART',
    name: 'PREČIŠĆIVAČ VAZDUHA - THERAPYAIR® SMART',
    code: 'TA-SMART',
    categorySlug: 'preciscavanje-vazduha',
    categoryName: 'Prečišćavanje vazduha',
    images: [image('therapy-air-smart-1.png'), image('therapy-air-smart-2.png')],
    badges: ['Najprodavanije'],
    shortDescription: 'Pametni prečišćivač vazduha za dom i poslovni prostor.',
    description: 'TherapyAir® Smart je uređaj za unapređenje kvaliteta vazduha u zatvorenom prostoru, sa modernim pristupom filtraciji.',
    presentation: 'Dizajniran za korisnike koji žele čistiji vazduh, jednostavno upravljanje i premium osećaj u prostoru.',
    historyDetails: 'Deo Zepter portfolija proizvoda za zdraviji životni stil.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'TA-SMART' },
      { label: 'KATEGORIJA', value: 'Prečišćavanje vazduha' }
    ],
    prices: { retail: 116820, clubMember: 106306, clubPartner: 93456 },
    discounts: { clubMemberPercent: 9, clubPartnerPercent: 20 },
    currency: 'RSD',
    isFeatured: true,
    sortOrder: 2
  },
  {
    publicId: 'PRD-EDEL-WASSER-GOLD',
    name: 'PREČIŠĆIVAČ VODE - EDEL WASSER / GOLD',
    code: 'EDEL-GOLD',
    categorySlug: 'preciscavanje-vode',
    categoryName: 'Prečišćavanje vode',
    images: [image('edel-wasser-gold-1.jpg'), image('edel-wasser-gold-2.png')],
    badges: ['Najprodavanije'],
    shortDescription: 'Premium sistem za prečišćavanje vode.',
    description: 'Edel Wasser / Gold predstavlja Zepter rešenje za kvalitetniju vodu u domaćinstvu.',
    presentation: 'Pogodan za korisnike koji žele dugoročno rešenje za svakodnevnu upotrebu vode.',
    historyDetails: 'Proizvod je deo Zepter programa za unapređenje kvaliteta života kroz zdraviju vodu.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'EDEL-GOLD' },
      { label: 'PRIMENA', value: 'Prečišćavanje vode' }
    ],
    prices: { retail: 88146, clubMember: 66110, clubPartner: 57300 },
    discounts: { clubMemberPercent: 25, clubPartnerPercent: 35 },
    currency: 'RSD',
    isFeatured: true,
    sortOrder: 3
  },
  {
    publicId: 'PRD-THERAPYAIR-ION',
    name: 'PREČIŠĆIVAČ VAZDUHA - THERAPYAIR® ION',
    code: 'TA-ION',
    categorySlug: 'preciscavanje-vazduha',
    categoryName: 'Prečišćavanje vazduha',
    images: [image('therapy-air-1.jpg'), image('therapy-air-2.jpg'), image('therapy-air-3.jpg')],
    badges: ['Najprodavanije'],
    shortDescription: 'Prečišćivač vazduha iz TherapyAir linije.',
    description: 'TherapyAir® iOn je namenjen unapređenju kvaliteta vazduha i stvaranju prijatnijeg prostora za život.',
    presentation: 'U POC aplikaciji se koristi kao reprezentativan proizvod sa više slika i više nivoa cena.',
    historyDetails: 'Deo Zepter linije proizvoda za zdravije okruženje.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'TA-ION' },
      { label: 'KATEGORIJA', value: 'Prečišćavanje vazduha' }
    ],
    prices: { retail: 104430, clubMember: 95031, clubPartner: 83544 },
    discounts: { clubMemberPercent: 9, clubPartnerPercent: 20 },
    currency: 'RSD',
    isFeatured: true,
    sortOrder: 4
  },
  {
    publicId: 'PRD-THERAPYAIR-FILTER',
    name: 'Set filtera za TherapyAir® iOn',
    code: 'TA-FILTER',
    categorySlug: 'sistemi-za-ciscenje',
    categoryName: 'Sistemi za čišćenje',
    images: [image('therapy-air-minister.jpg')],
    badges: ['Dodatna oprema'],
    shortDescription: 'Set filtera za održavanje TherapyAir® uređaja.',
    description: 'Set filtera omogućava pravilno održavanje uređaja i produžava kvalitet rada sistema.',
    presentation: 'Primer dodatne opreme u katalogu.',
    historyDetails: 'Dodatak uz TherapyAir liniju proizvoda.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'TA-FILTER' },
      { label: 'PRIMENA', value: 'Održavanje uređaja' }
    ],
    prices: { retail: 13629, clubMember: 13221, clubPartner: 12266 },
    discounts: { clubMemberPercent: 3, clubPartnerPercent: 10 },
    currency: 'RSD',
    isFeatured: true,
    sortOrder: 5
  },
  {
    publicId: 'PRD-ARTMIX-PRO',
    name: 'ARTMIX PRO BLENDER',
    code: 'ARTMIX-PRO',
    categorySlug: 'posudje',
    categoryName: 'Posuđe',
    images: [image('artmix-pro-blender.png')],
    badges: ['Najprodavanije'],
    shortDescription: 'Premium blender za modernu kuhinju.',
    description: 'ARTMIX PRO Blender je funkcionalan kuhinjski uređaj za pripremu hrane i napitaka.',
    presentation: 'U POC-u predstavlja proizvod iz kuhinjske kategorije.',
    historyDetails: 'Deo Zepter programa za zdravu pripremu hrane.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'ARTMIX-PRO' },
      { label: 'KATEGORIJA', value: 'Kuhinjski uređaji' }
    ],
    prices: { retail: 88264, clubMember: 81203, clubPartner: 70611 },
    discounts: { clubMemberPercent: 8, clubPartnerPercent: 20 },
    currency: 'RSD',
    isFeatured: true,
    sortOrder: 6
  },
  {
    publicId: 'PRD-BIOPTRON-MEDALL',
    name: 'BIOPTRON MEDALL APARAT ZA SVETLOSNU TERAPIJU',
    code: 'BIOPTRON-MEDALL',
    categorySlug: 'bioptron',
    categoryName: 'Bioptron',
    images: [image('bioptron-medall-1.png'), image('bioptron-medall-2.png')],
    badges: ['Najprodavanije'],
    shortDescription: 'Aparat za svetlosnu terapiju iz BIOPTRON linije.',
    description: 'BIOPTRON MedAll je uređaj za svetlosnu terapiju namenjen demonstraciji premium medicinskog segmenta u POC aplikaciji.',
    presentation: 'Prikazuje kako aplikacija može predstaviti skuplje proizvode sa detaljnim opisom, tehničkim karakteristikama i benefitima.',
    historyDetails: 'BIOPTRON linija predstavlja jedan od prepoznatljivih Zepter segmenata.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'BIOPTRON-MEDALL' },
      { label: 'KATEGORIJA', value: 'Svetlosna terapija' }
    ],
    prices: { retail: 160008, clubMember: 144007, clubPartner: 128006 },
    discounts: { clubMemberPercent: 10, clubPartnerPercent: 20 },
    currency: 'RSD',
    isFeatured: true,
    sortOrder: 7
  },
  {
    publicId: 'PRD-AQUEENA-THERMO-ECO',
    name: 'AQUEENA THERMO ECO BOCA',
    code: 'AQUEENA-THERMO-ECO',
    categorySlug: 'preciscavanje-vode',
    categoryName: 'Prečišćavanje vode',
    images: [image('aqueena-thermo-eco-boca.jpg')],
    badges: ['Novo'],
    shortDescription: 'Eco boca iz Aqueena linije.',
    description: 'Aqueena Thermo Eco boca je proizvod za svakodnevnu upotrebu i dobar primer novog proizvoda u POC-u.',
    presentation: 'Koristi se za prikaz sekcije Novi proizvodi.',
    historyDetails: 'Dodatak programu za vodu i zdravije navike.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'AQUEENA-THERMO-ECO' }
    ],
    prices: { retail: 4602, clubMember: 4602, clubPartner: 4142 },
    discounts: { clubMemberPercent: 0, clubPartnerPercent: 10 },
    currency: 'RSD',
    isNew: true,
    sortOrder: 8
  },
  {
    publicId: 'PRD-FRELLUX',
    name: 'FRELLUX',
    code: 'FRELLUX',
    categorySlug: 'posudje',
    categoryName: 'Posuđe',
    images: [image('frellux-1.jpeg'), image('frellux-2.jpeg')],
    badges: ['Novo'],
    shortDescription: 'Novi proizvod iz Zepter ponude.',
    description: 'Frellux je dodat kao reprezentativan novi proizvod za prikaz kartica, slidera i cena.',
    presentation: 'Omogućava prikaz novih proizvoda u home sekciji.',
    historyDetails: 'Proizvod je deo proširenog kataloga za POC.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'FRELLUX' }
    ],
    prices: { retail: 57820, clubMember: 53194, clubPartner: 46256 },
    discounts: { clubMemberPercent: 8, clubPartnerPercent: 20 },
    currency: 'RSD',
    isNew: true,
    sortOrder: 9
  },
  {
    publicId: 'PRD-ZERO-G-BLACK-TITANIUM',
    name: 'ZERO G BLACK TITANIUM - OUTDOOR',
    code: 'HE-0208TZGB',
    categorySlug: 'hyperlight-optics',
    categoryName: 'Hyperlight Optics®',
    images: [image('zero-g-black-titanium-outdoor-1.jpg'), image('hyperlight-eyewear.jpg')],
    badges: ['Novo'],
    shortDescription: 'Titanijumska lakoća i Hyperlight pametna optika.',
    description: 'Ista titanijumska lakoća, prilagođena svakodnevnom nošenju. Model koji je nenametljiv, ali zapažen.',
    presentation: 'Hyperlight Eyewear koristi specijalna sočiva koja transformišu UV i visokoenergetsku plavu svetlost u prijatniji spektar vidljive svetlosti.',
    historyDetails: 'Tokom evolucije čovek se adaptirao na difuznu sunčevu svetlost. Hyperlight pristup je predstavljen kao tehnologija koja transformiše određene svetlosne obrasce.',
    technicalDetails: [
      { label: 'ŠIFRA PROIZVODA', value: 'HE-0208TZGB' },
      { label: 'NAZIV PROIZVODA', value: 'ZERO G BLACK TITANIUM - OUTDOOR' },
      { label: 'GARANCIJA', value: '2 godine' },
      { label: 'BRUTO TEŽINA (KG)', value: '0,275' },
      { label: 'NETO TEŽINA (KG)', value: '0,026' },
      { label: 'DIMENZIJE', value: '62-15-145 mm' },
      { label: 'PROIZVOĐAČ', value: 'Home Art & Sales Servis AG, Sihleggstrasse 23, 8832 Wollerau, Switzerland' },
      { label: 'PRIMENA', value: 'Eyewear blocking UV and blue sunlight with relaxing effect.' }
    ],
    prices: { retail: 62540, clubMember: 56286, clubPartner: 50032 },
    discounts: { clubMemberPercent: 10, clubPartnerPercent: 20 },
    currency: 'RSD',
    isNew: true,
    sortOrder: 10
  }
];

const plans = [
  {
    code: 'MEMBER',
    name: 'ZepterClub Član',
    level: 1,
    discountPercent: 5,
    commissionFromPercent: 0,
    commissionToPercent: 0,
    requiredTurnover: 0,
    benefits: [
      'Privilegovana kupovina',
      'Pristup ZepterClub ponudama',
      'Mogućnost dobijanja personalizovanih pogodnosti'
    ],
    description: 'Osnovni klupski status za korisnike koji kupuju uz pogodnosti.',
    isPartnerLevel: false
  },
  {
    code: 'PARTNER',
    name: 'ZepterClub Partner',
    level: 2,
    discountPercent: 12,
    commissionFromPercent: 5,
    commissionToPercent: 40,
    requiredTurnover: 0,
    benefits: [
      'Kupovina po partnerskim uslovima',
      'Prodajna provizija',
      'Slanje ponuda klijentima',
      'Učlanjivanje novih članova'
    ],
    description: 'Status za korisnike koji prodaju, nude i grade svoju mrežu klijenata.',
    isPartnerLevel: true
  },
  {
    code: 'GOLD_PARTNER',
    name: 'Gold Partner',
    level: 3,
    discountPercent: 20,
    commissionFromPercent: 10,
    commissionToPercent: 40,
    requiredTurnover: 250000,
    benefits: [
      'Viši nivo pogodnosti',
      'Napredniji marketing plan',
      'Bolji pregled učinka i klijenata'
    ],
    description: 'Naredni demonstracioni nivo u POC marketing planu.',
    isPartnerLevel: true
  }
];

const demoUser = {
  publicId: 'USR-JOVAN-DEMO',
  email: 'jovan.jovovic064@gmail.com',
  firstName: 'JOVAN',
  lastName: 'JOVOVIC',
  phone: '+381612207486',
  customerCode: 'CU456380',
  clubNumber: '556880645370',
  recommenderCode: 'CU085060',
  role: 'PARTNER',
  clubStatus: 'PARTNER',
  address: {
    street: 'MILANA TANKOSIĆA 19/9 PALILULA',
    city: 'BEOGRAD',
    postalCode: '11000',
    country: 'Republika Srbija'
  },
  marketingPlan: {
    currentRank: 'ZepterClub Partner',
    currentDiscountPercent: 12,
    nextRank: 'Gold Partner',
    requiredTurnoverForNextRank: 250000,
    currentTurnover: 132000,
    invitedMembersCount: 8,
    clientsPurchasesCount: 17
  },
  marketingConsent: true,
  directMarketingConsent: true,
  isActive: true
};

const wishlistItems = [
  {
    publicId: 'WIS-DEMO-MYIONZ-PRO',
    userPublicId: demoUser.publicId,
    productPublicId: 'PRD-MYIONZ-PRO'
  },
  {
    publicId: 'WIS-DEMO-THERAPYAIR-SMART',
    userPublicId: demoUser.publicId,
    productPublicId: 'PRD-THERAPYAIR-SMART'
  },
  {
    publicId: 'WIS-DEMO-BIOPTRON-MEDALL',
    userPublicId: demoUser.publicId,
    productPublicId: 'PRD-BIOPTRON-MEDALL'
  }
];

const clients = [
  {
    publicId: 'CL-DEMO-001',
    ownerUserPublicId: 'USR-JOVAN-DEMO',
    firstName: 'Marko',
    lastName: 'Marković',
    email: 'marko@example.com',
    phone: '+38164111222',
    city: 'Beograd',
    clubStatus: 'MEMBER',
    purchasesCount: 4,
    totalTurnover: 58200
  },
  {
    publicId: 'CL-DEMO-002',
    ownerUserPublicId: 'USR-JOVAN-DEMO',
    firstName: 'Ana',
    lastName: 'Anić',
    email: 'ana@example.com',
    phone: '+38164222333',
    city: 'Novi Sad',
    clubStatus: 'INVITED',
    purchasesCount: 1,
    totalTurnover: 13629
  },
  {
    publicId: 'CL-DEMO-003',
    ownerUserPublicId: 'USR-JOVAN-DEMO',
    firstName: 'Nikola',
    lastName: 'Nikolić',
    email: 'nikola@example.com',
    phone: '+38164333444',
    city: 'Kragujevac',
    clubStatus: 'NONE',
    purchasesCount: 0,
    totalTurnover: 0
  }
];

async function upsertByKey<T extends Record<string, unknown>>(
  model: { updateOne: (filter: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown>) => Promise<unknown> },
  key: keyof T,
  docs: T[]
): Promise<void> {
  for (const doc of docs) {
    await model.updateOne({ [key]: doc[key] }, { $set: doc }, { upsert: true });
  }
}

async function runSeed(): Promise<void> {
  await connectDB();

  if (env.POC_SEED_RESET === 'true') {
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      ZepterClubPlan.deleteMany({}),
      User.deleteMany({}),
      Client.deleteMany({}),
      Region.deleteMany({}),
      Order.deleteMany({}),
      Offer.deleteMany({}),
      Wishlist.deleteMany({})
    ]);
  }

  await upsertByKey(Category, 'publicId', categories);
  await upsertByKey(Product, 'publicId', products.map((product) => ({ ...product, slug: makeSlug(product.name) })));
  await upsertByKey(ZepterClubPlan, 'code', plans);

  const passwordHash = await bcrypt.hash('demo12345', 10);
  await User.updateOne(
    { publicId: demoUser.publicId },
    { $set: { ...demoUser, passwordHash } },
    { upsert: true }
  );

  await upsertByKey(Client, 'publicId', clients);

  for (const item of wishlistItems) {
    await Wishlist.updateOne(
      {
        userPublicId: item.userPublicId,
        productPublicId: item.productPublicId
      },
      { $setOnInsert: item },
      { upsert: true }
    );
  }

  await Region.updateOne(
    { code: 'RS' },
    {
      $set: {
        code: 'RS',
        name: 'Srbija',
        countryName: 'Republika Srbija',
        currency: 'RSD',
        locale: 'sr-RS',
        languageCodes: ['sr', 'en'],
        isDefault: true,
        isActive: true
      }
    },
    { upsert: true }
  );

  console.log('POC seed completed.');
  console.log('Demo login: jovan.jovovic064@gmail.com / demo12345');

  await disconnectDB();
}

runSeed().catch(async (error) => {
  console.error('Seed failed:', error);
  await disconnectDB();
  process.exit(1);
});
