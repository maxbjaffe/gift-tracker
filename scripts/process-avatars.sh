#!/bin/bash

# Script to process NEW avatars only - rename and create multiple sizes
# Updated for home machine - MaxJaffe_Alexs

SOURCE_DIR="/Users/MaxJaffe_Alexs/gift-tracker/public/avatars/new"
DEST_DIR="/Users/MaxJaffe_Alexs/gift-tracker/public/avatars"

# Create destination directory
mkdir -p "$DEST_DIR"

# Size configurations
SIZES=(512 256 128 64)

echo "Processing NEW avatars..."
echo "===================="
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"
echo ""

# Process each file with simple mapping
process_avatar() {
    local filename="$1"
    local new_id="$2"
    local source_file="$SOURCE_DIR/$filename"

    if [ ! -f "$source_file" ]; then
        echo "⚠️  Not found: $filename"
        return
    fi

    echo "Processing: $new_id"

    for size in "${SIZES[@]}"; do
        output_file="$DEST_DIR/${new_id}-${size}.png"
        sips -z $size $size "$source_file" --out "$output_file" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            file_size=$(ls -lh "$output_file" | awk '{print $5}')
            echo "  ✅ ${size}px ($file_size)"
        else
            echo "  ❌ Failed ${size}px"
        fi
    done
}

# Map the 17 new avatars (exact filenames from your new folder)
process_avatar "Young woman with box braids, nose stud, infectious energy.png" "woman-12"
process_avatar "Grandpa with thick white mustache, flannel shirt vibes, twinkle in eye.png" "elder-man-2"
process_avatar "Toddler boy with chubby cheeks, wild curly hair, mischievous grin.png" "toddler-boy-1"
process_avatar "Professional woman with locs pulled up, elegant confidence.png" "woman-13"
process_avatar "Dad with shaved head, full sleeve tattoo peeking out, warm smile.png" "man-11"
process_avatar "Teenage girl with braces, excitement bursting through.png" "teen-girl-2"
process_avatar "Hipster guy with round tortoise glasses, neat beard, beanie.png" "man-12"
process_avatar "Skater kid with backwards cap, scraped knee energy, stoked expression.png" "boy-2"
process_avatar "Young dad holding it together, slight stubble, tired but happy eyes.png" "man-13"
process_avatar "Little girl with poofy ponytails, sparkly barrettes, pure joy.png" "girl-1"
process_avatar "Tech bro with airpods implied, hoodie, optimistic smirk.png" "man-14"
process_avatar "Auntie with big personality, bold jewelry, knowing look.png" "woman-14"
process_avatar "Fitness mom with high ponytail, healthy glow, encouraging smile.png" "woman-15"
process_avatar "Young mom with messy bun, coffee-fueled determination, real smile.png" "woman-16"
process_avatar "Little boy with superhero obsession showing, cape implied, heroic pose.png" "boy-3"
process_avatar "Sophisticated woman with chic bob, minimal jewelry, quiet confidence.png" "woman-17"
process_avatar "Artistic young woman with paint-stained fingers implied, dreamy look.png" "woman-18"

echo ""
echo "===================="
echo "Done! Check $DEST_DIR for the processed avatars."
