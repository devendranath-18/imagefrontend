"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface ImageType {
  id: number;
  filePath: string;
  createdAt: string;
}
const API = "http://localhost:5000/api/images";
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const loadImages = async () => {
    const res = await axios.get(API);
    setImages(res.data);
  };
  useEffect(() => {
    loadImages();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setLoading(true);
      await axios.post(`${API}/upload`, formData);
      setFile(null);
      loadImages();
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    await axios.delete(`${API}/${id}`);
    loadImages();
  };
  const filteredImages = images
    .filter((img) =>
      img.filePath.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
    );
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-10">
      <Card className="max-w-7xl mx-auto shadow-2xl rounded-3xl border backdrop-blur-lg bg-white/70">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center">
            📸 Image Management Dashboard
          </CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Total Images:{" "}
            <span className="font-semibold">{images.length}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-10">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
              className="max-w-md"
            />
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-2 rounded-xl"
            >
              {loading ? "Uploading..." : "Upload Image"}
            </Button>
          </form>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Input
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              className="border rounded-xl px-4 py-2 bg-white"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          {filteredImages.length === 0 ? (
            <p className="text-center text-muted-foreground text-lg">
              No images found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredImages.map((img) => (
                <Card
                  key={img.id}
                  className="overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div
                    className="relative cursor-pointer"
                    onClick={() =>
                      setPreview(`http://localhost:5000${img.filePath}`)
                    }
                  >
                    <img
                      src={`http://localhost:5000${img.filePath}`}
                      alt="uploaded"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-lg font-semibold">
                      View Image
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm truncate">
                      {img.filePath}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(img.createdAt).toLocaleString()}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleDelete(img.id)}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            alt="preview"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </main>
  );
}
