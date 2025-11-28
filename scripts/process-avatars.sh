#!/bin/bash

# Script to process custom avatars - rename and create multiple sizes
# This creates optimized versions of the avatars for web use

SOURCE_DIR="/Users/max.jaffe/gift-tracker/public/images/Avatars"
DEST_DIR="/Users/max.jaffe/gift-tracker/public/avatars"

# Create destination directory
mkdir -p "$DEST_DIR"

# Declare associative array for mapping old names to new IDs
declare -A AVATAR_MAP=(
    # Boys (ages 5-12)
    ["Little boy with messy blonde hair, missing front tooth, excited look.png"]="boy-1"

    # Girls (ages 5-12) - using existing files that could work

    # Teen Boys
    ["Teenage boy with shaggy hair covering one eye, shy smile.png"]="teen-boy-1"
    ["Young man with K-pop style hair, smooth features.png"]="teen-boy-2"

    # Teen Girls
    ["Teenage girl with blue-streaked hair, nose ring, playful smirk.png"]="teen-girl-1"

    # Men
    ["Middle-aged man with salt-and-pepper beard, kind eyes, glasses.png"]="man-1"
    ["Young man with dark skin, short fade haircut, bright confident smile.png"]="man-2"
    ["Latino man with thick mustache, warm brown eyes, friendly grin.png"]="man-3"
    ["Athletic young man with buzzcut, dimples.png"]="man-4"
    ["Man with man-bun, full beard, hipster glasses.png"]="man-5"
    ["Man with dreadlocks, infectious laugh, gold earring.png"]="man-6"
    ["Professional man with sharp haircut, subtle smile.png"]="man-7"
    ["Wholesome dad with sweater vest, genuine warmth.png"]="man-8"
    ["Dad-type with receding hairline, dad jokes energy.png"]="man-9"
    ["Younger Dad, Glasses, mix of cool and comic nerd.png"]="man-10"

    # Women
    ["Young woman with curly red hair and freckles, green eyes, warm smile.png"]="woman-1"
    ["Asian woman with long black hair, subtle makeup, serene expression.png"]="woman-2"
    ["Woman with hijab, soft features, gentle smile.png"]="woman-3"
    ["Woman with short pixie cut, bold red lipstick.png"]="woman-4"
    ["Woman with silver bob, artistic vibe, dangly earrings.png"]="woman-5"
    ["Young professional woman with sleek ponytail, confident look.png"]="woman-6"
    ["Young woman with natural afro, hoop earrings, radiant smile.png"]="woman-7"
    ["Punk rock woman with mohawk, multiple piercings, friendly face.png"]="woman-8"
    ["Quirky aunt type with big glasses, colorful scarf.png"]="woman-9"
    ["Younger Mom, with brown hair messy bun artsy.png"]="woman-10"
    ["Younger Mom, with brown hair put up in a messy bun, large round blue:green eyes, great smile, cool bad ass mom vibes.png"]="woman-11"

    # Elderly
    ["Elderly grandmother with silver bun, rosy cheeks, pearl earrings.png"]="elder-woman-1"
    ["Grandmother with gray braids, reading glasses on nose.png"]="elder-woman-2"
    ["Elderly grandfather with bald head, bushy white eyebrows, jolly expression.png"]="elder-man-1"
)

# Size configurations
SIZES=(512 256 128 64)

echo "Processing avatars..."
echo "===================="

# Process each file
for old_name in "${!AVATAR_MAP[@]}"; do
    new_id="${AVATAR_MAP[$old_name]}"
    source_file="$SOURCE_DIR/$old_name"

    if [ ! -f "$source_file" ]; then
        echo "⚠️  Warning: Source file not found: $old_name"
        continue
    fi

    echo ""
    echo "Processing: $new_id"

    # Create each size
    for size in "${SIZES[@]}"; do
        output_file="$DEST_DIR/${new_id}-${size}.png"

        # Use sips to resize and optimize
        sips -z $size $size "$source_file" --out "$output_file" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            file_size=$(ls -lh "$output_file" | awk '{print $5}')
            echo "  ✅ Created ${size}px version ($file_size)"
        else
            echo "  ❌ Failed to create ${size}px version"
        fi
    done
done

echo ""
echo "===================="
echo "Avatar processing complete!"
echo ""
echo "Generated files in: $DEST_DIR"
echo "Total avatars processed: ${#AVATAR_MAP[@]}"
echo "Sizes created: ${SIZES[@]}px"
