#!/bin/bash
#
# CFM Manager Card - Build Script
#
# Version: v2.0.0
# Concat all source files into dist/cfm-manager-card.js

set -e

echo "🔨 Building CFM Manager Card v2.0.0..."

# Ensure dist directory exists
mkdir -p dist

# Output file
OUTPUT="dist/cfm-manager-card.js"

# Clear output file
> "$OUTPUT"

# Add header
cat <<EOF >> "$OUTPUT"
/**
 * CFM Manager Card
 *
 * Version: v2.0.0
 * Author: Fehér Zsolt
 * License: MIT
 *
 * Built: $(date "+%Y-%m-%d %H:%M:%S")
 */

EOF

# Concat source files (order matters!)
echo "📦 Concatenating source files..."

# 1. Styles (export as inline strings, not ES6 modules)
echo "(function() {" >> "$OUTPUT"
echo "  // Inline styles from card-styles.js" >> "$OUTPUT"
sed 's/export function getCardStyles()/window.getCardStyles = function()/' src/styles/card-styles.js >> "$OUTPUT"
echo "" >> "$OUTPUT"

# 2. Card Main (replace import statements)
echo "  // Card main class" >> "$OUTPUT"
sed 's/import.*//' src/card-main.js | \
  sed 's/_getStyles() {/_getStyles() { return window.getCardStyles();/' >> "$OUTPUT"
echo "" >> "$OUTPUT"

# 3. Config Editor (replace import statements)
echo "  // Config editor class" >> "$OUTPUT"
sed 's/import.*//' src/card-config.js | \
  sed 's/_getStyles() {/_getStyles() { return window.getConfigStyles();/' >> "$OUTPUT"

echo "})();" >> "$OUTPUT"

echo "✅ Build complete: $OUTPUT"
echo "📊 File size: $(wc -c < "$OUTPUT") bytes"
echo ""
echo "🚀 Next steps:"
echo "   1. Test locally: Copy to www/community/cfm-manager-card/"
echo "   2. Commit to GitHub"
echo "   3. Create HACS release tag"
