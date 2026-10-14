/**
 * Premium Wallpaper Tab - Curated 4K Wallpaper Collection
 * 100% self-contained local assets (Zero external network dependencies)
 * Categories: Nature, Space, Technology
 */

window.WallpaperData = {
  categories: [
    { id: 'all', name: 'All Collections', count: 9, icon: 'sparkles' },
    { id: 'nature', name: 'Nature', count: 3, icon: 'trees' },
    { id: 'space', name: 'Space', count: 3, icon: 'orbit' },
    { id: 'technology', name: 'Technology', count: 3, icon: 'cpu' }
  ],

  wallpapers: [
    // --- NATURE ---
    {
      id: 'nature-1',
      title: 'Ethereal Emerald Aurora',
      category: 'nature',
      categoryName: 'Nature',
      author: 'Studio Nocturne',
      authorUrl: '#',
      resolution: '4K UHD (3840×2160)',
      location: 'Nordic Alpine Fjord',
      tags: ['Aurora', 'Alpine', 'Emerald', 'Night'],
      palette: ['#041512', '#0d4a3e', '#1ee39f', '#7cf2c5'],
      previewUrl: './assets/wallpapers/nature_1.jpg',
      fullUrl: './assets/wallpapers/nature_1.jpg',
      downloadUrl: './assets/wallpapers/nature_1.jpg',
      views: '54.2k',
      featured: true,
      description: 'Luminescent ribbons of emerald aurora borealis reflecting across still sub-alpine mirror lakes.'
    },
    {
      id: 'nature-2',
      title: 'Twilight Amber Dunes',
      category: 'nature',
      categoryName: 'Nature',
      author: 'Aura Landscapes',
      authorUrl: '#',
      resolution: '4K UHD (3840×2160)',
      location: 'Sahara Obsidian Basin',
      tags: ['Dunes', 'Desert', 'Golden Rim', 'Minimalist'],
      palette: ['#160b1e', '#3c1836', '#9a4732', '#f69d53'],
      previewUrl: './assets/wallpapers/nature_2.jpg',
      fullUrl: './assets/wallpapers/nature_2.jpg',
      downloadUrl: './assets/wallpapers/nature_2.jpg',
      views: '41.8k',
      featured: false,
      description: 'Silken undulating sand crests illuminated by an ethereal twilight gradient and fine crescent moon.'
    },
    {
      id: 'nature-3',
      title: 'Alpine Moonlit Sanctuary',
      category: 'nature',
      categoryName: 'Nature',
      author: 'Studio Nocturne',
      authorUrl: '#',
      resolution: '5K Retina (5120×2880)',
      location: 'Dolomites Glacial Valley',
      tags: ['Mountains', 'Solitude', 'Glacial', 'Zen'],
      palette: ['#061118', '#102e34', '#388b85', '#b4f0e0'],
      previewUrl: './assets/wallpapers/nature_3.jpg',
      fullUrl: './assets/wallpapers/nature_3.jpg',
      downloadUrl: './assets/wallpapers/nature_3.jpg',
      views: '48.9k',
      featured: true,
      description: 'Jagged granite pinnacles crowned by soft drifting fog and pristine celestial reflections.'
    },

    // --- SPACE ---
    {
      id: 'space-1',
      title: 'Deep Stellar Nebula Vortex',
      category: 'space',
      categoryName: 'Space',
      author: 'Cosmos Labs',
      authorUrl: '#',
      resolution: '5K Ultra (5120×2880)',
      location: 'Infrared Star Nursery (NGC 3324)',
      tags: ['Nebula', 'Deep Space', 'Prismatic', 'Stellar'],
      palette: ['#060814', '#1f0d3b', '#00b4d8', '#d946ef'],
      previewUrl: './assets/wallpapers/space_1.jpg',
      fullUrl: './assets/wallpapers/space_1.jpg',
      downloadUrl: './assets/wallpapers/space_1.jpg',
      views: '76.4k',
      featured: true,
      description: 'Vibrant interstellar gas clouds and energetic young stars sculpted by ultraviolet radiation in deep cosmos.'
    },
    {
      id: 'space-2',
      title: 'Colossal Ringed Gas Giant',
      category: 'space',
      categoryName: 'Space',
      author: 'Orbital Dynamics',
      authorUrl: '#',
      resolution: '4K UHD (3840×2160)',
      location: 'Outer Jovian Horizon',
      tags: ['Planet', 'Saturn', 'Rings', 'Void'],
      palette: ['#070710', '#1c1b30', '#635f82', '#e2ded5'],
      previewUrl: './assets/wallpapers/space_2.jpg',
      fullUrl: './assets/wallpapers/space_2.jpg',
      downloadUrl: './assets/wallpapers/space_2.jpg',
      views: '63.1k',
      featured: true,
      description: 'Luminous planetary ice rings casting delicate orbital shadows over deep violet atmospheric bands.'
    },
    {
      id: 'space-3',
      title: 'Celestial Monolith Horizon',
      category: 'space',
      categoryName: 'Space',
      author: 'Aether Digital',
      authorUrl: '#',
      resolution: '5K Retina (5120×2880)',
      location: 'Exoplanet Terminus',
      tags: ['Monolith', 'Cosmic Beams', 'Milky Way', 'Alien'],
      palette: ['#04050d', '#13112c', '#6028a8', '#00f2fe'],
      previewUrl: './assets/wallpapers/space_3.jpg',
      fullUrl: './assets/wallpapers/space_3.jpg',
      downloadUrl: './assets/wallpapers/space_3.jpg',
      views: '88.7k',
      featured: false,
      description: 'Obsidian spires channeling brilliant celestial light rays into a crystal-clear galactic night sky.'
    },

    // --- TECHNOLOGY ---
    {
      id: 'tech-1',
      title: 'Cyberpunk Midnight Metropolis',
      category: 'technology',
      categoryName: 'Technology',
      author: 'NeoShibuya Studio',
      authorUrl: '#',
      resolution: '4K UHD (3840×2160)',
      location: 'Sector 07 Skyway',
      tags: ['Cyberpunk', 'Neon', 'Rain', 'Architecture'],
      palette: ['#060d17', '#121f2f', '#00f2fe', '#8a2be2'],
      previewUrl: './assets/wallpapers/tech_1.jpg',
      fullUrl: './assets/wallpapers/tech_1.jpg',
      downloadUrl: './assets/wallpapers/tech_1.jpg',
      views: '71.2k',
      featured: true,
      description: 'Towering dark glass skyscrapers outlined in razor-sharp cyan and violet lasers reflecting on rain-washed boulevards.'
    },
    {
      id: 'tech-2',
      title: 'Iridescent Liquid Chrome Waves',
      category: 'technology',
      categoryName: 'Technology',
      author: 'Parametric Lab',
      authorUrl: '#',
      resolution: '5K Retina (5120×2880)',
      location: 'Procedural Material Core',
      tags: ['Liquid Metal', 'Chrome', 'Minimalist', 'Refraction'],
      palette: ['#04050a', '#141726', '#3b4371', '#00f2fe'],
      previewUrl: './assets/wallpapers/tech_2.jpg',
      fullUrl: './assets/wallpapers/tech_2.jpg',
      downloadUrl: './assets/wallpapers/tech_2.jpg',
      views: '65.5k',
      featured: true,
      description: 'Molten chromatic ribbon sculpture floating in an obsidian void with prismatic studio specular highlights.'
    },
    {
      id: 'tech-3',
      title: 'Quantum Lattice Vector Grid',
      category: 'technology',
      categoryName: 'Technology',
      author: 'NeoShibuya Studio',
      authorUrl: '#',
      resolution: '4K UHD (3840×2160)',
      location: 'Neural Processor Horizon',
      tags: ['Cybernetic', 'Quantum', 'Lasers', 'Future'],
      palette: ['#090d16', '#14253a', '#00e5ff', '#9333ea'],
      previewUrl: './assets/wallpapers/tech_3.jpg',
      fullUrl: './assets/wallpapers/tech_3.jpg',
      downloadUrl: './assets/wallpapers/tech_3.jpg',
      views: '58.3k',
      featured: false,
      description: 'Luminous photonic data conduits linking futuristic monolithic pillars in an infinite cyber grid.'
    }
  ],

  getById(id) {
    return this.wallpapers.find(w => w.id === id) || this.wallpapers[0];
  },

  getByCategory(cat) {
    if (!cat || cat === 'all') return this.wallpapers;
    return this.wallpapers.filter(w => w.category === cat);
  },

  getRandom(excludeId) {
    const pool = excludeId ? this.wallpapers.filter(w => w.id !== excludeId) : this.wallpapers;
    return pool[Math.floor(Math.random() * pool.length)];
  }
};
