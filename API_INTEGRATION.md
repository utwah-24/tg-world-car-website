# TG World API Integration

This project now uses the TG World API to fetch car data dynamically instead of hardcoded data.

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_API_BASE_URL=https://tgworld.e-saloon.online
```

## API Endpoints

The application expects the following endpoints from the API:

### Get All Cars
```
GET /api/cars
```

### Get Cars by Category
```
GET /api/cars?category={category}
```
Categories: `top-selling`, `coming-soon`, `sold-out`

### Get Car by ID
```
GET /api/cars/{id}
```

## Car Data Structure

The API should return car objects with the following structure:

```typescript
{
  id: string
  name: string
  year: number
  price: string
  image: string  // Full URL to the car's main image
  images?: string[]  // Array of full URLs to additional car images
  category: "top-selling" | "coming-soon" | "sold-out"
  mileage?: string
  transmission?: string
  fuel?: string
  engineSize?: string
  color?: string
  seats?: number
  doors?: number
  drive?: string
  features?: string[]
  description?: string
}
```

### Important: Image URLs

**All image paths must be full URLs** (e.g., `https://tgworld.e-saloon.online/images/car123.jpg`)

- The `image` field should contain the primary car photo
- The `images` array should contain additional photos (interior, engine, etc.)
- The website no longer uses local `/public/cars/` folder
- All images are fetched directly from the API

## How It Works

1. **API First**: The application tries to fetch data from the API endpoints
2. **Fallback**: If the API fails or returns no data, it falls back to static data in `lib/cars-data.ts`
3. **Caching**: Data is revalidated every 60 seconds using Next.js ISR (Incremental Static Regeneration)

## Files Created/Modified

**Created:**
- `.env.local` - Environment configuration
- `lib/api.ts` - API utility functions
- `components/hero-wrapper.tsx` - Server component to fetch hero image from API

**Modified:**
- `lib/cars-data.ts` - Updated to fetch from API with fallback (images now use placeholders for fallback)
- `app/page.tsx` - Made async to support API calls, uses HeroWrapper
- `components/hero.tsx` - Accepts heroImage prop from API, includes error handling

## Static Data Fallback

The static car data in `lib/cars-data.ts` serves as:
- A fallback when the API is unavailable
- Sample data structure reference
- Development data when working offline

**Note:** The `/public/cars/` folder has been removed. All images must come from the API. The fallback data uses placeholder images (`/placeholder.svg`) to ensure the site doesn't break if the API is down.

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the console for any API errors
3. If API is down, the site will automatically use static data

## Production Notes

- The page revalidates every 60 seconds in production
- API errors are logged but don't crash the site
- Static data ensures the site always has content to display
