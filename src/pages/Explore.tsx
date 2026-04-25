import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Search, MapPin, 
  CheckCircle2, Filter, LayoutGrid, List,
  Shield, Briefcase, Download, Share2,
  Globe, Mail, X, ExternalLink
} from 'lucide-react';
import { bulkNGOs, bulkVolunteers } from '../data/bulk_entities';
import { resolveEntityImage, resolveEntityLogo } from '../lib/images';
import './Explore.css';

interface Entity {
  id: string;
  type: 'NGO' | 'NPO' | 'Volunteer';
  name: string;
  location: string;
  region: string;
  specialty: string;
  rating: number;
  email: string;
  website?: string;
  phone: string;
  is_featured: boolean;
  verified: boolean;
  images: string[];
  description: string;
  avatar?: string;
  contact?: string;
  social_links?: any;
}

const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  // Escaping special characters for Regex
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="highlight-text">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'NGO' | 'NPO'>('All'); 
  const [regionFilter, setRegionFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // FIXED: Change number[] to string[]
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Animation variants
  const cardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.98 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: Math.min(i * 0.03, 0.4),
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }),
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.3 } 
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, regionFilter, specialtyFilter]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [{ data: volData }, { data: ngoData }] = await Promise.all([
          supabase.from('volunteers').select('*').limit(300),
          supabase.from('ngos').select('*').order('featured', { ascending: false }).order('impact_rating', { ascending: false }).limit(600)
        ]);
        
        const formattedVols: Entity[] = (volData || []).map(v => ({
           id: `db-vol-${v.id}`,
           type: 'Volunteer',
           name: v.name,
           location: v.full_address || v.district || 'Unknown',
           region: v.district || 'Various',
           specialty: v.skills && v.skills.length > 0 ? v.skills[0] : 'General Support',
           rating: v.reliability_score || 80,
           email: v.email || 'N/A',
           phone: v.phone || 'N/A',
           is_featured: false,
           verified: true,
           images: [],
           description: v.bio || '',
           avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=random`,
           contact: v.email || v.phone || 'N/A'
        }));
        
        const formattedNGOs: Entity[] = (ngoData || []).map(n => ({
           id: `db-ngo-${n.id}`,
           type: 'NGO',
           name: n.name && n.name.length > 60 ? n.name.substring(0, 60) + '...' : n.name,
           location: n.headquarters || n.location || 'Pan-India',
           region: (n.headquarters || n.location)?.split(',').pop()?.trim() || 'National',
           specialty: n.primary_sector || n.category || 'Environmental',
           rating: parseFloat(n.impact_rating) || 4.2,
           email: n.email || 'N/A',
           website: n.website || 'N/A',
           phone: n.phone || 'N/A',
           is_featured: n.featured || false,
           verified: true,
           images: n.image_url ? [n.image_url] : ['/images/community-work.jpg'],
           description: n.clean_description || '',
           social_links: n.social_links || {}
        }));
        
        // Prioritize Bulk Data (contains Pehchaan and curated high-fidelity records)
        const bulkEntities: Entity[] = bulkNGOs.map(bn => ({
          ...bn,
          id: bn.id.toString(),
          type: bn.type as 'NGO' | 'NPO',
          is_bulk: true
        }));

        const dbEntities = formattedNGOs.filter(dbn => 
          !bulkEntities.some(bn => bn.name.toLowerCase() === dbn.name.toLowerCase() || bn.id === dbn.id)
        );

        const allNGOs = [...bulkEntities, ...dbEntities]
          .sort((a, b) => {
            // Absolute priority for Pehchaan
            if (a.id === 'bulk-pehchaan') return -1;
            if (b.id === 'bulk-pehchaan') return 1;
            
            // Then Featured
            if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
            
            // Then Rating
            return (b.rating || 0) - (a.rating || 0);
          });

        setEntities(allNGOs);
      } catch (error) {
        console.error('Error loading entities:', error);
        // Fallback to bulk data only
        const formattedBulkNGOs: Entity[] = bulkNGOs.map(bn => ({
          ...bn,
          id: bn.id.toString(),
          type: bn.type as 'NGO' | 'NPO'
        }));
        setEntities(formattedBulkNGOs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute dynamic filter options
  const filterOptions = useMemo(() => {
    const activeData = typeFilter === 'All' ? entities : entities.filter(e => e.type === typeFilter);
    const regions = Array.from(new Set(activeData.map(e => e.region))).filter(Boolean).sort();
    const specialties = Array.from(new Set(activeData.map(e => e.specialty))).filter(s => s && s.length < 30).slice(0, 15).sort();
    return { regions, specialties };
  }, [entities, typeFilter]);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      const matchesType = typeFilter === 'All' || e.type === typeFilter;
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'All' || e.region === regionFilter;
      const matchesSpecialty = specialtyFilter === 'All' || e.specialty === specialtyFilter;
      return matchesType && matchesSearch && matchesRegion && matchesSpecialty;
    })
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      return a.name.localeCompare(b.name);
    });
  }, [entities, typeFilter, searchTerm, regionFilter, specialtyFilter]);

  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntities.slice(start, start + itemsPerPage);
  }, [filteredEntities, currentPage]);

  const handleExportCSV = () => {
    if (filteredEntities.length === 0) return;
    const csvData = filteredEntities.map((e: any) => ({
      Type: e.type,
      Name: e.name,
      Specialty: e.specialty,
      Region: e.region,
      Location: e.location,
      Rating: e.rating,
      Contact: e.email || e.phone || 'N/A'
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sahayogi-intelligence-platform-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredEntities.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Sahayogi-Intelligence-Platform Verified Entities Index', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Records: ${filteredEntities.length}`, 14, 28);
    
    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Type', 'Specialty', 'Region', 'Rating']],
      body: filteredEntities.slice(0, 100).map((e: any) => [e.name, e.type, e.specialty, e.region, e.rating]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });
    doc.save('sahayogi-intelligence-platform-registry.pdf');
  };

  const handleToggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setRegionFilter('All');
    setSpecialtyFilter('All');
  };

  return (
    <div className="explore-container">
      <aside className="explore-sidebar">
        <div>
          <h2 className="filter-section-title">REGISTRY TYPE</h2>
          <div className="filter-group">
            {[
              { id: 'All', label: 'Complete Ecosystem' },
              { id: 'NGO', label: 'NGOs' },
              { id: 'NPO', label: 'NPOs' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id as any)}
                className={`filter-btn ${typeFilter === type.id ? 'active' : ''}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="filter-section-title">REGIONAL FOCUS</h2>
          <select 
            className="region-select"
            value={regionFilter} 
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="All">National (All States)</option>
            {filterOptions.regions.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="filter-section-title">SECTORIAL SPECIALTY</h2>
          <div className="specialty-chips">
            <button
              onClick={() => setSpecialtyFilter('All')}
              className={`specialty-chip ${specialtyFilter === 'All' ? 'active' : ''}`}
            >
              All Sectors
            </button>
            {filterOptions.specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialtyFilter(spec)}
                className={`specialty-chip ${specialtyFilter === spec ? 'active' : ''}`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <button className="clear-filters-btn" onClick={clearAllFilters}>
          Clear All Filters
        </button>
      </aside>

      <main className="explore-main">
        <header className="explore-header">
          <div className="explore-subtitle">
            <Search size={16} /> 
            VERIFIED NATIONAL INTELLIGENCE
          </div>
          <h1 className="explore-title">Global Explorer</h1>
          <p style={{ color: 'var(--text-mid)', marginTop: '12px', fontWeight: 500, fontSize: '18px' }}>
            Accessing {entities.length > 0 ? entities.length.toLocaleString() : 'thousands of'} tactical datasets for humanitarian operations.
          </p>
        </header>

        <div className="explore-toolbar">
          <div className="explore-toolbar-search">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name, sector, or region..." 
                value={searchTerm} 
                className="search-input"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ height: '32px', width: '1px', background: 'rgba(0,0,0,0.1)' }} />
            <div className="results-count">
              Found <span>{filteredEntities.length}</span> entities
            </div>
          </div>
          
          <div className="export-group">
            <button className="export-btn csv" onClick={handleExportCSV}>
              <Download size={16} /> CSV
            </button>
            <button className="export-btn pdf" onClick={handleExportPDF}>
              <Download size={16} /> DATASET PDF
            </button>
          </div>
        </div>

        <div className="entity-grid">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '28px' }} />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {paginatedEntities.map((entity, index) => (
                <motion.div 
                  layout 
                  key={entity.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  className="entity-card"
                  onClick={() => navigate(`/profile/${entity.id}?type=${entity.type.toLowerCase()}`)}
                >
                    <div className="entity-card-image">
                        <img 
                         key={`${entity.id}-img`}
                         src={resolveEntityImage(entity)} 
                         alt={entity.name} 
                         loading="lazy" 
                         onError={(e: any) => { 
                           const fallbacks = [
                             "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
                             "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
                             "https://images.unsplash.com/photo-1542601906-fbbd4afdb3fd",
                             "https://images.unsplash.com/photo-1518331647414-7664448a393e",
                             "https://images.unsplash.com/photo-1516627145497-ae6968893b74"
                           ];
                           const safeId = (entity.id || entity.name || '0').toString();
                           const seed = safeId.split('').reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0);
                           e.target.src = `${fallbacks[seed % fallbacks.length]}?auto=format&fit=crop&q=80&w=800`;
                         }} 
                        />
                    </div>

                  <div className="entity-card-content">
                    <div className="entity-info-header">
                      <div className="entity-avatar-wrapper">
                        {resolveEntityLogo(entity) ? (
                          <img src={resolveEntityLogo(entity)} alt={entity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Briefcase size={24} color="white" />
                        )}
                      </div>
                      <div className="entity-title-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 className="entity-name">
                            <Highlight text={entity.name} highlight={searchTerm} />
                          </h3>
                          {entity.verified && <CheckCircle2 size={16} color="#10B981" className="verified-badge" />}
                        </div>
                        <div className="entity-meta">
                          <MapPin size={14} /> <Highlight text={entity.location} highlight={searchTerm} />
                        </div>
                      </div>
                    </div>

                    <div className="entity-tags-row">
                      {entity.is_featured && <span className="tag-pill tag-leader">🥇 LEADER</span>}
                      <span className="tag-pill tag-type">{entity.type}</span>
                      <span className="tag-pill tag-sector">{entity.specialty}</span>
                      <span className="tag-pill tag-rating">⭐ {entity.rating}</span>
                    </div>

                    <div className="entity-impact-block">
                      <div className="impact-col">
                        <div className="impact-label">IMPACT FOCUS</div>
                        <div className="impact-value">National</div>
                      </div>
                      <div className="impact-col">
                        <div className="impact-label">STATUS</div>
                        <div className="impact-value verified">Verified</div>
                      </div>
                    </div>

                    <div className="entity-contact-details">
                      <div className="contact-row">
                        <Mail size={14} className="contact-icon" />
                        <span>{entity.email}</span>
                      </div>
                      <div className="contact-row">
                        <Globe size={14} className="contact-icon" />
                        <span>{entity.website?.replace(/^https?:\/\//, '')}</span>
                      </div>
                    </div>

                    <div className="entity-actions-footer">
                      <button 
                        className="btn-access-dataset"
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${entity.id}?type=${entity.type.toLowerCase()}`); }}
                      >
                        ACCESS DATASET
                      </button>
                      <button className="btn-icon-secondary" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={18} />
                      </button>
                      <button className="btn-icon-secondary" onClick={(e) => e.stopPropagation()}>
                        <LayoutGrid size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {filteredEntities.length > itemsPerPage && (
          <div className="pagination">
            <button 
              className="page-btn page-btn-prev"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {currentPage} of {Math.ceil(filteredEntities.length / itemsPerPage)}
            </span>
            <button 
              className="page-btn page-btn-next"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(filteredEntities.length / itemsPerPage)}
            >
              Next Page
            </button>
          </div>
        )}

        {/* Multi-Select Action Bar (Floating) */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              style={{
                position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--navy-deep)', color: 'white', padding: '16px 32px',
                borderRadius: '50px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: '32px', zIndex: 1000,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--coral)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                  {selectedIds.length}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>ENTITIES SELECTED</span>
              </div>
              <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  className="btn-link"
                  style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}
                  onClick={handleExportCSV}
                >
                  <Download size={16} /> Export Dataset
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: 900 }}
                >
                  DESELECT ALL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
