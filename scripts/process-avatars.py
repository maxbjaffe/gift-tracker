#!/usr/bin/env python3
"""
Process custom avatars - rename and create multiple sizes
This creates optimized versions of the avatars for web use
"""

import os
import subprocess
from pathlib import Path

SOURCE_DIR = Path("/Users/max.jaffe/gift-tracker/public/images/Avatars")
DEST_DIR = Path("/Users/max.jaffe/gift-tracker/public/avatars")

# Mapping of original filenames to new IDs and categories
AVATAR_MAP = {
    # Boys (ages 5-12)
    "Little boy with messy blonde hair, missing front tooth, excited look.png": {
        "id": "boy-1",
        "name": "Boy 1",
        "category": "people"
    },

    # Teen Boys
    "Teenage boy with shaggy hair covering one eye, shy smile.png": {
        "id": "teen-boy-1",
        "name": "Teen Boy 1",
        "category": "people"
    },
    "Young man with K-pop style hair, smooth features.png": {
        "id": "teen-boy-2",
        "name": "Teen Boy 2",
        "category": "people"
    },

    # Teen Girls
    "Teenage girl with blue-streaked hair, nose ring, playful smirk.png": {
        "id": "teen-girl-1",
        "name": "Teen Girl 1",
        "category": "people"
    },

    # Men
    "Middle-aged man with salt-and-pepper beard, kind eyes, glasses.png": {
        "id": "man-1",
        "name": "Man 1",
        "category": "people"
    },
    "Young man with dark skin, short fade haircut, bright confident smile.png": {
        "id": "man-2",
        "name": "Man 2",
        "category": "people"
    },
    "Latino man with thick mustache, warm brown eyes, friendly grin.png": {
        "id": "man-3",
        "name": "Man 3",
        "category": "people"
    },
    "Athletic young man with buzzcut, dimples.png": {
        "id": "man-4",
        "name": "Man 4",
        "category": "people"
    },
    "Man with man-bun, full beard, hipster glasses.png": {
        "id": "man-5",
        "name": "Man 5",
        "category": "people"
    },
    "Man with dreadlocks, infectious laugh, gold earring.png": {
        "id": "man-6",
        "name": "Man 6",
        "category": "people"
    },
    "Professional man with sharp haircut, subtle smile.png": {
        "id": "man-7",
        "name": "Man 7",
        "category": "people"
    },
    "Wholesome dad with sweater vest, genuine warmth.png": {
        "id": "man-8",
        "name": "Man 8",
        "category": "people"
    },
    "Dad-type with receding hairline, dad jokes energy.png": {
        "id": "man-9",
        "name": "Man 9",
        "category": "people"
    },
    "Younger Dad, Glasses, mix of cool and comic nerd.png": {
        "id": "man-10",
        "name": "Man 10",
        "category": "people"
    },

    # Women
    "Young woman with curly red hair and freckles, green eyes, warm smile.png": {
        "id": "woman-1",
        "name": "Woman 1",
        "category": "people"
    },
    "Asian woman with long black hair, subtle makeup, serene expression.png": {
        "id": "woman-2",
        "name": "Woman 2",
        "category": "people"
    },
    "Woman with hijab, soft features, gentle smile.png": {
        "id": "woman-3",
        "name": "Woman 3",
        "category": "people"
    },
    "Woman with short pixie cut, bold red lipstick.png": {
        "id": "woman-4",
        "name": "Woman 4",
        "category": "people"
    },
    "Woman with silver bob, artistic vibe, dangly earrings.png": {
        "id": "woman-5",
        "name": "Woman 5",
        "category": "people"
    },
    "Young professional woman with sleek ponytail, confident look.png": {
        "id": "woman-6",
        "name": "Woman 6",
        "category": "people"
    },
    "Young woman with natural afro, hoop earrings, radiant smile.png": {
        "id": "woman-7",
        "name": "Woman 7",
        "category": "people"
    },
    "Punk rock woman with mohawk, multiple piercings, friendly face.png": {
        "id": "woman-8",
        "name": "Woman 8",
        "category": "people"
    },
    "Quirky aunt type with big glasses, colorful scarf.png": {
        "id": "woman-9",
        "name": "Woman 9",
        "category": "people"
    },
    "Younger Mom, with brown hair messy bun artsy.png": {
        "id": "woman-10",
        "name": "Woman 10",
        "category": "people"
    },
    "Younger Mom, with brown hair put up in a messy bun, large round blue:green eyes, great smile, cool bad ass mom vibes.png": {
        "id": "woman-11",
        "name": "Woman 11",
        "category": "people"
    },

    # Elderly
    "Elderly grandmother with silver bun, rosy cheeks, pearl earrings.png": {
        "id": "elder-woman-1",
        "name": "Elder Woman 1",
        "category": "people"
    },
    "Grandmother with gray braids, reading glasses on nose.png": {
        "id": "elder-woman-2",
        "name": "Elder Woman 2",
        "category": "people"
    },
    "Elderly grandfather with bald head, bushy white eyebrows, jolly expression.png": {
        "id": "elder-man-1",
        "name": "Elder Man 1",
        "category": "people"
    },
}

# Size configurations
SIZES = [512, 256, 128, 64]

def process_avatars():
    """Process all avatars - resize and optimize"""

    # Create destination directory
    DEST_DIR.mkdir(parents=True, exist_ok=True)

    print("Processing avatars...")
    print("=" * 50)

    processed_count = 0

    for old_name, avatar_info in AVATAR_MAP.items():
        avatar_id = avatar_info["id"]
        source_file = SOURCE_DIR / old_name

        if not source_file.exists():
            print(f"\n⚠️  Warning: Source file not found: {old_name}")
            continue

        print(f"\nProcessing: {avatar_id} ({avatar_info['name']})")

        # Create each size
        for size in SIZES:
            output_file = DEST_DIR / f"{avatar_id}-{size}.png"

            try:
                # Use sips to resize and optimize
                result = subprocess.run(
                    ["sips", "-z", str(size), str(size), str(source_file), "--out", str(output_file)],
                    capture_output=True,
                    text=True,
                    check=True
                )

                # Get file size
                file_size = output_file.stat().st_size / 1024  # KB
                print(f"  ✅ Created {size}px version ({file_size:.1f}KB)")

            except subprocess.CalledProcessError as e:
                print(f"  ❌ Failed to create {size}px version: {e}")

        processed_count += 1

    print("\n" + "=" * 50)
    print(f"Avatar processing complete!")
    print(f"\nGenerated files in: {DEST_DIR}")
    print(f"Total avatars processed: {processed_count}/{len(AVATAR_MAP)}")
    print(f"Sizes created: {', '.join(f'{s}px' for s in SIZES)}")

    # Return the avatar map for use in updating avatar-utils.ts
    return AVATAR_MAP

if __name__ == "__main__":
    process_avatars()
