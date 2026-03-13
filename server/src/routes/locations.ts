import { Router, Request, Response } from 'express';
import Location from '../models/Location';
import Country from '../models/Country';
import Listing from '../models/Listing';

const router = Router();

const publishedFilter = { $or: [ { status: 'published' }, { status: { $exists: false } } ] };

function escapeRegex(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req: Request, res: Response) => {
  try {
    let baseQuery = Location.find();
    const hasListings = req.query.hasListings === '1' || req.query.hasListings === 'true';
    if (hasListings) {
      const locationIds = await Listing.distinct('location', publishedFilter);
      if (locationIds.length === 0) {
        res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        });
        return;
      }
      baseQuery = baseQuery.where('_id').in(locationIds);
    }

    const countryRef = typeof req.query.countryRef === 'string' ? req.query.countryRef.trim() : '';
    if (countryRef) {
      baseQuery = baseQuery.where('countryRef').equals(countryRef);
    }

    const distinct = typeof req.query.distinct === 'string' ? req.query.distinct.trim() : '';
    if (distinct && countryRef) {
      const filter = { countryRef } as Record<string, unknown>;
      if (distinct === 'city') {
        const cities = await Location.distinct('city', filter);
        const list = (cities || []).filter((c) => c != null && String(c).trim()).sort((a, b) => String(a).localeCompare(String(b)));
        return res.json({ success: true, data: list });
      }
      if (distinct === 'region') {
        const regions = await Location.distinct('region', filter);
        const list = (regions || []).filter((r) => r != null && String(r).trim()).sort((a, b) => String(a).localeCompare(String(b)));
        return res.json({ success: true, data: list });
      }
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      const countryIds = await Country.find({ $or: [{ name: re }, { code: re }, { slug: re }] }).distinct('_id');
      baseQuery = baseQuery.and([
        { $or: [
          { name: re },
          { slug: re },
          { address: re },
          { city: re },
          { region: re },
          { country: re },
          ...(countryIds.length > 0 ? [{ countryRef: { $in: countryIds } }] : []),
        ] },
      ]);
    }

    const page = Math.max(1, parseInt(String(req.query.page || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || 10), 10) || 10));
    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      baseQuery.clone().sort({ name: 1 }).skip(skip).limit(limit).populate('countryRef', 'name code slug').lean(),
      baseQuery.countDocuments(),
    ]);

    const data = (locations as { countryRef?: { name: string }; country?: string }[]).map((loc) => ({
      ...loc,
      country: (loc.countryRef as { name: string })?.name ?? loc.country ?? undefined,
    }));

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

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const location = await Location.findById(req.params.id).populate('countryRef', 'name code slug').lean();
    if (!location) {
      res.status(404).json({ success: false, message: 'Location not found' });
      return;
    }
    const loc = location as { countryRef?: { name: string }; country?: string };
    res.json({
      success: true,
      data: {
        ...loc,
        country: loc.countryRef?.name ?? loc.country ?? undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, slug, address, city, region, country, countryRef, latitude, longitude, description, isActive, seo } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, message: 'name and slug are required' });
      return;
    }
    const slugNorm = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    const location = await Location.create({
      name: String(name).trim(),
      slug: slugNorm,
      address: address != null ? String(address).trim() : undefined,
      city: city != null ? String(city).trim() : undefined,
      region: region != null ? String(region).trim() : undefined,
      countryRef: countryRef || undefined,
      country: country != null ? String(country).trim() : undefined,
      latitude: latitude != null ? Number(latitude) : undefined,
      longitude: longitude != null ? Number(longitude) : undefined,
      description: description != null ? String(description).trim() : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      seo: seo && typeof seo === 'object' ? seo : undefined,
    });
    const populated = await Location.findById(location._id).populate('countryRef', 'name code slug').lean();
    const loc = populated as { countryRef?: { name: string }; country?: string };
    res.status(201).json({
      success: true,
      data: {
        ...loc,
        country: loc?.countryRef?.name ?? loc?.country ?? undefined,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, slug, address, city, region, country, countryRef, latitude, longitude, description, isActive, seo } = req.body;
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name).trim();
    if (slug !== undefined) update.slug = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    if (address !== undefined) update.address = address != null ? String(address).trim() : null;
    if (city !== undefined) update.city = city != null ? String(city).trim() : null;
    if (region !== undefined) update.region = region != null ? String(region).trim() : null;
    if (country !== undefined) update.country = country != null ? String(country).trim() : null;
    if (countryRef !== undefined) update.countryRef = countryRef || null;
    if (latitude !== undefined) update.latitude = latitude !== '' && latitude != null ? Number(latitude) : null;
    if (longitude !== undefined) update.longitude = longitude !== '' && longitude != null ? Number(longitude) : null;
    if (description !== undefined) update.description = description != null ? String(description).trim() : null;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (seo !== undefined) update.seo = seo && typeof seo === 'object' ? seo : undefined;
    const location = await Location.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('countryRef', 'name code slug')
      .lean();
    if (!location) {
      res.status(404).json({ success: false, message: 'Location not found' });
      return;
    }
    const loc = location as { countryRef?: { name: string }; country?: string };
    res.json({
      success: true,
      data: {
        ...loc,
        country: loc.countryRef?.name ?? loc.country ?? undefined,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      res.status(404).json({ success: false, message: 'Location not found' });
      return;
    }
    res.json({ success: true, message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
