import { useRef } from 'react';
import { CourseCard } from '../components/CourseCard';

// --- SUB-COMPONENTE DEL CARRUSEL ---
const CarouselSection = ({ title, courses, favorites, toggleFavorite, navigateTo, setSelectedCourse }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const moveAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - moveAmount : scrollLeft + moveAmount,
        behavior: 'smooth'
      });
    }
  };

  if (courses.length === 0) return null;

  return (
    <section className="container-center" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="white-text" style={{ margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-btn-home" onClick={() => scroll('left')}>❮</button>
          <button className="nav-btn-home" onClick={() => scroll('right')}>❯</button>
        </div>
      </div>
      
      <div 
        className="home-carousel-container" 
        ref={scrollRef} 
        style={{ 
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          paddingBottom: '20px',
          scrollbarWidth: 'none', // Oculta scroll en Firefox
          msOverflowStyle: 'none', // Oculta scroll en IE/Edge
        }}
      >
        {courses.map((c: any) => (
          <div 
            key={c.id} 
            className="home-carousel-item" 
            style={{ 
              flex: '0 0 300px', 
              minWidth: '300px',
              height: '450px', // Alto fijo para que no se vea mal
              display: 'flex'
            }}
          >
            <CourseCard 
              course={c} 
              isFavorite={favorites.includes(c.id)} 
              onFavorite={toggleFavorite} 
              onClick={() => { setSelectedCourse(c); navigateTo('course-detail') }} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const LandingPage = ({ courses, favorites, toggleFavorite, navigateTo, setSelectedCourse }: any) => {
  
  // 1. Cursos más demandados (los primeros 10)
  const popularCourses = courses.slice(0, 10);

  // 2. Nuevos Lanzamientos (invertimos la lista para ver los últimos agregados)
  const newCourses = [...courses].reverse().slice(0, 10);

  // 3. Cursos Gratuitos (filtrado por precio o marca de gratuito)
  const freeCourses = courses.filter((c: any) => 
    c.is_free === true || c.price === 0 || c.category?.toLowerCase().includes('gratis')
  );

  // 4. Especialización Frontend (Cursos que tengan React, HTML, JS, etc.)
  const frontendKeywords = ['react', 'frontend', 'javascript', 'html', 'css', 'vue', 'angular'];
  const frontendCourses = courses.filter((c: any) => 
    frontendKeywords.some(key => c.title.toLowerCase().includes(key))
  ).slice(0, 10);

  return (
    <div className="landing-wrapper">
      {/* HERO SECTION */}
      <section className="hero-education">
        <div className="container-center">
          <h1 className="hero-title">Domina las <span className="text-gradient">Tecnologías</span> del Futuro</h1>
          <p className="hero-subtitle">Aprende de expertos con rutas guiadas y proyectos reales.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>
            <button className="btn-primary-levelup" style={{ padding: '15px 40px', fontSize: '1.1rem' }} onClick={() => navigateTo('explorer')}>
              Ver Catálogo Completo
            </button>
            <button 
              style={{ background: 'transparent', border: '1px solid #a855f7', color: 'white', padding: '15px 40px', borderRadius: '10px', cursor: 'pointer' }}
              onClick={() => navigateTo('categories')}
            >
              Rutas de Carrera
            </button>
          </div>
        </div>
      </section>

      {/* SECCIONES DE CARRUSELES */}
      
      <CarouselSection 
        title="🚀 Cursos más demandados" 
        courses={popularCourses} 
        favorites={favorites} 
        toggleFavorite={toggleFavorite} 
        navigateTo={navigateTo} 
        setSelectedCourse={setSelectedCourse} 
      />

      <CarouselSection 
        title="✨ Nuevos Lanzamientos" 
        courses={newCourses} 
        favorites={favorites} 
        toggleFavorite={toggleFavorite} 
        navigateTo={navigateTo} 
        setSelectedCourse={setSelectedCourse} 
      />

      {/* SECCIÓN DINÁMICA DE CURSOS GRATUITOS */}
      {freeCourses.length > 0 ? (
        <CarouselSection 
          title="🎁 Cursos Gratuitos" 
          courses={freeCourses} 
          favorites={favorites} 
          toggleFavorite={toggleFavorite} 
          navigateTo={navigateTo} 
          setSelectedCourse={setSelectedCourse} 
        />
      ) : (
        <section className="container-center" style={{ padding: '40px 0' }}>
          <div style={{ 
            background: 'rgba(74, 222, 128, 0.05)', 
            border: '1px dashed #4ade80', 
            padding: '40px', 
            borderRadius: '20px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ color: '#4ade80', margin: '0 0 10px 0' }}>🎁 Próximamente: Contenido Gratuito</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Estamos preparando cursos increíbles para que empieces sin costo.</p>
          </div>
        </section>
      )}

      {frontendCourses.length > 0 && (
        <CarouselSection 
          title="💻 Especialización Frontend" 
          courses={frontendCourses} 
          favorites={favorites} 
          toggleFavorite={toggleFavorite} 
          navigateTo={navigateTo} 
          setSelectedCourse={setSelectedCourse} 
        />
      )}

      {/* ESPACIADOR FINAL */}
      <div style={{ marginBottom: '80px' }}></div>
    </div>
  );
};