# New Avatars Setup Guide

## 17 New Avatars to Add

Download each image and rename according to this table. Each avatar needs 4 sizes.

### Image Mapping

| Download URL | Rename To (base) | Display Name |
|-------------|------------------|--------------|
| `Young-woman-with-box-braids-nose-stud-infectious-energy.png` | `woman-12` | Box Braids |
| `Grandpa-with-thick-white-mustache-flannel-shirt-vibes-twinkle-in-eye.png` | `elder-man-2` | Flannel Grandpa |
| `Toddler-boy-with-chubby-cheeks-wild-curly-hair-mischievous-grin.png` | `toddler-boy-1` | Curly Toddler |
| `Professional-woman-with-locs-pulled-up-elegant-confidence.png` | `woman-13` | Professional Locs |
| `Dad-with-shaved-head-full-sleeve-tattoo-peeking-out-warm-smile.png` | `man-11` | Tattoo Dad |
| `Teenage-girl-with-braces-excitement-bursting-through.png` | `teen-girl-2` | Braces Girl |
| `Hipster-guy-with-round-tortoise-glasses-neat-beard-beanie.png` | `man-12` | Hipster Guy |
| `Skater-kid-with-backwards-cap-scraped-knee-energy-stoked-expression.png` | `boy-2` | Skater Boy |
| `Young-dad-holding-it-together-slight-stubble-tired-but-happy-eyes.png` | `man-13` | Tired Dad |
| `Little-girl-with-poofy-ponytails-sparkly-barrettes-pure-joy.png` | `girl-1` | Poofy Ponytails |
| `Tech-bro-with-airpods-implied-hoodie-optimistic-smirk.png` | `man-14` | Tech Bro |
| `Auntie-with-big-personality-bold-jewelry-knowing-look.png` | `woman-14` | Bold Auntie |
| `Fitness-mom-with-high-ponytail-healthy-glow-encouraging-smile.png` | `woman-15` | Fitness Mom |
| `Young-mom-with-messy-bun-coffee-fueled-determination-real-smile.png` | `woman-16` | Coffee Mom |
| `Little-boy-with-superhero-obsession-showing-cape-implied-heroic-pose.png` | `boy-3` | Superhero Boy |
| `Sophisticated-woman-with-chic-bob-minimal-jewelry-quiet-confidence.png` | `woman-17` | Sophisticated |
| `Artistic-young-woman-with-paint-stained-fingers-implied-dreamy-look.png` | `woman-18` | Artistic |

---

## Quick Setup (Recommended)

### Option A: Use the processing script

1. Put your original images in: `public/images/Avatars/`
2. Run the updated processing script:
   ```bash
   chmod +x scripts/process-avatars.sh
   ./scripts/process-avatars.sh
   ```

### Option B: Manual resize

For each image, create 4 sizes and place in `public/avatars/`:

```
{id}-64.png   (64x64 pixels)
{id}-128.png  (128x128 pixels)
{id}-256.png  (256x256 pixels)
{id}-512.png  (512x512 pixels)
```

Example for `woman-12`:
```
public/avatars/woman-12-64.png
public/avatars/woman-12-128.png
public/avatars/woman-12-256.png
public/avatars/woman-12-512.png
```

---

## Files Already Updated

- `src/lib/avatar-utils.ts` - All 17 new avatars added to `AVATAR_PRESETS`

## New Avatar Count

| Category | Before | After |
|----------|--------|-------|
| Toddlers | 0 | 1 |
| Boys (5-12) | 1 | 3 |
| Girls (5-12) | 0 | 1 |
| Teen Boys | 2 | 2 |
| Teen Girls | 1 | 2 |
| Men | 10 | 14 |
| Women | 11 | 18 |
| Elderly | 3 | 4 |
| **Total** | **28** | **45** |

---

## imgbb Download Links

```
https://i.ibb.co/h1RxFd4w/Young-woman-with-box-braids-nose-stud-infectious-energy.png
https://i.ibb.co/6Ryvd1YW/Grandpa-with-thick-white-mustache-flannel-shirt-vibes-twinkle-in-eye.png
https://i.ibb.co/zVLpgmN7/Toddler-boy-with-chubby-cheeks-wild-curly-hair-mischievous-grin.png
https://i.ibb.co/bgczPHhP/Professional-woman-with-locs-pulled-up-elegant-confidence.png
https://i.ibb.co/Ngz0KXsc/Dad-with-shaved-head-full-sleeve-tattoo-peeking-out-warm-smile.png
https://i.ibb.co/WNB1Nb8c/Teenage-girl-with-braces-excitement-bursting-through.png
https://i.ibb.co/TD1V0mmh/Hipster-guy-with-round-tortoise-glasses-neat-beard-beanie.png
https://i.ibb.co/XxC4H7r7/Skater-kid-with-backwards-cap-scraped-knee-energy-stoked-expression.png
https://i.ibb.co/1GLnsS0C/Young-dad-holding-it-together-slight-stubble-tired-but-happy-eyes.png
https://i.ibb.co/DHS3C5JY/Little-girl-with-poofy-ponytails-sparkly-barrettes-pure-joy.png
https://i.ibb.co/gMZxz8CD/Tech-bro-with-airpods-implied-hoodie-optimistic-smirk.png
https://i.ibb.co/Qvb7bMGQ/Auntie-with-big-personality-bold-jewelry-knowing-look.png
https://i.ibb.co/Jjnk7Wr2/Fitness-mom-with-high-ponytail-healthy-glow-encouraging-smile.png
https://i.ibb.co/YFtqvmpy/Young-mom-with-messy-bun-coffee-fueled-determination-real-smile.png
https://i.ibb.co/xp1KK1n/Little-boy-with-superhero-obsession-showing-cape-implied-heroic-pose.png
https://i.ibb.co/NngXXPvD/Sophisticated-woman-with-chic-bob-minimal-jewelry-quiet-confidence.png
https://i.ibb.co/23gx2Q5n/Artistic-young-woman-with-paint-stained-fingers-implied-dreamy-look.png
```
