#!/bin/bash

# Automated Documentation Testing Script
# Performs comprehensive testing of documentation quality and functionality

echo "🧪 Running Automated Documentation Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo ""
    echo "${BLUE}🧪 Test: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo "${RED}❌ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check if file exists
file_exists() {
    [ -f "$1" ]
}

# Function to check if directory exists
dir_exists() {
    [ -d "$1" ]
}

echo ""
echo "${BLUE}=== DOCUMENTATION INFRASTRUCTURE TESTS ===${NC}"

# Test 1: Documentation directory exists
run_test "Documentation directory exists" "dir_exists 'docs'"

# Test 2: Documentation index exists
run_test "Documentation index exists" "file_exists 'docs/DOCUMENTATION_INDEX.md'"

# Test 3: README exists in project root
run_test "Project README exists" "file_exists 'README.md'"

# Test 4: Documentation audit report exists
run_test "Documentation audit report exists" "file_exists 'docs/DOCUMENTATION_AUDIT_REPORT.md'"

echo ""
echo "${BLUE}=== USER GUIDE TESTS ===${NC}"

# Test 5: Student user guide exists
run_test "Student user guide exists" "file_exists 'docs/USER_GUIDE_STUDENT.md'"

# Test 6: Teacher user guide exists
run_test "Teacher user guide exists" "file_exists 'docs/USER_GUIDE_TEACHER.md'"

# Test 7: Parent user guide exists
run_test "Parent user guide exists" "file_exists 'docs/USER_GUIDE_PARENT.md'"

echo ""
echo "${BLUE}=== TECHNICAL DOCUMENTATION TESTS ===${NC}"

# Test 8: API documentation exists
run_test "API documentation exists" "file_exists 'docs/API_DOCUMENTATION.md'"

# Test 9: System architecture documentation exists
run_test "System architecture documentation exists" "file_exists 'docs/SYSTEM_ARCHITECTURE.md'"

# Test 10: Database schema documentation exists
run_test "Database schema documentation exists" "file_exists 'docs/DATABASE_SCHEMA.md'"

# Test 11: RAG AI system documentation exists
run_test "RAG AI system documentation exists" "file_exists 'docs/RAG_AI_SYSTEM.md'"

# Test 12: Cloudflare Worker backend documentation exists
run_test "Cloudflare Worker backend documentation exists" "file_exists 'docs/CLOUDFLARE_WORKER_BACKEND.md'"

echo ""
echo "${BLUE}=== SECURITY DOCUMENTATION TESTS ===${NC}"

# Test 13: Security guide exists
run_test "Security guide exists" "file_exists 'docs/SECURITY_GUIDE.md'"

# Test 14: Security implementation guide exists
run_test "Security implementation guide exists" "file_exists 'docs/SECURITY_IMPLEMENTATION_GUIDE.md'"

# Test 15: Security audit report exists
run_test "Security audit report exists" "file_exists 'docs/SECURITY_AUDIT_REPORT.md'"

echo ""
echo "${BLUE}=== DEPLOYMENT DOCUMENTATION TESTS ===${NC}"

# Test 16: Installation guide exists
run_test "Installation guide exists" "file_exists 'docs/INSTALLATION_GUIDE.md'"

# Test 17: Deployment guide exists
run_test "Deployment guide exists" "file_exists 'docs/DEPLOYMENT_GUIDE.md'"

# Test 18: Environment setup documentation exists
run_test "Environment setup documentation exists" "file_exists 'docs/ENVIRONMENT_SETUP.md'"

echo ""
echo "${BLUE}=== TROUBLESHOOTING DOCUMENTATION TESTS ===${NC}"

# Test 19: Troubleshooting guide exists
run_test "Troubleshooting guide exists" "file_exists 'docs/TROUBLESHOOTING_GUIDE.md'"

# Test 20: Quick troubleshooting guide exists
run_test "Quick troubleshooting guide exists" "file_exists 'docs/QUICK_TROUBLESHOOTING_GUIDE.md'"

echo ""
echo "${BLUE}=== DOCUMENTATION FORMAT TESTS ===${NC}"

# Test 21: All markdown files have proper headers
echo ""
echo "${BLUE}🧪 Test: Markdown files have proper headers${NC}"
HEADER_TEST_PASSED=0
HEADER_TEST_TOTAL=0

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        HEADER_TEST_TOTAL=$((HEADER_TEST_TOTAL + 1))
        if grep -q "^# " "$doc"; then
            HEADER_TEST_PASSED=$((HEADER_TEST_PASSED + 1))
        fi
    fi
done

if [ $HEADER_TEST_PASSED -eq $HEADER_TEST_TOTAL ]; then
    echo "${GREEN}✅ PASSED${NC} ($HEADER_TEST_PASSED/$HEADER_TEST_TOTAL files have headers)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "${RED}❌ FAILED${NC} ($HEADER_TEST_PASSED/$HEADER_TEST_TOTAL files have headers)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 22: Documentation files have version information
echo ""
echo "${BLUE}🧪 Test: Documentation files have version information${NC}"
VERSION_TEST_PASSED=0
VERSION_TEST_TOTAL=0

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        VERSION_TEST_TOTAL=$((VERSION_TEST_TOTAL + 1))
        if grep -q "Version:" "$doc"; then
            VERSION_TEST_PASSED=$((VERSION_TEST_PASSED + 1))
        fi
    fi
done

if [ $VERSION_TEST_PASSED -ge $((VERSION_TEST_TOTAL * 90 / 100)) ]; then
    echo "${GREEN}✅ PASSED${NC} ($VERSION_TEST_PASSED/$VERSION_TEST_TOTAL files have version info)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "${RED}❌ FAILED${NC} ($VERSION_TEST_PASSED/$VERSION_TEST_TOTAL files have version info)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""
echo "${BLUE}=== LINK VALIDATION TESTS ===${NC}"

# Test 23: Internal links are valid
echo ""
echo "${BLUE}🧪 Test: Internal links are valid${NC}"
LINK_TEST_PASSED=0
LINK_TEST_TOTAL=0

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        # Extract internal links
        links=$(grep -o '\[.*\]([^)]*)' "$doc" | sed 's/\[.*\](\([^)]*\))/\1/' | grep -v '^http' | grep -v '^#')
        for link in $links; do
            LINK_TEST_TOTAL=$((LINK_TEST_TOTAL + 1))
            clean_link=$(echo "$link" | cut -d'#' -f1)
            if [ -z "$clean_link" ] || [ -f "$clean_link" ] || [ -f "docs/$clean_link" ] || [ -f "$(dirname "$doc")/$clean_link" ]; then
                LINK_TEST_PASSED=$((LINK_TEST_PASSED + 1))
            fi
        done
    fi
done

if [ $LINK_TEST_TOTAL -eq 0 ]; then
    echo "${YELLOW}⚠️ SKIPPED${NC} (No internal links found)"
elif [ $LINK_TEST_PASSED -ge $((LINK_TEST_TOTAL * 95 / 100)) ]; then
    echo "${GREEN}✅ PASSED${NC} ($LINK_TEST_PASSED/$LINK_TEST_TOTAL links are valid)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "${RED}❌ FAILED${NC} ($LINK_TEST_PASSED/$LINK_TEST_TOTAL links are valid)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""
echo "${BLUE}=== CODE EXAMPLE TESTS ===${NC}"

# Test 24: Code examples have language specifications
echo ""
echo "${BLUE}🧪 Test: Code examples have language specifications${NC}"
CODE_TEST_PASSED=0
CODE_TEST_TOTAL=0

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        code_blocks=$(grep -c '```' "$doc")
        if [ $code_blocks -gt 0 ]; then
            CODE_TEST_TOTAL=$((CODE_TEST_TOTAL + 1))
            if grep -q '```[a-zA-Z]' "$doc"; then
                CODE_TEST_PASSED=$((CODE_TEST_PASSED + 1))
            fi
        fi
    fi
done

if [ $CODE_TEST_TOTAL -eq 0 ]; then
    echo "${YELLOW}⚠️ SKIPPED${NC} (No code examples found)"
elif [ $CODE_TEST_PASSED -ge $((CODE_TEST_TOTAL * 90 / 100)) ]; then
    echo "${GREEN}✅ PASSED${NC} ($CODE_TEST_PASSED/$CODE_TEST_TOTAL files have proper code blocks)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "${RED}❌ FAILED${NC} ($CODE_TEST_PASSED/$CODE_TEST_TOTAL files have proper code blocks)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""
echo "${BLUE}=== AGENTS.md COMPLIANCE TESTS ===${NC}"

# Test 25: RAG AI system documentation exists (AGENTS.md requirement)
run_test "RAG AI system documented (AGENTS.md compliance)" "file_exists 'docs/RAG_AI_SYSTEM.md'"

# Test 26: Cloudflare Worker backend documented (AGENTS.md requirement)
run_test "Cloudflare Worker backend documented (AGENTS.md compliance)" "file_exists 'docs/CLOUDFLARE_WORKER_BACKEND.md'"

# Test 27: Dual file structure documented (AGENTS.md requirement)
run_test "Dual file structure documented (AGENTS.md compliance)" "file_exists 'docs/DUAL_FILE_STRUCTURE.md'"

echo ""
echo "${BLUE}=== DOCUMENTATION COMPLETENESS TESTS ===${NC}"

# Test 28: Quick start guide exists
run_test "Quick start guide exists" "file_exists 'docs/QUICK_START_GUIDE.md'"

# Test 29: Developer guide exists
run_test "Developer guide exists" "file_exists 'docs/DEVELOPER_GUIDE.md'"

# Test 30: Administrator guide exists
run_test "Administrator guide exists" "file_exists 'docs/ADMINISTRATOR_GUIDE.md'"

# Test 31: Component library documentation exists
run_test "Component library documentation exists" "file_exists 'docs/COMPONENT_LIBRARY.md'"

# Test 32: Testing guide exists
run_test "Testing guide exists" "file_exists 'docs/TESTING_GUIDE.md'"

echo ""
echo "${BLUE}=== TEST RESULTS SUMMARY ===${NC}"

echo "${BLUE}📊 Total Tests:${NC} $TESTS_TOTAL"
echo "${GREEN}✅ Passed:${NC} $TESTS_PASSED"
echo "${RED}❌ Failed:${NC} $TESTS_FAILED"

# Calculate success rate
if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo "${BLUE}📈 Success Rate:${NC} $SUCCESS_RATE%"
    
    if [ $SUCCESS_RATE -ge 95 ]; then
        echo "${GREEN}🏆 EXCELLENT - Documentation quality is outstanding${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 85 ]; then
        echo "${GREEN}✅ VERY GOOD - Documentation quality is high${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 75 ]; then
        echo "${YELLOW}⚠️ GOOD - Documentation meets standards${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 60 ]; then
        echo "${YELLOW}⚠️ FAIR - Documentation needs improvement${NC}"
        exit 1
    else
        echo "${RED}❌ POOR - Documentation requires significant improvement${NC}"
        exit 1
    fi
else
    echo "${RED}❌ No tests run${NC}"
    exit 1
fi