#!/bin/bash
#═══════════════════════════════════════════════════════════════
#  E-Commerce Backend — Complete API Test Script
#  Tests all endpoints in the correct order
#  Usage: bash test_api.sh
#═══════════════════════════════════════════════════════════════

BASE_URL="http://localhost:5000/api"
PASS=0
FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
  echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

print_test() {
  echo -e "\n${YELLOW}▶ TEST: $1${NC}"
}

check_response() {
  local response="$1"
  local expected="$2"
  local test_name="$3"

  if echo "$response" | grep -q "$expected"; then
    echo -e "  ${GREEN}✅ PASS${NC} — $test_name"
    ((PASS++))
  else
    echo -e "  ${RED}❌ FAIL${NC} — $test_name"
    echo -e "  ${RED}Response: $response${NC}"
    ((FAIL++))
  fi
}

#═══════════════════════════════════════════════════════════════
# 0. HEALTH CHECK
#═══════════════════════════════════════════════════════════════
print_header "0. HEALTH CHECK"

print_test "GET /api/health"
RESPONSE=$(curl -s $BASE_URL/health)
check_response "$RESPONSE" '"status":"ok"' "Health check"

#═══════════════════════════════════════════════════════════════
# 1. AUTHENTICATION
#═══════════════════════════════════════════════════════════════
print_header "1. AUTHENTICATION"

# Register Customer
print_test "POST /api/auth/register (Customer)"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test Customer","email":"customer@test.com","password":"password123","role":"customer"}')
check_response "$RESPONSE" '"token"' "Register customer"
CUSTOMER_TOKEN=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

# Register Seller
print_test "POST /api/auth/register (Seller)"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test Seller","email":"seller@test.com","password":"password123","role":"seller"}')
check_response "$RESPONSE" '"token"' "Register seller"
SELLER_TOKEN=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

# Duplicate email test
print_test "POST /api/auth/register (Duplicate Email)"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Duplicate","email":"customer@test.com","password":"password123","role":"customer"}')
check_response "$RESPONSE" '"error"' "Duplicate email rejected"

# Login Customer
print_test "POST /api/auth/login (Customer)"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}')
check_response "$RESPONSE" '"token"' "Login customer"

# Login with wrong password
print_test "POST /api/auth/login (Wrong Password)"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"wrongpassword"}')
check_response "$RESPONSE" '"error"' "Wrong password rejected"

# Get Profile
print_test "GET /api/auth/profile"
RESPONSE=$(curl -s $BASE_URL/auth/profile \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"email":"customer@test.com"' "Get profile"

# Unauthenticated access
print_test "GET /api/auth/profile (No Token)"
RESPONSE=$(curl -s $BASE_URL/auth/profile)
check_response "$RESPONSE" '"error"' "Unauthenticated access rejected"

#═══════════════════════════════════════════════════════════════
# 2. STORE MANAGEMENT
#═══════════════════════════════════════════════════════════════
print_header "2. STORE MANAGEMENT"

# Create Store (Seller)
print_test "POST /api/stores (Seller creates store)"
RESPONSE=$(curl -s -X POST $BASE_URL/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"name":"Harry Tech Store","description":"Best tech gadgets online"}')
check_response "$RESPONSE" '"Store created successfully"' "Create store"
STORE_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['store']['id'])" 2>/dev/null)

# Duplicate Store
print_test "POST /api/stores (Duplicate store)"
RESPONSE=$(curl -s -X POST $BASE_URL/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"name":"Another Store","description":"Should fail"}')
check_response "$RESPONSE" '"error"' "Duplicate store rejected (1:1)"

# Customer tries to create store
print_test "POST /api/stores (Customer — should fail)"
RESPONSE=$(curl -s -X POST $BASE_URL/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"name":"Customer Store","description":"Should fail"}')
check_response "$RESPONSE" '"error"' "Customer can't create store"

# Get My Store Dashboard
print_test "GET /api/stores/me/dashboard"
RESPONSE=$(curl -s $BASE_URL/stores/me/dashboard \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$RESPONSE" '"Harry Tech Store"' "Get my store dashboard"

# Update Store
print_test "PUT /api/stores"
RESPONSE=$(curl -s -X PUT $BASE_URL/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"name":"Harry Premium Tech Store"}')
check_response "$RESPONSE" '"Store updated successfully"' "Update store"

# Get All Stores (Public)
print_test "GET /api/stores"
RESPONSE=$(curl -s "$BASE_URL/stores")
check_response "$RESPONSE" '"stores"' "Get all stores (public)"

# Get Store By ID (Public)
print_test "GET /api/stores/:id"
RESPONSE=$(curl -s "$BASE_URL/stores/$STORE_ID")
check_response "$RESPONSE" '"Harry Premium Tech Store"' "Get store by ID"

#═══════════════════════════════════════════════════════════════
# 3. PRODUCT MANAGEMENT
#═══════════════════════════════════════════════════════════════
print_header "3. PRODUCT MANAGEMENT"

# Create Product 1
print_test "POST /api/products (Create Product 1)"
RESPONSE=$(curl -s -X POST $BASE_URL/products \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "name=Wireless Headphones" \
  -F "description=Premium noise cancelling headphones" \
  -F "price=99.99" \
  -F "stock_quantity=50" \
  -F "category=Electronics")
check_response "$RESPONSE" '"Product created successfully"' "Create product 1"
PRODUCT1_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['product']['id'])" 2>/dev/null)

# Create Product 2
print_test "POST /api/products (Create Product 2)"
RESPONSE=$(curl -s -X POST $BASE_URL/products \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "name=Mechanical Keyboard" \
  -F "description=RGB mechanical keyboard with Cherry MX switches" \
  -F "price=149.99" \
  -F "stock_quantity=30" \
  -F "category=Electronics")
check_response "$RESPONSE" '"Product created successfully"' "Create product 2"
PRODUCT2_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['product']['id'])" 2>/dev/null)

# Create Product 3 (different category)
print_test "POST /api/products (Create Product 3 — Clothing)"
RESPONSE=$(curl -s -X POST $BASE_URL/products \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "name=Developer T-Shirt" \
  -F "description=Cool t-shirt for devs" \
  -F "price=24.99" \
  -F "stock_quantity=100" \
  -F "category=Clothing")
check_response "$RESPONSE" '"Product created successfully"' "Create product 3"
PRODUCT3_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['product']['id'])" 2>/dev/null)

# Get Product By ID
print_test "GET /api/products/:id"
RESPONSE=$(curl -s "$BASE_URL/products/$PRODUCT1_ID")
check_response "$RESPONSE" '"Wireless Headphones"' "Get product by ID"

# Get All Products
print_test "GET /api/products"
RESPONSE=$(curl -s "$BASE_URL/products")
check_response "$RESPONSE" '"products"' "Get all products"

# Filter by Category
print_test "GET /api/products?category=Electronics"
RESPONSE=$(curl -s "$BASE_URL/products?category=Electronics")
check_response "$RESPONSE" '"Electronics"' "Filter by category"

# Update Product
print_test "PUT /api/products/:id"
RESPONSE=$(curl -s -X PUT "$BASE_URL/products/$PRODUCT1_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "price=89.99")
check_response "$RESPONSE" '"Product updated successfully"' "Update product price"

# Get My Products
print_test "GET /api/products/my/list"
RESPONSE=$(curl -s "$BASE_URL/products/my/list" \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$RESPONSE" '"products"' "Get my products (seller)"

#═══════════════════════════════════════════════════════════════
# 4. SEARCH
#═══════════════════════════════════════════════════════════════
print_header "4. SEARCH"

# Search by keyword
print_test "GET /api/search?q=keyboard"
RESPONSE=$(curl -s "$BASE_URL/search?q=keyboard")
check_response "$RESPONSE" '"Mechanical Keyboard"' "Search by keyword"

# Search with price range
print_test "GET /api/search?min_price=50&max_price=100"
RESPONSE=$(curl -s "$BASE_URL/search?min_price=50&max_price=100")
check_response "$RESPONSE" '"products"' "Search with price range"

# Search with sort
print_test "GET /api/search?sort_by=price_asc"
RESPONSE=$(curl -s "$BASE_URL/search?sort_by=price_asc")
check_response "$RESPONSE" '"products"' "Search with sorting"

#═══════════════════════════════════════════════════════════════
# 5. CART
#═══════════════════════════════════════════════════════════════
print_header "5. CART"

# Add to Cart
print_test "POST /api/cart (Add product 1)"
RESPONSE=$(curl -s -X POST $BASE_URL/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"product_id\":\"$PRODUCT1_ID\",\"quantity\":2}")
check_response "$RESPONSE" '"Added to cart"' "Add to cart"
CART_ITEM1_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['item']['id'])" 2>/dev/null)

# Add second product
print_test "POST /api/cart (Add product 2)"
RESPONSE=$(curl -s -X POST $BASE_URL/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"product_id\":\"$PRODUCT2_ID\",\"quantity\":1}")
check_response "$RESPONSE" '"Added to cart"' "Add second product"
CART_ITEM2_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['item']['id'])" 2>/dev/null)

# Get Cart
print_test "GET /api/cart"
RESPONSE=$(curl -s $BASE_URL/cart \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"items"' "Get cart"
echo -e "  Cart total: $(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])" 2>/dev/null)"

# Update Cart Quantity
print_test "PUT /api/cart/:id (Update quantity)"
RESPONSE=$(curl -s -X PUT "$BASE_URL/cart/$CART_ITEM1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"quantity":3}')
check_response "$RESPONSE" '"Cart updated"' "Update cart quantity"

# Remove from Cart
print_test "DELETE /api/cart/:id (Remove product 2)"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/cart/$CART_ITEM2_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"Item removed from cart"' "Remove from cart"

# Add product 2 back for checkout
curl -s -X POST $BASE_URL/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"product_id\":\"$PRODUCT2_ID\",\"quantity\":1}" > /dev/null

#═══════════════════════════════════════════════════════════════
# 6. CHECKOUT & ORDERS
#═══════════════════════════════════════════════════════════════
print_header "6. CHECKOUT & ORDERS"

# Checkout
print_test "POST /api/orders/checkout"
RESPONSE=$(curl -s -X POST $BASE_URL/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"shipping_address":{"street":"123 Main St","city":"Lahore","state":"Punjab","zip":"54000","country":"Pakistan"}}')
check_response "$RESPONSE" '"Order placed successfully"' "Checkout"
ORDER_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['order']['id'])" 2>/dev/null)

# Verify cart is empty after checkout
print_test "GET /api/cart (Should be empty after checkout)"
RESPONSE=$(curl -s $BASE_URL/cart \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"count":0' "Cart empty after checkout"

# Checkout with empty cart (should fail)
print_test "POST /api/orders/checkout (Empty cart — should fail)"
RESPONSE=$(curl -s -X POST $BASE_URL/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"shipping_address":{"street":"123 Main St","city":"Lahore"}}')
check_response "$RESPONSE" '"error"' "Empty cart checkout rejected"

# Get Order by ID
print_test "GET /api/orders/:id"
RESPONSE=$(curl -s "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"order"' "Get order by ID"

# Get User Orders
print_test "GET /api/orders"
RESPONSE=$(curl -s "$BASE_URL/orders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"orders"' "Get user orders"

# Get Seller Orders
print_test "GET /api/orders/seller/list"
RESPONSE=$(curl -s "$BASE_URL/orders/seller/list" \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$RESPONSE" '"orders"' "Get seller orders"

# Update Order Status
print_test "PATCH /api/orders/:id/status (→ processing)"
RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"status":"processing"}')
check_response "$RESPONSE" '"Order status updated"' "Update to processing"

print_test "PATCH /api/orders/:id/status (→ shipped)"
RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"status":"shipped"}')
check_response "$RESPONSE" '"Order status updated"' "Update to shipped"

print_test "PATCH /api/orders/:id/status (→ delivered)"
RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"status":"delivered"}')
check_response "$RESPONSE" '"Order status updated"' "Update to delivered"

#═══════════════════════════════════════════════════════════════
# 7. REVIEWS
#═══════════════════════════════════════════════════════════════
print_header "7. REVIEWS"

# Add Product Review
print_test "POST /api/reviews/product/:id"
RESPONSE=$(curl -s -X POST "$BASE_URL/reviews/product/$PRODUCT1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"rating":5,"comment":"Amazing headphones! Great noise cancellation."}')
check_response "$RESPONSE" '"Review added"' "Add product review"
REVIEW_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['review']['id'])" 2>/dev/null)

# Duplicate Review (should fail)
print_test "POST /api/reviews/product/:id (Duplicate — should fail)"
RESPONSE=$(curl -s -X POST "$BASE_URL/reviews/product/$PRODUCT1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"rating":4,"comment":"Trying again"}')
check_response "$RESPONSE" '"error"' "Duplicate review rejected"

# Add Store Review
print_test "POST /api/reviews/store/:id"
RESPONSE=$(curl -s -X POST "$BASE_URL/reviews/store/$STORE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"rating":4,"comment":"Great store, fast shipping!"}')
check_response "$RESPONSE" '"Review added"' "Add store review"

# Get Product Reviews (Public)
print_test "GET /api/reviews/product/:id"
RESPONSE=$(curl -s "$BASE_URL/reviews/product/$PRODUCT1_ID")
check_response "$RESPONSE" '"reviews"' "Get product reviews"

# Get Store Reviews (Public)
print_test "GET /api/reviews/store/:id"
RESPONSE=$(curl -s "$BASE_URL/reviews/store/$STORE_ID")
check_response "$RESPONSE" '"reviews"' "Get store reviews"

# Verify auto-updated rating (trigger)
print_test "Verify product rating auto-updated by trigger"
RESPONSE=$(curl -s "$BASE_URL/products/$PRODUCT1_ID")
check_response "$RESPONSE" '"average_rating"' "Product rating auto-updated"

# Delete Review
print_test "DELETE /api/reviews/:id"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"Review deleted"' "Delete review"

#═══════════════════════════════════════════════════════════════
# 8. NOTIFICATIONS
#═══════════════════════════════════════════════════════════════
print_header "8. NOTIFICATIONS"

# Get Seller Notifications (should have order notifications from triggers)
print_test "GET /api/notifications (Seller — auto-created by triggers)"
RESPONSE=$(curl -s $BASE_URL/notifications \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$RESPONSE" '"notifications"' "Get seller notifications"
echo -e "  Unread count: $(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['unread'])" 2>/dev/null)"

# Get Customer Notifications (should have status change notifications)
print_test "GET /api/notifications (Customer — order status triggers)"
RESPONSE=$(curl -s $BASE_URL/notifications \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"notifications"' "Get customer notifications"
echo -e "  Unread count: $(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['unread'])" 2>/dev/null)"

# Mark notification as read
NOTIF_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['notifications'][0]['id'])" 2>/dev/null)
if [ -n "$NOTIF_ID" ]; then
  print_test "PATCH /api/notifications/:id/read"
  RESPONSE=$(curl -s -X PATCH "$BASE_URL/notifications/$NOTIF_ID/read" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN")
  check_response "$RESPONSE" '"Marked as read"' "Mark notification as read"
fi

# Mark all as read
print_test "PATCH /api/notifications/read-all"
RESPONSE=$(curl -s -X PATCH $BASE_URL/notifications/read-all \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
check_response "$RESPONSE" '"All notifications marked as read"' "Mark all as read"

#═══════════════════════════════════════════════════════════════
# 9. STORE REVENUE (DB Function)
#═══════════════════════════════════════════════════════════════
print_header "9. STORE REVENUE (fn_store_revenue)"

print_test "GET /api/stores/me/revenue"
RESPONSE=$(curl -s "$BASE_URL/stores/me/revenue" \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$RESPONSE" '"revenue"' "Get store revenue"
echo -e "  Revenue: $(echo $RESPONSE | python3 -c "import sys,json; r=json.load(sys.stdin)['revenue']; print(f\"Total: \${r['total_revenue']}, Orders: {r['total_orders']}, Items: {r['total_items_sold']}\")" 2>/dev/null)"

#═══════════════════════════════════════════════════════════════
# 10. PRODUCT DELETE
#═══════════════════════════════════════════════════════════════
print_header "10. PRODUCT DELETE"

print_test "DELETE /api/products/:id"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/products/$PRODUCT3_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$RESPONSE" '"Product deleted successfully"' "Delete product"

# Verify deleted
print_test "GET /api/products/:id (Deleted product — should 404)"
RESPONSE=$(curl -s "$BASE_URL/products/$PRODUCT3_ID")
check_response "$RESPONSE" '"error"' "Deleted product returns 404"

#═══════════════════════════════════════════════════════════════
# 11. EDGE CASES & ERROR HANDLING
#═══════════════════════════════════════════════════════════════
print_header "11. EDGE CASES & ERROR HANDLING"

print_test "GET /api/nonexistent (404)"
RESPONSE=$(curl -s $BASE_URL/nonexistent)
check_response "$RESPONSE" '"error"' "404 for unknown route"

print_test "POST /api/auth/register (Missing fields)"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}')
check_response "$RESPONSE" '"error"' "Missing fields rejected"

print_test "Invalid Status Update"
RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"status":"invalid_status"}')
check_response "$RESPONSE" '"error"' "Invalid status rejected"

#═══════════════════════════════════════════════════════════════
# RESULTS
#═══════════════════════════════════════════════════════════════
echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  TEST RESULTS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
TOTAL=$((PASS + FAIL))
echo -e "  ${GREEN}✅ Passed: $PASS${NC}"
echo -e "  ${RED}❌ Failed: $FAIL${NC}"
echo -e "  Total: $TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}🎉 ALL TESTS PASSED! Backend is fully functional!${NC}"
else
  echo -e "  ${RED}⚠️  Some tests failed. Check the output above.${NC}"
fi
echo ""
