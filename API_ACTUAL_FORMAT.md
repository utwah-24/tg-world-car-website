# TG World API - Actual Format Documentation

## ✅ API is Working!

The API at `https://tgworld.e-saloon.online/api/cars` is live and returning data.

## Actual API Response Format

### Get All Cars
**GET** `/api/cars`

**Actual Response:**
```json
{
  "data": [
    {
      "car_id": 1,
      "car_name": "2003 SCANIA DUMP TRUCK 94C - 300",
      "car_pic": "TGworld/2003 SCANIA DUMP TRUCK 94C - 300/Front.jpeg",
      "car_price": "185Million With New Registration",
      "car_description": "2003 SCANIA DUMP TRUCK 94C - 300\r\n\r\nPrice : 185Million With New Registration \r\n\r\nNumber Of Axle : 8x4\r\nFuel : Diesel\r\nTransmission : Manual\r\nBody Type : Dump Truck\r\nColour : Orange 🍊 \r\nCarrying Capacity : 25Ton\r\n\r\nFeatures:\r\nDriver Bed | Fm Radio | Fog Lights | Ac | Sports Lights\r\n\r\n📍Location : Sinza Dar Es Salaam",
      "created_at": "2026-02-11T13:55:54.000000Z",
      "updated_at": "2026-02-11T13:55:54.000000Z"
    }
  ]
}
```

## Image URL Format

**Relative path from API:** `TGworld/2003 SCANIA DUMP TRUCK 94C - 300/Front.jpeg`

**Full URL:** `https://tgworld.e-saloon.online/public/TGworld/2003 SCANIA DUMP TRUCK 94C - 300/Front.jpeg`

## How the App Handles It

The app automatically transforms the API response:

1. **Wraps the data array:** Extracts `response.data`
2. **Transforms field names:**
   - `car_id` → `id`
   - `car_name` → `name` (with year extracted)
   - `car_pic` → `image` (converted to full URL)
   - `car_price` → `price`
   - `car_description` → `description`

3. **Extracts additional info from description:**
   - Year (from car_name: "2003 SCANIA...")
   - Transmission
   - Fuel
   - Mileage
   - Color

4. **Builds full image URLs:** 
   - Base: `https://tgworld.e-saloon.online/public/`
   - Path: `{car_pic from API}`
   - Result: Full accessible URL

## Data Flow

```
API Response → Transform Function → App Format → Display
```

**Example transformation:**
```javascript
// API returns:
{
  car_id: 1,
  car_name: "2003 SCANIA DUMP TRUCK 94C - 300",
  car_pic: "TGworld/...",
  car_price: "185Million..."
}

// App uses:
{
  id: "1",
  name: "SCANIA DUMP TRUCK 94C - 300",
  year: 2003,
  price: "185Million...",
  image: "https://tgworld.e-saloon.online/public/TGworld/...",
  fuel: "Diesel",
  transmission: "Manual"
}
```

## Status

✅ API Integration Complete
✅ Image URLs Working  
✅ Data Transformation Working
✅ Website Ready to Display Real Cars
