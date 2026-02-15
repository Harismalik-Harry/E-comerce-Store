const { pool } = require("./pool");

const createAdvancedFeatures = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // ═══════════════════════════════════════════════
        // VIEWS
        // ═══════════════════════════════════════════════

        // ─── 1. Product Listing View ───
        // Combines product, store, and review data in one query
        await client.query(`
      CREATE OR REPLACE VIEW v_product_listing AS
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.image_url,
        p.average_rating,
        p.is_active,
        p.created_at,
        s.id AS store_id,
        s.name AS store_name,
        s.average_rating AS store_rating,
        u.full_name AS seller_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS review_count
      FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN users u ON u.id = s.seller_id;
    `);

        // ─── 2. Store Dashboard View ───
        // Aggregated store stats for seller dashboard
        await client.query(`
      CREATE OR REPLACE VIEW v_store_dashboard AS
      SELECT
        s.id,
        s.name,
        s.description,
        s.average_rating,
        s.seller_id,
        s.created_at,
        u.full_name AS seller_name,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id) AS total_products,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.is_active = true) AS active_products,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.stock_quantity = 0) AS out_of_stock,
        (SELECT COUNT(DISTINCT oi.order_id) FROM order_items oi WHERE oi.store_id = s.id) AS total_orders,
        (SELECT COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0) FROM order_items oi WHERE oi.store_id = s.id) AS total_revenue,
        (SELECT COUNT(*) FROM reviews r WHERE r.store_id = s.id) AS review_count
      FROM stores s
      JOIN users u ON u.id = s.seller_id;
    `);

        // ─── 3. Order Summary View ───
        // Order with item count and aggregated info
        await client.query(`
      CREATE OR REPLACE VIEW v_order_summary AS
      SELECT
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
        (SELECT json_agg(json_build_object(
          'product_id', oi.product_id,
          'product_name', p.name,
          'store_name', st.name,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase,
          'image_url', p.image_url
        ))
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN stores st ON st.id = oi.store_id
        WHERE oi.order_id = o.id) AS items
      FROM orders o
      JOIN users u ON u.id = o.user_id;
    `);

        // ═══════════════════════════════════════════════
        // FUNCTIONS
        // ═══════════════════════════════════════════════

        // ─── 4. Function: Recalculate Product Rating ───
        await client.query(`
      CREATE OR REPLACE FUNCTION fn_update_product_rating(p_product_id UUID)
      RETURNS VOID AS $$
      BEGIN
        UPDATE products
        SET average_rating = (
          SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
          FROM reviews
          WHERE product_id = p_product_id
        )
        WHERE id = p_product_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

        // ─── 5. Function: Recalculate Store Rating ───
        await client.query(`
      CREATE OR REPLACE FUNCTION fn_update_store_rating(p_store_id UUID)
      RETURNS VOID AS $$
      BEGIN
        UPDATE stores
        SET average_rating = (
          SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
          FROM reviews
          WHERE store_id = p_store_id
        )
        WHERE id = p_store_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

        // ─── 6. Function: Get Store Revenue by Date Range ───
        await client.query(`
      CREATE OR REPLACE FUNCTION fn_store_revenue(
        p_store_id UUID,
        p_start_date TIMESTAMP DEFAULT NULL,
        p_end_date TIMESTAMP DEFAULT NULL
      )
      RETURNS TABLE (
        total_revenue DECIMAL,
        total_orders BIGINT,
        total_items_sold BIGINT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0.00)::DECIMAL AS total_revenue,
          COUNT(DISTINCT oi.order_id) AS total_orders,
          COALESCE(SUM(oi.quantity), 0) AS total_items_sold
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.store_id = p_store_id
          AND o.status != 'cancelled'
          AND (p_start_date IS NULL OR o.created_at >= p_start_date)
          AND (p_end_date IS NULL OR o.created_at <= p_end_date);
      END;
      $$ LANGUAGE plpgsql;
    `);

        // ═══════════════════════════════════════════════
        // TRIGGER FUNCTIONS
        // ═══════════════════════════════════════════════

        // ─── 7. Trigger Function: Auto-update rating on review INSERT/DELETE ───
        await client.query(`
      CREATE OR REPLACE FUNCTION trg_fn_review_rating_update()
      RETURNS TRIGGER AS $$
      BEGIN
        -- On INSERT use NEW, on DELETE use OLD
        IF TG_OP = 'DELETE' THEN
          IF OLD.product_id IS NOT NULL THEN
            PERFORM fn_update_product_rating(OLD.product_id);
          END IF;
          IF OLD.store_id IS NOT NULL THEN
            PERFORM fn_update_store_rating(OLD.store_id);
          END IF;
          RETURN OLD;
        ELSE
          IF NEW.product_id IS NOT NULL THEN
            PERFORM fn_update_product_rating(NEW.product_id);
          END IF;
          IF NEW.store_id IS NOT NULL THEN
            PERFORM fn_update_store_rating(NEW.store_id);
          END IF;
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await client.query(`
      DROP TRIGGER IF EXISTS trg_review_rating ON reviews;
      CREATE TRIGGER trg_review_rating
      AFTER INSERT OR DELETE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION trg_fn_review_rating_update();
    `);

        // ─── 8. Trigger Function: Notify seller on new order ───
        // This trigger fires on order_items INSERT (not orders)
        // so it has access to the store_id
        await client.query(`
      CREATE OR REPLACE FUNCTION trg_fn_notify_seller_new_order()
      RETURNS TRIGGER AS $$
      DECLARE
        v_seller_id UUID;
        v_store_name TEXT;
        v_order_amount DECIMAL;
      BEGIN
        -- Get seller and store info for this order item
        SELECT s.seller_id, s.name, o.total_amount
        INTO v_seller_id, v_store_name, v_order_amount
        FROM stores s
        JOIN orders o ON o.id = NEW.order_id
        WHERE s.id = NEW.store_id;

        -- Only notify if we haven't already for this store+order combo
        IF NOT EXISTS (
          SELECT 1 FROM notifications
          WHERE user_id = v_seller_id
            AND type = 'new_order'
            AND message LIKE '%' || LEFT(NEW.order_id::text, 8) || '%'
        ) THEN
          INSERT INTO notifications (user_id, message, type)
          VALUES (
            v_seller_id,
            'New order #' || LEFT(NEW.order_id::text, 8) || ' received for ' || v_store_name || '! Amount: $' || v_order_amount,
            'new_order'
          );
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await client.query(`
      DROP TRIGGER IF EXISTS trg_notify_seller_order ON orders;
      DROP TRIGGER IF EXISTS trg_notify_seller_order_item ON order_items;
      CREATE TRIGGER trg_notify_seller_order_item
      AFTER INSERT ON order_items
      FOR EACH ROW
      EXECUTE FUNCTION trg_fn_notify_seller_new_order();
    `);

        // ─── 9. Trigger Function: Notify customer on order status change ───
        await client.query(`
      CREATE OR REPLACE FUNCTION trg_fn_notify_order_status()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          INSERT INTO notifications (user_id, message, type)
          VALUES (
            NEW.user_id,
            'Your order #' || LEFT(NEW.id::text, 8) || ' status changed to: ' || UPPER(NEW.status),
            'order_status'
          );
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await client.query(`
      DROP TRIGGER IF EXISTS trg_order_status_notify ON orders;
      CREATE TRIGGER trg_order_status_notify
      AFTER UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION trg_fn_notify_order_status();
    `);

        // ─── 10. Trigger Function: Prevent stock going negative ───
        await client.query(`
      CREATE OR REPLACE FUNCTION trg_fn_check_stock()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.stock_quantity < 0 THEN
          RAISE EXCEPTION 'Stock cannot be negative for product %', NEW.id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await client.query(`
      DROP TRIGGER IF EXISTS trg_check_stock ON products;
      CREATE TRIGGER trg_check_stock
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION trg_fn_check_stock();
    `);

        // ═══════════════════════════════════════════════
        // STORED PROCEDURE: Checkout
        // ═══════════════════════════════════════════════

        // ─── 11. Procedure: Process Checkout ───
        // Handles the entire checkout atomically in the DB
        await client.query(`
      CREATE OR REPLACE FUNCTION fn_checkout(
        p_user_id UUID,
        p_shipping_address JSONB
      )
      RETURNS UUID AS $$
      DECLARE
        v_order_id UUID;
        v_total DECIMAL := 0;
        v_cart_item RECORD;
      BEGIN
        -- Check cart has items
        IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = p_user_id) THEN
          RAISE EXCEPTION 'Cart is empty';
        END IF;

        -- Validate stock for all items
        FOR v_cart_item IN
          SELECT ci.product_id, ci.quantity, p.stock_quantity, p.price, p.store_id, p.name
          FROM cart_items ci
          JOIN products p ON p.id = ci.product_id
          WHERE ci.user_id = p_user_id
        LOOP
          IF v_cart_item.stock_quantity < v_cart_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product: %', v_cart_item.name;
          END IF;
          v_total := v_total + (v_cart_item.price * v_cart_item.quantity);
        END LOOP;

        -- Create order
        INSERT INTO orders (user_id, total_amount, shipping_address)
        VALUES (p_user_id, v_total, p_shipping_address)
        RETURNING id INTO v_order_id;

        -- Create order items and reduce stock
        INSERT INTO order_items (order_id, product_id, store_id, quantity, price_at_purchase)
        SELECT v_order_id, ci.product_id, p.store_id, ci.quantity, p.price
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = p_user_id;

        -- Reduce stock
        UPDATE products p
        SET stock_quantity = p.stock_quantity - ci.quantity
        FROM cart_items ci
        WHERE ci.product_id = p.id
          AND ci.user_id = p_user_id;

        -- Clear cart
        DELETE FROM cart_items WHERE user_id = p_user_id;

        RETURN v_order_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await client.query("COMMIT");
        console.log("✅ All views, functions, triggers, and procedures created successfully");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Advanced migration failed:", err.message);
        throw err;
    } finally {
        client.release();
    }
};

// Run if called directly: node src/db/migrate_advanced.js
if (require.main === module) {
    createAdvancedFeatures()
        .then(() => {
            console.log("Advanced migration complete");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration error:", err);
            process.exit(1);
        });
}

module.exports = { createAdvancedFeatures };
