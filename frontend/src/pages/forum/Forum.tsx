import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, Bookmark, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';
import toast from 'react-hot-toast';

const categories = ['Semua', 'Akademik', 'Sosial', 'Keluarga', 'Karir', 'Self-Care'];

const posts = [
  { id: 'p1', author: 'Annisa R.', avatar: '', time: '2 jam lalu', category: 'Akademik', title: 'Bagaimana cara kalian mengatasi test anxiety?', body: 'Saya selalu panik saat ujian meski sudah belajar. Ada tips untuk mengatasinya?', likes: 42, comments: 18, isBookmarked: false, isLiked: false },
  { id: 'p2', author: 'Dimas P.', avatar: '', time: '5 jam lalu', category: 'Sosial', title: 'Susah berteman di sekolah baru — normal gak sih?', body: 'Baru pindah sekolah 2 bulan lalu dan masih belum punya teman dekat. Butuh motivasi.', likes: 87, comments: 34, isBookmarked: true, isLiked: true },
  { id: 'p3', author: 'Lia K.', avatar: '', time: '1 hari lalu', category: 'Self-Care', title: 'Sharing Rutinitas Malam yang Bikin Tidur Lebih Nyenyak', body: 'Meditasi 10 menit + journaling sebelum tidur benar-benar mengubah kualitas tidur saya!', likes: 156, comments: 47, isBookmarked: false, isLiked: false },
];

export const Forum: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [postStates, setPostStates] = useState<Record<string, { liked: boolean; bookmarked: boolean; likes: number }>>(
    Object.fromEntries(posts.map((p) => [p.id, { liked: p.isLiked, bookmarked: p.isBookmarked, likes: p.likes }]))
  );

  const toggleLike = (id: string) => {
    setPostStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        liked: !prev[id].liked,
        likes: prev[id].liked ? prev[id].likes - 1 : prev[id].likes + 1,
      },
    }));
  };

  const toggleBookmark = (id: string) => {
    setPostStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], bookmarked: !prev[id].bookmarked },
    }));
    toast.success(postStates[id].bookmarked ? 'Dihapus dari simpanan.' : 'Disimpan ke koleksimu!');
  };

  const filtered = posts.filter(
    (p) =>
      (activeCategory === 'Semua' || p.category === activeCategory) &&
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.body.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black">Forum Diskusi</h2>
          <p className="text-sm text-muted-foreground mt-1">Berbagi cerita, pengalaman, dan dukungan dengan sesama pelajar.</p>
        </div>
        <Button leftIcon={<MessageSquare className="h-4 w-4" />} onClick={() => toast.success('Membuka form buat posting baru...')}>
          Buat Posting
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari topik diskusi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 rounded-xl border border-border bg-card/50 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts feed */}
      <div className="space-y-4">
        {filtered.map((post) => {
          const state = postStates[post.id];
          return (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 space-y-3">
                {/* Post header */}
                <div className="flex items-center gap-3">
                  <Avatar fallback={post.author} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">{post.author}</span>
                      <span className="text-[10px] text-muted-foreground">{post.time}</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 mt-0.5">{post.category}</Badge>
                  </div>
                </div>

                {/* Post body */}
                <div>
                  <h3 className="font-bold text-sm mb-1 cursor-pointer hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.body}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-1 border-t border-border">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                      state.liked ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${state.liked ? 'fill-current' : ''}`} />
                    {state.likes}
                  </button>
                  <button
                    onClick={() => toast.success('Membuka komentar...')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.comments}
                  </button>
                  <button
                    onClick={() => toast.success('Tautan disalin!')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                      state.bookmarked ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${state.bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Tidak ada topik yang cocok dengan pencarianmu.
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
