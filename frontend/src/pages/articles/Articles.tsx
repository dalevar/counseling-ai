import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Bookmark, Search, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import toast from 'react-hot-toast';

const categories = ['Semua', 'Kesehatan Mental', 'Akademik', 'Karir', 'Keluarga', 'Relasi'];

const articles = [
  { id: 'a1', title: '7 Teknik Mindfulness untuk Mengurangi Stres Ujian', category: 'Kesehatan Mental', author: 'Dr. Rina Marliani', time: '7 menit baca', date: '10 Juli 2026', image: '', isBookmarked: false, tags: ['Mindfulness', 'Stres', 'Akademik'] },
  { id: 'a2', title: 'Membangun Kepercayaan Diri: Panduan Psikologi untuk Remaja', category: 'Kesehatan Mental', author: 'Sri Wahyuni, M.Psi.', time: '10 menit baca', date: '8 Juli 2026', image: '', isBookmarked: true, tags: ['Percaya Diri', 'Remaja', 'Self-Esteem'] },
  { id: 'a3', title: 'Tips Manajemen Waktu Efektif untuk Pelajar Aktif', category: 'Akademik', author: 'Tim EduCouns AI', time: '5 menit baca', date: '6 Juli 2026', image: '', isBookmarked: false, tags: ['Manajemen Waktu', 'Produktivitas', 'Belajar'] },
  { id: 'a4', title: 'Mengenal Gejala Burnout dan Cara Mengatasinya', category: 'Kesehatan Mental', author: 'Dr. Bambang S.', time: '8 menit baca', date: '4 Juli 2026', image: '', isBookmarked: false, tags: ['Burnout', 'Kelelahan', 'Pemulihan'] },
];

export const Articles: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(articles.filter((a) => a.isBookmarked).map((a) => a.id)));

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success('Dihapus dari simpanan.'); }
      else { next.add(id); toast.success('Artikel disimpan!'); }
      return next;
    });
  };

  const filtered = articles.filter(
    (a) =>
      (activeCategory === 'Semua' || a.category === activeCategory) &&
      (a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black">Artikel Edukasi Psikologi</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kumpulan artikel edukasi kesehatan mental dan pengembangan diri yang dikurasi oleh para psikolog terpercaya.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari artikel atau topik..."
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

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((article) => (
          <motion.div key={article.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="flex flex-col h-full p-5 gap-3 hover:shadow-md transition-shadow duration-200 cursor-pointer group">
              {/* Placeholder graphic */}
              <div className="w-full h-32 rounded-xl bg-gradient-to-tr from-primary/15 to-secondary/15 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary/40" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">{article.date}</span>
                </div>
                <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-[11px] text-muted-foreground">Oleh {article.author}</p>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.time}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                    className={`p-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      bookmarks.has(article.id) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarks.has(article.id) ? 'fill-current' : ''}`} />
                  </button>
                  <Button size="sm" variant="ghost" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} className="h-8 text-xs" onClick={() => toast.success('Membuka artikel...')}>
                    Baca
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="md:col-span-2 py-12 text-center text-muted-foreground text-sm">
            Tidak ada artikel yang cocok.
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
