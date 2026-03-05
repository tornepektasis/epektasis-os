import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Plus, Search, Book, Calendar, Tag, Settings, ChevronRight, ChevronLeft,
  MoreVertical, Image as ImageIcon, Mic, Smile, Meh, Frown, Mountain, Archive,
  Trash2, FileText, BarChart3, BrainCircuit, Maximize2, Clock, Save, Moon, Sun,
  X, CheckCircle2, AlertCircle, Menu, Download, Lock, Unlock, LogOut, Share2, History, ChevronDown,
  Edit2, Bold, Italic, Underline, Heading1, Heading2, Heading3, List, ListOrdered,
  ImagePlus, AlignLeft, AlignCenter, AlignRight, LayoutTemplate, Palette, Hash, 
  Cloud, CloudOff
} from 'lucide-react';

/**
 * Epektasis Theme Defaults
 */
const DEFAULT_THEME = {
  primary: '#00471B',    // Good Land Green
  secondary: '#EEE1C6',  // Cream City Cream
  accent: '#0077C0',     // Great Lakes Blue
  sidebarText: '#ffffff',// Sidebar Font Base
  uiFont: 'Inter',
  docFont: 'Charter'
};

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { id: 'grateful', label: 'Grateful', icon: Mountain, color: 'text-emerald-600' },
  { id: 'serene', label: 'Serene', icon: Smile, color: 'text-blue-500' },
  { id: 'accomplished', label: 'Accomplished', icon: CheckCircle2, color: 'text-purple-500' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-zinc-500' },
  { id: 'anxious', label: 'Anxious', icon: AlertCircle, color: 'text-orange-500' },
  { id: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-400' },
  { id: 'angry', label: 'Angry', icon: Frown, color: 'text-red-500' }
];

// --- Initial Data ---
const INITIAL_JOURNALS = [
  { id: 'j1', name: 'Personal', color: 'var(--theme-primary)' },
  { id: 'j2', name: 'Spiritual', color: 'var(--theme-accent)' },
  { id: 'j3', name: 'Commonplace', color: '#6B4E71' },
];

const INITIAL_ENTRIES = [
  {
    id: 'e1',
    journalId: 'j1',
    title: 'Designing the Future',
    content: '<p>It is February 2026. The shift towards agentic workflows has completely redefined how we interact with personal data. <b>Epektasis</b> is becoming the core of my digital reflection...</p><ul><li>Faster processing</li><li>Deeper insights</li></ul>',
    createdAt: new Date('2026-02-28T10:30:00'),
    tags: ['philosophy', 'tech'],
    mood: 'serene'
  },
  {
    id: 'e2',
    journalId: 'j1',
    title: 'Winter Reflections',
    content: '<p>The clarity of a cold morning. Looking back at the start of the year, progress on the semantic search engine has been exponential.</p>',
    createdAt: new Date('2026-02-15T09:15:00'),
    tags: ['work', 'coding'],
    mood: 'accomplished'
  }
];

const INITIAL_TEMPLATES = [
  {
    id: 't1',
    name: 'Morning Gratitude',
    content: '<h3>What am I grateful for today?</h3><ul><li></li></ul><h3>What would make today great?</h3><ul><li></li></ul><h3>Daily Affirmation</h3><p>I am...</p>'
  },
  {
    id: 't2',
    name: 'Weekly Review',
    content: '<h2>Weekly Reflection</h2><h3>Wins for the week</h3><ul><li></li></ul><h3>Challenges & Friction</h3><ul><li></li></ul><h3>Goals for next week</h3><ul><li></li></ul>'
  }
];

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-[color:var(--theme-secondary)] text-[color:var(--theme-primary)] font-semibold shadow-sm' 
        : 'text-sidebar-inactive hover:bg-white/10 hover:text-sidebar-hover'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm tracking-tight truncate">{label}</span>
    </div>
    {badge !== undefined && (
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-[color:var(--theme-primary)] text-[color:var(--theme-secondary)]' : 'bg-white/20 text-sidebar-hover'}`}>
        {badge}
      </span>
    )}
  </button>
);

const SectionLabel = ({ children }) => (
  <div className="px-4 mt-8 mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-sidebar-muted">
    {children}
  </div>
);

const RichTextEditor = ({ content, onChange, onShowMessage, accessToken, folderId }) => {
  const editorRef = useRef(null);
  const savedRange = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedRange.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (savedRange.current) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange.current);
      }
    }
  };

  const exec = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    const inputTarget = e.target;
    if (!file) return;

    if (!accessToken) {
      onShowMessage?.('Cloud Upload Required: Please go to Settings and click "Connect to Drive" first.');
      inputTarget.value = ''; 
      return;
    }

    setIsUploading(true);
    try {
      const metadata = { name: `epektasis_media_${Date.now()}`, mimeType: file.type };
      if (folderId) {
        metadata.parents = [folderId]; // Save to specific Google Drive Folder!
      }
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      const fileData = await uploadRes.json();
      const fileId = fileData.id;

      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' })
      });

      const imgUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      
      restoreSelection();
      document.execCommand('insertImage', false, imgUrl);
      onChange(editorRef.current?.innerHTML || '');
      
    } catch (err) {
      console.error(err);
      onShowMessage?.('Failed to upload image to Google Drive.');
    } finally {
      setIsUploading(false);
      inputTarget.value = ''; 
    }
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target);
    } else {
      setSelectedImage(null);
    }
    saveSelection();
  };

  const resizeImage = (widthPercentage) => {
    if (selectedImage) {
      selectedImage.style.width = widthPercentage;
      selectedImage.style.height = 'auto';
      onChange(editorRef.current.innerHTML);
    }
  };

  const alignImage = (alignment) => {
    if (selectedImage) {
      if (alignment === 'center') {
        selectedImage.style.display = 'block';
        selectedImage.style.margin = '1.5rem auto';
        selectedImage.style.float = 'none';
      } else if (alignment === 'left') {
        selectedImage.style.display = 'inline-block';
        selectedImage.style.margin = '0 1.5rem 1.5rem 0';
        selectedImage.style.float = 'left';
      } else if (alignment === 'right') {
        selectedImage.style.display = 'inline-block';
        selectedImage.style.margin = '0 0 1.5rem 1.5rem';
        selectedImage.style.float = 'right';
      }
      onChange(editorRef.current.innerHTML);
    }
  };

  const deleteSelectedImage = async () => {
    if (selectedImage) {
      const imgSrc = selectedImage.getAttribute('src');
      selectedImage.remove();
      setSelectedImage(null);
      onChange(editorRef.current.innerHTML);

      // Tell Google Drive to delete the file permanently
      if (imgSrc && accessToken) {
        const match = imgSrc.match(/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          try {
            await fetch(`https://www.googleapis.com/drive/v3/files/${match[1]}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
          } catch (e) {
            console.error('Failed to delete image from Drive', e);
          }
        }
      }
    }
  };

  const toggleDictation = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onShowMessage?.('Speech recognition is not supported in this browser, or is blocked by your current security settings.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        restoreSelection();
        document.execCommand('insertText', false, finalTranscript);
        saveSelection();
        onChange(editorRef.current.innerHTML);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error', e.error);
      setIsRecording(false);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        onShowMessage?.('Microphone access was denied. Please check your browser or system permissions.');
      } else if (e.error !== 'no-speech') {
        onShowMessage?.(`Dictation error: ${e.error}`);
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      onShowMessage?.('Failed to start dictation. The microphone may be in use or permissions are not properly configured.');
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, className = "" }) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 rounded transition-colors ${className}`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex flex-col border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-100 bg-zinc-50 min-h-[44px]">
        {selectedImage ? (
          <div className="flex items-center gap-2 px-2 animate-in fade-in duration-200 w-full overflow-x-auto pb-1">
            <span className="text-[10px] font-bold text-[color:var(--theme-primary)] uppercase tracking-wider mr-1 shrink-0">Resize:</span>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => resizeImage('25%')} className="px-2 py-1 text-xs font-bold bg-white border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 shrink-0">25%</button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => resizeImage('50%')} className="px-2 py-1 text-xs font-bold bg-white border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 shrink-0">50%</button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => resizeImage('100%')} className="px-2 py-1 text-xs font-bold bg-white border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 shrink-0">100%</button>
            
            <div className="w-px h-4 bg-zinc-300 mx-1 shrink-0" />
            <span className="text-[10px] font-bold text-[color:var(--theme-primary)] uppercase tracking-wider mr-1 shrink-0">Align:</span>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => alignImage('left')} className="p-1 bg-white border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 shrink-0" title="Align Left"><AlignLeft size={14}/></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => alignImage('center')} className="p-1 bg-white border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 shrink-0" title="Center"><AlignCenter size={14}/></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => alignImage('right')} className="p-1 bg-white border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 shrink-0" title="Align Right"><AlignRight size={14}/></button>

            <div className="flex-1 min-w-[10px]" />
            <button onMouseDown={(e) => e.preventDefault()} onClick={deleteSelectedImage} className="px-2 py-1 text-xs font-bold bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center gap-1 shrink-0">
              <Trash2 size={12} /> Remove
            </button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setSelectedImage(null)} className="p-1 text-zinc-400 hover:text-zinc-700 ml-1 shrink-0">
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <ToolbarButton icon={Bold} onClick={() => exec('bold')} title="Bold" />
            <ToolbarButton icon={Italic} onClick={() => exec('italic')} title="Italic" />
            <ToolbarButton icon={Underline} onClick={() => exec('underline')} title="Underline" />
            <div className="w-px h-4 bg-zinc-300 mx-1" />
            <ToolbarButton icon={Heading1} onClick={() => exec('formatBlock', 'H1')} title="Heading 1" />
            <ToolbarButton icon={Heading2} onClick={() => exec('formatBlock', 'H2')} title="Heading 2" />
            <ToolbarButton icon={Heading3} onClick={() => exec('formatBlock', 'H3')} title="Heading 3" />
            <div className="w-px h-4 bg-zinc-300 mx-1" />
            <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} title="Bullet List" />
            <ToolbarButton icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Numbered List" />
            <div className="w-px h-4 bg-zinc-300 mx-1" />
            <ToolbarButton icon={AlignLeft} onClick={() => exec('justifyLeft')} title="Align Left" />
            <ToolbarButton icon={AlignCenter} onClick={() => exec('justifyCenter')} title="Align Center" />
            <ToolbarButton icon={AlignRight} onClick={() => exec('justifyRight')} title="Align Right" />
            <div className="w-px h-4 bg-zinc-300 mx-1" />
            <label 
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded transition-colors ${isUploading ? 'text-[color:var(--theme-accent)] animate-pulse' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 cursor-pointer'}`} 
              title={isUploading ? "Uploading to Cloud..." : "Insert Image"}
            >
              {isUploading ? <Cloud size={16} /> : <ImagePlus size={16} />}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" disabled={isUploading} />
            </label>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleDictation}
              title={isRecording ? "Stop Dictation" : "Start Dictation"}
              className={`p-1.5 rounded transition-all ml-1 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
            >
              <Mic size={16} />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('formatBlock', 'P')} 
              className="text-xs font-bold text-zinc-500 hover:bg-zinc-200 px-2 py-1 rounded transition-colors ml-auto"
            >
              Paragraph
            </button>
          </>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onClick={handleEditorClick}
        onBlur={() => {
          saveSelection();
          setTimeout(() => setSelectedImage(null), 150);
        }}
        onKeyUp={saveSelection}
        className="p-6 min-h-[500px] outline-none rte-content font-serif text-lg leading-relaxed text-zinc-700 bg-white"
        placeholder="Begin your reflection..."
      />
    </div>
  );
};

// --- Main Application ---

const App = () => {
  // Data State
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('epektasis_entries');
    if (saved) {
      return JSON.parse(saved, (key, value) => key === 'createdAt' ? new Date(value) : value);
    }
    return INITIAL_ENTRIES;
  });
  
  const [journals, setJournals] = useState(() => {
    const saved = localStorage.getItem('epektasis_journals');
    return saved ? JSON.parse(saved) : INITIAL_JOURNALS;
  });
  
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('epektasis_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });
  const [themeConfig, setThemeConfig] = useState(() => {
    const saved = localStorage.getItem('epektasis_theme');
    return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME;
  });

  // Security State
  const [userPin, setUserPin] = useState(() => localStorage.getItem('epektasis_pin') || '');
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem('epektasis_pin'));
  const [pinInput, setPinInput] = useState('');
  const [pinSetup, setPinSetup] = useState('');

  // Navigation State
  const [activeView, setActiveView] = useState('home');
  const [activeJournal, setActiveJournal] = useState(journals[0] || INITIAL_JOURNALS[0]);
  const [selectedEntryId, setSelectedEntryId] = useState(entries[0]?.id || null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || null);
  const [archiveFilter, setArchiveFilter] = useState(null); 
  const [tagFilter, setTagFilter] = useState(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);
  const [isAIPanelOpen, setAIPanelOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEditingJournalName, setIsEditingJournalName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedYears, setExpandedYears] = useState([new Date().getFullYear().toString()]);
  const [modalConfig, setModalConfig] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);
  
  // Cloud Sync State
  const [googleClientId, setGoogleClientId] = useState(() => localStorage.getItem('epektasis_gclient') || '');
  const [accessToken, setAccessToken] = useState(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveFileId, setDriveFileId] = useState(() => localStorage.getItem('epektasis_fileId') || null);
  const [driveFolderId, setDriveFolderId] = useState(() => localStorage.getItem('epektasis_folderId') || null);
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem('epektasis_lastSync') || null);
  
  // Mobile Navigation State
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  const moreMenuRef = useRef(null);
  const moodMenuRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  // Load Google API Scripts dynamically
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://apis.google.com/js/api.js'),
      loadScript('https://accounts.google.com/gsi/client')
    ]).then(() => {
      window.gapi.load('client', () => {
        window.gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).catch(err => console.error("Error initializing GAPI client", err));
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Save to Local Storage
  useEffect(() => { localStorage.setItem('epektasis_entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('epektasis_journals', JSON.stringify(journals)); }, [journals]);
  useEffect(() => { localStorage.setItem('epektasis_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('epektasis_theme', JSON.stringify(themeConfig)); }, [themeConfig]);
  useEffect(() => { localStorage.setItem('epektasis_gclient', googleClientId); }, [googleClientId]);
  useEffect(() => { if (driveFileId) localStorage.setItem('epektasis_fileId', driveFileId); }, [driveFileId]);
  useEffect(() => { if (driveFolderId) localStorage.setItem('epektasis_folderId', driveFolderId); }, [driveFolderId]);
  useEffect(() => { if (lastSynced) localStorage.setItem('epektasis_lastSync', lastSynced); }, [lastSynced]);

  // AUTO-SYNC (Debounced 3s)
  useEffect(() => {
    if (isDriveConnected && driveFileId && accessToken && !isLocked) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncToDrive();
      }, 3000);
    }
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [entries, journals, templates, themeConfig, isDriveConnected, driveFileId, accessToken, isLocked]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setIsMoreMenuOpen(false);
      if (moodMenuRef.current && !moodMenuRef.current.contains(event.target)) setIsMoodMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedEntry = useMemo(() => entries.find(e => e.id === selectedEntryId) || null, [selectedEntryId, entries]);
  const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId) || null, [selectedTemplateId, templates]);

  const dynamicArchives = useMemo(() => {
    const arch = {};
    entries.forEach(entry => {
      const year = entry.createdAt.getFullYear().toString();
      const month = entry.createdAt.toLocaleString('default', { month: 'long' });
      if (!arch[year]) arch[year] = new Set();
      arch[year].add(month);
    });
    Object.keys(arch).forEach(year => {
      arch[year] = Array.from(arch[year]).sort((a, b) => new Date(Date.parse(b + " 1, 2026")) - new Date(Date.parse(a + " 1, 2026")));
    });
    return arch;
  }, [entries]);

  const dynamicTags = useMemo(() => {
    const tags = new Set();
    entries.forEach(e => { if (e.tags) e.tags.forEach(t => tags.add(t)); });
    return Array.from(tags).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (!activeJournal) return false;
      const matchesJournal = e.journalId === activeJournal.id;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = e.title.toLowerCase().includes(lowerQuery) || 
                            e.content.toLowerCase().includes(lowerQuery) ||
                            (e.tags && e.tags.some(t => t.includes(lowerQuery)));
      
      let matchesArchive = true;
      if (archiveFilter) {
        const entryYear = e.createdAt.getFullYear().toString();
        const entryMonth = e.createdAt.toLocaleString('default', { month: 'long' });
        matchesArchive = archiveFilter.month ? (entryYear === archiveFilter.year && entryMonth === archiveFilter.month) : (entryYear === archiveFilter.year);
      }

      let matchesTag = true;
      if (tagFilter) matchesTag = e.tags && e.tags.includes(tagFilter);

      return matchesJournal && matchesSearch && matchesArchive && matchesTag;
    });
  }, [activeJournal, searchQuery, entries, archiveFilter, tagFilter]);

  // --- Handlers ---

  const handleCreateEntry = () => {
    if (!activeJournal) return;
    const newEntry = {
      id: `e-${Date.now()}`,
      journalId: activeJournal.id,
      title: '',
      content: '',
      createdAt: new Date(),
      tags: [],
      mood: 'neutral'
    };
    setEntries([newEntry, ...entries]);
    setSelectedEntryId(newEntry.id);
    setActiveView('entries');
    setArchiveFilter(null);
    setTagFilter(null);
    setShowMobileDetail(true);
  };

  const handleDeleteEntry = async (id) => {
    const entryToDelete = entries.find(e => e.id === id);
    
    // Self-Cleaning: Delete any photos embedded in this entry from Google Drive
    if (entryToDelete && accessToken) {
      const regex = /https:\/\/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/g;
      let match;
      while ((match = regex.exec(entryToDelete.content || '')) !== null) {
        const fileId = match[1];
        try {
          await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
        } catch (err) {
          console.error("Failed to delete media from Drive:", err);
        }
      }
    }

    // Delete the entry locally
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    if (selectedEntryId === id && updated.length > 0) {
      setSelectedEntryId(updated[0].id);
    } else if (updated.length === 0) {
      setSelectedEntryId(null);
      setShowMobileDetail(false);
    }
    setIsMoreMenuOpen(false);
  };

  const handleCreateTemplate = () => {
    const newTemplate = { id: `t-${Date.now()}`, name: 'New Template', content: '' };
    setTemplates([newTemplate, ...templates]);
    setSelectedTemplateId(newTemplate.id);
    setShowMobileDetail(true);
  };

  const handleDeleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    if (selectedTemplateId === id && updated.length > 0) {
      setSelectedTemplateId(updated[0].id);
    } else if (updated.length === 0) {
      setSelectedTemplateId(null);
      setShowMobileDetail(false);
    }
  };

  const applyTemplateToEntry = (template) => {
    if (!selectedEntry) return;
    const currentContent = selectedEntry.content || '';
    const prefix = currentContent && !currentContent.endsWith('</p>') && !currentContent.endsWith('<br>') ? '<br><br>' : '';
    const newContent = currentContent + prefix + template.content;
    const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, content: newContent } : ent);
    setEntries(updated);
    setShowTemplatePicker(false);
  };

  const handleAddJournal = () => {
    const newJournal = { id: `j-${Date.now()}`, name: 'New Journal', color: 'var(--theme-accent)' };
    setJournals([...journals, newJournal]);
    setActiveJournal(newJournal);
    setActiveView('entries');
    setArchiveFilter(null);
    setTagFilter(null);
    setShowMobileDetail(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
    setTimeout(() => setIsEditingJournalName(true), 100);
  };

  const handleDeleteJournal = (id) => {
    if (journals.length === 1) {
      setModalConfig({ type: 'alert', title: 'Action Denied', message: 'You must have at least one journal remaining in Epektasis.', confirmText: 'Understood' });
      return;
    }
    setModalConfig({
      type: 'confirm', title: 'Delete Journal', message: `Are you sure you want to delete "${activeJournal.name}" and all of its associated entries? This action cannot be undone.`, confirmText: 'Delete', isDestructive: true,
      onConfirm: async () => {
        const entriesToDelete = entries.filter(e => e.journalId === id);
        
        // Self-Cleaning: Delete ALL photos inside ALL entries of this journal
        if (accessToken) {
          const regex = /https:\/\/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/g;
          for (const entry of entriesToDelete) {
            let match;
            while ((match = regex.exec(entry.content || '')) !== null) {
              try {
                await fetch(`https://www.googleapis.com/drive/v3/files/${match[1]}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${accessToken}` }
                });
              } catch (err) { console.error(err); }
            }
          }
        }

        const updatedJournals = journals.filter(j => j.id !== id);
        const updatedEntries = entries.filter(e => e.journalId !== id);
        setJournals(updatedJournals);
        setEntries(updatedEntries);
        setActiveJournal(updatedJournals[0]);
        if (updatedEntries.length > 0) setSelectedEntryId(updatedEntries[0].id);
        else setSelectedEntryId(null);
      }
    });
  };

  const handleConnectGoogleDrive = () => {
    if (!googleClientId) {
      setModalConfig({ type: 'alert', title: 'Missing Client ID', message: 'Please paste your Google OAuth Client ID first.', confirmText: 'Okay' });
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      setModalConfig({ type: 'alert', title: 'Scripts Loading', message: 'Google API scripts are still loading. Please wait a moment and try again.', confirmText: 'Okay' });
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: async (response) => {
        if (response.error !== undefined) {
          throw (response);
        }
        setAccessToken(response.access_token);
        setIsDriveConnected(true);
        await findOrCreateDriveFile(response.access_token);
      },
    });

    tokenClient.requestAccessToken();
  };

  const findOrCreateDriveFile = async (token) => {
    window.gapi.client.setToken({ access_token: token });
    try {
      // 1. Locate or Create "Epektasis Vault" Folder
      let folderId = driveFolderId;
      const folderRes = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and name='Epektasis Vault' and trashed=false",
        spaces: 'drive',
        fields: 'files(id, name)'
      });
      
      const folders = folderRes.result.files;
      if (folders && folders.length > 0) {
        folderId = folders[0].id;
      } else {
        const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Epektasis Vault', mimeType: 'application/vnd.google-apps.folder' })
        });
        const newFolder = await createFolderRes.json();
        folderId = newFolder.id;
      }
      setDriveFolderId(folderId);

      // 2. Locate or Create Main JSON Data File
      const response = await window.gapi.client.drive.files.list({
        q: "name='epektasis_vault.json' and trashed=false",
        spaces: 'drive',
        fields: 'files(id, name)'
      });

      const files = response.result.files;
      if (files && files.length > 0) {
        const fileId = files[0].id;
        setDriveFileId(fileId);
        await pullFromDrive(fileId, token);
      } else {
        const metadata = { name: 'epektasis_vault.json', mimeType: 'application/json', parents: [folderId] };
        const data = JSON.stringify({ entries, journals, templates, themeConfig });
        
        const file = new Blob([data], { type: 'application/json' });
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Bearer ' + token }),
          body: form,
        });
        
        const createData = await createRes.json();
        setDriveFileId(createData.id);
        setLastSynced(new Date().toLocaleTimeString());
        setModalConfig({ type: 'alert', title: 'Cloud Sync Ready', message: 'Successfully created a secure Epektasis Vault folder in your Google Drive. Your entries have been backed up.', confirmText: 'Awesome' });
      }
    } catch (err) {
      console.error(err);
      setModalConfig({ type: 'alert', title: 'Sync Error', message: 'Failed to connect to Google Drive. Ensure your Client ID is correct.', confirmText: 'Okay' });
    }
  };

  const pullFromDrive = async (fileId, token) => {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.entries) {
        const parsedEntries = data.entries.map(e => ({ ...e, createdAt: new Date(e.createdAt) }));
        setEntries(parsedEntries);
      }
      if (data.journals) setJournals(data.journals);
      if (data.templates) setTemplates(data.templates);
      if (data.themeConfig) setThemeConfig(data.themeConfig);
      
      setLastSynced(new Date().toLocaleTimeString());
      setModalConfig({ type: 'alert', title: 'Data Downloaded', message: 'Successfully pulled your Epektasis vault from Google Drive!', confirmText: 'Okay' });
    } catch (err) {
      console.error("Pull failed", err);
    }
  };

  const syncToDrive = async () => {
    setIsSaving(true);
    if (isDriveConnected && driveFileId && accessToken) {
      try {
        const data = JSON.stringify({ entries, journals, templates, themeConfig });
        const file = new Blob([data], { type: 'application/json' });
        
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media`, {
          method: 'PATCH',
          headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
          body: file,
        });
        setLastSynced(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Save to Drive failed", err);
      }
    }
    setTimeout(() => setIsSaving(false), 800);
  };

  // FULL SIGN OUT / WIPE
  const handleFullSignOut = () => {
    setModalConfig({
      type: 'confirm',
      title: 'Sign Out & Wipe Data?',
      message: 'This will remove your vault from this device and disconnect Google Drive. Make sure your latest notes have been synced! You will need your Client ID to sign back in.',
      confirmText: 'Sign Out',
      isDestructive: true,
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  const handleExportPDF = (entriesToExport, documentTitle) => {
    if (!entriesToExport || entriesToExport.length === 0) {
      setModalConfig({ type: 'alert', title: 'Export Failed', message: 'There are no entries to export.', confirmText: 'Okay' });
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setModalConfig({ type: 'alert', title: 'Popup Blocked', message: 'Please allow popups to generate the PDF.', confirmText: 'Got it' });
      return;
    }

    const uiFontStack = themeConfig.uiFont === 'system-ui' ? 'system-ui, sans-serif' : `'${themeConfig.uiFont}', sans-serif`;
    const docFontStack = themeConfig.docFont === 'system-ui' ? 'system-ui, serif' : `'${themeConfig.docFont}', serif`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle} - Epektasis Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Charter:wght@400;700&display=swap');
            body { font-family: ${docFontStack}; line-height: 1.6; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; }
            .header-block { border-bottom: 2px solid ${themeConfig.primary}; padding-bottom: 20px; margin-bottom: 50px; text-align: center; }
            h1 { font-family: ${uiFontStack}; margin: 0 0 10px 0; }
            .export-meta { font-family: ${uiFontStack}; font-size: 14px; color: #666; }
            .entry { margin-bottom: 60px; page-break-inside: avoid; }
            .entry-title { font-size: 28px; font-weight: bold; margin-bottom: 8px; font-family: ${uiFontStack}; color: ${themeConfig.primary}; }
            .entry-meta { font-size: 13px; color: #666; margin-bottom: 20px; font-family: ${uiFontStack}; text-transform: uppercase; letter-spacing: 1px; }
            .entry-tags { margin-bottom: 20px; font-family: ${uiFontStack}; font-size: 12px; color: ${themeConfig.accent}; font-weight: bold; }
            .entry-content { font-size: 18px; color: #333; }
            .entry-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
            hr { border: 0; border-top: 1px solid #eee; margin-top: 60px; }
          </style>
        </head>
        <body>
          <div class="header-block">
            <h1>${documentTitle}</h1>
            <div class="export-meta">Generated from Epektasis OS • ${entriesToExport.length} Entries</div>
          </div>
          ${entriesToExport.map(entry => `
            <div class="entry">
              <div class="entry-title">${entry.title || 'Untitled Entry'}</div>
              <div class="entry-meta">${new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Mood: ${entry.mood}</div>
              ${entry.tags && entry.tags.length > 0 ? `<div class="entry-tags">${entry.tags.map(t => `#${t}`).join('  ')}</div>` : ''}
              <div class="entry-content">${entry.content || ''}</div>
            </div>
            <hr/>
          `).join('')}
          <script> window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); } </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const toggleYear = (year) => setExpandedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  const selectArchive = (year, month = null) => { setArchiveFilter({ year, month }); setActiveView('entries'); };

  // --- Dynamic CSS Engine ---
  const getGoogleFontsUrl = () => {
    const fonts = [];
    if (!['system-ui', 'Georgia'].includes(themeConfig.uiFont)) fonts.push(`family=${themeConfig.uiFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
    if (!['system-ui', 'Georgia'].includes(themeConfig.docFont)) fonts.push(`family=${themeConfig.docFont.replace(/ /g, '+')}:wght@400;700`);
    if (fonts.length === 0) return '';
    return `@import url('https://fonts.googleapis.com/css2?${fonts.join('&')}&display=swap');`;
  };

  const uiFontStack = themeConfig.uiFont === 'system-ui' ? 'system-ui, sans-serif' : `'${themeConfig.uiFont}', sans-serif`;
  const docFontStack = themeConfig.docFont === 'system-ui' ? 'system-ui, serif' : `'${themeConfig.docFont}', serif`;

  const dynamicCss = `
    ${getGoogleFontsUrl()}
    :root {
      --theme-primary: ${themeConfig.primary};
      --theme-secondary: ${themeConfig.secondary};
      --theme-accent: ${themeConfig.accent};
      --theme-sidebar-text: ${themeConfig.sidebarText};
      --font-ui: ${uiFontStack};
      --font-doc: ${docFontStack};
    }
    ::selection { background-color: color-mix(in srgb, var(--theme-accent) 25%, transparent); color: inherit; }
    ::-moz-selection { background-color: color-mix(in srgb, var(--theme-accent) 25%, transparent); color: inherit; }
    body { font-family: var(--font-ui) !important; }
    .font-serif { font-family: var(--font-doc) !important; }
    .hover\\:bg-primary-dark:hover { background-color: color-mix(in srgb, var(--theme-primary) 85%, black) !important; }
    .hover\\:bg-accent-dark:hover { background-color: color-mix(in srgb, var(--theme-accent) 85%, black) !important; }
    .bg-primary-20 { background-color: color-mix(in srgb, var(--theme-primary) 20%, transparent) !important; }
    .bg-secondary-30 { background-color: color-mix(in srgb, var(--theme-secondary) 30%, transparent) !important; }
    .bg-accent-5 { background-color: color-mix(in srgb, var(--theme-accent) 5%, transparent) !important; }
    .border-accent-20 { border-color: color-mix(in srgb, var(--theme-accent) 20%, transparent) !important; }
    .focus-ring-accent:focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 20%, transparent) !important; border-color: var(--theme-accent) !important; outline: none; }
    .text-sidebar-hover { color: var(--theme-sidebar-text) !important; }
    .text-sidebar-inactive { color: color-mix(in srgb, var(--theme-sidebar-text) 70%, transparent) !important; }
    .hover\\:text-sidebar-hover:hover { color: var(--theme-sidebar-text) !important; }
    .text-sidebar-muted { color: color-mix(in srgb, var(--theme-sidebar-text) 40%, transparent) !important; }
    .rte-content { font-family: var(--font-doc) !important; outline: none; }
    .rte-content h1 { font-family: var(--font-ui) !important; font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; margin-top: 1.5rem; line-height: 1.2; color: #111; }
    .rte-content h2 { font-family: var(--font-ui) !important; font-size: 1.875rem; font-weight: 700; margin-bottom: 0.75rem; margin-top: 1.5rem; line-height: 1.25; color: #111; }
    .rte-content h3 { font-family: var(--font-ui) !important; font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.25rem; line-height: 1.3; color: #222; }
    .rte-content p { margin-bottom: 1rem; }
    .rte-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
    .rte-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
    .rte-content li { margin-bottom: 0.5rem; }
    .rte-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5rem auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .rte-content [style*="text-align: center"] img { margin: 1.5rem auto; }
    .rte-content [style*="text-align: right"] img { margin: 1.5rem 0 1.5rem auto; }
    .rte-content [style*="text-align: left"] img { margin: 1.5rem auto 1.5rem 0; }
    .rte-content:empty:before { content: attr(placeholder); color: #a1a1aa; pointer-events: none; }
    .ease-apple { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
    aside .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-in { animation: fade-in 0.3s ease-out; }
  `;

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        const recentEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

        return (
          <div className={`flex-1 flex-col p-6 md:p-12 overflow-y-auto bg-[#F8F9FA] custom-scrollbar ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
            <div className="max-w-4xl mx-auto w-full space-y-12">
              <div className="space-y-2 mt-8 md:mt-0">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 mb-4 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}>
                  <Menu size={24} />
                </button>
                <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">{greeting}.</h1>
                <p className="text-lg text-zinc-500 font-medium">Ready to capture your thoughts today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => { handleCreateEntry(); setShowMobileDetail(true); }} className="p-6 bg-[color:var(--theme-primary)] hover:bg-primary-dark text-[color:var(--theme-secondary)] rounded-3xl transition-colors text-left group shadow-lg shadow-black/10 flex flex-col justify-between min-h-[140px]">
                  <div className="p-3 bg-white/10 rounded-2xl w-max group-hover:bg-white/20 transition-colors"><Plus size={24} /></div>
                  <div>
                    <h3 className="font-bold text-xl">New Reflection</h3>
                    <p className="opacity-70 text-sm mt-1">Write in {activeJournal?.name || 'Journal'}</p>
                  </div>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col justify-between">
                    <Book size={24} className="text-[color:var(--theme-accent)] mb-4" />
                    <div>
                      <h3 className="font-bold text-2xl text-zinc-900">{journals.length}</h3>
                      <p className="text-zinc-500 text-sm font-medium">Active Journals</p>
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col justify-between">
                    <FileText size={24} className="text-[color:var(--theme-primary)] mb-4" />
                    <div>
                      <h3 className="font-bold text-2xl text-zinc-900">{entries.length}</h3>
                      <p className="text-zinc-500 text-sm font-medium">Total Memories</p>
                    </div>
                  </div>
                </div>
              </div>

              {recentEntries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Recent Memories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentEntries.map(entry => {
                      const journal = journals.find(j => j.id === entry.journalId);
                      return (
                        <button
                          key={entry.id}
                          onClick={() => { setSelectedEntryId(entry.id); setActiveJournal(journal || journals[0]); setActiveView('entries'); setShowMobileDetail(true); }}
                          className="p-6 bg-white border border-zinc-200 rounded-3xl text-left hover:border-[color:var(--theme-accent)] hover:shadow-md transition-all group flex flex-col min-h-[160px]"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded">
                              {entry.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: journal?.color || 'var(--theme-primary)' }} />
                          </div>
                          <h4 className="font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-[color:var(--theme-accent)] transition-colors">{entry.title || 'Untitled Entry'}</h4>
                          <p className="text-sm text-zinc-500 line-clamp-2 mt-auto">{entry.content ? entry.content.replace(/<[^>]+>/g, '') : 'Empty entry...'}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'calendar': {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
        const calendarDays = [];
        for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
        for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

        return (
          <div className={`flex-1 flex-col p-6 md:p-12 bg-zinc-50 overflow-y-auto ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <div className="flex items-center gap-4 self-start mb-6">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}>
                <Menu size={24} />
              </button>
              <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-semibold transition-colors">
                <Home size={20} /> <span className="hidden sm:inline">Home</span>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]">
              <Calendar size={64} className="text-[#EEE1C6] mb-4" />
              <h2 className="text-2xl font-bold text-zinc-800">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <p className="text-zinc-500 max-w-sm text-center mt-2">Browse your memories chronologically.</p>
              <div className="mt-8 grid grid-cols-7 gap-2 w-full max-w-md">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-zinc-400 mb-2">{day}</div>
                ))}
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                  const hasEntry = entries.some(e => e.createdAt.getDate() === day && e.createdAt.getMonth() === today.getMonth() && e.createdAt.getFullYear() === today.getFullYear());
                  const isToday = day === today.getDate();

                  return (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (hasEntry) {
                          const entryOnDay = entries.find(e => e.createdAt.getDate() === day && e.createdAt.getMonth() === today.getMonth() && e.createdAt.getFullYear() === today.getFullYear());
                          if (entryOnDay) {
                            setSelectedEntryId(entryOnDay.id);
                            const journal = journals.find(j => j.id === entryOnDay.journalId);
                            if (journal) setActiveJournal(journal);
                            setActiveView('entries');
                            setShowMobileDetail(true);
                          }
                        }
                      }}
                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-xs font-bold transition-all relative
                        ${isToday ? 'bg-[#00471B] text-white ring-4 ring-[#EEE1C6]' : 'bg-white text-zinc-700 hover:bg-zinc-50'}
                        ${hasEntry && !isToday ? 'border-[#0077C0] cursor-pointer' : 'border-zinc-200'}
                        ${!hasEntry && !isToday ? 'cursor-default' : ''}
                      `}
                    >
                      {day}
                      {hasEntry && !isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#0077C0] absolute bottom-2" />}
                      {hasEntry && isToday && <div className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      case 'templates':
        return (
          <main className={`flex-1 flex-col relative bg-white ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <header className="h-16 border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowMobileDetail(false)} className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
                <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="hidden md:flex p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"><Home size={20} /></button>
                <div className="hidden md:flex items-center gap-2 text-zinc-400"><LayoutTemplate size={14} /><span className="text-xs font-medium">Template Editor</span></div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={syncToDrive} className={`p-2 rounded-full transition-all ${isSaving ? 'text-green-600 bg-green-50' : 'text-zinc-400 hover:bg-zinc-100'}`}>{isSaving ? <CheckCircle2 size={20} /> : <Save size={20} />}</button>
                <div className="w-px h-6 bg-zinc-200 mx-1" />
                <button onClick={() => handleDeleteTemplate(selectedTemplate.id)} className="p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all" disabled={!selectedTemplate}><Trash2 size={18} /></button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto px-8 py-12 flex justify-center custom-scrollbar bg-[#F8F9FA]/30">
              {selectedTemplate ? (
                <div className="max-w-3xl w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      className="w-full text-4xl font-extrabold tracking-tight text-zinc-900 border-none outline-none placeholder-zinc-200 bg-transparent"
                      value={selectedTemplate.name || ''}
                      onChange={(e) => {
                        const updated = templates.map(t => t.id === selectedTemplate.id ? { ...t, name: e.target.value } : t);
                        setTemplates(updated);
                      }}
                      placeholder="Template Name"
                    />
                  </div>
                  <RichTextEditor 
                    content={selectedTemplate.content}
                    accessToken={accessToken}
                    folderId={driveFolderId}
                    onChange={(html) => {
                      const updated = templates.map(t => t.id === selectedTemplate.id ? { ...t, content: html } : t);
                      setTemplates(updated);
                    }}
                    onShowMessage={(msg) => setModalConfig({ type: 'alert', title: 'Notice', message: msg, confirmText: 'Got it' })}
                  />
                </div>
              ) : (
                <div className="max-w-2xl w-full h-full flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500">
                  <LayoutTemplate size={48} className="mb-4 opacity-20" />
                  <p>No template selected.</p>
                  <button onClick={handleCreateTemplate} className="mt-6 px-6 py-2.5 bg-[color:var(--theme-primary)] hover:bg-primary-dark transition-colors text-[color:var(--theme-secondary)] rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"><Plus size={16} /> Create New Template</button>
                </div>
              )}
            </div>
          </main>
        );
      case 'settings':
        return (
          <div className={`flex-1 flex-col p-6 md:p-12 overflow-y-auto bg-white custom-scrollbar ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-4 self-start mb-6">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}><Menu size={24} /></button>
                <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-semibold transition-colors"><Home size={20} /> <span className="hidden sm:inline">Home</span></button>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[color:var(--theme-primary)] rounded-2xl text-[color:var(--theme-secondary)]"><Settings size={28} /></div>
                <h2 className="text-3xl font-extrabold text-zinc-900">System Settings</h2>
              </div>
              
              <div className="space-y-8 pb-12">
                
                {/* SECURITY & ACCESS */}
                <section className="p-6 border border-zinc-200 rounded-3xl bg-zinc-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-zinc-700" />
                    <h3 className="font-bold text-lg text-zinc-900">Security & Access</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Vault PIN / Password</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          placeholder={userPin ? "********" : "Enter a new PIN..."}
                          value={pinSetup}
                          onChange={(e) => setPinSetup(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 outline-none focus-ring-accent text-sm transition-all"
                        />
                        <button 
                          onClick={() => {
                            if (!pinSetup) return;
                            setUserPin(pinSetup);
                            localStorage.setItem('epektasis_pin', pinSetup);
                            setPinSetup('');
                            setModalConfig({ type: 'alert', title: 'PIN Saved', message: 'Your Vault PIN has been updated. You can now lock the app.', confirmText: 'Okay' });
                          }}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          {userPin ? 'Update' : 'Set PIN'}
                        </button>
                        {userPin && (
                          <button 
                            onClick={() => {
                              setUserPin('');
                              localStorage.removeItem('epektasis_pin');
                              setModalConfig({ type: 'alert', title: 'PIN Removed', message: 'Your Vault is now unlocked by default on this device.', confirmText: 'Okay' });
                            }}
                            className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Locks the app so others can't open it if you hand them this device.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-zinc-200">
                    <div>
                      <p className="font-medium text-red-600">Complete Sign Out</p>
                      <p className="text-sm text-zinc-500 max-w-xs">Wipes all local data from this device and disconnects Google Drive.</p>
                    </div>
                    <button 
                      onClick={handleFullSignOut}
                      className="px-6 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </section>

                <section className="p-6 border border-zinc-200 rounded-3xl bg-zinc-50">
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-4">
                    <div className="flex items-center gap-2"><Palette size={20} className="text-zinc-700" /><h3 className="font-bold text-lg text-zinc-900">App Theming</h3></div>
                    <button onClick={() => setThemeConfig(DEFAULT_THEME)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 rounded-lg transition-colors">Restore Defaults</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Primary Color</label>
                      <div className="flex items-center gap-3"><input type="color" value={themeConfig.primary} onChange={e => setThemeConfig({...themeConfig, primary: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0" /><input type="text" value={themeConfig.primary} onChange={e => setThemeConfig({...themeConfig, primary: e.target.value})} className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-300 uppercase focus-ring-accent" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3"><input type="color" value={themeConfig.secondary} onChange={e => setThemeConfig({...themeConfig, secondary: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0" /><input type="text" value={themeConfig.secondary} onChange={e => setThemeConfig({...themeConfig, secondary: e.target.value})} className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-300 uppercase focus-ring-accent" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Accent Color</label>
                      <div className="flex items-center gap-3"><input type="color" value={themeConfig.accent} onChange={e => setThemeConfig({...themeConfig, accent: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0" /><input type="text" value={themeConfig.accent} onChange={e => setThemeConfig({...themeConfig, accent: e.target.value})} className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-300 uppercase focus-ring-accent" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Sidebar Text</label>
                      <div className="flex items-center gap-3"><input type="color" value={themeConfig.sidebarText} onChange={e => setThemeConfig({...themeConfig, sidebarText: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0" /><input type="text" value={themeConfig.sidebarText} onChange={e => setThemeConfig({...themeConfig, sidebarText: e.target.value})} className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-300 uppercase focus-ring-accent" /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">UI Font (Interface)</label>
                      <select value={themeConfig.uiFont} onChange={e => setThemeConfig({...themeConfig, uiFont: e.target.value})} className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 bg-white focus-ring-accent outline-none">
                        <option value="Inter">Inter</option><option value="Roboto">Roboto</option><option value="Open Sans">Open Sans</option><option value="system-ui">System Default</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Document Font (Editor)</label>
                      <select value={themeConfig.docFont} onChange={e => setThemeConfig({...themeConfig, docFont: e.target.value})} className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 bg-white focus-ring-accent outline-none">
                        <option value="Charter">Charter</option><option value="Merriweather">Merriweather</option><option value="Lora">Lora</option><option value="Georgia">Georgia</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-zinc-200">
                    <div>
                      <p className="font-medium text-zinc-800">Dark Mode</p>
                      <p className="text-sm text-zinc-500">Toggle dark aesthetic across the OS.</p>
                    </div>
                    <button onClick={() => setDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-[color:var(--theme-primary)]' : 'bg-zinc-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </section>

                <section className="p-6 border border-accent-20 rounded-3xl bg-accent-5">
                  <div className="flex items-center gap-2 mb-4">
                    {isDriveConnected ? <Cloud size={20} className="text-[color:var(--theme-accent)]" /> : <CloudOff size={20} className="text-[color:var(--theme-accent)]" />}
                    <h3 className="font-bold text-lg text-[color:var(--theme-accent)]">Cloud Sync & Encryption</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Google OAuth Client ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 123456789-abcxyz.apps.googleusercontent.com"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-300 focus-ring-accent outline-none transition-all text-sm"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Required to save your encrypted vault to Google Drive.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-accent-20 pt-4">
                    <div>
                      <p className="font-medium text-zinc-800">Drive Connection Status</p>
                      <p className={`text-sm font-bold ${isDriveConnected ? 'text-green-600' : 'text-zinc-500'}`}>
                        {isDriveConnected ? `Connected • Synced ${lastSynced}` : 'Not Connected'}
                      </p>
                    </div>
                    <button 
                      onClick={handleConnectGoogleDrive}
                      className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-lg ${isDriveConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-[color:var(--theme-accent)] hover:bg-accent-dark'}`}
                    >
                      {isDriveConnected ? 'Manual Sync' : 'Connect to Drive'}
                    </button>
                  </div>
                </section>

              </div>
            </div>
          </div>
        );
      case 'analytics': {
        const totalEntries = entries.length;
        const moodCounts = entries.reduce((acc, entry) => {
          acc[entry.mood || 'neutral'] = (acc[entry.mood || 'neutral'] || 0) + 1;
          return acc;
        }, {});
        
        const happyGrateful = (moodCounts['happy'] || 0) + (moodCounts['grateful'] || 0) + (moodCounts['accomplished'] || 0);
        const neutralSerene = (moodCounts['neutral'] || 0) + (moodCounts['serene'] || 0);
        const negative = (moodCounts['sad'] || 0) + (moodCounts['angry'] || 0) + (moodCounts['anxious'] || 0);
        const totalMoods = happyGrateful + neutralSerene + negative || 1; 
        
        const pPositive = (happyGrateful / totalMoods) * 100;
        const pNeutral = (neutralSerene / totalMoods) * 100;
        const pNegative = (negative / totalMoods) * 100;

        const todayDate = new Date();
        const heatmap = Array.from({ length: 50 }).map((_, i) => {
          const d = new Date(todayDate);
          d.setDate(d.getDate() - (49 - i));
          return entries.some(e => e.createdAt.toDateString() === d.toDateString());
        });

        return (
          <div className={`flex-1 flex-col p-6 md:p-12 overflow-y-auto bg-white custom-scrollbar ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-4 self-start mb-6">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}><Menu size={24} /></button>
                <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-semibold transition-colors"><Home size={20} /> <span className="hidden sm:inline">Home</span></button>
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-900 mb-8">Life Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-white border border-zinc-200 rounded-3xl">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Memories</h4>
                  <div className="text-4xl font-extrabold text-[color:var(--theme-primary)]">{totalEntries}</div>
                </div>
                <div className="p-6 bg-white border border-zinc-200 rounded-3xl">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Most Frequent Mood</h4>
                  <div className="text-2xl font-bold text-[color:var(--theme-accent)] capitalize">{Object.keys(moodCounts).sort((a,b) => moodCounts[b] - moodCounts[a])[0] || 'Neutral'}</div>
                </div>
                <div className="p-6 bg-white border border-zinc-200 rounded-3xl">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Active Journals</h4>
                  <div className="text-4xl font-extrabold text-zinc-900">{journals.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-secondary-30 rounded-3xl border border-[color:var(--theme-secondary)]">
                  <h4 className="text-sm font-bold text-[color:var(--theme-primary)] mb-4 uppercase tracking-widest">Consistency Heatmap (Last 50 Days)</h4>
                  <div className="flex gap-1 flex-wrap">
                    {heatmap.map((hasEntry, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${hasEntry ? 'bg-[color:var(--theme-primary)]' : 'bg-zinc-100'}`} title={hasEntry ? 'Entry logged' : 'No entry'} />
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">Sentiment Mix</h4>
                  <div className="h-4 w-full flex rounded-full overflow-hidden mb-3">
                    {pPositive > 0 && <div className="h-full bg-green-500" style={{ width: `${pPositive}%` }} title="Positive" />}
                    {pNeutral > 0 && <div className="h-full bg-blue-400" style={{ width: `${pNeutral}%` }} title="Neutral" />}
                    {pNegative > 0 && <div className="h-full bg-red-400" style={{ width: `${pNegative}%` }} title="Negative" />}
                  </div>
                  <div className="flex justify-between text-xs font-bold text-zinc-500">
                    <span>Positive: {Math.round(pPositive || 0)}%</span>
                    <span>Neutral: {Math.round(pNeutral || 0)}%</span>
                    <span>Negative: {Math.round(pNegative || 0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        let CurrentMoodIcon = Meh;
        let currentMoodColor = 'text-zinc-500';
        if (selectedEntry) {
          const mObj = MOODS.find(m => m.id === selectedEntry.mood) || MOODS.find(m => m.id === 'neutral');
          CurrentMoodIcon = mObj.icon;
          currentMoodColor = mObj.color;
        }

        return (
          <main className={`flex-1 flex-col relative bg-white ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <header className="h-16 border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowMobileDetail(false)} className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
                <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="hidden md:flex p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"><Home size={20} /></button>
                <div className="hidden md:flex items-center gap-2 text-zinc-400">
                  {isDriveConnected ? <Cloud size={14} className="text-green-500"/> : <CloudOff size={14} />}
                  <span className="text-xs font-medium">Last synced: {lastSynced || 'Never'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                {userPin && (
                  <button onClick={() => setIsLocked(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-zinc-800 text-white rounded-full text-xs font-bold hover:bg-zinc-900 transition-all shadow-md mr-1">
                    <Lock size={14} /><span className="hidden xl:inline">Lock Vault</span>
                  </button>
                )}
                <button onClick={() => setShowTemplatePicker(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-zinc-100 text-zinc-700 rounded-full text-xs font-bold hover:bg-zinc-200 transition-all"><LayoutTemplate size={14} /><span className="hidden xl:inline">Templates</span></button>
                <button onClick={syncToDrive} className={`p-2 rounded-full transition-all ${isSaving ? 'text-green-600 bg-green-50' : 'text-zinc-400 hover:bg-zinc-100'}`}>{isSaving ? <CheckCircle2 size={20} /> : <Save size={20} />}</button>
                <div className="w-px h-6 bg-zinc-200 mx-1 hidden md:block" />
                
                <div className="relative" ref={moreMenuRef}>
                  <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={`p-2 rounded-full transition-all ${isMoreMenuOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-100'}`} disabled={!selectedEntry}><MoreVertical size={18} /></button>
                  {isMoreMenuOpen && selectedEntry && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => { handleExportPDF([selectedEntry], selectedEntry.title || 'Untitled Entry'); setIsMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-3 transition-colors"><Download size={16} className="text-zinc-400" /> Export Entry as PDF</button>
                      <div className="h-px bg-zinc-100 my-1 mx-2" />
                      <button onClick={() => handleDeleteEntry(selectedEntry.id)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"><Trash2 size={16} /> Delete Entry</button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-12 flex justify-center custom-scrollbar bg-[#F8F9FA]/30">
              {selectedEntry ? (
                <div className="max-w-3xl w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <input type="text" className="w-full text-4xl font-extrabold tracking-tight text-zinc-900 border-none outline-none placeholder-zinc-200 bg-transparent" value={selectedEntry.title || ''} onChange={(e) => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, title: e.target.value } : ent); setEntries(updated); }} placeholder="Entry Title" />
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium relative">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-100 rounded-full"><Calendar size={12} className="text-[color:var(--theme-primary)]" />{selectedEntry.createdAt.toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                      <div className="relative" ref={moodMenuRef}>
                        <button onClick={() => setIsMoodMenuOpen(!isMoodMenuOpen)} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-100 rounded-full hover:bg-zinc-50 transition-colors" title="Change Mood"><CurrentMoodIcon size={14} className={currentMoodColor} /><span className="capitalize">{selectedEntry.mood || 'neutral'}</span></button>
                        {isMoodMenuOpen && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 z-50 w-40 animate-in fade-in zoom-in-95 duration-100">
                            {MOODS.map(m => ( <button key={m.id} onClick={() => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, mood: m.id } : ent); setEntries(updated); setIsMoodMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${selectedEntry.mood === m.id ? 'bg-zinc-50 font-semibold' : 'hover:bg-zinc-50 text-zinc-700'}`}><m.icon size={16} className={m.color} />{m.label}</button> ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100/50 mt-2">
                      {selectedEntry.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)] rounded-full text-xs font-bold transition-colors">#{tag}<button onClick={() => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, tags: ent.tags.filter(t => t !== tag) } : ent); setEntries(updated); }} className="hover:text-red-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-100/50" title="Remove Tag"><X size={10} /></button></span>
                      ))}
                      <div className="relative flex items-center">
                        <Hash size={12} className="absolute left-2.5 text-zinc-400" />
                        <input type="text" placeholder="Add tag..." className="pl-7 pr-3 py-1 text-xs bg-white border border-zinc-200 hover:border-zinc-300 focus:border-[color:var(--theme-accent)] rounded-full outline-none transition-all w-28 focus:w-32 placeholder-zinc-400 text-zinc-700 font-medium" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { const newTag = e.target.value.replace(/#/g, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''); if (newTag && !selectedEntry.tags?.includes(newTag)) { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, tags: [...(ent.tags || []), newTag] } : ent); setEntries(updated); } e.target.value = ''; } }} />
                      </div>
                    </div>
                  </div>
                  <RichTextEditor content={selectedEntry.content} accessToken={accessToken} folderId={driveFolderId} onChange={(html) => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, content: html } : ent); setEntries(updated); }} onShowMessage={(msg) => setModalConfig({ type: 'alert', title: 'Notice', message: msg, confirmText: 'Got it' })} />
                </div>
              ) : (
                <div className="max-w-2xl w-full h-full flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500"><Book size={48} className="mb-4 opacity-20" /><p>No entry selected in {activeJournal?.name || 'Journal'}.</p><button onClick={handleCreateEntry} className="mt-6 px-6 py-2.5 bg-[color:var(--theme-primary)] hover:bg-primary-dark transition-colors text-[color:var(--theme-secondary)] rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"><Plus size={16} /> Create New Entry</button></div>
              )}
            </div>
          </main>
        );
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-[#F8F9FA] text-zinc-900'}`}>
      <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />

      {isLocked ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 absolute inset-0 z-50 px-6">
          <div className="w-16 h-16 bg-[color:var(--theme-primary)] rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <Lock size={32} className="text-[color:var(--theme-secondary)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Vault Locked</h1>
          <p className="text-zinc-400 mb-8 text-sm">Enter your PIN to access Epektasis.</p>
          
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if(pinInput === userPin) { setIsLocked(false); setPinInput(''); } 
              else { setModalConfig({ type: 'alert', title: 'Incorrect PIN', message: 'The PIN you entered is incorrect.', confirmText: 'Try Again' }); setPinInput(''); } 
            }} 
            className="flex flex-col gap-4 w-full max-w-xs"
          >
            <input 
              type="password" 
              value={pinInput} 
              onChange={e => setPinInput(e.target.value)} 
              placeholder="••••••••" 
              className="px-6 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-white text-center text-2xl tracking-[0.5em] focus:border-[color:var(--theme-accent)] outline-none transition-colors" 
              autoFocus 
            />
            <button type="submit" className="px-6 py-4 bg-[color:var(--theme-primary)] hover:bg-primary-dark transition-colors rounded-2xl text-white font-bold text-lg shadow-xl">
              Unlock Vault
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* SIDEBAR */}
          <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[color:var(--theme-primary)] transition-all duration-300 flex flex-col absolute md:relative z-40 h-full overflow-hidden shadow-2xl shrink-0`}>
            <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[color:var(--theme-secondary)] flex items-center justify-center shrink-0"><BrainCircuit size={20} className="text-[color:var(--theme-primary)]" /></div>
              <h1 className="text-sidebar-hover font-bold tracking-tight text-lg">Epektasis</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
              <SectionLabel>Core</SectionLabel>
              <SidebarItem icon={Home} label="Home" active={activeView === 'home'} onClick={() => { setActiveView('home'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={FileText} label="All Entries" active={activeView === 'entries' && !archiveFilter && !tagFilter} onClick={() => { setActiveView('entries'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={LayoutTemplate} label="Templates" active={activeView === 'templates'} onClick={() => { setActiveView('templates'); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={Calendar} label="Calendar" active={activeView === 'calendar'} onClick={() => { setActiveView('calendar'); setShowMobileDetail(true); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={BarChart3} label="Life Analytics" active={activeView === 'analytics'} onClick={() => { setActiveView('analytics'); setShowMobileDetail(true); if(window.innerWidth < 768) setSidebarOpen(false); }} />

              <div className="flex items-center justify-between px-4 mt-8 mb-2 group">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sidebar-muted">Journals</span>
                <button onClick={handleAddJournal} className="text-sidebar-muted hover:text-sidebar-hover transition-colors" title="Add New Journal"><Plus size={14} /></button>
              </div>
              {journals.map(j => (
                <SidebarItem key={j.id} icon={Book} label={j.name} active={activeJournal?.id === j.id && activeView === 'entries'} onClick={() => { setActiveJournal(j); setActiveView('entries'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} badge={entries.filter(e => e.journalId === j.id).length} />
              ))}

              <SectionLabel>Tags</SectionLabel>
              <div className="space-y-0.5">
                <button onClick={() => setIsTagsExpanded(!isTagsExpanded)} className="w-full flex items-center justify-between px-4 py-1.5 text-xs transition-colors text-sidebar-inactive hover:text-sidebar-hover"><div className="flex items-center gap-2">{isTagsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}<span>Hashtags</span></div></button>
                {isTagsExpanded && (
                  <div className="ml-6 space-y-0.5 mt-1">
                    {dynamicTags.map(tag => {
                      const isTagActive = tagFilter === tag;
                      return (
                        <button key={tag} onClick={() => { setTagFilter(isTagActive ? null : tag); setArchiveFilter(null); setActiveView('entries'); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`w-full text-left px-4 py-1 text-[13px] transition-colors flex items-center gap-2 ${isTagActive ? 'text-[color:var(--theme-sidebar-text)] font-bold' : 'text-sidebar-muted hover:text-sidebar-hover'}`}><Hash size={10} />{tag}</button>
                      );
                    })}
                    {dynamicTags.length === 0 && <div className="px-4 py-1 text-[12px] text-sidebar-muted italic">No tags yet</div>}
                  </div>
                )}
              </div>

              <SectionLabel>Archives</SectionLabel>
              {Object.entries(dynamicArchives).map(([year, months]) => {
                const isYearExpanded = expandedYears.includes(year);
                const isYearActive = archiveFilter?.year === year && !archiveFilter?.month;
                return (
                  <div key={year} className="space-y-0.5">
                    <button onClick={() => toggleYear(year)} className={`w-full flex items-center justify-between px-4 py-1.5 text-xs transition-colors ${isYearActive ? 'text-[color:var(--theme-sidebar-text)] font-bold' : 'text-sidebar-inactive hover:text-sidebar-hover'}`}><div className="flex items-center gap-2">{isYearExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}<span onClick={(e) => { e.stopPropagation(); selectArchive(year); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }}>{year}</span></div></button>
                    {isYearExpanded && (
                      <div className="ml-6 space-y-0.5">
                        {months.map(month => {
                          const isMonthActive = archiveFilter?.year === year && archiveFilter?.month === month;
                          return ( <button key={month} onClick={() => { selectArchive(year, month); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`w-full text-left px-4 py-1 text-[13px] transition-colors ${isMonthActive ? 'text-[color:var(--theme-sidebar-text)] font-bold' : 'text-sidebar-muted hover:text-sidebar-hover'}`}>{month}</button> );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10 bg-primary-dark">
              <SidebarItem icon={Settings} label="System Settings" active={activeView === 'settings'} onClick={() => { setActiveView('settings'); setShowMobileDetail(true); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            </div>
          </aside>

          {/* DYNAMIC LIST PANEL */}
          {(activeView === 'entries' || activeView === 'templates') && (
            <div className={`w-full md:w-80 border-r ${isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'} ${showMobileDetail ? 'hidden md:flex' : 'flex'} flex-col shadow-sm z-10 shrink-0`}>
              <div className="p-4 border-b border-zinc-200/50 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    {activeView === 'entries' ? (
                      <>
                        {isEditingJournalName ? (
                          <input autoFocus value={activeJournal?.name || ''} onChange={(e) => { const updated = journals.map(j => j.id === activeJournal.id ? { ...j, name: e.target.value } : j); setJournals(updated); setActiveJournal(updated.find(j => j.id === activeJournal.id)); }} onBlur={() => setIsEditingJournalName(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingJournalName(false)} className="font-bold text-xl bg-transparent border-b border-zinc-300 outline-none w-full text-zinc-900" />
                        ) : (
                          <h2 className="font-bold text-xl truncate cursor-pointer hover:text-[color:var(--theme-accent)] transition-colors flex items-center gap-2 group" onClick={() => setIsEditingJournalName(true)} title="Click to rename journal">{activeJournal?.name || 'Journal'} <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-zinc-400" /></h2>
                        )}
                        {(archiveFilter || tagFilter) && (
                          <span className="text-[10px] text-[color:var(--theme-accent)] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {archiveFilter && <span className="flex items-center gap-1"><Archive size={10} /> {archiveFilter.month ? `${archiveFilter.month} ` : ''}{archiveFilter.year}</span>}
                            {archiveFilter && tagFilter && <span className="text-zinc-300">•</span>}
                            {tagFilter && <span className="flex items-center"><Hash size={10} className="mr-0.5" /> {tagFilter}</span>}
                          </span>
                        )}
                      </>
                    ) : ( <h2 className="font-bold text-xl truncate">Saved Templates</h2> )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => { setActiveView('home'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); }} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-900" title="Go Home"><Home size={16} /></button>
                    {activeView === 'entries' && <button onClick={() => handleExportPDF(filteredEntries, archiveFilter ? `Archive: ${archiveFilter.month || ''} ${archiveFilter.year}` : `Journal: ${activeJournal?.name}`)} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-900" title="Export List to PDF"><Download size={16} /></button>}
                    {activeView === 'entries' && !archiveFilter && !tagFilter && <button onClick={() => handleDeleteJournal(activeJournal.id)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-zinc-400 hover:text-red-600" title="Delete Journal"><Trash2 size={16} /></button>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-900" title="Toggle Sidebar"><Menu size={18} /></button>
                  </div>
                </div>
                
                {activeView === 'entries' && (
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
                    <input type="text" placeholder="Search tags or text..." className={`w-full pl-10 pr-4 py-2 text-sm rounded-full ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-transparent'} focus-ring-accent outline-none transition-all`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-px custom-scrollbar">
                {activeView === 'entries' && (filteredEntries.length > 0 ? (
                  filteredEntries.map(entry => {
                    const entryMoodObj = MOODS.find(m => m.id === entry.mood) || MOODS.find(m => m.id === 'neutral');
                    const EntryMoodIcon = entryMoodObj.icon;
                    return (
                      <button key={entry.id} onClick={() => { setSelectedEntryId(entry.id); setShowMobileDetail(true); }} className={`w-full text-left p-5 transition-all relative border-b border-zinc-100 ${selectedEntryId === entry.id ? (isDarkMode ? 'bg-primary-20 shadow-inner' : 'bg-secondary-30 shadow-sm') : 'hover:bg-zinc-50'}`}>
                        {selectedEntryId === entry.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[color:var(--theme-primary)]" />}
                        <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{entry.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><EntryMoodIcon size={14} className={entryMoodObj.color} /></div>
                        <h3 className={`font-bold text-sm mb-1 leading-tight ${selectedEntryId === entry.id ? 'text-[color:var(--theme-primary)]' : 'text-zinc-800'}`}>{entry.title || 'Untitled Entry'}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{entry.content ? entry.content.replace(/<[^>]+>/g, '').substring(0, 100) : 'Empty entry...'}</p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-1.5 mt-2.5 overflow-hidden flex-wrap">
                            {entry.tags.slice(0, 3).map(tag => ( <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded text-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10 truncate max-w-[80px]">#{tag}</span> ))}
                            {entry.tags.length > 3 && <span className="text-[9px] font-bold text-zinc-400 py-0.5">+{entry.tags.length - 3}</span>}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : ( <div className="p-8 text-center text-zinc-400 italic text-sm">No entries found.</div> ))}

                {activeView === 'templates' && (templates.length > 0 ? (
                  templates.map(template => (
                    <button key={template.id} onClick={() => { setSelectedTemplateId(template.id); setShowMobileDetail(true); }} className={`w-full text-left p-5 transition-all relative border-b border-zinc-100 ${selectedTemplateId === template.id ? (isDarkMode ? 'bg-primary-20 shadow-inner' : 'bg-secondary-30 shadow-sm') : 'hover:bg-zinc-50'}`}>
                      {selectedTemplateId === template.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[color:var(--theme-primary)]" />}
                      <div className="flex justify-between items-start mb-1"><LayoutTemplate size={14} className={selectedTemplateId === template.id ? 'text-[color:var(--theme-primary)]' : 'text-zinc-400'} /></div>
                      <h3 className={`font-bold text-sm mb-1 leading-tight ${selectedTemplateId === template.id ? 'text-[color:var(--theme-primary)]' : 'text-zinc-800'}`}>{template.name || 'Untitled Template'}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{template.content ? template.content.replace(/<[^>]+>/g, '').substring(0, 100) : 'Empty template...'}</p>
                    </button>
                  ))
                ) : ( <div className="p-8 text-center text-zinc-400 italic text-sm">No templates saved.</div> ))}

                <button onClick={activeView === 'entries' ? handleCreateEntry : handleCreateTemplate} className="w-full py-8 text-sm text-zinc-400 font-medium hover:text-[color:var(--theme-primary)] flex flex-col items-center gap-2 transition-colors">
                  <div className="p-2 border-2 border-dashed border-zinc-200 rounded-full"><Plus size={20} /></div>
                  {activeView === 'entries' ? 'New Entry' : 'New Template'}
                </button>
              </div>
            </div>
          )}

          {/* RENDER DYNAMIC CONTENT */}
          {renderContent()}

          {/* TEMPLATE PICKER MODAL */}
          {showTemplatePicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 mx-4 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3"><div className="p-2 bg-[color:var(--theme-primary)] rounded-lg text-[color:var(--theme-secondary)]"><LayoutTemplate size={18} /></div><h3 className="font-bold text-lg text-zinc-900">Insert Template</h3></div>
                  <button onClick={() => setShowTemplatePicker(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => applyTemplateToEntry(t)} className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-[color:var(--theme-primary)] hover:bg-zinc-50 transition-colors group">
                      <h4 className="font-bold text-zinc-800 group-hover:text-[color:var(--theme-primary)]">{t.name}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{t.content.replace(/<[^>]+>/g, '')}</p>
                    </button>
                  ))}
                  {templates.length === 0 && <p className="text-center text-zinc-500 text-sm py-4">You haven't saved any templates yet. Go to Core {'>'} Templates to create one.</p>}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CUSTOM MODAL ENGINE */}
      {modalConfig && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 mx-4">
            <h3 className="font-bold text-lg mb-2 text-zinc-900">{modalConfig.title || 'Attention'}</h3>
            <p className="text-zinc-600 mb-6 text-sm leading-relaxed">{modalConfig.message}</p>
            <div className="flex justify-end gap-3">
              {modalConfig.type === 'confirm' && <button onClick={() => setModalConfig(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">Cancel</button>}
              <button onClick={() => { modalConfig.onConfirm?.(); setModalConfig(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${modalConfig.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-black/10' : 'bg-[color:var(--theme-primary)] hover:bg-primary-dark shadow-black/10'}`}>{modalConfig.confirmText || 'OK'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
