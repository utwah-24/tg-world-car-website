# Illuminate\Database\UniqueConstraintViolationException - Internal Server Error

SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'TOYOTA LANDCRUISER PICKUP DOUBLE CAB VDJ79 - V8' for key 'cars_car_name_unique' (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: esaloon_tgworld, SQL: update `cars` set `car_name` = TOYOTA LANDCRUISER PICKUP DOUBLE CAB VDJ79 - V8, `year` = 2021, `company` = TOYOTA, `cars`.`updated_at` = 2026-03-26 21:40:15 where `car_id` = 18)

PHP 8.4.18
Laravel 12.53.0
tgworld.e-saloon.online

## Stack Trace

0 - vendor/laravel/framework/src/Illuminate/Database/Connection.php:838
1 - vendor/laravel/framework/src/Illuminate/Database/Connection.php:794
2 - vendor/laravel/framework/src/Illuminate/Database/Connection.php:597
3 - vendor/laravel/framework/src/Illuminate/Database/Connection.php:549
4 - vendor/laravel/framework/src/Illuminate/Database/Query/Builder.php:4204
5 - vendor/laravel/framework/src/Illuminate/Database/Eloquent/Builder.php:1266
6 - vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:1316
7 - vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:1233
8 - vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:1090
9 - vendor/filament/filament/src/Resources/Pages/EditRecord.php:251
10 - vendor/filament/filament/src/Resources/Pages/EditRecord.php:151
11 - vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php:36
12 - vendor/laravel/framework/src/Illuminate/Container/Util.php:43
13 - vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php:96
14 - vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php:35
15 - vendor/livewire/livewire/src/Wrapped.php:23
16 - vendor/livewire/livewire/src/Mechanisms/HandleComponents/HandleComponents.php:492
17 - vendor/livewire/livewire/src/Mechanisms/HandleComponents/HandleComponents.php:101
18 - vendor/livewire/livewire/src/LivewireManager.php:102
19 - vendor/livewire/livewire/src/Mechanisms/HandleRequests/HandleRequests.php:131
20 - vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php:46
21 - vendor/laravel/framework/src/Illuminate/Routing/Route.php:265
22 - vendor/laravel/framework/src/Illuminate/Routing/Route.php:211
23 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:822
24 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:180
25 - vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php:50
26 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
27 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php:87
28 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
29 - vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php:48
30 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
31 - vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php:120
32 - vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php:63
33 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
34 - vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php:36
35 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
36 - vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php:74
37 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
38 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:137
39 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:821
40 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:800
41 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:764
42 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:753
43 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php:200
44 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:180
45 - vendor/livewire/livewire/src/Features/SupportDisablingBackButtonCache/DisableBackButtonCacheMiddleware.php:19
46 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
47 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php:27
48 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
49 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php:47
50 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
51 - vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php:27
52 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
53 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php:109
54 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
55 - vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php:61
56 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
57 - vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php:58
58 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
59 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php:22
60 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
61 - vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php:26
62 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
63 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:137
64 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php:175
65 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php:144
66 - vendor/laravel/framework/src/Illuminate/Foundation/Application.php:1220
67 - index.php:20

## Request

POST /livewire/update

## Headers

* **accept**: */*
* **accept-encoding**: gzip, deflate, br, zstd
* **accept-language**: en-US,en;q=0.9
* **content-type**: application/json
* **content-length**: 3513
* **cookie**: XSRF-TOKEN=eyJpdiI6ImdTSUtrVEhHSExvd3cwSFNFQnRUUkE9PSIsInZhbHVlIjoiRGltRVA4azg4dmY5TmFKdGQzMFlRSHBiVktXVGVaQVN3UzRFbVFEUjdBc21OMldFVWw3d0NsTTdhRUxQSlFDS0xldld6NXlhZkVRYWVaMWJKSW1kcFlVdVRUS0lLMERHRDA4bHN6LzhBZkcvMVkzZmF0YjZyWEFPbnUrcVR0aFciLCJtYWMiOiJlMzViMjc4OGJjZGExNzYxOTlhMWI1ZmIyOGQ4YzYwZTg0NjdhNmRlYzA2MTkxYTFjNjM1NDE0ZDRlODAxZWIyIiwidGFnIjoiIn0%3D; laravel-session=eyJpdiI6IlEzWDJkTy9rcjExOVh5UHNxUDl4QWc9PSIsInZhbHVlIjoiNzRvSC9GUTFzMGlYMFVaQlRleTFibGUrTWx6UGVHM2xkNTNKbWd3ZXhFWE9ueUNuTmVZbW4xTTdoNVVSY25meW1aalEwL0VSUUxQSU5VUEdEMlhiVEVJUTZ4NTJ2RytHQlFOaFc4dDRFWHl0Um54a1R5UXRRTndOU3hmQWpNblAiLCJtYWMiOiI0NDM1NjViNDhiY2JkZGNhNThmZmMyMTM0Y2ZkZTVhMWRjNGY3OTYyNTM1NjkxZWZhNzU1ODdmMGU2NWJlNDBkIiwidGFnIjoiIn0%3D
* **host**: tgworld.e-saloon.online
* **referer**: https://tgworld.e-saloon.online/admin/cars/18/edit
* **user-agent**: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
* **x-forwarded-for**: 197.250.134.83
* **sec-ch-ua-platform**: "macOS"
* **sec-ch-ua**: "Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"
* **x-livewire**: 
* **sec-ch-ua-mobile**: ?0
* **origin**: https://tgworld.e-saloon.online
* **sec-fetch-site**: same-origin
* **sec-fetch-mode**: cors
* **sec-fetch-dest**: empty
* **priority**: u=1, i
* **x-forwarded-proto**: https
* **x-https**: on

## Route Context

controller: Livewire\Mechanisms\HandleRequests\HandleRequests@handleUpdate
route name: default.livewire.update
middleware: web

## Route Parameters

No route parameter data available.

## Database Queries

* mysql - select * from `sessions` where `id` = '6OO8ux44sOU2ar6YaCLDUHHPsOMZcFN5UHkSba8k' limit 1 (6.9 ms)
* mysql - select * from `admins` where `id` = 1 limit 1 (5.04 ms)
* mysql - select * from `cars` where `cars`.`car_id` = 18 limit 1 (0.89 ms)
