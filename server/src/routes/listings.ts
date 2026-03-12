import { Router, Request, Response } from 'express';
import Listing from '../models/Listing';
import Category from '../models/Category';
import Location from '../models/Location';
import Amenity from '../models/Amenity';
import User from '../models/User';
import Review from '../models/Review';
import Media from '../models/Media';
import '../models/Tier';

const router = Router();

async function ensureMediaOwnership(mediaIds: string[], ownerId: string): Promise<boolean> {
  if (mediaIds.length === 0) return true;
  const docs = await Media.find({ _id: { $in: mediaIds } }).select('user').lean();
  const notOwned = docs.filter((m) => m.user == null || String(m.user) !== String(ownerId));
  return notOwned.length === 0;
}

const publishedFilter = { $or: [ { status: 'published' }, { status: { $exists: false } } ] };

function escapeRegex(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const all = req.query.all === '1' || req.query.all === 'true';
    const featuredOnly = req.query.featuredOnly === '1' || req.query.featuredOnly === 'true';
    const filter: Record<string, unknown> = all ? {} : { ...publishedFilter };
    if (featuredOnly) Object.assign(filter, { isFeatured: true });

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$and = (filter.$and as unknown[] || []).concat([
        { $or: [
          { title: re },
          { description: re },
          { shortDescription: re },
          { status: re },
        ] },
      ]);
    }

    const page = Math.max(1, parseInt(String(req.query.page || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || 10), 10) || 10));
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('user', 'name email')
        .populate('category', 'name slug')
        .populate({ path: 'location', select: 'name slug address city region country countryRef', populate: { path: 'countryRef', select: 'name code slug' } })
        .populate({ path: 'medias.media', select: 'url urlMedium urlLow type' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    const listingIds = (listings as { _id: unknown }[]).map((l) => l._id);
    const reviewStats = await Review.aggregate([
      { $match: { listing: { $in: listingIds }, isApproved: true } },
      { $group: { _id: '$listing', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const statsByListing = new Map(reviewStats.map((s) => [String(s._id), { reviewAverage: Math.round(s.average * 10) / 10, reviewCount: s.count }]));

    const data = (listings as { _id: unknown; location?: { countryRef?: { name: string }; country?: string } }[]).map((item) => {
      const stats = statsByListing.get(String(item._id));
      const withLocation = item.location && item.location.countryRef
        ? { ...item, location: { ...item.location, country: (item.location.countryRef as { name: string }).name ?? item.location.country } }
        : item;
      return { ...withLocation, reviewAverage: stats?.reviewAverage, reviewCount: stats?.reviewCount ?? 0 };
    });

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findOne({ slug: req.params.slug, status: 'published' })
      .populate('user', 'name email')
      .populate({ path: 'category', select: 'name slug parent', populate: { path: 'parent', select: 'slug' } })
      .populate({ path: 'location', populate: { path: 'countryRef', select: 'name code slug' } })
      .populate('amenities', 'name slug icon')
      .populate({ path: 'medias.media', select: 'url urlMedium urlLow type' })
      .lean();
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    const loc = (listing as { location?: { countryRef?: { name: string }; country?: string } }).location;
    if (loc?.countryRef) {
      (listing as { location?: { country: string } }).location = { ...loc, country: (loc.countryRef as { name: string }).name ?? loc.country };
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name email')
      .populate({ path: 'category', select: 'name slug parent', populate: { path: 'parent', select: 'slug' } })
      .populate({ path: 'location', populate: { path: 'countryRef', select: 'name code slug' } })
      .populate('amenities', 'slug')
      .populate({ path: 'medias.media', select: 'url urlMedium urlLow type' })
      .lean();
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    const loc = (listing as { location?: { countryRef?: { name: string }; country?: string } }).location;
    if (loc?.countryRef) {
      (listing as { location?: { country: string } }).location = { ...loc, country: (loc.countryRef as { name: string }).name ?? loc.country };
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const listing = await Listing.create(req.body);
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.post('/create-full', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      category: categorySlug,
      title,
      description,
      slug,
      shortDescription,
      location: locationData,
      locationId: existingLocationId,
      contact,
      mediaIds = [],
      media360Ids = [],
      videoIds = [],
      amenityIds = [],
      openingHours = [],
      seo,
      isFeatured,
    } = req.body;

    if (!userId || !title || !description || !slug || !categorySlug) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, description, slug, category.',
      });
      return;
    }

    const requestingUser = await User.findById(userId).populate('tier').lean();
    if (!requestingUser) {
      res.status(403).json({ success: false, message: 'User not found.' });
      return;
    }
    let listingStatus: 'draft' | 'pending' | 'published' = 'draft';
    const isAdmin = requestingUser.role === 'admin' || (requestingUser as { role?: string }).role === 'superadmin';
    if (isAdmin) {
      listingStatus = req.body.status === 'draft' ? 'draft' : 'published';
    } else {
      const tier = requestingUser.tier as { maxListings?: number } | null;
      const maxListings = tier?.maxListings ?? 999;
      const count = await Listing.countDocuments({
        user: userId,
        status: { $in: ['pending', 'published'] },
      });
      if (count >= maxListings) {
        res.status(403).json({
          success: false,
          message: `Your plan allows up to ${maxListings} listing(s). Upgrade or contact support.`,
        });
        return;
      }
      listingStatus = 'pending';
    }

    let location;
    if (existingLocationId) {
      location = await Location.findById(existingLocationId);
      if (!location) {
        res.status(400).json({ success: false, message: 'Invalid locationId.' });
        return;
      }
    } else if (locationData && (locationData.address != null || locationData.city != null || locationData.country != null)) {
      const { address, city, region, country, countryRef, latitude, longitude } = locationData;
      const locationName = [address, city, region, country].filter(Boolean).join(', ') || title;
      const locationSlug = slug + '-location';
      location = await Location.create({
        name: locationName,
        slug: locationSlug,
        address: address || undefined,
        city: city || undefined,
        region: region || undefined,
        countryRef: countryRef || undefined,
        country: country || undefined,
        latitude: latitude != null ? Number(latitude) : undefined,
        longitude: longitude != null ? Number(longitude) : undefined,
        isActive: true,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Provide either location (address/city/country) or locationId.',
      });
      return;
    }

    let category = await Category.findOne({ slug: categorySlug, type: 'listing' });
    if (!category) {
      category = await Category.create({
        name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
        slug: categorySlug,
        type: 'listing',
      });
    }

    const allMediaIds = [...(mediaIds || []), ...(media360Ids || []), ...(videoIds || [])];
    const mediaOwned = await ensureMediaOwnership(allMediaIds, userId);
    if (!mediaOwned) {
      res.status(400).json({ success: false, message: 'You can only use your own media on a listing.' });
      return;
    }

    const medias: Array<{ media: unknown; role: 'feature' | 'gallery' | 'video'; order: number }> = [];
    if (mediaIds?.length) {
      medias.push({ media: mediaIds[0], role: 'feature', order: 0 });
      mediaIds.slice(1).forEach((id: string, i: number) => {
        medias.push({ media: id, role: 'gallery', order: i + 1 });
      });
    }
    (media360Ids || []).forEach((id: string, i: number) => {
      medias.push({ media: id, role: 'gallery', order: medias.length + i });
    });
    (videoIds || []).forEach((id: string, i: number) => {
      medias.push({ media: id, role: 'video', order: i });
    });

    const amenityObjectIds = await Promise.all(
      (amenityIds || []).map(async (slugOrId: string) => {
        let amenity = await Amenity.findOne({ slug: slugOrId });
        if (!amenity) {
          amenity = await Amenity.create({
            name: slugOrId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            slug: slugOrId,
            icon: 'fa-check',
          });
        }
        return amenity._id;
      })
    );

    const listing = await Listing.create({
      title,
      description,
      slug,
      category: category._id,
      location: location._id,
      user: userId,
      medias,
      amenities: amenityObjectIds,
      openingHours: Array.isArray(openingHours) ? openingHours : [],
      status: listingStatus,
      isFeatured: isFeatured === true || isFeatured === 'true',
      ...(seo && typeof seo === 'object' ? { seo } : {}),
    });

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { isFeatured } = req.body;
    if (typeof isFeatured !== 'boolean') {
      res.status(400).json({ success: false, message: 'isFeatured (boolean) is required.' });
      return;
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true, runValidators: true }
    ).lean();
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Listing.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    const {
      category: categorySlug,
      title,
      description,
      slug,
      location: locationData,
      locationId: existingLocationId,
      mediaIds = [],
      media360Ids = [],
      videoIds = [],
      amenityIds = [],
      openingHours = [],
      status,
      seo,
      isFeatured,
    } = req.body;

    if (!title || !description || !slug || !categorySlug) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, slug, category.',
      });
      return;
    }

    let category = await Category.findOne({ slug: categorySlug, type: 'listing' });
    if (!category) {
      category = await Category.create({
        name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
        slug: categorySlug,
        type: 'listing',
      });
    }

    const allMediaIds = [...(mediaIds || []), ...(media360Ids || []), ...(videoIds || [])];
    const ownerId = String(existing.user);
    const mediaOwned = await ensureMediaOwnership(allMediaIds, ownerId);
    if (!mediaOwned) {
      res.status(400).json({ success: false, message: 'You can only use your own media on a listing.' });
      return;
    }

    let locationIdToSet = existing.location;
    if (existingLocationId) {
      const loc = await Location.findById(existingLocationId);
      if (!loc) {
        res.status(400).json({ success: false, message: 'Invalid locationId.' });
        return;
      }
      locationIdToSet = loc._id;
    } else if (locationData && (locationData.address != null || locationData.city != null || locationData.country != null)) {
      const { address, city, region, country, countryRef, latitude, longitude } = locationData;
      const locationName = [address, city, region, country].filter(Boolean).join(', ') || title;
      const locationSlug = slug + '-location';
      await Location.findByIdAndUpdate(existing.location, {
        name: locationName,
        slug: locationSlug,
        address: address || undefined,
        city: city || undefined,
        region: region || undefined,
        countryRef: countryRef || undefined,
        country: country || undefined,
        latitude: latitude != null ? Number(latitude) : undefined,
        longitude: longitude != null ? Number(longitude) : undefined,
      });
    }

    const medias: Array<{ media: unknown; role: 'feature' | 'gallery' | 'video'; order: number }> = [];
    if (mediaIds?.length) {
      medias.push({ media: mediaIds[0], role: 'feature', order: 0 });
      mediaIds.slice(1).forEach((id: string, i: number) => {
        medias.push({ media: id, role: 'gallery', order: i + 1 });
      });
    }
    (media360Ids || []).forEach((id: string, i: number) => {
      medias.push({ media: id, role: 'gallery', order: medias.length + i });
    });
    (videoIds || []).forEach((id: string, i: number) => {
      medias.push({ media: id, role: 'video', order: i });
    });

    const amenityObjectIds = await Promise.all(
      (amenityIds || []).map(async (slugOrId: string) => {
        let amenity = await Amenity.findOne({ slug: slugOrId });
        if (!amenity) amenity = await Amenity.findById(slugOrId);
        if (!amenity) {
          amenity = await Amenity.create({
            name: slugOrId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            slug: slugOrId,
            icon: 'fa-check',
          });
        }
        return amenity._id;
      })
    );

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        slug,
        category: category._id,
        location: locationIdToSet,
        medias,
        amenities: amenityObjectIds,
        openingHours: Array.isArray(openingHours) ? openingHours : existing.openingHours,
        ...(status === 'published' || status === 'draft' || status === 'pending' ? { status } : {}),
        ...(isFeatured !== undefined ? { isFeatured: isFeatured === true || isFeatured === 'true' } : {}),
        ...(seo && typeof seo === 'object' ? { seo } : {}),
      },
      { new: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
