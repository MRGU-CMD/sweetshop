import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  sales: number;
  images: string;
}

export default function ProductCard({ id, name, price, originalPrice, sales, images }: ProductCardProps) {
  const imageList = JSON.parse(images || "[]") as string[];
  const firstImage = imageList[0];

  return (
    <Link href={`/product/${id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-50 hover:shadow-lg hover:shadow-sakura-500/10 transition-all duration-300">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-sakura-50 to-purple-50 flex items-center justify-center text-4xl relative overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="opacity-40">🧸</span>
          )}
          {originalPrice && originalPrice > price && (
            <span className="absolute top-2 left-2 bg-sakura-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {Math.round((1 - price / originalPrice) * 100)}%OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm text-gray-700 line-clamp-2 leading-snug group-hover:text-sakura-500 transition-colors">
            {name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-sakura-500">¥{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-300 line-through">¥{originalPrice}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">已售 {sales.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
