-- AlterTable: add discount_price to product_variants
ALTER TABLE "product_variants" ADD COLUMN "discount_price" DOUBLE PRECISION;

-- AlterTable: drop base_price and discount_price from products
ALTER TABLE "products" DROP COLUMN "base_price";
ALTER TABLE "products" DROP COLUMN "discount_price";
