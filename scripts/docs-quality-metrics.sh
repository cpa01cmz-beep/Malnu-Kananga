#!/bin/bash

# Documentation Quality Metrics Script
# Calculates comprehensive documentation quality metrics

echo "📊 Calculating Documentation Quality Metrics..."

# Initialize counters
TOTAL_DOCS=0
VALID_LINKS=0
TOTAL_LINKS=0
DOCS_WITH_VERSIONS=0
DOCS_WITH_DATES=0
DOCS_WITH_CODE_EXAMPLES=0
VALID_CODE_EXAMPLES=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}=== DOCUMENTATION COVERAGE ANALYSIS ===${NC}"

# Count total documentation files
TOTAL_DOCS=$(find docs/ -name "*.md" | wc -l)
echo "${BLUE}📚 Total Documentation Files:${NC} $TOTAL_DOCS"

# Analyze documentation categories
USER_GUIDES=$(find docs/ -name "USER_GUIDE*.md" | wc -l)
TECH_DOCS=$(find docs/ -name "*ARCHITECTURE.md" -o -name "*API*.md" -o -name "*DATABASE*.md" | wc -l)
SECURITY_DOCS=$(find docs/ -name "*SECURITY*.md" | wc -l)
AI_DOCS=$(find docs/ -name "*AI*.md" -o -name "*RAG*.md" | wc -l)

echo "${BLUE}📋 Documentation Categories:${NC}"
echo "  👥 User Guides: $USER_GUIDES"
echo "  🔧 Technical Docs: $TECH_DOCS"
echo "  🔒 Security Docs: $SECURITY_DOCS"
echo "  🤖 AI & Backend: $AI_DOCS"

echo ""
echo "${BLUE}=== VERSION CONSISTENCY ANALYSIS ===${NC}"

# Check version consistency
VERSIONS=$(grep -r "Version:" docs/ | grep -v ".git" | sed 's/.*Version: \([0-9.]*\).*/\1/' | sort | uniq -c)
echo "${BLUE}📝 Version Distribution:${NC}"
echo "$VERSIONS"

# Count documents with proper version headers
DOCS_WITH_VERSIONS=$(grep -l "Version:" docs/*.md | wc -l)
VERSION_COVERAGE=$((DOCS_WITH_VERSIONS * 100 / TOTAL_DOCS))
echo "${BLUE}📊 Version Coverage:${NC} $DOCS_WITH_VERSIONS/$TOTAL_DOCS ($VERSION_COVERAGE%)"

if [ $VERSION_COVERAGE -ge 90 ]; then
    echo "${GREEN}✅ Excellent version consistency${NC}"
elif [ $VERSION_COVERAGE -ge 75 ]; then
    echo "${YELLOW}⚠️ Good version consistency${NC}"
else
    echo "${RED}❌ Poor version consistency${NC}"
fi

echo ""
echo "${BLUE}=== DATE FRESHNESS ANALYSIS ===${NC}"

# Check date consistency
DOCS_WITH_DATES=$(grep -l "Last Updated:" docs/*.md | wc -l)
DATE_COVERAGE=$((DOCS_WITH_DATES * 100 / TOTAL_DOCS))
echo "${BLUE}📅 Date Coverage:${NC} $DOCS_WITH_DATES/$TOTAL_DOCS ($DATE_COVERAGE%)"

# Find oldest and newest documentation
OLDEST_DOC=$(find docs/ -name "*.md" -exec stat -c "%Y %n" {} \; | sort -n | head -1 | cut -d' ' -f2-)
NEWEST_DOC=$(find docs/ -name "*.md" -exec stat -c "%Y %n" {} \; | sort -n | tail -1 | cut -d' ' -f2-)

echo "${BLUE}📆 Date Range:${NC}"
echo "  📜 Oldest: $(stat -c "%y" $OLDEST_DOC | cut -d' ' -f1) - $(basename $OLDEST_DOC)"
echo "  🆕 Newest: $(stat -c "%y" $NEWEST_DOC | cut -d' ' -f1) - $(basename $NEWEST_DOC)"

echo ""
echo "${BLUE}=== LINK HEALTH ANALYSIS ===${NC}"

# Extract and check internal links
echo "${BLUE}🔗 Checking internal links...${NC}"
for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        # Extract markdown links
        links=$(grep -o '\[.*\]([^)]*)' "$doc" | sed 's/\[.*\](\([^)]*\))/\1/' | grep -v '^http')
        for link in $links; do
            TOTAL_LINKS=$((TOTAL_LINKS + 1))
            # Remove anchor and check if file exists
            clean_link=$(echo "$link" | cut -d'#' -f1)
            if [ -z "$clean_link" ] || [ -f "$clean_link" ] || [ -f "docs/$clean_link" ] || [ -f "$(dirname "$doc")/$clean_link" ]; then
                VALID_LINKS=$((VALID_LINKS + 1))
            fi
        done
    fi
done

if [ $TOTAL_LINKS -gt 0 ]; then
    LINK_HEALTH=$((VALID_LINKS * 100 / TOTAL_LINKS))
    echo "${BLUE}🔗 Link Health:${NC} $VALID_LINKS/$TOTAL_LINKS ($LINK_HEALTH%)"
    
    if [ $LINK_HEALTH -ge 95 ]; then
        echo "${GREEN}✅ Excellent link health${NC}"
    elif [ $LINK_HEALTH -ge 85 ]; then
        echo "${YELLOW}⚠️ Good link health${NC}"
    else
        echo "${RED}❌ Poor link health - needs attention${NC}"
    fi
else
    echo "${BLUE}🔗 Link Health:${NC} No internal links found"
fi

echo ""
echo "${BLUE}=== CODE EXAMPLE ANALYSIS ===${NC}"

# Analyze code examples
echo "${BLUE}💻 Analyzing code examples...${NC}"
for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        code_blocks=$(grep -c '```' "$doc")
        if [ $code_blocks -gt 0 ]; then
            DOCS_WITH_CODE_EXAMPLES=$((DOCS_WITH_CODE_EXAMPLES + 1))
            # Basic syntax validation (check for language specification)
            with_lang=$(grep -c '```[a-zA-Z]' "$doc")
            if [ $with_lang -gt 0 ]; then
                VALID_CODE_EXAMPLES=$((VALID_CODE_EXAMPLES + 1))
            fi
        fi
    fi
done

if [ $DOCS_WITH_CODE_EXAMPLES -gt 0 ]; then
    CODE_QUALITY=$((VALID_CODE_EXAMPLES * 100 / DOCS_WITH_CODE_EXAMPLES))
    echo "${BLUE}💻 Code Example Quality:${NC} $VALID_CODE_EXAMPLES/$DOCS_WITH_CODE_EXAMPLES ($CODE_QUALITY%)"
    echo "${BLUE}📊 Documents with Code Examples:${NC} $DOCS_WITH_CODE_EXAMPLES/$TOTAL_DOCS"
else
    echo "${BLUE}💻 Code Examples:${NC} No code examples found"
fi

echo ""
echo "${BLUE}=== STRUCTURE ANALYSIS ===${NC}"

# Check document structure
echo "${BLUE}📋 Analyzing document structure...${NC}"
GOOD_STRUCTURE=0

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        # Check for proper heading structure
        has_h1=$(grep -c '^# ' "$doc")
        has_h2=$(grep -c '^## ' "$doc")
        has_toc=$(grep -c "## 📋" "$doc" || grep -c "## Table of Contents" "$doc")
        
        if [ $has_h1 -gt 0 ] && [ $has_h2 -gt 0 ]; then
            GOOD_STRUCTURE=$((GOOD_STRUCTURE + 1))
        fi
    fi
done

STRUCTURE_QUALITY=$((GOOD_STRUCTURE * 100 / TOTAL_DOCS))
echo "${BLUE}📋 Document Structure Quality:${NC} $GOOD_STRUCTURE/$TOTAL_DOCS ($STRUCTURE_QUALITY%)"

echo ""
echo "${BLUE}=== OVERALL QUALITY SCORE ===${NC}"

# Calculate overall quality score
OVERALL_SCORE=0
OVERALL_SCORE=$((OVERALL_SCORE + VERSION_COVERAGE))
OVERALL_SCORE=$((OVERALL_SCORE + DATE_COVERAGE))
OVERALL_SCORE=$((OVERALL_SCORE + LINK_HEALTH))
OVERALL_SCORE=$((OVERALL_SCORE + STRUCTURE_QUALITY))

# Add code example quality if applicable
if [ $DOCS_WITH_CODE_EXAMPLES -gt 0 ]; then
    OVERALL_SCORE=$((OVERALL_SCORE + CODE_QUALITY))
fi

# Calculate average
if [ $DOCS_WITH_CODE_EXAMPLES -gt 0 ]; then
    OVERALL_SCORE=$((OVERALL_SCORE / 5))
else
    OVERALL_SCORE=$((OVERALL_SCORE / 4))
fi

echo "${BLUE}📊 Overall Documentation Quality Score:${NC} $OVERALL_SCORE%"

if [ $OVERALL_SCORE -ge 90 ]; then
    echo "${GREEN}🏆 EXCELLENT - Industry-leading documentation quality${NC}"
elif [ $OVERALL_SCORE -ge 80 ]; then
    echo "${GREEN}✅ VERY GOOD - High quality documentation${NC}"
elif [ $OVERALL_SCORE -ge 70 ]; then
    echo "${YELLOW}⚠️ GOOD - Documentation meets standards${NC}"
elif [ $OVERALL_SCORE -ge 60 ]; then
    echo "${YELLOW}⚠️ FAIR - Documentation needs improvement${NC}"
else
    echo "${RED}❌ POOR - Documentation requires significant improvement${NC}"
fi

echo ""
echo "${BLUE}=== RECOMMENDATIONS ===${NC}"

if [ $VERSION_COVERAGE -lt 90 ]; then
    echo "${YELLOW}📝 Add version information to all documents${NC}"
fi

if [ $DATE_COVERAGE -lt 90 ]; then
    echo "${YELLOW}📅 Add last updated dates to all documents${NC}"
fi

if [ $LINK_HEALTH -lt 95 ]; then
    echo "${YELLOW}🔗 Fix broken internal links${NC}"
fi

if [ $STRUCTURE_QUALITY -lt 85 ]; then
    echo "${YELLOW}📋 Improve document structure with proper headings${NC}"
fi

if [ $DOCS_WITH_CODE_EXAMPLES -gt 0 ] && [ $CODE_QUALITY -lt 90 ]; then
    echo "${YELLOW}💻 Add language specifications to code blocks${NC}"
fi

echo ""
echo "${GREEN}✅ Documentation quality analysis complete!${NC}"
echo "${BLUE}📊 Quality Score: $OVERALL_SCORE%${NC}"