import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Plus, Search, Book, Calendar, Tag, Settings, ChevronRight, ChevronLeft,
  MoreVertical, Image as ImageIcon, Mic, Smile, Meh, Frown, Mountain, Archive,
  Trash2, FileText, BarChart3, BrainCircuit, Maximize2, Clock, Save, Moon, Sun,
  X, CheckCircle2, AlertCircle, Menu, Download, Lock, Unlock, LogOut, Share2, History,
  ChevronDown, Bookmark, Edit2, Bold, Italic, Underline, Heading1, Heading2, Heading3, 
  List, ListOrdered, ImagePlus, AlignLeft, AlignCenter, AlignRight, LayoutTemplate, 
  Palette, Hash, Cloud, CloudOff, Highlighter, Type, HelpCircle, Quote
} from 'lucide-react';

/**
 * Epektasis Theme Defaults - Premium, grounded feel
 */
const DEFAULT_THEME = {
  primary: '#4A5D4E',   // Sage
  secondary: '#FDFBF7', // Oat
  accent: '#7B8C98',    // Slate
  sidebarText: '#EAEAEA',
  uiFont: 'Inter',
  docFont: 'Charter'
};

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { id: 'grateful', label: 'Grateful', icon: Mountain, color: 'text-emerald-600' },
  { id: 'serene', label: 'Serene', icon: Smile, color: 'text-blue-500' },
  { id: 'accomplished', label: 'Accomplished', icon: CheckCircle2, color: 'text-purple-500' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-zinc-500' },
  { id: 'complicated', label: 'Complicated', icon: HelpCircle, color: 'text-zinc-400' },
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
    journalIds: ['j1', 'j3'], // Example of multiple journals
    title: 'Designing the Future',
    content: '<p>It is February 2026. The shift towards agentic workflows has completely redefined how we interact with personal data. <span style="background-color: #fef08a;"><b>Epektasis</b> is becoming the core of my digital reflection...</span></p><ul><li>Faster processing</li><li>Deeper insights</li></ul>',
    createdAt: new Date('2026-02-28T10:30:00'),
    tags: ['philosophy', 'tech'],
    mood: 'serene',
    isBookmarked: true
  },
  {
    id: 'e2',
    journalIds: ['j1'],
    title: 'Winter Reflections',
    content: '<p>The clarity of a cold morning. Looking back at the start of the year, progress on the semantic search engine has been exponential.</p>',
    createdAt: new Date('2026-02-15T09:15:00'),
    tags: ['work', 'coding'],
    mood: 'accomplished',
    isBookmarked: false
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
      <span className="text-sm sidebar-label truncate">{label}</span>
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
  
  // Highlighter & Font Size State
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const highlightMenuRef = useRef(null);
  const [showTextSizeMenu, setShowTextSizeMenu] = useState(false);
  const textSizeMenuRef = useRef(null);
  
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
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(event.target)) {
        setShowHighlightMenu(false);
      }
      if (textSizeMenuRef.current && !textSizeMenuRef.current.contains(event.target)) {
        setShowTextSizeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
  }

  // Smart Quotes Interceptor
  const handleKeyDown = (e) => {
    if (e.key === '"' || e.key === "'") {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      const preText = range.startContainer.textContent.slice(0, range.startOffset);
      // Determine if opening quote based on preceding character (space, newline, or structural bracket)
      const isOpening = preText.length === 0 || /[\s\[{(]$/.test(preText);
      
      let charToInsert = '';
      if (e.key === '"') charToInsert = isOpening ? '“' : '”';
      if (e.key === "'") charToInsert = isOpening ? '‘' : '’';

      e.preventDefault();
      document.execCommand('insertText', false, charToInsert);
    }
  };
  
  const exec = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    onChange(editorRef.current?.innerHTML || '');
  };
  
  const toggleFormatBlock = (tag) => {
    restoreSelection();
    let node = window.getSelection().anchorNode;
    let isActive = false;
    
    while (node && node !== editorRef.current) {
      if (node && node.nodeName === tag.toUpperCase()) {
        isActive = true;
        break;
      }
      node = node ? node.parentNode : null;
    }
    
    if (isActive) {
      if (tag.toUpperCase() === 'BLOCKQUOTE') {
        document.execCommand('outdent', false, null);
      } else {
        document.execCommand('formatBlock', false, 'P');
      }
    } else {
      document.execCommand('formatBlock', false, tag);
    }
    
    saveSelection();
    onChange(editorRef.current?.innerHTML || '');
  };
  
  const applyHighlight = (color) => {
    restoreSelection();
    document.execCommand('backColor', false, color);
    saveSelection();
    onChange(editorRef.current.innerHTML);
    setShowHighlightMenu(false);
  };
  
  const applyFontSize = (size) => {
    restoreSelection();
    document.execCommand('fontSize', false, size);
    saveSelection();
    onChange(editorRef.current.innerHTML);
    setShowTextSizeMenu(false);
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
        metadata.parents = [folderId]; 
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
    <div className="flex flex-col border-2 border-[color:var(--theme-secondary)] rounded-2xl overflow-hidden bg-white shadow-sm mt-4 relative z-10">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-[color:var(--theme-secondary)] bg-zinc-50/80 backdrop-blur min-h-[52px]">
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
            {/* Text Style Group */}
            <div className="flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-sm">
              <ToolbarButton icon={Bold} onClick={() => exec('bold')} title="Bold" />
              <ToolbarButton icon={Italic} onClick={() => exec('italic')} title="Italic" />
              <ToolbarButton icon={Underline} onClick={() => exec('underline')} title="Underline" />
              
              <div className="relative flex items-center" ref={highlightMenuRef}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowHighlightMenu(!showHighlightMenu); setShowTextSizeMenu(false); }}
                  className={`p-1.5 rounded transition-colors ${showHighlightMenu ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
                  title="Highlight Text"
                >
                  <Highlighter size={16} />
                </button>
                {showHighlightMenu && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 flex gap-1.5 animate-in fade-in zoom-in-95 w-max">
                    {[
                      { label: 'Yellow', color: '#fef08a' },
                      { label: 'Green', color: '#bbf7d0' },
                      { label: 'Blue', color: '#bfdbfe' },
                      { label: 'Pink', color: '#fbcfe8' },
                      { label: 'Purple', color: '#e9d5ff' },
                      { label: 'Orange', color: '#fed7aa' },
                      { label: 'Clear', color: 'transparent', icon: X }
                    ].map(h => (
                      <button
                        key={h.label}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyHighlight(h.color)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm border border-black/10"
                        style={{ backgroundColor: h.color === 'transparent' ? '#f4f4f5' : h.color }}
                        title={h.label}
                      >
                        {h.color === 'transparent' && <h.icon size={12} className="text-zinc-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex items-center" ref={textSizeMenuRef}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowTextSizeMenu(!showTextSizeMenu); setShowHighlightMenu(false); }}
                  className={`p-1.5 rounded transition-colors ${showTextSizeMenu ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
                  title="Text Size"
                >
                  <Type size={16} />
                </button>
                {showTextSizeMenu && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 w-32">
                    {[
                      { label: 'Small', size: '2', className: 'text-sm' },
                      { label: 'Normal', size: '3', className: 'text-base' },
                      { label: 'Large', size: '4', className: 'text-lg' },
                      { label: 'Huge', size: '5', className: 'text-xl' },
                      { label: 'Giant', size: '6', className: 'text-2xl' }
                    ].map(s => (
                      <button
                        key={s.label}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyFontSize(s.size)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-700 font-medium ${s.className}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Headings Group */}
            <div className="flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-sm">
              <ToolbarButton icon={Heading1} onClick={() => exec('formatBlock', 'H1')} title="Heading 1" />
              <ToolbarButton icon={Heading2} onClick={() => exec('formatBlock', 'H2')} title="Heading 2" />
              <ToolbarButton icon={Heading3} onClick={() => exec('formatBlock', 'H3')} title="Heading 3" />
            </div>
            
            {/* Lists & Quotes Group */}
            <div className="flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-sm hidden sm:flex">
              <ToolbarButton icon={Quote} onClick={() => toggleFormatBlock('BLOCKQUOTE')} title="Blockquote" />
              <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} title="Bullet List" />
              <ToolbarButton icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Numbered List" />
            </div>

            {/* Alignment Group */}
            <div className="flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-sm hidden md:flex">
              <ToolbarButton icon={AlignLeft} onClick={() => exec('justifyLeft')} title="Align Left" />
              <ToolbarButton icon={AlignCenter} onClick={() => exec('justifyCenter')} title="Align Center" />
              <ToolbarButton icon={AlignRight} onClick={() => exec('justifyRight')} title="Align Right" />
            </div>
            
            {/* Action Group */}
            <div className="flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-sm">
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
                className={`p-1.5 rounded transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
              >
                <Mic size={16} />
              </button>
            </div>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                restoreSelection();
                document.execCommand('outdent', false, null);
                document.execCommand('formatBlock', false, 'P');
                saveSelection();
                onChange(editorRef.current?.innerHTML || '');
              }} 
              className="text-xs font-bold text-zinc-500 hover:bg-white border border-transparent hover:border-zinc-200 hover:shadow-sm px-3 py-1.5 rounded-lg transition-all ml-auto"
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
        onKeyDown={handleKeyDown}
        className="px-6 pt-8 pb-32 md:px-12 md:pt-16 md:pb-64 min-h-[500px] md:h-[65vh] md:overflow-y-auto custom-scrollbar outline-none rte-content font-serif bg-white"
        placeholder="Begin your reflection..."
      />
      {/* Solid bar underneath the editor to keep text from touching bottom */}
      <div className="h-10 w-full bg-zinc-50 border-t border-zinc-200 shrink-0 flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest relative z-20">
        End of Entry
      </div>
    </div>
  );
};

// --- Main Application ---
const App = () => {
  // Data State
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('epektasis_entries');
    if (saved) {
      const parsed = JSON.parse(saved, (key, value) => key === 'createdAt' ? new Date(value) : value);
      // Auto-migrate legacy entries to multi-journal architecture
      return parsed.map(e => {
        if (e.journalId && !e.journalIds) {
          const newE = { ...e, journalIds: [e.journalId] };
          delete newE.journalId;
          return newE;
        }
        return e;
      });
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

  const [customThemes, setCustomThemes] = useState(() => {
    const saved = localStorage.getItem('epektasis_custom_themes');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeThemeId, setActiveThemeId] = useState(() => localStorage.getItem('epektasis_active_theme') || 'default');

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
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('epektasis_theme_mode') || 'light');
  const [isZenMode, setIsZenMode] = useState(false);
  const [animateBookmark, setAnimateBookmark] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEditingJournalName, setIsEditingJournalName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedYears, setExpandedYears] = useState([new Date().getFullYear().toString()]);
  const [modalConfig, setModalConfig] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);
  const [isJournalMenuOpen, setIsJournalMenuOpen] = useState(false);
  
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
  const journalMenuRef = useRef(null);
  const syncTimeoutRef = useRef(null);

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

  useEffect(() => { localStorage.setItem('epektasis_entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('epektasis_journals', JSON.stringify(journals)); }, [journals]);
  useEffect(() => { localStorage.setItem('epektasis_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('epektasis_theme', JSON.stringify(themeConfig)); }, [themeConfig]);
  useEffect(() => { localStorage.setItem('epektasis_custom_themes', JSON.stringify(customThemes)); }, [customThemes]);
  useEffect(() => { localStorage.setItem('epektasis_active_theme', activeThemeId); }, [activeThemeId]);
  useEffect(() => { localStorage.setItem('epektasis_theme_mode', themeMode); }, [themeMode]);
  useEffect(() => { localStorage.setItem('epektasis_gclient', googleClientId); }, [googleClientId]);
  useEffect(() => { if (driveFileId) localStorage.setItem('epektasis_fileId', driveFileId); }, [driveFileId]);
  useEffect(() => { if (driveFolderId) localStorage.setItem('epektasis_folderId', driveFolderId); }, [driveFolderId]);
  useEffect(() => { if (lastSynced) localStorage.setItem('epektasis_lastSync', lastSynced); }, [lastSynced]);

  useEffect(() => {
    if (isDriveConnected && driveFileId && accessToken && !isLocked) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncToDrive();
      }, 3000);
    }
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [entries, journals, templates, themeConfig, customThemes, activeThemeId, isDriveConnected, driveFileId, accessToken, isLocked]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setIsMoreMenuOpen(false);
      if (moodMenuRef.current && !moodMenuRef.current.contains(event.target)) setIsMoodMenuOpen(false);
      if (journalMenuRef.current && !journalMenuRef.current.contains(event.target)) setIsJournalMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedEntry = useMemo(() => entries.find(e => e.id === selectedEntryId) || null, [selectedEntryId, entries]);
  const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId) || null, [selectedTemplateId, templates]);

  const selectArchive = (year, month = null) => { 
    setArchiveFilter({ year, month }); 
    setActiveView('entries'); 
    setActiveJournal(null); 
  };

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
      if (activeView === 'bookmarks' && !e.isBookmarked) return false;
      const matchesJournal = (activeJournal && activeView !== 'bookmarks') ? (e.journalIds && e.journalIds.includes(activeJournal.id)) : true;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = e.title.toLowerCase().includes(lowerQuery) || 
                            e.content.toLowerCase().includes(lowerQuery) ||
                            (e.tags && e.tags.some(t => t.includes(lowerQuery)));
      
      let matchesArchive = true;
      if (archiveFilter && activeView !== 'bookmarks') {
        const entryYear = e.createdAt.getFullYear().toString();
        const entryMonth = e.createdAt.toLocaleString('default', { month: 'long' });
        matchesArchive = archiveFilter.month ? (entryYear === archiveFilter.year && entryMonth === archiveFilter.month) : (entryYear === archiveFilter.year);
      }

      let matchesTag = true;
      if (tagFilter && activeView !== 'bookmarks') matchesTag = e.tags && e.tags.includes(tagFilter);

      return matchesJournal && matchesSearch && matchesArchive && matchesTag;
    });
  }, [activeJournal, searchQuery, entries, archiveFilter, tagFilter, activeView]);

  const handleCreateEntry = () => {
    const targetJournalId = activeJournal ? activeJournal.id : (journals[0]?.id || 'j1');
    const newEntry = {
      id: `e-${Date.now()}`,
      journalIds: [targetJournalId],
      title: '',
      content: '',
      createdAt: new Date(),
      tags: [],
      mood: 'neutral',
      isBookmarked: false
    };
    setEntries([newEntry, ...entries]);
    setSelectedEntryId(newEntry.id);
    setActiveView('entries');
    setArchiveFilter(null);
    setTagFilter(null);
    setShowMobileDetail(true);
  };

  const toggleBookmark = (id) => {
    const updated = entries.map(ent => ent.id === id ? { ...ent, isBookmarked: !ent.isBookmarked } : ent);
    setEntries(updated);
  };

  const handleDeleteEntry = async (id) => {
    const entryToDelete = entries.find(e => e.id === id);
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
      type: 'confirm', title: 'Delete Journal', message: `Are you sure you want to delete "${activeJournal?.name}"? Entries that belong ONLY to this journal will be permanently deleted. Other overlapping entries will just have this journal tag removed.`, confirmText: 'Delete', isDestructive: true,
      onConfirm: async () => {
        // Entries that belong EXCLUSIVELY to this journal get permanently wiped
        const entriesToDelete = entries.filter(e => e.journalIds?.length === 1 && e.journalIds[0] === id);
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
        
        // Remove permanently deleted entries, and remove the journal ID from the remaining ones
        let updatedEntries = entries.filter(e => !(e.journalIds?.length === 1 && e.journalIds[0] === id));
        updatedEntries = updatedEntries.map(e => ({
          ...e,
          journalIds: e.journalIds?.filter(jid => jid !== id)
        }));

        setJournals(updatedJournals);
        setEntries(updatedEntries);
        setActiveJournal(updatedJournals[0] || null);
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
        const data = JSON.stringify({ entries, journals, templates, themeConfig, customThemes, activeThemeId });
        
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
        const parsedEntries = data.entries.map(e => ({ 
          ...e, 
          createdAt: new Date(e.createdAt),
          // Auto migrate cloud data if necessary
          journalIds: e.journalIds || (e.journalId ? [e.journalId] : [])
        }));
        setEntries(parsedEntries);
      }
      if (data.journals) setJournals(data.journals);
      if (data.templates) setTemplates(data.templates);
      if (data.themeConfig) setThemeConfig(data.themeConfig);
      if (data.customThemes) setCustomThemes(data.customThemes);
      if (data.activeThemeId) setActiveThemeId(data.activeThemeId);
      
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
        const data = JSON.stringify({ entries, journals, templates, themeConfig, customThemes, activeThemeId });
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

  const handleSaveCustomThemePrompt = () => {
    setModalConfig({
      title: 'Save Custom Theme',
      message: 'Give your current color palette a name to save it for later.',
      type: 'confirm',
      confirmText: 'Save Theme',
      content: (
        <div className="mt-4">
          <input 
            type="text" 
            id="customThemeNameInput" 
            placeholder="e.g., Midnight Forest" 
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 outline-none focus-ring-accent text-base bg-zinc-50 focus:bg-white"
            autoFocus
          />
        </div>
      ),
      onConfirm: () => {
        const input = document.getElementById('customThemeNameInput');
        const themeName = input?.value?.trim();
        if (themeName) {
          const newThemeId = `theme-${Date.now()}`;
          const newTheme = {
            id: newThemeId,
            name: themeName,
            ...themeConfig
          };
          setCustomThemes(prev => [...prev, newTheme]);
          setActiveThemeId(newThemeId);
        }
      }
    });
  };

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

  const handleExportPDF = (entriesToExport, documentTitle, sortOrder = 'desc') => {
    if (!entriesToExport || entriesToExport.length === 0) {
      setModalConfig({ type: 'alert', title: 'Export Failed', message: 'There are no entries to export.', confirmText: 'Okay' });
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setModalConfig({ type: 'alert', title: 'Popup Blocked', message: 'Please allow popups to generate the PDF.', confirmText: 'Got it' });
      return;
    }

    const sortedEntries = [...entriesToExport].sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    const uiFontStack = themeConfig.uiFont === 'system-ui' ? 'system-ui, sans-serif' : `'${themeConfig.uiFont}', sans-serif`;
    const docFontStack = themeConfig.docFont === 'system-ui' ? 'system-ui, serif' : `'${themeConfig.docFont}', serif`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle} - Epektasis Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@700&family=Inter:wght@400;700&family=Charter:wght@400;700&display=swap');
            body { font-family: ${docFontStack}; line-height: 1.6; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; }
            .header-block { border-bottom: 2px solid ${themeConfig.primary}; padding-bottom: 20px; margin-bottom: 50px; text-align: center; }
            h1 { font-family: 'Quicksand', sans-serif; margin: 0 0 10px 0; }
            .export-meta { font-family: ${uiFontStack}; font-size: 14px; color: #666; font-variant: all-small-caps; text-transform: lowercase; }
            .entry { margin-bottom: 60px; page-break-inside: avoid; }
            .entry-title { font-size: 28px; font-weight: bold; margin-bottom: 8px; font-family: 'Quicksand', sans-serif; color: ${themeConfig.primary}; }
            .entry-meta { font-size: 13px; color: #666; margin-bottom: 20px; font-family: ${uiFontStack}; font-variant: all-small-caps; text-transform: lowercase; letter-spacing: 1px; }
            .entry-tags { margin-bottom: 20px; font-family: ${uiFontStack}; font-size: 12px; color: ${themeConfig.accent}; font-weight: bold; font-variant: all-small-caps; text-transform: lowercase; }
            .entry-content { font-size: 18px; color: #333; }
            .entry-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
            hr { border: 0; border-top: 1px solid #eee; margin-top: 60px; }
          </style>
        </head>
        <body>
          <div class="header-block">
            <h1>${documentTitle}</h1>
            <div class="export-meta">Generated from Epektasis OS • ${sortedEntries.length} Entries</div>
          </div>
          ${sortedEntries.map(entry => `
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

  // --- Dynamic CSS Engine ---
  const getGoogleFontsUrl = () => {
    const fonts = [];
    fonts.push(`family=Quicksand:wght@400;500;600;700`);
    if (!['system-ui', 'Georgia'].includes(themeConfig.uiFont)) fonts.push(`family=${themeConfig.uiFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
    if (!['system-ui', 'Georgia'].includes(themeConfig.docFont)) fonts.push(`family=${themeConfig.docFont.replace(/ /g, '+')}:wght@400;700`);
    if (fonts.length === 0) return '';
    return `@import url('https://fonts.googleapis.com/css2?${fonts.join('&')}&display=swap');`;
  };

  const uiFontStack = themeConfig.uiFont === 'system-ui' ? 'system-ui, sans-serif' : `'${themeConfig.uiFont}', sans-serif`;
  const isDocSans = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Nunito', 'Montserrat', 'Quicksand'].includes(themeConfig.docFont);
  const docFontStack = themeConfig.docFont === 'system-ui' ? 'system-ui, serif' : `'${themeConfig.docFont}', ${isDocSans ? 'sans-serif' : 'serif'}`;

  // Updated Dynamic CSS to implement reading width and clean up typography
  const dynamicCss = `
    ${getGoogleFontsUrl()}
    :root {
      --theme-primary: ${themeConfig.primary};
      --theme-secondary: ${themeConfig.secondary};
      --theme-accent: ${themeConfig.accent};
      --theme-sidebar-text: ${themeConfig.sidebarText};
      --font-ui: ${uiFontStack};
      --font-doc: ${docFontStack};
      --font-heading: 'Quicksand', sans-serif;

      /* FLUID TYPOGRAPHY VARIABLES */
      --fluid-base: clamp(1.05rem, 1vw + 0.8rem, 1.25rem);
      --fluid-h3: clamp(1.3rem, 1.5vw + 1rem, 1.75rem);
      --fluid-h2: clamp(1.6rem, 2.5vw + 1rem, 2.25rem);
      --fluid-h1: clamp(2rem, 4vw + 1rem, 3rem);
      --fluid-title: clamp(2.25rem, 5vw + 1rem, 3.5rem);
      --fluid-greeting: clamp(2.5rem, 6vw + 1rem, 4rem);
    }
    ::selection { background-color: color-mix(in srgb, var(--theme-accent) 25%, transparent); color: inherit; }
    ::-moz-selection { background-color: color-mix(in srgb, var(--theme-accent) 25%, transparent); color: inherit; }
    body { font-family: var(--font-ui) !important; }
    .font-serif { font-family: var(--font-doc) !important; }
    .font-heading { font-family: var(--font-heading) !important; letter-spacing: -0.01em; }
    .sidebar-label { letter-spacing: 0.01em; }
    
    .meta-small-caps { 
      font-variant: all-small-caps; 
      -webkit-font-variant: all-small-caps; 
      font-variant-caps: all-small-caps; 
      text-transform: lowercase; 
      letter-spacing: 0.04em; 
    }

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
    
    /* FLUID TITLE CLASSES */
    .fluid-title { font-size: var(--fluid-title); line-height: 1.1; }
    .fluid-greeting { font-size: var(--fluid-greeting); line-height: 1.1; letter-spacing: -0.02em; }

    /* REFINED EDITOR TYPOGRAPHY */
    .rte-content { 
      font-family: var(--font-doc) !important; 
      outline: none; 
      max-width: 65ch; /* Optimal reading width */
      margin: 0 auto;  /* Centers the text block */
      line-height: 1.8; /* More breathing room */
      color: inherit;
      font-size: var(--fluid-base);
      hanging-punctuation: first allow-end;
      hyphens: auto;
      -webkit-hyphens: auto;
    }
    .rte-content h1 { font-family: var(--font-heading) !important; font-size: var(--fluid-h1); font-weight: 800; margin-bottom: 1.5rem; margin-top: 2rem; letter-spacing: -0.02em; color: inherit; line-height: 1.2; }
    .rte-content h2 { font-family: var(--font-heading) !important; font-size: var(--fluid-h2); font-weight: 700; margin-bottom: 1rem; margin-top: 2rem; letter-spacing: -0.01em; color: inherit; line-height: 1.25; }
    .rte-content h3 { font-family: var(--font-heading) !important; font-size: var(--fluid-h3); font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.5rem; color: inherit; line-height: 1.3; }
    .rte-content blockquote { border-left: 3px solid var(--theme-accent); padding: 1rem 1.5rem; margin: 2rem 0; font-style: italic; color: inherit; opacity: 0.8; background-color: transparent; }
    .rte-content p { margin-bottom: 1.5rem; }
    .rte-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
    .rte-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.5rem; }
    .rte-content li { margin-bottom: 0.5rem; }
    .rte-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 2rem auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .rte-content [style*="text-align: center"] img { margin: 2rem auto; }
    .rte-content [style*="text-align: right"] img { margin: 2rem 0 2rem auto; }
    .rte-content [style*="text-align: left"] img { margin: 2rem auto 2rem 0; }
    .rte-content:empty:before { content: attr(placeholder); color: #a1a1aa; pointer-events: none; }
    
    .ease-apple { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
    aside .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-in { animation: fade-in 0.3s ease-out; }

    /* AESTHETIC ENHANCEMENTS */
    .texture-bg {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    }
    
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.25); }
      100% { transform: scale(1); }
    }
    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

    /* THEME: GOLDEN HOUR */
    .theme-golden { background-color: #F5EAE0 !important; color: #4A3B32 !important; }
    .theme-golden .bg-white { background-color: #FDF9F3 !important; border-color: #E8D8CA !important; }
    .theme-golden .bg-zinc-50 { background-color: #F2E3D5 !important; }
    .theme-golden .bg-zinc-100 { background-color: #EAD6C5 !important; }
    .theme-golden .text-zinc-900, .theme-golden .text-zinc-800 { color: #3E2C20 !important; }
    .theme-golden .text-zinc-700 { color: #5C4A3D !important; }
    .theme-golden .text-zinc-500 { color: #8C7868 !important; }
    .theme-golden .text-zinc-400 { color: #B5A496 !important; }
    .theme-golden .border-zinc-100, .theme-golden .border-zinc-200 { border-color: #E8D8CA !important; }
    .theme-golden .bg-\\[color\\:var\\(--theme-secondary\\)\\] { background-color: #F5EAE0 !important; }
  `;

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        const recentEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

        return (
          <div className={`flex-1 flex-col p-6 md:p-12 overflow-y-auto bg-[color:var(--theme-secondary)] custom-scrollbar ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
            <div className="max-w-4xl mx-auto w-full space-y-12">
              <div className="space-y-2 mt-8 md:mt-0">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 mb-4 text-zinc-500 hover:bg-zinc-200/50 rounded-full transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}>
                  <Menu size={24} />
                </button>
                <h1 className="fluid-greeting font-heading font-extrabold text-zinc-900 tracking-tight">{greeting}.</h1>
                <p className="text-lg text-zinc-600 font-medium">Ready to capture your thoughts today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => { handleCreateEntry(); setShowMobileDetail(true); }} className="p-6 bg-[color:var(--theme-primary)] hover:bg-primary-dark text-white rounded-3xl transition-all hover:shadow-xl hover:-translate-y-1 duration-300 text-left group shadow-lg flex flex-col justify-between min-h-[140px]">
                  <div className="p-3 bg-white/10 rounded-2xl w-max group-hover:bg-white/20 transition-colors"><Plus size={24} /></div>
                  <div>
                    <h3 className="font-heading font-bold text-xl">New Reflection</h3>
                    <p className="opacity-70 text-sm mt-1">Write in {activeJournal?.name || 'your vault'}</p>
                  </div>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl flex flex-col justify-between shadow-sm">
                    <Book size={24} className="text-[color:var(--theme-accent)] mb-4" />
                    <div>
                      <h3 className="font-heading font-bold text-2xl text-zinc-900">{journals.length}</h3>
                      <p className="text-zinc-500 text-sm font-medium">Active Journals</p>
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl flex flex-col justify-between shadow-sm">
                    <FileText size={24} className="text-[color:var(--theme-primary)] mb-4" />
                    <div>
                      <h3 className="font-heading font-bold text-2xl text-zinc-900">{entries.length}</h3>
                      <p className="text-zinc-500 text-sm font-medium">Total Memories</p>
                    </div>
                  </div>
                </div>
              </div>

              {recentEntries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-zinc-400">Recent Memories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentEntries.map(entry => {
                      return (
                        <button
                          key={entry.id}
                          onClick={() => { 
                            setSelectedEntryId(entry.id); 
                            const matchingJournal = journals.find(j => entry.journalIds?.includes(j.id));
                            setActiveJournal(matchingJournal || null); 
                            setActiveView('entries'); 
                            setShowMobileDetail(true); 
                          }}
                          className="p-6 bg-white border border-zinc-100 rounded-3xl text-left shadow-sm hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col min-h-[160px] relative"
                        >
                          {entry.isBookmarked && (
                            <div className="absolute top-4 right-4 text-[color:var(--theme-primary)]">
                              <Bookmark size={14} className="fill-current" />
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-zinc-500 meta-small-caps bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
                              {entry.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            
                            <div className="flex gap-1 -mr-1">
                              {entry.journalIds?.slice(0, 3).map(jid => {
                                const j = journals.find(x => x.id === jid);
                                return j ? <div key={jid} className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: j.color }} title={j.name} /> : null;
                              })}
                            </div>

                          </div>
                          <h4 className="font-heading font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-[color:var(--theme-accent)] transition-colors pr-6">{entry.title || 'Untitled Entry'}</h4>
                          <p className="text-sm text-zinc-500 line-clamp-2 mt-auto leading-relaxed">{entry.content ? entry.content.replace(/<[^>]+>/g, '') : 'Empty entry...'}</p>
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
          <div className={`flex-1 flex-col p-6 md:p-12 bg-[color:var(--theme-secondary)] overflow-y-auto ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <div className="flex items-center gap-4 self-start mb-6">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 text-zinc-500 hover:bg-white hover:shadow-sm rounded-full transition-all ${isSidebarOpen ? 'md:hidden' : ''}`}>
                <Menu size={24} />
              </button>
              <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-semibold transition-colors">
                <Home size={20} /> <span className="hidden sm:inline">Home</span>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]">
              <Calendar size={64} className="text-zinc-300 mb-4" />
              <h2 className="font-heading text-2xl font-bold text-zinc-800">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <p className="text-zinc-500 max-w-sm text-center mt-2">Browse your memories chronologically.</p>
              <div className="mt-8 grid grid-cols-7 gap-2 w-full max-w-md bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
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
                            const journal = journals.find(j => entryOnDay.journalIds?.includes(j.id));
                            setActiveJournal(journal || null);
                            setActiveView('entries');
                            setShowMobileDetail(true);
                          }
                        }
                      }}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all relative
                        ${isToday ? 'bg-[color:var(--theme-primary)] text-white shadow-md' : 'bg-transparent text-zinc-700 hover:bg-zinc-50'}
                        ${hasEntry && !isToday ? 'border-[color:var(--theme-accent)] cursor-pointer bg-[color:var(--theme-accent)]/5' : 'border-transparent'}
                        ${!hasEntry && !isToday ? 'cursor-default hover:bg-transparent' : ''}
                      `}
                    >
                      {day}
                      {hasEntry && !isToday && <div className="w-1 h-1 rounded-full bg-[color:var(--theme-accent)] absolute bottom-2" />}
                      {hasEntry && isToday && <div className="w-1 h-1 rounded-full bg-white absolute bottom-2" />}
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
                {/* ZEN MODE BUTTON (Templates) */}
                <button onClick={() => setIsZenMode(!isZenMode)} className={`p-2 rounded-full transition-all flex items-center justify-center ${isZenMode ? 'bg-[color:var(--theme-primary)] text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-100'}`} title="Toggle Zen Mode">
                  <Maximize2 size={18} className={isZenMode ? "scale-90" : ""} />
                </button>
                <button onClick={syncToDrive} className={`p-2 rounded-full transition-all ${isSaving ? 'text-green-600 bg-green-50' : 'text-zinc-400 hover:bg-zinc-100'}`}>{isSaving ? <CheckCircle2 size={20} /> : <Save size={20} />}</button>
                <div className="w-px h-6 bg-zinc-200 mx-1" />
                <button onClick={() => handleDeleteTemplate(selectedTemplate.id)} className="p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all" disabled={!selectedTemplate}><Trash2 size={18} /></button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto pt-12 flex justify-center custom-scrollbar bg-[color:var(--theme-secondary)]/30">
              {selectedTemplate ? (
                <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500 px-8">
                  <div className="space-y-4 max-w-[65ch] mx-auto">
                    <input 
                      type="text" 
                      className="w-full fluid-title font-heading font-extrabold tracking-tight text-zinc-900 border-none outline-none placeholder-zinc-300 bg-transparent text-center"
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
                  <div className="h-32 w-full shrink-0 pointer-events-none" />
                </div>
              ) : (
                <div className="max-w-2xl w-full h-full flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500">
                  <LayoutTemplate size={48} className="mb-4 opacity-20" />
                  <p>No template selected.</p>
                  <button onClick={handleCreateTemplate} className="mt-6 px-6 py-2.5 bg-[color:var(--theme-primary)] hover:bg-primary-dark transition-colors text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"><Plus size={16} /> Create New Template</button>
                </div>
              )}
            </div>
          </main>
        );
      case 'settings':
        return (
          <div className={`flex-1 flex-col p-6 md:p-12 overflow-y-auto bg-[color:var(--theme-secondary)] custom-scrollbar ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-4 self-start mb-6">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 text-zinc-500 hover:bg-white hover:shadow-sm rounded-full transition-all ${isSidebarOpen ? 'md:hidden' : ''}`}><Menu size={24} /></button>
                <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-semibold transition-colors"><Home size={20} /> <span className="hidden sm:inline">Home</span></button>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white shadow-sm rounded-2xl text-[color:var(--theme-primary)] shrink-0 border border-zinc-100"><Settings size={28} /></div>
                <h2 className="font-heading text-3xl font-extrabold text-zinc-900">System Settings</h2>
              </div>
              
              <div className="space-y-8 pb-12">
                
                {/* SECURITY & ACCESS */}
                <section className="p-6 border border-zinc-100 shadow-sm rounded-3xl bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-[color:var(--theme-primary)]" />
                    <h3 className="font-heading font-bold text-lg text-zinc-900">Security & Access</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Vault PIN / Password</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="password" 
                          placeholder={userPin ? "********" : "Enter a new PIN..."}
                          value={pinSetup}
                          onChange={(e) => setPinSetup(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 outline-none focus-ring-accent text-base transition-all min-w-0 bg-zinc-50 focus:bg-white"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              if (!pinSetup) return;
                              setUserPin(pinSetup);
                              localStorage.setItem('epektasis_pin', pinSetup);
                              setPinSetup('');
                              setModalConfig({ type: 'alert', title: 'PIN Saved', message: 'Your Vault PIN has been updated. You can now lock the app.', confirmText: 'Okay' });
                            }}
                            className="px-4 py-2 bg-[color:var(--theme-primary)] hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
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
                              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Locks the app so others can't open it if you hand them this device.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-t border-zinc-100 gap-4">
                    <div>
                      <p className="font-medium text-red-600">Complete Sign Out</p>
                      <p className="text-sm text-zinc-500">Wipes all local data from this device and disconnects Google Drive.</p>
                    </div>
                    <button 
                      onClick={handleFullSignOut}
                      className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </section>

                {/* THEMING */}
                <section className="p-6 border border-zinc-100 shadow-sm rounded-3xl bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-zinc-100 pb-4 gap-4">
                    <div className="flex items-center gap-2"><Palette size={20} className="text-[color:var(--theme-primary)]" /><h3 className="font-heading font-bold text-lg text-zinc-900">App Theming</h3></div>
                    
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <select 
                        value={activeThemeId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActiveThemeId(val);
                          if (val === 'default') {
                            setThemeConfig({ ...themeConfig, ...DEFAULT_THEME });
                          } else if (val !== 'custom') {
                            const theme = customThemes.find(t => t.id === val);
                            if (theme) {
                              setThemeConfig({ ...themeConfig, ...theme });
                            }
                          }
                        }}
                        className="text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-transparent px-2 py-1.5 rounded-lg outline-none cursor-pointer focus:border-zinc-300 max-w-[140px] truncate transition-colors"
                      >
                        {activeThemeId === 'custom' && <option value="custom" disabled>Unsaved Changes...</option>}
                        <option value="default">Epektasis Default</option>
                        {customThemes.length > 0 && (
                          <optgroup label="Your Themes">
                            {customThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </optgroup>
                        )}
                      </select>
                      
                      <button 
                        onClick={handleSaveCustomThemePrompt} 
                        className="text-xs font-bold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)] px-3 py-1.5 bg-[color:var(--theme-primary)]/10 hover:bg-[color:var(--theme-primary)] rounded-lg transition-colors shrink-0"
                      >
                        Save Colors
                      </button>

                      {activeThemeId.startsWith('theme-') && (
                        <button 
                          onClick={() => {
                            setModalConfig({
                              title: 'Delete Theme',
                              message: 'Are you sure you want to permanently delete this theme?',
                              type: 'confirm',
                              isDestructive: true,
                              confirmText: 'Delete',
                              onConfirm: () => {
                                setCustomThemes(customThemes.filter(t => t.id !== activeThemeId));
                                setActiveThemeId('default');
                                setThemeConfig({ ...themeConfig, ...DEFAULT_THEME });
                              }
                            });
                          }} 
                          className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                          title="Delete Custom Theme"
                        >
                          Delete Theme
                        </button>
                      )}

                      <button 
                        onClick={() => { setThemeConfig({ ...themeConfig, ...DEFAULT_THEME }); setActiveThemeId('default'); }} 
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors shrink-0"
                        title="Restore to Default Theme"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={themeConfig.primary} onChange={e => { setThemeConfig({...themeConfig, primary: e.target.value}); setActiveThemeId('custom'); }} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                        <input type="text" value={themeConfig.primary} onChange={e => { setThemeConfig({...themeConfig, primary: e.target.value}); setActiveThemeId('custom'); }} className="flex-1 px-3 py-2 text-base rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white uppercase focus-ring-accent min-w-0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={themeConfig.secondary} onChange={e => { setThemeConfig({...themeConfig, secondary: e.target.value}); setActiveThemeId('custom'); }} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                        <input type="text" value={themeConfig.secondary} onChange={e => { setThemeConfig({...themeConfig, secondary: e.target.value}); setActiveThemeId('custom'); }} className="flex-1 px-3 py-2 text-base rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white uppercase focus-ring-accent min-w-0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={themeConfig.accent} onChange={e => { setThemeConfig({...themeConfig, accent: e.target.value}); setActiveThemeId('custom'); }} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                        <input type="text" value={themeConfig.accent} onChange={e => { setThemeConfig({...themeConfig, accent: e.target.value}); setActiveThemeId('custom'); }} className="flex-1 px-3 py-2 text-base rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white uppercase focus-ring-accent min-w-0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Sidebar Text</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={themeConfig.sidebarText} onChange={e => { setThemeConfig({...themeConfig, sidebarText: e.target.value}); setActiveThemeId('custom'); }} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                        <input type="text" value={themeConfig.sidebarText} onChange={e => { setThemeConfig({...themeConfig, sidebarText: e.target.value}); setActiveThemeId('custom'); }} className="flex-1 px-3 py-2 text-base rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white uppercase focus-ring-accent min-w-0" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">UI Font (Interface)</label>
                      <select value={themeConfig.uiFont} onChange={e => { setThemeConfig({...themeConfig, uiFont: e.target.value}); setActiveThemeId('custom'); }} className="w-full px-3 py-2 text-base rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus-ring-accent outline-none">
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Nunito">Nunito</option>
                        <option value="Fira Sans">Fira Sans</option>
                        <option value="Work Sans">Work Sans</option>
                        <option value="DM Sans">DM Sans</option>
                        <option value="Rubik">Rubik</option>
                        <option value="system-ui">System Default</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Document Font (Editor)</label>
                      <select value={themeConfig.docFont} onChange={e => { setThemeConfig({...themeConfig, docFont: e.target.value}); setActiveThemeId('custom'); }} className="w-full px-3 py-2 text-base rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus-ring-accent outline-none">
                        <optgroup label="Serif">
                          <option value="Charter">Charter</option>
                          <option value="Merriweather">Merriweather</option>
                          <option value="Lora">Lora</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="PT Serif">PT Serif</option>
                          <option value="Crimson Text">Crimson Text</option>
                          <option value="Spectral">Spectral</option>
                          <option value="EB Garamond">EB Garamond</option>
                          <option value="Literata">Literata</option>
                          <option value="Georgia">Georgia</option>
                        </optgroup>
                        <optgroup label="Sans-Serif">
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Nunito">Nunito</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Quicksand">Quicksand</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-zinc-100 gap-4">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-zinc-800">Visual Theme</p>
                      <p className="text-sm text-zinc-500">Choose between Light, Dark, or Golden Hour.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl shrink-0">
                      <button onClick={() => setThemeMode('light')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === 'light' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Light</button>
                      <button onClick={() => setThemeMode('dark')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === 'dark' ? 'bg-zinc-800 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-700'}`}>Dark</button>
                      <button onClick={() => setThemeMode('golden')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === 'golden' ? 'bg-[#D4A373] shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-700'}`}>Golden</button>
                    </div>
                  </div>
                </section>

                {/* CLOUD SYNC */}
                <section className="p-6 border border-accent-20 rounded-3xl bg-accent-5">
                  <div className="flex items-center gap-2 mb-4">
                    {isDriveConnected ? <Cloud size={20} className="text-[color:var(--theme-accent)]" /> : <CloudOff size={20} className="text-[color:var(--theme-accent)]" />}
                    <h3 className="font-heading font-bold text-lg text-[color:var(--theme-accent)]">Cloud Sync & Encryption</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Google OAuth Client ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 123456789-abcxyz.apps.googleusercontent.com"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-300 focus-ring-accent outline-none transition-all text-base min-w-0 bg-white"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Required to save your encrypted vault to Google Drive.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-t border-accent-20 pt-4 gap-4">
                    <div className="min-w-0 break-words">
                      <p className="font-medium text-zinc-800">Drive Connection Status</p>
                      <p className={`text-sm font-bold ${isDriveConnected ? 'text-green-600' : 'text-zinc-500'} break-words`}>
                        {isDriveConnected ? `Connected • Synced ${lastSynced}` : 'Not Connected'}
                      </p>
                    </div>
                    <button 
                      onClick={handleConnectGoogleDrive}
                      className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-lg whitespace-nowrap self-start sm:self-auto shrink-0 ${isDriveConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-[color:var(--theme-accent)] hover:bg-accent-dark'}`}
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
          <div className={`flex-1 flex-col p-6 md:p-12 overflow-y-auto bg-[color:var(--theme-secondary)] custom-scrollbar ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-4 self-start mb-6">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 -ml-2 text-zinc-500 hover:bg-white hover:shadow-sm rounded-full transition-all ${isSidebarOpen ? 'md:hidden' : ''}`}><Menu size={24} /></button>
                <button onClick={() => { setActiveView('home'); setTagFilter(null); setArchiveFilter(null); setShowMobileDetail(false); }} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-semibold transition-colors"><Home size={20} /> <span className="hidden sm:inline">Home</span></button>
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-zinc-900 mb-8">Life Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-white border border-zinc-100 shadow-sm rounded-3xl">
                  <h4 className="font-heading text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Memories</h4>
                  <div className="font-heading text-4xl font-extrabold text-[color:var(--theme-primary)]">{totalEntries}</div>
                </div>
                <div className="p-6 bg-white border border-zinc-100 shadow-sm rounded-3xl">
                  <h4 className="font-heading text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Most Frequent Mood</h4>
                  <div className="font-heading text-2xl font-bold text-[color:var(--theme-accent)] capitalize">{Object.keys(moodCounts).sort((a,b) => moodCounts[b] - moodCounts[a])[0] || 'Neutral'}</div>
                </div>
                <div className="p-6 bg-white border border-zinc-100 shadow-sm rounded-3xl">
                  <h4 className="font-heading text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Active Journals</h4>
                  <div className="font-heading text-4xl font-extrabold text-zinc-900">{journals.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-zinc-100">
                  <h4 className="font-heading text-sm font-bold text-[color:var(--theme-primary)] mb-4 uppercase tracking-widest">Consistency Heatmap (Last 50 Days)</h4>
                  <div className="flex gap-1 flex-wrap">
                    {heatmap.map((hasEntry, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${hasEntry ? 'bg-[color:var(--theme-primary)]' : 'bg-zinc-100'}`} title={hasEntry ? 'Entry logged' : 'No entry'} />
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-zinc-100">
                  <h4 className="font-heading text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">Sentiment Mix</h4>
                  <div className="h-4 w-full flex rounded-full overflow-hidden mb-3">
                    {pPositive > 0 && <div className="h-full bg-[color:var(--theme-primary)]" style={{ width: `${pPositive}%` }} title="Positive" />}
                    {pNeutral > 0 && <div className="h-full bg-zinc-300" style={{ width: `${pNeutral}%` }} title="Neutral" />}
                    {pNegative > 0 && <div className="h-full bg-orange-400" style={{ width: `${pNegative}%` }} title="Negative" />}
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
                
                {/* BOOKMARK BUTTON */}
                {selectedEntry && (
                  <button 
                    onClick={() => {
                      setAnimateBookmark(true);
                      toggleBookmark(selectedEntry.id);
                      setTimeout(() => setAnimateBookmark(false), 300);
                    }}
                    className={`p-2 rounded-full transition-all flex items-center justify-center ${
                      selectedEntry.isBookmarked 
                        ? 'text-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10'
                        : 'text-zinc-400 hover:bg-zinc-100'
                    } ${animateBookmark ? 'animate-pop' : ''}`}
                    title={selectedEntry.isBookmarked ? "Remove Bookmark" : "Bookmark Entry"}
                  >
                    <Bookmark size={20} className={selectedEntry.isBookmarked ? "fill-current" : ""} />
                  </button>
                )}

                <button onClick={() => setShowTemplatePicker(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-full text-xs font-bold hover:bg-zinc-100 transition-all shadow-sm"><LayoutTemplate size={14} /><span className="hidden xl:inline">Templates</span></button>
                
                {/* ZEN MODE BUTTON */}
                <button onClick={() => setIsZenMode(!isZenMode)} className={`p-2 rounded-full transition-all flex items-center justify-center ${isZenMode ? 'bg-[color:var(--theme-primary)] text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-100'}`} title="Toggle Zen Mode">
                  <Maximize2 size={18} className={isZenMode ? "scale-90" : ""} />
                </button>

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

            <div className="flex-1 overflow-y-auto pt-12 flex justify-center custom-scrollbar bg-[color:var(--theme-secondary)]/30">
              {selectedEntry ? (
                <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500 px-8">
                  
                  {/* Title & Metadata Header */}
                  <div className="space-y-6 mb-8 max-w-[65ch] mx-auto">
                    <input 
                      type="text" 
                      className="w-full fluid-title font-heading font-extrabold tracking-tight text-zinc-900 border-none outline-none placeholder-zinc-300 bg-transparent text-center" 
                      value={selectedEntry.title || ''} 
                      onChange={(e) => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, title: e.target.value } : ent); setEntries(updated); }} 
                      placeholder="Entry Title" 
                    />
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 font-medium relative">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 shadow-sm rounded-full meta-small-caps">
                        <Calendar size={12} className="text-[color:var(--theme-primary)]" />
                        {selectedEntry.createdAt.toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>

                      <div className="relative" ref={journalMenuRef}>
                        <button onClick={() => setIsJournalMenuOpen(!isJournalMenuOpen)} className="group flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 shadow-sm rounded-full hover:bg-zinc-50 hover:scale-105 transition-all duration-300" title="Manage Journals">
                          <Book size={12} className="text-[color:var(--theme-primary)] group-hover:scale-110 transition-transform duration-300" />
                          <span className="truncate max-w-[120px] font-bold text-[color:var(--theme-primary)] text-xs">
                            {selectedEntry.journalIds?.length > 1 
                              ? `${selectedEntry.journalIds.length} Journals` 
                              : (journals.find(j => j.id === selectedEntry.journalIds?.[0])?.name || 'No Journal')}
                          </span>
                        </button>
                        {isJournalMenuOpen && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 z-50 w-56 animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-64 overflow-y-auto">
                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 mb-1">Save to...</div>
                            {journals.map(j => {
                              const isSelected = selectedEntry.journalIds?.includes(j.id);
                              return (
                                <button 
                                  key={j.id} 
                                  onClick={() => {
                                    let newIds = [...(selectedEntry.journalIds || [])];
                                    if (isSelected) {
                                      newIds = newIds.filter(id => id !== j.id);
                                      if (newIds.length === 0 && journals.length > 0) newIds = [journals[0].id]; // Prevent zero
                                    } else {
                                      newIds.push(j.id);
                                    }
                                    const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, journalIds: newIds } : ent);
                                    setEntries(updated);
                                  }} 
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors hover:bg-zinc-50`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: j.color }} />
                                    <span className={`truncate ${isSelected ? 'font-bold text-zinc-900' : 'font-medium text-zinc-600'}`}>{j.name}</span>
                                  </div>
                                  {isSelected && <CheckCircle2 size={14} className="text-[color:var(--theme-primary)] shrink-0" />}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="relative" ref={moodMenuRef}>
                        <button onClick={() => setIsMoodMenuOpen(!isMoodMenuOpen)} className="group flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 shadow-sm rounded-full hover:bg-zinc-50 hover:scale-105 transition-all duration-300" title="Change Mood">
                          <CurrentMoodIcon size={14} className={`${currentMoodColor} group-hover:rotate-12 transition-transform duration-300`} />
                          <span className="capitalize">{selectedEntry.mood || 'neutral'}</span>
                        </button>
                        {isMoodMenuOpen && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 z-50 w-40 animate-in fade-in zoom-in-95 duration-100">
                            {MOODS.map(m => ( <button key={m.id} onClick={() => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, mood: m.id } : ent); setEntries(updated); setIsMoodMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${selectedEntry.mood === m.id ? 'bg-zinc-50 font-semibold' : 'hover:bg-zinc-50 text-zinc-700'}`}><m.icon size={16} className={m.color} />{m.label}</button> ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                      {selectedEntry.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white border border-[color:var(--theme-primary)]/20 text-[color:var(--theme-primary)] rounded-full text-xs font-bold transition-colors shadow-sm meta-small-caps">
                          #{tag}
                          <button onClick={() => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, tags: ent.tags.filter(t => t !== tag) } : ent); setEntries(updated); }} className="hover:text-red-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-50" title="Remove Tag"><X size={10} /></button>
                        </span>
                      ))}
                      <div className="relative flex items-center shadow-sm rounded-full">
                        <Hash size={12} className="absolute left-3 text-zinc-400" />
                        <input type="text" placeholder="Add tag..." className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 hover:border-zinc-300 focus:border-[color:var(--theme-accent)] rounded-full outline-none transition-all w-32 focus:w-40 placeholder-zinc-400 text-zinc-700 font-medium" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { const newTag = e.target.value.replace(/#/g, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''); if (newTag && !selectedEntry.tags?.includes(newTag)) { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, tags: [...(ent.tags || []), newTag] } : ent); setEntries(updated); } e.target.value = ''; } }} />
                      </div>
                    </div>
                  </div>

                  {/* Core Editor */}
                  <RichTextEditor content={selectedEntry.content} accessToken={accessToken} folderId={driveFolderId} onChange={(html) => { const updated = entries.map(ent => ent.id === selectedEntry.id ? { ...ent, content: html } : ent); setEntries(updated); }} onShowMessage={(msg) => setModalConfig({ type: 'alert', title: 'Notice', message: msg, confirmText: 'Got it' })} />
                  
                  {/* Invisible spacer block */}
                  <div className="h-32 w-full shrink-0 pointer-events-none" />

                </div>
              ) : (
                <div className="max-w-2xl w-full h-full flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500"><Book size={48} className="mb-4 opacity-20" /><p>No entry selected{activeJournal ? ` in ${activeJournal.name}` : ''}.</p><button onClick={handleCreateEntry} className="mt-6 px-6 py-2.5 bg-[color:var(--theme-primary)] hover:bg-primary-dark transition-colors text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"><Plus size={16} /> Create New Entry</button></div>
              )}
            </div>
          </main>
        );
    }
  };

  return (
    <div className={`flex h-[100dvh] w-full overflow-hidden texture-bg ${themeMode === 'dark' ? 'bg-zinc-950 text-white' : themeMode === 'golden' ? 'theme-golden' : 'bg-[color:var(--theme-secondary)] text-zinc-900'}`}>
      <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />

      {isLocked ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 absolute inset-0 z-50 px-6">
          <div className="w-16 h-16 bg-[color:var(--theme-primary)] rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white mb-2 tracking-tight">Vault Locked</h1>
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
          <aside className={`${isSidebarOpen && !isZenMode ? 'w-64' : 'w-0'} bg-[color:var(--theme-primary)] transition-all duration-500 ease-in-out flex flex-col absolute md:relative z-40 h-full overflow-hidden shadow-2xl shrink-0`}>
            <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[color:var(--theme-secondary)] flex items-center justify-center shrink-0"><BrainCircuit size={20} className="text-[color:var(--theme-primary)]" /></div>
              <h1 className="text-sidebar-hover font-bold tracking-tight text-lg">Epektasis</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
              <SectionLabel>Core</SectionLabel>
              <SidebarItem icon={Home} label="Home" active={activeView === 'home'} onClick={() => { setActiveView('home'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={FileText} label="All Entries" active={activeView === 'entries' && !activeJournal && !archiveFilter && !tagFilter} onClick={() => { setActiveView('entries'); setActiveJournal(null); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem 
                icon={Bookmark} 
                label="Bookmarks" 
                active={activeView === 'bookmarks'} 
                onClick={() => { setActiveView('bookmarks'); setActiveJournal(null); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} 
                badge={entries.filter(e => e.isBookmarked).length || undefined} 
              />
              <SidebarItem icon={LayoutTemplate} label="Templates" active={activeView === 'templates'} onClick={() => { setActiveView('templates'); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={Calendar} label="Calendar" active={activeView === 'calendar'} onClick={() => { setActiveView('calendar'); setShowMobileDetail(true); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              <SidebarItem icon={BarChart3} label="Life Analytics" active={activeView === 'analytics'} onClick={() => { setActiveView('analytics'); setShowMobileDetail(true); if(window.innerWidth < 768) setSidebarOpen(false); }} />

              <div className="flex items-center justify-between px-4 mt-8 mb-2 group">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sidebar-muted">Journals</span>
                <button onClick={handleAddJournal} className="text-sidebar-muted hover:text-sidebar-hover transition-colors" title="Add New Journal"><Plus size={14} /></button>
              </div>
              {journals.map(j => (
                <SidebarItem key={j.id} icon={Book} label={j.name} active={activeJournal?.id === j.id && activeView === 'entries'} onClick={() => { setActiveJournal(j); setActiveView('entries'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} badge={entries.filter(e => e.journalIds?.includes(j.id)).length} />
              ))}

              <SectionLabel>Tags</SectionLabel>
              <div className="space-y-0.5">
                <button onClick={() => setIsTagsExpanded(!isTagsExpanded)} className="w-full flex items-center justify-between px-4 py-1.5 text-xs transition-colors text-sidebar-inactive hover:text-sidebar-hover"><div className="flex items-center gap-2">{isTagsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}<span>Hashtags</span></div></button>
                {isTagsExpanded && (
                  <div className="ml-6 space-y-0.5 mt-1">
                    {dynamicTags.map(tag => {
                      const isTagActive = tagFilter === tag;
                      return (
                        <button key={tag} onClick={() => { setTagFilter(isTagActive ? null : tag); setActiveJournal(null); setArchiveFilter(null); setActiveView('entries'); setShowMobileDetail(false); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`w-full text-left px-4 py-1 text-[13px] transition-colors flex items-center gap-2 ${isTagActive ? 'text-[color:var(--theme-sidebar-text)] font-bold' : 'text-sidebar-muted hover:text-sidebar-hover'}`}><Hash size={10} />{tag}</button>
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

            <div className="p-4 border-t border-white/10 bg-black/10">
              <SidebarItem icon={Settings} label="System Settings" active={activeView === 'settings'} onClick={() => { setActiveView('settings'); setShowMobileDetail(true); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            </div>
          </aside>

          {/* DYNAMIC LIST PANEL */}
          {(activeView === 'entries' || activeView === 'bookmarks' || activeView === 'templates') && (
            <div className={`w-full md:w-80 border-r ${themeMode === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-[#FBF8F1]'} ${showMobileDetail ? 'hidden md:flex' : 'flex'} ${isZenMode ? 'md:hidden w-0 opacity-0 overflow-hidden border-none' : ''} flex-col shadow-sm z-10 shrink-0 transition-all duration-500 ease-in-out`}>
              <div className="p-4 border-b border-zinc-200/50 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    {(activeView === 'entries' || activeView === 'bookmarks') ? (
                      <>
                        {isEditingJournalName && activeJournal && activeView !== 'bookmarks' ? (
                          <input autoFocus value={activeJournal.name || ''} onChange={(e) => { const updated = journals.map(j => j.id === activeJournal.id ? { ...j, name: e.target.value } : j); setJournals(updated); setActiveJournal(updated.find(j => j.id === activeJournal.id)); }} onBlur={() => setIsEditingJournalName(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingJournalName(false)} className="font-heading font-bold text-xl bg-transparent border-b border-zinc-300 outline-none w-full text-zinc-900" />
                        ) : (
                          <h2 className={`font-heading font-bold text-xl truncate ${(activeJournal && activeView !== 'bookmarks') ? 'cursor-pointer hover:text-[color:var(--theme-accent)] transition-colors flex items-center gap-2 group' : ''}`} onClick={() => activeJournal && activeView !== 'bookmarks' && setIsEditingJournalName(true)} title={(activeJournal && activeView !== 'bookmarks') ? "Click to rename journal" : "Your entries"}>
                            {activeView === 'bookmarks' ? 'Bookmarks' : (activeJournal?.name || 'All Entries')} 
                            {activeJournal && activeView !== 'bookmarks' && <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-zinc-400" />}
                          </h2>
                        )}
                        {(archiveFilter || tagFilter) && activeView !== 'bookmarks' && (
                          <span className="text-[10px] text-[color:var(--theme-accent)] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {archiveFilter && <span className="flex items-center gap-1"><Archive size={10} /> {archiveFilter.month ? `${archiveFilter.month} ` : ''}{archiveFilter.year}</span>}
                            {archiveFilter && tagFilter && <span className="text-zinc-300">•</span>}
                            {tagFilter && <span className="flex items-center"><Hash size={10} className="mr-0.5" /> {tagFilter}</span>}
                          </span>
                        )}
                      </>
                    ) : ( <h2 className="font-heading font-bold text-xl truncate">Saved Templates</h2> )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => { setActiveView('home'); setArchiveFilter(null); setTagFilter(null); setShowMobileDetail(false); }} className="p-1.5 hover:bg-white rounded-md transition-colors text-zinc-400 hover:text-zinc-900 hover:shadow-sm" title="Go Home"><Home size={16} /></button>
                    {(activeView === 'entries' || activeView === 'bookmarks') && (
                      <button 
                        onClick={() => {
                          const listExportTitle = activeView === 'bookmarks' ? 'Bookmarked Entries' : (archiveFilter ? `Archive: ${archiveFilter.month || ''} ${archiveFilter.year}` : activeJournal ? `Journal: ${activeJournal.name}` : 'All Entries');
                          setModalConfig({
                            title: 'Export Settings',
                            message: 'Choose how you want your entries ordered in the PDF.',
                            type: 'custom',
                            content: (
                              <div className="flex flex-col gap-3 mt-4">
                                <button onClick={() => { handleExportPDF(filteredEntries, listExportTitle, 'desc'); setModalConfig(null); }} className="px-4 py-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-[color:var(--theme-primary)] text-left flex flex-col transition-colors">
                                  <span className="font-bold text-zinc-900">Newest to Oldest</span>
                                  <span className="text-xs text-zinc-500">Most recent entries first</span>
                                </button>
                                <button onClick={() => { handleExportPDF(filteredEntries, listExportTitle, 'asc'); setModalConfig(null); }} className="px-4 py-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-[color:var(--theme-primary)] text-left flex flex-col transition-colors">
                                  <span className="font-bold text-zinc-900">Oldest to Newest</span>
                                  <span className="text-xs text-zinc-500">Chronological reading order</span>
                                </button>
                              </div>
                            ),
                            hideActions: true
                          });
                        }} 
                        className="p-1.5 hover:bg-white rounded-md transition-colors text-zinc-400 hover:text-zinc-900 hover:shadow-sm" 
                        title="Export List to PDF"
                      >
                        <Download size={16} />
                      </button>
                    )}
                    {activeView === 'entries' && !archiveFilter && !tagFilter && activeJournal && <button onClick={() => handleDeleteJournal(activeJournal.id)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-zinc-400 hover:text-red-600 hover:shadow-sm" title="Delete Journal"><Trash2 size={16} /></button>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white rounded-md transition-colors text-zinc-400 hover:text-zinc-900 hover:shadow-sm" title="Toggle Sidebar"><Menu size={18} /></button>
                  </div>
                </div>
                
                {(activeView === 'entries' || activeView === 'bookmarks') && (
                  <div className="relative mt-1 shadow-sm rounded-full">
                    <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
                    <input type="text" placeholder="Search tags or text..." className={`w-full pl-10 pr-4 py-2 text-sm rounded-full ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} focus-ring-accent outline-none transition-all`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                )}
              </div>

              <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${themeMode === 'dark' ? 'bg-zinc-950' : 'bg-transparent'}`}>
                {(activeView === 'entries' || activeView === 'bookmarks') && (filteredEntries.length > 0 ? (
                  filteredEntries.map(entry => {
                    const entryMoodObj = MOODS.find(m => m.id === entry.mood) || MOODS.find(m => m.id === 'neutral');
                    const EntryMoodIcon = entryMoodObj.icon;
                    const isSelected = selectedEntryId === entry.id;
                    const day = entry.createdAt.getDate();
                    const month = entry.createdAt.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    
                    return (
                      <button 
                        key={entry.id} 
                        onClick={() => { setSelectedEntryId(entry.id); setShowMobileDetail(true); }} 
                        // Updated List card styling for improved tactile response
                        className={`w-full text-left p-5 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-sm ${
                          isSelected 
                            ? `border-none ring-2 ring-offset-2 ring-[color:var(--theme-primary)] ${themeMode === 'dark' ? 'bg-zinc-800' : 'bg-white'}`
                            : `border border-zinc-100 hover:border-zinc-300 hover:shadow-md ${themeMode === 'dark' ? 'bg-zinc-900/50' : 'bg-white'}`
                        }`}
                      >
                        {entry.isBookmarked && (
                           <div className="absolute top-4 right-4 text-[color:var(--theme-primary)]">
                             <Bookmark size={14} className="fill-current" />
                           </div>
                        )}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center justify-start pt-1 min-w-[2.5rem]">
                            <span className={`font-serif text-3xl font-extrabold leading-none ${isSelected ? 'text-[color:var(--theme-primary)]' : 'text-zinc-800'}`}>{day}</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{month}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className={`font-heading font-bold text-base leading-tight truncate ${isSelected ? 'text-[color:var(--theme-primary)]' : 'text-zinc-800'}`}>{entry.title || 'Untitled Entry'}</h3>
                              <EntryMoodIcon size={14} className={`shrink-0 ${entryMoodObj.color}`} />
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{entry.content ? entry.content.replace(/<[^>]+>/g, '').substring(0, 100) : 'Empty entry...'}</p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex gap-1.5 mt-3 overflow-hidden flex-wrap">
                                {entry.tags.slice(0, 3).map(tag => ( <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10 border border-[color:var(--theme-primary)]/20 truncate max-w-[80px] meta-small-caps">#{tag}</span> ))}
                                {entry.tags.length > 3 && <span className="text-[10px] font-bold text-zinc-400 py-0.5">+{entry.tags.length - 3}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : ( <div className="p-8 text-center text-zinc-400 italic text-sm bg-white rounded-3xl border border-dashed border-zinc-200 shadow-sm">No entries found.</div> ))}

                {activeView === 'templates' && (templates.length > 0 ? (
                  templates.map(template => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                      <button 
                        key={template.id} 
                        onClick={() => { setSelectedTemplateId(template.id); setShowMobileDetail(true); }} 
                        className={`w-full text-left p-5 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-sm flex gap-4 ${
                          isSelected 
                            ? `border-none ring-2 ring-offset-2 ring-[color:var(--theme-primary)] ${themeMode === 'dark' ? 'bg-zinc-800' : 'bg-white'}`
                            : `border border-zinc-100 hover:border-zinc-300 hover:shadow-md ${themeMode === 'dark' ? 'bg-zinc-900/50' : 'bg-white'}`
                        }`}
                      >
                        <div className="flex flex-col items-center justify-start pt-1 min-w-[2.5rem]">
                          <LayoutTemplate size={20} className={isSelected ? 'text-[color:var(--theme-primary)]' : 'text-zinc-400'} />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className={`font-heading font-bold text-base mb-1.5 leading-tight ${isSelected ? 'text-[color:var(--theme-primary)]' : 'text-zinc-800'}`}>{template.name || 'Untitled Template'}</h3>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{template.content ? template.content.replace(/<[^>]+>/g, '').substring(0, 100) : 'Empty template...'}</p>
                        </div>
                      </button>
                    )
                  })
                ) : ( <div className="p-8 text-center text-zinc-400 italic text-sm bg-white rounded-3xl border border-dashed border-zinc-200 shadow-sm">No templates saved.</div> ))}

                <button onClick={activeView === 'entries' ? handleCreateEntry : handleCreateTemplate} className="w-full py-6 text-sm text-zinc-400 font-medium hover:text-[color:var(--theme-primary)] flex flex-col items-center gap-2 transition-colors rounded-3xl border-2 border-dashed border-zinc-200 hover:border-[color:var(--theme-primary)] hover:bg-[color:var(--theme-primary)]/5 mt-4 bg-white/50">
                  <div className="p-2"><Plus size={20} /></div>
                  {(activeView === 'entries' || activeView === 'bookmarks') ? 'New Entry' : 'New Template'}
                </button>
              </div>
            </div>
          )}

          {/* RENDER DYNAMIC CONTENT */}
          {renderContent()}

          {/* TEMPLATE PICKER MODAL */}
          {showTemplatePicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 mx-4 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-3"><div className="p-2 bg-[color:var(--theme-primary)] rounded-xl text-white shadow-sm"><LayoutTemplate size={18} /></div><h3 className="font-heading font-bold text-lg text-zinc-900">Insert Template</h3></div>
                  <button onClick={() => setShowTemplatePicker(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => applyTemplateToEntry(t)} className="w-full text-left p-4 rounded-2xl border border-zinc-200 hover:border-[color:var(--theme-primary)] hover:shadow-md hover:-translate-y-0.5 transition-all bg-zinc-50 hover:bg-white group">
                      <h4 className="font-heading font-bold text-zinc-800 group-hover:text-[color:var(--theme-primary)]">{t.name}</h4>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 mx-4 border border-zinc-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading font-bold text-lg text-zinc-900">{modalConfig.title || 'Attention'}</h3>
              {modalConfig.hideActions && <button onClick={() => setModalConfig(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18}/></button>}
            </div>
            {modalConfig.message && <p className={`text-zinc-600 text-sm leading-relaxed ${modalConfig.content ? 'mb-4' : 'mb-6'}`}>{modalConfig.message}</p>}
            
            {modalConfig.content}

            {!modalConfig.hideActions && (
              <div className="flex justify-end gap-3 mt-6">
                {modalConfig.type === 'confirm' && <button onClick={() => setModalConfig(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">Cancel</button>}
                <button onClick={() => { modalConfig.onConfirm?.(); setModalConfig(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${modalConfig.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-black/10' : 'bg-[color:var(--theme-primary)] hover:bg-primary-dark shadow-black/10'}`}>{modalConfig.confirmText || 'OK'}</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
