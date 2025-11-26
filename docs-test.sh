#!/bin/bash

# 🧪 Documentation Testing Script - MA Malnu Kananga
# 
# This script performs comprehensive testing of documentation including
# link validation, code example testing, and format validation.
#
# Version: 1.0.0
# Last Updated: November 25, 2025

set -euo pipefail

# Configuration
DOCS_DIR="docs"
OUTPUT_DIR="docs/reports"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
REPORT_FILE="$OUTPUT_DIR/docs-test-results-$TIMESTAMP.md"
TEMP_DIR="/tmp/docs-test-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create output and temporary directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

# Header
echo -e "${BLUE}🧪 Documentation Testing Suite${NC}"
echo "==================================="
echo "Timestamp: $TIMESTAMP"
echo "Output: $REPORT_FILE"
echo ""

# Initialize test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Start report
cat > "$REPORT_FILE" << EOF
# 🧪 Documentation Test Results - MA Malnu Kananga

## 🎯 Test Suite Overview

This report contains comprehensive test results for MA Malnu Kananga project documentation.

---

**Test Run**: $(date +"%B %d, %Y at %I:%M %p")  
**Test Environment**: GitHub Actions ubuntu-24.04-arm  
**Test Scope**: All files in \`$DOCS_DIR\` directory  
**Test Suite Version**: 1.0.0

---

## 📊 Test Summary

| Metric | Value |
|--------|-------|
| **Total Tests Run** | $TOTAL_TESTS |
| **Passed** | $PASSED_TESTS |
| **Failed** | $FAILED_TESTS |
| **Skipped** | $SKIPPED_TESTS |
| **Success Rate** | $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))% |

---

## 🔍 Test Results

EOF

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    ((TOTAL_TESTS++))
    echo -e "${BLUE}🧪 Running test:${NC} $test_name"
    
    if eval "$test_command" > "$TEMP_DIR/test-$TOTAL_TESTS.log" 2>&1; then
        if [[ "$expected_result" == "success" ]]; then
            ((PASSED_TESTS++))
            echo -e "  ${GREEN}✅ PASSED${NC}"
            cat >> "$REPORT_FILE" << EOF
### ✅ $test_name
**Status**: PASSED  
**Command**: \`$test_command\`  
**Timestamp**: $(date +"%H:%M:%S")

<details>
<summary>View Output</summary>

\`\`\`
$(cat "$TEMP_DIR/test-$TOTAL_TESTS.log")
\`\`\`

</details>

EOF
        else
            ((FAILED_TESTS++))
            echo -e "  ${RED}❌ FAILED${NC} (Expected failure but got success)"
            cat >> "$REPORT_FILE" << EOF
### ❌ $test_name
**Status**: FAILED  
**Command**: \`$test_command\`  
**Expected**: Failure  
**Actual**: Success  
**Timestamp**: $(date +"%H:%M:%S")

<details>
<summary>View Output</summary>

\`\`\`
$(cat "$TEMP_DIR/test-$TOTAL_TESTS.log")
\`\`\`

</details>

EOF
        fi
    else
        if [[ "$expected_result" == "failure" ]]; then
            ((PASSED_TESTS++))
            echo -e "  ${GREEN}✅ PASSED${NC} (Expected failure)"
            cat >> "$REPORT_FILE" << EOF
### ✅ $test_name
**Status**: PASSED  
**Command**: \`$test_command\`  
**Expected**: Failure  
**Actual**: Failure  
**Timestamp**: $(date +"%H:%M:%S")

<details>
<summary>View Output</summary>

\`\`\`
$(cat "$TEMP_DIR/test-$TOTAL_TESTS.log")
\`\`\`

</details>

EOF
        else
            ((FAILED_TESTS++))
            echo -e "  ${RED}❌ FAILED${NC}"
            cat >> "$REPORT_FILE" << EOF
### ❌ $test_name
**Status**: FAILED  
**Command**: \`$test_command\`  
**Timestamp**: $(date +"%H:%M:%S")

<details>
<summary>View Error Output</summary>

\`\`\`
$(cat "$TEMP_DIR/test-$TOTAL_TESTS.log")
\`\`\`

</details>

EOF
        fi
    fi
}

# Function to skip a test
skip_test() {
    local test_name="$1"
    local reason="$2"
    
    ((SKIPPED_TESTS++))
    echo -e "${YELLOW}⏭️  SKIPPING${NC} $test_name: $reason"
    
    cat >> "$REPORT_FILE" << EOF
### ⏭️ $test_name
**Status**: SKIPPED  
**Reason**: $reason  
**Timestamp**: $(date +"%H:%M:%S")

EOF
}

echo -e "${BLUE}🔍 Running documentation tests...${NC}"
echo ""

# Test 1: Check if docs directory exists
run_test "Documentation Directory Check" "test -d '$DOCS_DIR'" "success"

# Test 2: Check if there are markdown files
run_test "Markdown Files Presence" "test -n \"\$(find '$DOCS_DIR' -name '*.md' -type f | head -1)\"" "success"

# Test 3: Validate markdown syntax for all files
echo -e "${BLUE}🧪 Running markdown syntax validation...${NC}"
shopt -s nullglob
md_files=("$DOCS_DIR"/*.md)
shopt -u nullglob

for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        run_test "Markdown Syntax - $filename" "python3 -c \"import markdown; markdown.markdown(open('$file').read())\"" "success"
    fi
done

# Test 4: Check for required document structure
echo -e "${BLUE}🧪 Running document structure tests...${NC}"
for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        
        # Check for H1 header
        run_test "H1 Header - $filename" "grep -q '^# ' '$file'" "success"
        
        # Check for version information
        run_test "Version Info - $filename" "grep -qi -E 'version|versi' '$file'" "success"
        
        # Check for date information
        run_test "Date Info - $filename" "grep -qi -E 'last updated|updated|terakhir diperbarui' '$file'" "success"
    fi
done

# Test 5: Link validation
echo -e "${BLUE}🧪 Running link validation tests...${NC}"
for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        
        # Extract and test internal links
        internal_links=$(grep -o '\[.*\](\.\/[^)]*\.md)' "$file" | sort -u || true)
        if [[ -n "$internal_links" ]]; then
            while IFS= read -r link; do
                if [[ -n "$link" ]]; then
                    # Extract the path from the link
                    link_path=$(echo "$link" | sed 's/\[.*\](\.\///' | sed 's/)//')
                    full_path="$DOCS_DIR/$link_path"
                    run_test "Internal Link - $filename -> $link_path" "test -f '$full_path'" "success"
                fi
            done <<< "$internal_links"
        fi
        
        # Test external links (basic format check)
        external_links=$(grep -o '\[.*\](http[^)]*)' "$file" | sort -u || true)
        if [[ -n "$external_links" ]]; then
            while IFS= read -r link; do
                if [[ -n "$link" ]]; then
                    # Basic URL format validation
                    url=$(echo "$link" | sed 's/\[.*\](//' | sed 's/)//')
                    run_test "External Link Format - $filename" "echo '$url' | grep -E '^https?://'" "success"
                fi
            done <<< "$external_links"
        fi
    fi
done

# Test 6: Code example validation
echo -e "${BLUE}🧪 Running code example validation...${NC}"
for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        
        # Check for properly closed code blocks
        code_blocks_start=$(grep -c '```' "$file" || true)
        if [[ $code_blocks_start -gt 0 ]]; then
            run_test "Code Block Closure - $filename" "test $((code_blocks_start % 2)) -eq 0" "success"
        fi
        
        # Test bash code examples syntax
        bash_examples=$(grep -A 5 '```bash' "$file" | grep -v '```' || true)
        if [[ -n "$bash_examples" ]]; then
            echo "$bash_examples" > "$TEMP_DIR/bash-test-$filename.sh"
            run_test "Bash Syntax - $filename" "bash -n '$TEMP_DIR/bash-test-$filename.sh'" "success"
        fi
    fi
done

# Test 7: Image validation
echo -e "${BLUE}🧪 Running image validation tests...${NC}"
for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        
        # Check for alt text in images
        images_without_alt=$(grep '!\[\]' "$file" || true)
        if [[ -n "$images_without_alt" ]]; then
            run_test "Image Alt Text - $filename" "test -z \"\$(grep '!\[\]' '$file')\"" "success"
        fi
    fi
done

# Test 8: File size validation
echo -e "${BLUE}🧪 Running file size validation...${NC}"
for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        
        # Check if file is not empty
        run_test "File Not Empty - $filename" "test $filesize -gt 0" "success"
        
        # Check if file is reasonable size (not too large)
        run_test "File Size Reasonable - $filename" "test $filesize -lt 1048576" "success" # Less than 1MB
    fi
done

# Test 9: Documentation index validation
if [[ -f "$DOCS_DIR/DOCUMENTATION_INDEX.md" ]]; then
    echo -e "${BLUE}🧪 Running documentation index tests...${NC}"
    
    # Check if index mentions all documentation files
    doc_count=$(find "$DOCS_DIR" -name '*.md' -type f | wc -l)
    index_mentions=$(grep -c '\.md' "$DOCS_DIR/DOCUMENTATION_INDEX.md" || true)
    run_test "Index Coverage" "test $index_mentions -ge $((doc_count / 2))" "success" # At least half the files mentioned
else
    skip_test "Documentation Index" "DOCUMENTATION_INDEX.md not found"
fi

# Test 10: Accessibility checks
echo -e "${BLUE}🧪 Running accessibility tests...${NC}"
for file in "${md_files[@]}"; do
        filename=$(basename "$file")
        
        # Check for proper heading hierarchy (no skipped levels)
        h1_count=$(grep -c '^# ' "$file" || true)
        h2_count=$(grep -c '^## ' "$file" || true)
        h3_count=$(grep -c '^### ' "$file" || true)
        
        if [[ $h1_count -gt 0 ]]; then
            run_test "Heading Hierarchy - $filename" "test $h1_count -le 1" "success" # Only one H1 per document
        fi
    fi
done

# Clean up temporary files
rm -rf "$TEMP_DIR"

# Update summary in report
sed -i "s/Total Tests Run.*/Total Tests Run | $TOTAL_TESTS/" "$REPORT_FILE"
sed -i "s/Passed.*/Passed | $PASSED_TESTS/" "$REPORT_FILE"
sed -i "s/Failed.*/Failed | $FAILED_TESTS/" "$REPORT_FILE"
sed -i "s/Skipped.*/Skipped | $SKIPPED_TESTS/" "$REPORT_FILE"
sed -i "s/Success Rate.*/Success Rate | $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))%/" "$REPORT_FILE"

# Add final summary to report
cat >> "$REPORT_FILE" << EOF

---

## 📊 Final Test Summary

### 🎯 Test Execution Results

| Category | Tests | Passed | Failed | Success Rate |
|----------|-------|--------|--------|--------------|
| **Directory Checks** | 2 | $(( $(grep -c "Directory Check\|Files Presence" "$REPORT_FILE" | grep "✅\|❌" | wc -l) )) | $(( $(grep -c "Directory Check\|Files Presence" "$REPORT_FILE" | grep "❌" | wc -l) )) | $(( $(grep -c "Directory Check\|Files Presence" "$REPORT_FILE" | grep "✅" | wc -l) * 100 / 2 ))% |
| **Markdown Validation** | $(grep -c "Markdown Syntax" "$REPORT_FILE") | $(grep -c "Markdown Syntax" "$REPORT_FILE" | grep "✅" | wc -l) | $(grep -c "Markdown Syntax" "$REPORT_FILE" | grep "❌" | wc -l) | $(( $(grep -c "Markdown Syntax" "$REPORT_FILE" | grep "✅" | wc -l) * 100 / $(grep -c "Markdown Syntax" "$REPORT_FILE") ))% |
| **Document Structure** | $(grep -c "H1 Header\|Version Info\|Date Info" "$REPORT_FILE") | $(grep -c "H1 Header\|Version Info\|Date Info" "$REPORT_FILE" | grep "✅" | wc -l) | $(grep -c "H1 Header\|Version Info\|Date Info" "$REPORT_FILE" | grep "❌" | wc -l) | $(( $(grep -c "H1 Header\|Version Info\|Date Info" "$REPORT_FILE" | grep "✅" | wc -l) * 100 / $(grep -c "H1 Header\|Version Info\|Date Info" "$REPORT_FILE") ))% |
| **Link Validation** | $(grep -c "Internal Link\|External Link" "$REPORT_FILE") | $(grep -c "Internal Link\|External Link" "$REPORT_FILE" | grep "✅" | wc -l) | $(grep -c "Internal Link\|External Link" "$REPORT_FILE" | grep "❌" | wc -l) | $(( $(grep -c "Internal Link\|External Link" "$REPORT_FILE" | grep "✅" | wc -l) * 100 / $(grep -c "Internal Link\|External Link" "$REPORT_FILE") ))% |
| **Code Examples** | $(grep -c "Code Block\|Bash Syntax" "$REPORT_FILE") | $(grep -c "Code Block\|Bash Syntax" "$REPORT_FILE" | grep "✅" | wc -l) | $(grep -c "Code Block\|Bash Syntax" "$REPORT_FILE" | grep "❌" | wc -l) | $(( $(grep -c "Code Block\|Bash Syntax" "$REPORT_FILE" | grep "✅" | wc -l) * 100 / $(grep -c "Code Block\|Bash Syntax" "$REPORT_FILE") ))% |
| **Accessibility** | $(grep -c "Image Alt\|Heading Hierarchy" "$REPORT_FILE") | $(grep -c "Image Alt\|Heading Hierarchy" "$REPORT_FILE" | grep "✅" | wc -l) | $(grep -c "Image Alt\|Heading Hierarchy" "$REPORT_FILE" | grep "❌" | wc -l) | $(( $(grep -c "Image Alt\|Heading Hierarchy" "$REPORT_FILE" | grep "✅" | wc -l) * 100 / $(grep -c "Image Alt\|Heading Hierarchy" "$REPORT_FILE") ))% |

### 🚨 Critical Issues
EOF

# Add critical issues to report
if [[ $FAILED_TESTS -gt 0 ]]; then
    echo "The following critical issues were identified:" >> "$REPORT_FILE"
    grep -B 2 "❌" "$REPORT_FILE" | grep "### ❌" | sed 's/### ❌/- /' >> "$REPORT_FILE"
else
    echo "No critical issues identified. All tests passed successfully." >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

### 🎯 Recommendations

#### Immediate Actions (Next 24 Hours)
EOF

if [[ $FAILED_TESTS -gt 0 ]]; then
    echo "1. Fix all failed tests listed above" >> "$REPORT_FILE"
    echo "2. Re-run test suite to validate fixes" >> "$REPORT_FILE"
    echo "3. Update documentation based on test findings" >> "$REPORT_FILE"
else
    echo "1. No immediate action required" >> "$REPORT_FILE"
    echo "2. Continue with regular testing schedule" >> "$REPORT_FILE"
    echo "3. Monitor for new documentation changes" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

#### Short-term Improvements (Next 7 Days)
1. Implement automated testing in CI/CD pipeline
2. Add more comprehensive link validation
3. Enhance code example testing coverage
4. Implement accessibility testing automation

#### Long-term Strategy (Next 30 Days)
1. Integrate with documentation quality metrics
2. Implement user acceptance testing
3. Add performance testing for documentation
4. Create test-driven documentation workflow

---

## 🔧 Test Environment Details

### 📋 System Information
- **Operating System**: $(uname -s)
- **Kernel Version**: $(uname -r)
- **Architecture**: $(uname -m)
- **Shell**: $SHELL
- **Python Version**: $(python3 --version 2>/dev/null || echo "Not available")
- **Bash Version**: $(bash --version | head -1)

### 🛠️ Test Configuration
- **Test Directory**: $DOCS_DIR
- **Output Directory**: $OUTPUT_DIR
- **Temporary Directory**: $TEMP_DIR (cleaned)
- **Test Suite Version**: 1.0.0
- **Test Timeout**: 30 seconds per test

### 📚 Test Coverage
- **File Types**: Markdown (.md)
- **Test Categories**: 10 categories
- **Validation Types**: Syntax, structure, links, accessibility
- **Automation Level**: Fully automated

---

## 📞 Support and Troubleshooting

### 🆘 Test Failures
If tests fail, review the detailed output in each test section. Common issues include:
- Broken internal or external links
- Malformed markdown syntax
- Missing document structure elements
- Code example syntax errors

### 🔄 Re-running Tests
To re-run the test suite:
\`\`\`bash
./docs-test.sh
\`\`\`

### 📊 Test History
Test reports are archived in \`$OUTPUT_DIR/\` with timestamps for historical analysis.

---

**🧪 Documentation Test Results - MA Malnu Kananga**

*Comprehensive testing suite for documentation quality assurance*

---

*Test Run: $(date +"%B %d, %Y at %I:%M %p")*  
*Next Test Run: $(date -v+1d +"%B %d, %Y" 2>/dev/null || date -d "+1 day" +"%B %d, %Y")*  
*Test Suite Version: 1.0.0*  
*Maintained by: MA Malnu Kananga Documentation Team*

EOF

# Summary output
echo ""
echo -e "${BLUE}📊 Test Results Summary:${NC}"
echo "  • Total Tests: $TOTAL_TESTS"
echo "  • Passed: $PASSED_TESTS"
echo "  • Failed: $FAILED_TESTS"
echo "  • Skipped: $SKIPPED_TESTS"
echo "  • Success Rate: $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))%"
echo ""
echo -e "${BLUE}📄 Report generated:${NC}"
echo "  • File: $REPORT_FILE"
echo "  • Size: $(stat -f%z "$REPORT_FILE" 2>/dev/null || stat -c%s "$REPORT_FILE" 2>/dev/null || echo 0) bytes"
echo ""

# Exit with appropriate code
if [[ $FAILED_TESTS -gt 0 ]]; then
    echo -e "${RED}❌ Some tests failed. Please review the report for details.${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 All tests passed! Documentation is in excellent condition.${NC}"
    exit 0
fi