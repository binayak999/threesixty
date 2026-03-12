/**
 * Seeder: create reference data (Amenities, Locations, Listing Categories).
 * Usage: npx ts-node src/scripts/seed-refs.ts
 * Run after seed-admin if you want categories to exist; listings seed is optional.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Amenity from '../models/Amenity';
import Location from '../models/Location';
import Category from '../models/Category';
import Country from '../models/Country';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/threesixtynepal';

const AMENITIES = [
  { name: 'Free WiFi', slug: 'wifi', icon: 'fa-wifi' },
  { name: 'Parking', slug: 'parking', icon: 'fa-car' },
  { name: 'Air Conditioning', slug: 'ac', icon: 'fa-snowflake' },
  { name: 'Outdoor Seating', slug: 'outdoor_seating', icon: 'fa-umbrella-beach' },
  { name: 'Home Delivery', slug: 'delivery', icon: 'fa-truck' },
  { name: 'Takeaway', slug: 'takeaway', icon: 'fa-bag-shopping' },
  { name: 'Wheelchair Accessible', slug: 'wheelchair', icon: 'fa-wheelchair' },
  { name: 'Card Payment', slug: 'cards', icon: 'fa-credit-card' },
  { name: 'Live Music', slug: 'live_music', icon: 'fa-music' },
  { name: 'Bar/Alcohol', slug: 'bar', icon: 'fa-wine-bottle' },
  { name: 'Pet Friendly', slug: 'pet_friendly', icon: 'fa-paw' },
  { name: 'Pool', slug: 'pool', icon: 'fa-person-swimming' },
  { name: 'Garden', slug: 'garden', icon: 'fa-seedling' },
  { name: 'Parking - Free', slug: 'parking_free', icon: 'fa-circle-parking' },
  { name: 'Reservations', slug: 'reservations', icon: 'fa-calendar-check' },
];

const LOCATIONS = [
  { name: 'Kathmandu', slug: 'kathmandu', city: 'Kathmandu', region: 'Bagmati', country: 'Nepal', address: 'Kathmandu Metropolitan City' },
  { name: 'Pokhara', slug: 'pokhara', city: 'Pokhara', region: 'Gandaki', country: 'Nepal', address: 'Pokhara Metropolitan City' },
  { name: 'Lalitpur', slug: 'lalitpur', city: 'Lalitpur', region: 'Bagmati', country: 'Nepal', address: 'Lalitpur Metropolitan City' },
  { name: 'Bhaktapur', slug: 'bhaktapur', city: 'Bhaktapur', region: 'Bagmati', country: 'Nepal', address: 'Bhaktapur' },
  { name: 'Chitwan', slug: 'chitwan', city: 'Bharatpur', region: 'Bagmati', country: 'Nepal', address: 'Chitwan District' },
  { name: 'Lumbini', slug: 'lumbini', city: 'Siddharthanagar', region: 'Lumbini', country: 'Nepal', address: 'Lumbini Province' },
  { name: 'Nagarkot', slug: 'nagarkot', city: 'Nagarkot', region: 'Bagmati', country: 'Nepal', address: 'Nagarkot' },
  { name: 'Thamel', slug: 'thamel-kathmandu', city: 'Kathmandu', region: 'Bagmati', country: 'Nepal', address: 'Thamel, Kathmandu' },
];

const LISTING_CATEGORIES = [
  { name: 'Restaurants & Cafes', slug: 'restaurant', description: 'Dining establishments, cafes, bars, food courts' },
  { name: 'Hotels & Lodging', slug: 'accommodation', description: 'Hotels, resorts, hostels, guesthouses' },
  { name: 'Religious Places', slug: 'religious', description: 'Temples, churches, mosques, monasteries' },
  { name: 'Historical Sites', slug: 'historical', description: 'Monuments, museums, heritage sites' },
  { name: 'Public Facilities', slug: 'public', description: 'Public toilets, parks, libraries, hospitals' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Cinemas, theaters, clubs, gaming centers' },
  { name: 'Shopping', slug: 'shopping', description: 'Malls, markets, stores, boutiques' },
  { name: 'Services', slug: 'services', description: 'Banks, salons, repair shops, offices' },
];

async function seedRefs(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    for (const a of AMENITIES) {
      await Amenity.findOneAndUpdate(
        { slug: a.slug },
        { $setOnInsert: { name: a.name, icon: a.icon, slug: a.slug } },
        { upsert: true }
      );
    }
    console.log(`Amenities: ${AMENITIES.length} upserted`);

    for (const loc of LOCATIONS) {
      const countryDoc = await Country.findOne({ $or: [{ name: loc.country }, { code: loc.country }, { slug: loc.country.toLowerCase().replace(/\s+/g, '-') }] });
      await Location.findOneAndUpdate(
        { slug: loc.slug },
        {
          $setOnInsert: {
            name: loc.name,
            slug: loc.slug,
            address: loc.address,
            city: loc.city,
            region: loc.region,
            countryRef: countryDoc?._id ?? undefined,
            country: countryDoc ? undefined : loc.country,
            isActive: true,
          },
        },
        { upsert: true }
      );
    }
    console.log(`Locations: ${LOCATIONS.length} upserted`);

    for (const c of LISTING_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: c.slug, type: 'listing' },
        {
          $setOnInsert: {
            name: c.name,
            slug: c.slug,
            type: 'listing',
            description: c.description,
            status: 'published',
          },
        },
        { upsert: true }
      );
    }
    console.log(`Listing categories: ${LISTING_CATEGORIES.length} upserted`);

    console.log('Refs seed done.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

seedRefs();
