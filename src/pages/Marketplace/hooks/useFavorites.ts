import { useState } from "react";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((fav) => fav !== id)
        : [...prevFavorites, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
};
