import { useState } from 'react';
import { CourseCard } from '../components/CourseCard';

export const ExplorerPage = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredCourses, 
  favorites, 
  toggleFavorite, 
  navigateTo, 
  setSelectedCourse,
  onSearch 
}: any) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]); 
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  
  // --- NUEVO: Estado para paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 18;

  const categories = [
    { title: 'Desarrollo móvil', techs: ['Multiplataforma', 'Dart y Flutter'] },
    { title: 'Desarrollo web', techs: ['Ruby', 'HTML', 'Python', 'JAVA', 'CSS', 'JavaScript', 'PHP', 'Go', 'Frontend', 'Backend', 'Angular', 'React', 'NodeJS', 'Vue', 'C# y VB', 'JAMstack'] },
    { title: 'Bases de Datos', techs: ['Relacionales', 'No relacionales', 'BD móviles'] },
    { title: 'Fundamentos', techs: ['Básico', 'Algoritmia y Estructuras', 'Arquitectura y Patrones de diseño', 'Git y GitHub'] },
    { title: 'Herramientas', techs: ['Información y Datos', 'Diseño', 'Generales', 'Bots', 'Asistentes de IA para código', 'Git y GitHub'] },
    { title: 'Devops', techs: ['Contenedores y VM', 'Automatización', 'Servidores'] },
    { title: 'Ciencia datos', techs: ['Fundamentos de Ciencia de datos', 'Herramientas de ciencia de datos', 'Python para ciencia de datos', 'Ingeniería de datos'] },
    { title: 'Inteligencia Artificial', techs: ['Machine Learning', 'Herramientas de IA en la nube', 'Deep learning', 'IA Generativa'] },
    { title: 'Testing (QA)', techs: ['Testing'] },
    { title: 'Cloud', techs: ['Fundamentos de Cloud', 'Azure', 'AWS'] },
    { title: 'English', techs: ['English'] },
  ];

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleTechChange = (tech: string) => {
    setSelectedTechs(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  };

  const finalCourses = filteredCourses.filter((c: any) => {
    if (selectedTechs.length === 0) return true;
    const title = c.title.toLowerCase();
    const description = (c.description || "").toLowerCase();
    const category = (c.category || "").toLowerCase();

    return selectedTechs.some(tech => {
      const t = tech.toLowerCase();
      return title.includes(t) || description.includes(t) || category.includes(t) || (c.job_type && c.job_type.toLowerCase().includes(t));
    });
  });

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = finalCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(finalCourses.length / coursesPerPage);

  return (
    <div className="container-center">
      <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '3rem', color: '#fff' }}>
          Explora nuestro <span className="text-gradient">Catálogo</span>
        </h2>
      </div>

      <div className="explorer-layout">
        <aside className="explorer-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            <h3 className="white-text" style={{ margin: 0 }}>Filtros</h3>
            {selectedTechs.length > 0 && (
              <button onClick={() => { setSelectedTechs([]); setCurrentPage(1); }} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', fontSize: '0.8rem' }}>
                Limpiar
              </button>
            )}
          </div>
          
          {categories.map(cat => (
            <div key={cat.title} className="accordion-item">
              <div className={`accordion-header ${openMenus.includes(cat.title) ? 'active' : ''}`} onClick={() => toggleMenu(cat.title)}>
                <span>{cat.title}</span>
                <span>{openMenus.includes(cat.title) ? '−' : '+'}</span>
              </div>
              {openMenus.includes(cat.title) && (
                <div className="accordion-content">
                  {cat.techs.map(tech => (
                    <label key={tech} className="checkbox-label">
                      <input type="checkbox" checked={selectedTechs.includes(tech)} onChange={() => handleTechChange(tech)} />
                      <span className="checkmark"></span>
                      {tech}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main className="explorer-main">
  <div className="search-box-premium" style={{ margin: '0 0 30px 0', maxWidth: 'none' }}>
    <input 
      type="text" 
      placeholder="🔍 ¿Qué quieres aprender hoy?..." 
      value={searchTerm} 
      onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
    />
    <button className="btn-primary-levelup" onClick={onSearch}>Buscar</button>
  </div>

  <div className="jobs-list" style={{ 
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gridAutoRows: '450px', // ESTO FIJA EL LARGO PARA TODAS
    gap: '25px',
    width: '100%',
    alignItems: 'stretch'
  }}>
    {currentCourses.length > 0 ? (
      <>
        {currentCourses.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', height: '100%' }}> 
            <CourseCard 
              course={c} 
              isFavorite={favorites.includes(c.id)} 
              onFavorite={toggleFavorite} 
              onClick={() => { setSelectedCourse(c); navigateTo('course-detail') }} 
            />
          </div>
        ))}
      </>
    ) : (
      <div className="no-results" style={{ gridColumn: '1 / -1' }}>
        <p>No se encontraron cursos.</p>
      </div>
    )}
  </div>

  {/* Paginación */}
  {totalPages > 1 && (
    <div className="pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
        <button 
          key={num} 
          onClick={() => { setCurrentPage(num); window.scrollTo(0,0); }} 
          className={`page-btn ${currentPage === num ? 'active' : ''}`}
        >
          {num}
        </button>
      ))}
    </div>
  )}
</main>
      </div>
    </div>
  );
};