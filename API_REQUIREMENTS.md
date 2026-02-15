# TG World API Requirements

## Base URL
```
https://tgworld.e-saloon.online
```

## Required Endpoints

### 1. Get All Cars
**GET** `/api/cars`

Returns an array of all cars.

**Response Example:**
```json
[
  {
    "id": "1",
    "name": "Toyota Land Cruiser ZX",
    "year": 2024,
    "price": "375,000,000 TZS",
    "image": "https://tgworld.e-saloon.online/images/cars/landcruiser-zx-front.jpg",
    "images": [
      "https://tgworld.e-saloon.online/images/cars/landcruiser-zx-front.jpg",
      "https://tgworld.e-saloon.online/images/cars/landcruiser-zx-back.jpg",
      "https://tgworld.e-saloon.online/images/cars/landcruiser-zx-interior.jpg"
    ],
    "category": "top-selling",
    "mileage": "0km (Brand New)",
    "transmission": "Automatic 10 Speed",
    "fuel": "Petrol",
    "engineSize": "3,500cc Twin Turbo",
    "color": "Pearl White",
    "seats": 7,
    "doors": 5,
    "drive": "4WD",
    "features": [
      "Sunroof",
      "Leather Seats",
      "12.3 Inch Touchscreen",
      "JBL Audio System"
    ],
    "description": "Brand New 2024 TOYOTA LANDCRUISER ZX 3.5L Twin Turbo Petrol."
  }
]
```

### 2. Get Cars by Category
**GET** `/api/cars?category={category}`

**Parameters:**
- `category` (required): One of `top-selling`, `coming-soon`, or `sold-out`

**Response:** Same as Get All Cars, but filtered by category

### 3. Get Single Car
**GET** `/api/cars/{id}`

**Response:** Single car object (same structure as above)

## Field Specifications

### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier | "1" |
| `name` | string | Car model name | "Toyota Land Cruiser ZX" |
| `year` | number | Manufacturing year | 2024 |
| `price` | string | Price with currency | "375,000,000 TZS" |
| `image` | string | **Full URL** to main image | "https://..." |
| `category` | string | One of: `top-selling`, `coming-soon`, `sold-out` | "top-selling" |

### Optional Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `images` | string[] | Array of **full URLs** to additional images | ["https://...", "https://..."] |
| `mileage` | string | Vehicle mileage | "0km (Brand New)" |
| `transmission` | string | Transmission type | "Automatic 10 Speed" |
| `fuel` | string | Fuel type | "Petrol" |
| `engineSize` | string | Engine capacity | "3,500cc Twin Turbo" |
| `color` | string | Vehicle color | "Pearl White" |
| `seats` | number | Passenger capacity | 7 |
| `doors` | number | Number of doors | 5 |
| `drive` | string | Drive type | "4WD" |
| `features` | string[] | Array of features | ["Sunroof", "Leather Seats"] |
| `description` | string | Full car description | "Brand New 2024..." |

## Image URL Requirements

### CRITICAL: All images must be full URLs

✅ **CORRECT:**
```json
{
  "image": "https://tgworld.e-saloon.online/images/cars/car1-front.jpg",
  "images": [
    "https://tgworld.e-saloon.online/images/cars/car1-front.jpg",
    "https://tgworld.e-saloon.online/images/cars/car1-back.jpg",
    "https://tgworld.e-saloon.online/images/cars/car1-interior.jpg"
  ]
}
```

❌ **INCORRECT:**
```json
{
  "image": "/images/car1.jpg",  // Relative paths won't work
  "images": ["./car1-front.jpg"]  // Local paths won't work
}
```

### Image Guidelines
1. Use HTTPS URLs
2. Images should be web-optimized (< 500KB recommended)
3. Recommended formats: JPG, PNG, WebP
4. Recommended dimensions: 800x600px or higher
5. Ensure images are publicly accessible (no authentication required)

## CORS Configuration

The API must allow requests from the frontend domain.

**Required Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Response Format

All responses should be JSON with appropriate status codes:

- `200 OK` - Successful request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Error Handling

The website has fallback mechanisms:
- If API is unavailable, static placeholder data is used
- If images fail to load, placeholder images are shown
- API errors are logged but don't crash the site

## Testing Checklist

- [ ] All endpoints return valid JSON
- [ ] Image URLs are full HTTPS URLs
- [ ] Images are publicly accessible
- [ ] CORS headers are set correctly
- [ ] Categories are spelled correctly: `top-selling`, `coming-soon`, `sold-out`
- [ ] All required fields are present in responses
- [ ] Response times are < 2 seconds

## Example API Test

```bash
# Test Get All Cars
curl https://tgworld.e-saloon.online/api/cars

# Test Get by Category
curl "https://tgworld.e-saloon.online/api/cars?category=top-selling"

# Test Get Single Car
curl https://tgworld.e-saloon.online/api/cars/1
```
