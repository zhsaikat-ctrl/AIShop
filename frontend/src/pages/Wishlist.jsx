import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { wishlist, remove } = useWishlist();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>

      {wishlist.length === 0 && <p>No items in wishlist</p>}

      <div className="grid md:grid-cols-4 gap-4">
        {wishlist.map((w) => (
          <div key={w._id} className="card bg-base-200 shadow">
            <img src={w.product.image} alt="" className="h-40 object-cover" />
            <div className="p-3">
              <h2 className="font-bold">{w.product.name}</h2>
              <p>${w.product.price}</p>

              <button
                onClick={() => remove(w.product._id)}
                className="btn btn-error btn-sm mt-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
