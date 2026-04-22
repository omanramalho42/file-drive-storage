import { FileBrowser } from "@/components/base/file-browser"

export default function FavoritesPage() {
  return (
    <div>
      <FileBrowser
        title="Favoritos"
        favoritesOnly
      />
    </div>
  )
}