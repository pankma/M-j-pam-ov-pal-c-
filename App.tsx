import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  Handle,
  Position,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import {
  Archive,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleHelp,
  Clock3,
  FileText,
  Home,
  Link2,
  Menu,
  MoreHorizontal,
  Network,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UserRound,
  X,
  AlertCircle,
} from 'lucide-react'

const ORANGE = '#FF6B00'

type PalaceNodeType =
  | 'person'
  | 'institution'
  | 'event'
  | 'document'
  | 'note'
  | 'task'
  | 'question'
  | 'problem'
  | 'decision'
  | 'deadline'

type Palace = {
  id: string
  title: string
  description: string
  updatedAt: string
  nodes: Node[]
  edges: Edge[]
}

type SavedState = {
  palaces: Palace[]
}

const nodeTypesMeta: Record<PalaceNodeType, { label: string; icon: any }> = {
  person: { label: 'Osoba', icon: UserRound },
  institution: { label: 'Instituce', icon: Building2 },
  event: { label: 'Událost', icon: CalendarDays },
  document: { label: 'Dokument', icon: FileText },
  note: { label: 'Poznámka', icon: NotebookPen },
  task: { label: 'Úkol', icon: CheckCircle2 },
  question: { label: 'Otázka', icon: CircleHelp },
  problem: { label: 'Problém', icon: AlertCircle },
  decision: { label: 'Rozhodnutí', icon: CheckCircle2 },
  deadline: { label: 'Termín', icon: Clock3 },
}

const demoNodes: Node[] = [
  { id: 'n1', type: 'default', position: { x: 80, y: 70 }, data: { nodeType: 'person', title: 'Martina Nováková', description: 'Koordinuje projekt', date: '2026-09-28' } },
  { id: 'n2', type: 'default', position: { x: 390, y: 40 }, data: { nodeType: 'institution', title: 'Projektový tým', description: 'Hlavní pracovní skupina', date: '' } },
  { id: 'n3', type: 'default', position: { x: 330, y: 230 }, data: { nodeType: 'event', title: 'Úvodní schůzka', description: 'Kick-off projektu Aurora', date: '2026-09-30' } },
  { id: 'n4', type: 'default', position: { x: 650, y: 120 }, data: { nodeType: 'document', title: 'Zápis ze schůzky', description: 'Shrnutí rozhodnutí a úkolů', date: '2026-09-30' } },
  { id: 'n5', type: 'default', position: { x: 590, y: 330 }, data: { nodeType: 'task', title: 'Připravit návrh projektu', description: 'První pracovní verze', date: '2026-10-05' } },
  { id: 'n6', type: 'default', position: { x: 890, y: 250 }, data: { nodeType: 'question', title: 'Kdo schválí finální verzi?', description: 'Otevřená otázka', date: '' } },
]

const demoEdges: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', label: 'pracuje v', style: { stroke: ORANGE }, labelStyle: { fill: '#111', fontSize: 12 } },
  { id: 'e1-3', source: 'n1', target: 'n3', label: 'účastnila se', style: { stroke: '#BDBDBD' }, labelStyle: { fill: '#111', fontSize: 12 } },
  { id: 'e3-4', source: 'n3', target: 'n4', label: 'vznikl zápis', style: { stroke: ORANGE }, labelStyle: { fill: '#111', fontSize: 12 } },
  { id: 'e3-5', source: 'n3', target: 'n5', label: 'vyvolala', style: { stroke: '#BDBDBD' }, labelStyle: { fill: '#111', fontSize: 12 } },
  { id: 'e4-6', source: 'n4', target: 'n6', label: 'obsahuje otázku', style: { stroke: '#BDBDBD' }, labelStyle: { fill: '#111', fontSize: 12 } },
]

const seed: SavedState = {
  palaces: [
    {
      id: 'aurora',
      title: 'Projekt Aurora',
      description: 'Ukázkový palác pro propojení lidí, událostí, dokumentů a úkolů.',
      updatedAt: new Date().toISOString(),
      nodes: demoNodes,
      edges: demoEdges,
    },
  ],
}

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem('memory-palace-v1')
    return raw ? JSON.parse(raw) : seed
  } catch {
    return seed
  }
}

function saveState(state: SavedState) {
  localStorage.setItem('memory-palace-v1', JSON.stringify(state))
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[18px] border border-[#E7E7E7] bg-white shadow-soft ${className}`}>{children}</div>
}

function CustomNodeCard({ data, selected }: any) {
  const meta = nodeTypesMeta[data.nodeType as PalaceNodeType] ?? nodeTypesMeta.note
  const Icon = meta.icon
  return (
    <div className={`relative min-w-[190px] max-w-[230px] rounded-2xl border bg-white p-3.5 shadow-soft transition ${selected ? 'border-[#FF6B00] ring-4 ring-orange-100' : 'border-[#E7E7E7]'}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-[#FF6B00]" />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-[#FF6B00]" />
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FFF3EA] text-[#FF6B00]"><Icon size={16} /></span>
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#777]">{meta.label}</span>
      </div>
      <div className="text-sm font-semibold leading-5 text-[#111]">{data.title}</div>
      {data.description ? <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#777]">{data.description}</div> : null}
      {data.date ? <div className="mt-2 text-[11px] font-medium text-[#999]">{data.date}</div> : null}
    </div>
  )
}

const flowNodeTypes = { default: CustomNodeCard }

export default function App() {
  const [state, setState] = useState<SavedState>(() => loadState())
  const [activePalaceId, setActivePalaceId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [view, setView] = useState<'map' | 'list' | 'timeline'>('map')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewPalace, setShowNewPalace] = useState(false)
  const [showAddNode, setShowAddNode] = useState(false)
  const [newPalace, setNewPalace] = useState({ title: '', description: '' })
  const [newNode, setNewNode] = useState({ nodeType: 'note' as PalaceNodeType, title: '', description: '', date: '' })
  const [savedPulse, setSavedPulse] = useState(false)

  useEffect(() => {
    saveState(state)
    setSavedPulse(true)
    const timer = setTimeout(() => setSavedPulse(false), 900)
    return () => clearTimeout(timer)
  }, [state])

  const palace = useMemo(() => state.palaces.find((p) => p.id === activePalaceId) ?? null, [state, activePalaceId])
  const selectedNode = palace?.nodes.find((n) => n.id === selectedNodeId) ?? null

  const patchPalace = useCallback((id: string, updater: (p: Palace) => Palace) => {
    setState((s) => ({ ...s, palaces: s.palaces.map((p) => (p.id === id ? { ...updater(p), updatedAt: new Date().toISOString() } : p)) }))
  }, [])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    if (!palace) return
    patchPalace(palace.id, (p) => ({ ...p, nodes: applyNodeChanges(changes, p.nodes) }))
  }, [palace, patchPalace])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (!palace) return
    patchPalace(palace.id, (p) => ({ ...p, edges: applyEdgeChanges(changes, p.edges) }))
  }, [palace, patchPalace])

  const onConnect = useCallback((connection: Connection) => {
    if (!palace) return
    const relation = window.prompt('Jaký je vztah mezi těmito prvky?', 'souvisí s')?.trim() || 'souvisí s'
    patchPalace(palace.id, (p) => ({
      ...p,
      edges: addEdge({ ...connection, id: crypto.randomUUID(), label: relation, style: { stroke: ORANGE }, labelStyle: { fill: '#111', fontSize: 12 } }, p.edges),
    }))
  }, [palace, patchPalace])

  function editEdge(edge: Edge) {
    if (!palace) return
    const label = window.prompt('Název vztahu', String(edge.label ?? 'souvisí s'))
    if (label === null) return
    patchPalace(palace.id, (p) => ({ ...p, edges: p.edges.map((e) => e.id === edge.id ? { ...e, label } : e) }))
  }

  function createPalace() {
    if (!newPalace.title.trim()) return
    const created: Palace = {
      id: crypto.randomUUID(),
      title: newPalace.title.trim(),
      description: newPalace.description.trim(),
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    }
    setState((s) => ({ ...s, palaces: [created, ...s.palaces] }))
    setNewPalace({ title: '', description: '' })
    setShowNewPalace(false)
    setActivePalaceId(created.id)
  }

  function addNode() {
    if (!palace || !newNode.title.trim()) return
    const count = palace.nodes.length
    const node: Node = {
      id: crypto.randomUUID(),
      type: 'default',
      position: { x: 120 + (count % 4) * 230, y: 120 + Math.floor(count / 4) * 170 },
      data: { ...newNode, title: newNode.title.trim() },
    }
    patchPalace(palace.id, (p) => ({ ...p, nodes: [...p.nodes, node] }))
    setNewNode({ nodeType: 'note', title: '', description: '', date: '' })
    setShowAddNode(false)
    setSelectedNodeId(node.id)
  }

  function updateSelectedNode(data: Record<string, unknown>) {
    if (!palace || !selectedNode) return
    patchPalace(palace.id, (p) => ({ ...p, nodes: p.nodes.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...data } } : n) }))
  }

  function deleteSelectedNode() {
    if (!palace || !selectedNode) return
    patchPalace(palace.id, (p) => ({ ...p, nodes: p.nodes.filter((n) => n.id !== selectedNode.id), edges: p.edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id) }))
    setSelectedNodeId(null)
  }

  const filteredPalaces = state.palaces.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(search.toLowerCase()))

  if (!palace) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#111]">
        <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[#E7E7E7] bg-white p-5 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#111] text-white"><Network size={20} /></div>
              <div><div className="font-bold">Marti</div><div className="text-xs text-[#777]">Paměťový palác</div></div>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
          </div>
          <nav className="mt-8 space-y-1 text-sm">
            {[
              [Home, 'Domů', true], [Archive, 'Moje paláce', false], [NotebookPen, 'Všechny poznámky', false], [CheckCircle2, 'Úkoly', false], [CalendarDays, 'Časová osa', false], [FileText, 'Dokumenty', false], [Sparkles, 'AI centrum', false],
            ].map(([Icon, label, active]: any) => <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${active ? 'bg-[#FFF3EA] font-semibold text-[#FF6B00]' : 'text-[#555] hover:bg-[#F7F7F7]'}`}><Icon size={18}/>{label}</button>)}
          </nav>
          <div className="absolute bottom-5 left-5 right-5 border-t border-[#E7E7E7] pt-4"><button className="flex items-center gap-3 text-sm text-[#555]"><Settings size={18}/>Nastavení</button></div>
        </aside>

        <main className="lg:pl-[260px]">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#E7E7E7] bg-white/90 px-4 backdrop-blur lg:px-8">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={22}/></button>
            <div className="ml-auto text-xs text-[#999]">{savedPulse ? 'Uloženo' : 'Lokální autosave'}</div>
          </header>

          <div className="mx-auto max-w-7xl p-4 pb-28 sm:p-6 lg:p-10">
            <section className="mb-10 max-w-3xl">
              <div className="mb-3 text-sm font-semibold text-[#FF6B00]">Váš vizuální druhý mozek</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Dobré ráno 👋</h1>
              <p className="mt-3 text-base text-[#777] sm:text-lg">Co dnes chcete uložit, propojit nebo vyřešit?</p>
            </section>

            <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button onClick={() => setShowNewPalace(true)} className="rounded-2xl bg-[#FF6B00] p-5 text-left text-white shadow-soft transition hover:-translate-y-0.5"><Plus className="mb-7"/><div className="font-semibold">Nový palác</div><div className="mt-1 text-sm text-white/80">Vytvořit novou oblast</div></button>
              <Card className="p-5"><NotebookPen className="mb-7 text-[#FF6B00]"/><div className="font-semibold">Rychlá poznámka</div><div className="mt-1 text-sm text-[#777]">Zachytit myšlenku</div></Card>
              <Card className="p-5"><Sparkles className="mb-7 text-[#FF6B00]"/><div className="font-semibold">AI: Zpracovat text</div><div className="mt-1 text-sm text-[#777]">Připraveno pro další iteraci</div></Card>
              <Card className="p-5"><CheckCircle2 className="mb-7 text-[#FF6B00]"/><div className="font-semibold">Nový úkol</div><div className="mt-1 text-sm text-[#777]">Přidat do paláce</div></Card>
            </section>

            <div className="relative mb-10"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={20}/><input value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full rounded-2xl border border-[#E7E7E7] bg-white py-4 pl-12 pr-4 outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100" placeholder="Hledat ve vašem paměťovém paláci…"/></div>

            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Pokračovat</h2><span className="text-sm text-[#777]">{filteredPalaces.length} paláců</span></div>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPalaces.map((p) => (
                <button key={p.id} onClick={() => setActivePalaceId(p.id)} className="text-left">
                  <Card className="p-5 transition hover:-translate-y-1 hover:border-[#FFB47F]">
                    <div className="mb-8 flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#111] text-white"><Network size={20}/></div><MoreHorizontal className="text-[#999]"/></div>
                    <div className="text-lg font-bold">{p.title}</div><p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#777]">{p.description || 'Bez popisu'}</p>
                    <div className="mt-5 flex gap-4 border-t border-[#EEE] pt-4 text-xs text-[#777]"><span><b className="text-[#111]">{p.nodes.length}</b> prvků</span><span><b className="text-[#111]">{p.nodes.filter(n=>n.data.nodeType==='task').length}</b> úkolů</span><span><b className="text-[#111]">{p.nodes.filter(n=>n.data.nodeType==='document').length}</b> dokumentů</span></div>
                  </Card>
                </button>
              ))}
            </section>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around border-t border-[#E7E7E7] bg-white px-4 lg:hidden">
          <button className="grid place-items-center gap-1 text-xs text-[#FF6B00]"><Home size={20}/>Domů</button>
          <button className="grid place-items-center gap-1 text-xs text-[#777]"><Archive size={20}/>Paláce</button>
          <button onClick={() => setShowNewPalace(true)} className="grid h-14 w-14 -translate-y-4 place-items-center rounded-full bg-[#FF6B00] text-white shadow-lg"><Plus size={26}/></button>
          <button className="grid place-items-center gap-1 text-xs text-[#777]"><CheckCircle2 size={20}/>Úkoly</button>
          <button className="grid place-items-center gap-1 text-xs text-[#777]"><Search size={20}/>Hledat</button>
        </div>

        {showNewPalace && <Modal onClose={()=>setShowNewPalace(false)} title="Nový palác">
          <div className="space-y-4"><Field label="Název"><input autoFocus value={newPalace.title} onChange={e=>setNewPalace({...newPalace,title:e.target.value})} className="input" placeholder="Např. Diplomová práce"/></Field><Field label="Krátký popis"><textarea value={newPalace.description} onChange={e=>setNewPalace({...newPalace,description:e.target.value})} className="input min-h-24" placeholder="Co v tomto paláci budete řešit?"/></Field><button onClick={createPalace} className="w-full rounded-xl bg-[#FF6B00] px-4 py-3 font-semibold text-white">Vytvořit palác</button></div>
        </Modal>}
        <style>{`.input{width:100%;border:1px solid #E7E7E7;border-radius:12px;padding:12px 14px;outline:none;background:white}.input:focus{border-color:#FF6B00;box-shadow:0 0 0 4px #fff0e5}`}</style>
      </div>
    )
  }

  const displayNodes = palace.nodes.filter((n) => !search || `${n.data.title} ${n.data.description ?? ''}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7] text-[#111]">
      <aside className="hidden w-[250px] shrink-0 border-r border-[#E7E7E7] bg-white p-5 lg:block">
        <button onClick={()=>{setActivePalaceId(null);setSelectedNodeId(null)}} className="mb-7 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#111] text-white"><Network size={18}/></div><div className="text-left"><div className="font-bold">Marti</div><div className="text-xs text-[#777]">Paměťový palác</div></div></button>
        <nav className="space-y-1 text-sm"><button onClick={()=>setActivePalaceId(null)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[#555] hover:bg-[#F7F7F7]"><Home size={18}/>Domů</button><button className="flex w-full items-center gap-3 rounded-xl bg-[#FFF3EA] px-3 py-2.5 font-semibold text-[#FF6B00]"><Archive size={18}/>Moje paláce</button><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[#555]"><Sparkles size={18}/>AI centrum</button></nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-[#E7E7E7] bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={()=>{setActivePalaceId(null);setSelectedNodeId(null)}} className="grid h-9 w-9 place-items-center rounded-xl border border-[#E7E7E7] lg:hidden"><ChevronLeft size={18}/></button>
            <div className="min-w-0"><div className="text-xs text-[#999]">Moje paláce /</div><div className="truncate text-lg font-bold">{palace.title}</div></div>
            <div className="ml-auto flex items-center gap-2"><span className="hidden text-xs text-[#999] sm:block">{savedPulse ? 'Uloženo' : 'Autosave'}</span><button onClick={()=>setShowAddNode(true)} className="flex items-center gap-2 rounded-xl bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white"><Plus size={17}/> <span className="hidden sm:inline">Přidat</span></button></div>
          </div>
          <p className="mt-2 hidden max-w-3xl text-sm text-[#777] sm:block">{palace.description}</p>
          <div className="mt-3 flex items-center gap-1 overflow-x-auto rounded-xl bg-[#F7F7F7] p-1">
            {(['map','timeline','list'] as const).map(v=><button key={v} onClick={()=>setView(v)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${view===v?'bg-white text-[#111] shadow-sm':'text-[#777]'}`}>{v==='map'?'Mapa':v==='timeline'?'Časová osa':'Seznam'}</button>)}
            <div className="ml-auto hidden min-w-[230px] items-center gap-2 rounded-lg bg-white px-3 sm:flex"><Search size={15} className="text-[#999]"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-transparent py-2 text-sm outline-none" placeholder="Hledat v paláci…"/></div>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1">
          <section className="min-w-0 flex-1">
            {view === 'map' && (
              <ReactFlow nodes={displayNodes} edges={palace.edges} nodeTypes={flowNodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_,n)=>setSelectedNodeId(n.id)} onEdgeDoubleClick={(_,e)=>editEdge(e)} fitView className="bg-[#FAFAFA]">
                <Background color="#E9E9E9" gap={22} size={1}/><Controls/><MiniMap zoomable pannable nodeColor="#FF6B00" maskColor="rgba(247,247,247,.76)"/>
              </ReactFlow>
            )}
            {view === 'list' && <div className="h-full overflow-auto p-4 sm:p-6"><Card><div className="grid grid-cols-[1.5fr_.8fr_.8fr] gap-3 border-b border-[#EEE] p-4 text-xs font-semibold uppercase tracking-wide text-[#999]"><span>Název</span><span>Typ</span><span>Datum</span></div>{displayNodes.map(n=><button key={n.id} onClick={()=>setSelectedNodeId(n.id)} className="grid w-full grid-cols-[1.5fr_.8fr_.8fr] gap-3 border-b border-[#F0F0F0] p-4 text-left text-sm last:border-0 hover:bg-[#FAFAFA]"><span className="font-medium">{String(n.data.title)}</span><span className="text-[#777]">{nodeTypesMeta[n.data.nodeType as PalaceNodeType]?.label}</span><span className="text-[#777]">{String(n.data.date || '—')}</span></button>)}</Card></div>}
            {view === 'timeline' && <div className="h-full overflow-auto p-4 sm:p-6"><div className="mx-auto max-w-3xl space-y-4">{[...displayNodes].filter(n=>n.data.date).sort((a,b)=>String(a.data.date).localeCompare(String(b.data.date))).map(n=><button key={n.id} onClick={()=>setSelectedNodeId(n.id)} className="flex w-full gap-4 text-left"><div className="flex w-24 shrink-0 flex-col items-end pt-3 text-xs font-medium text-[#777]">{String(n.data.date)}</div><div className="relative flex w-5 justify-center"><div className="absolute inset-y-0 w-px bg-[#E7E7E7]"/><div className="relative mt-4 h-3 w-3 rounded-full border-2 border-white bg-[#FF6B00] shadow"/></div><Card className="flex-1 p-4"><div className="text-xs font-semibold uppercase text-[#999]">{nodeTypesMeta[n.data.nodeType as PalaceNodeType]?.label}</div><div className="mt-1 font-semibold">{String(n.data.title)}</div><div className="mt-1 text-sm text-[#777]">{String(n.data.description || '')}</div></Card></button>)}</div></div>}
          </section>

          {selectedNode && <NodeDetail node={selectedNode} onClose={()=>setSelectedNodeId(null)} onUpdate={updateSelectedNode} onDelete={deleteSelectedNode}/>} 

          <button onClick={()=>setShowAddNode(true)} className="absolute bottom-5 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-[#FF6B00] text-white shadow-xl lg:hidden"><Plus size={26}/></button>
        </div>
      </div>

      {showAddNode && <Modal onClose={()=>setShowAddNode(false)} title="Přidat prvek">
        <div className="space-y-4"><Field label="Typ"><select value={newNode.nodeType} onChange={e=>setNewNode({...newNode,nodeType:e.target.value as PalaceNodeType})} className="input">{Object.entries(nodeTypesMeta).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></Field><Field label="Název"><input autoFocus value={newNode.title} onChange={e=>setNewNode({...newNode,title:e.target.value})} className="input" placeholder="Název prvku"/></Field><Field label="Popis"><textarea value={newNode.description} onChange={e=>setNewNode({...newNode,description:e.target.value})} className="input min-h-20" placeholder="Volitelné"/></Field><Field label="Datum"><input type="date" value={newNode.date} onChange={e=>setNewNode({...newNode,date:e.target.value})} className="input"/></Field><button onClick={addNode} className="w-full rounded-xl bg-[#FF6B00] px-4 py-3 font-semibold text-white">Přidat do paláce</button></div>
      </Modal>}
      <style>{`.input{width:100%;border:1px solid #E7E7E7;border-radius:12px;padding:12px 14px;outline:none;background:white}.input:focus{border-color:#FF6B00;box-shadow:0 0 0 4px #fff0e5}`}</style>
    </div>
  )
}

function NodeDetail({ node, onClose, onUpdate, onDelete }: { node: Node; onClose: ()=>void; onUpdate:(d:Record<string,unknown>)=>void; onDelete:()=>void }) {
  const meta = nodeTypesMeta[node.data.nodeType as PalaceNodeType] ?? nodeTypesMeta.note
  const Icon = meta.icon
  return <aside className="absolute inset-x-0 bottom-0 z-30 max-h-[82%] overflow-auto rounded-t-[24px] border-t border-[#E7E7E7] bg-white p-5 shadow-2xl lg:static lg:w-[410px] lg:max-h-none lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none">
    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#DDD] lg:hidden"/>
    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF3EA] text-[#FF6B00]"><Icon size={19}/></div><div><div className="text-xs uppercase tracking-wide text-[#999]">{meta.label}</div><div className="font-semibold">Detail prvku</div></div></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[#F7F7F7]"><X size={18}/></button></div>
    <div className="mt-6 space-y-5"><Field label="Název"><input value={String(node.data.title || '')} onChange={e=>onUpdate({title:e.target.value})} className="input"/></Field><Field label="Typ"><select value={String(node.data.nodeType)} onChange={e=>onUpdate({nodeType:e.target.value})} className="input">{Object.entries(nodeTypesMeta).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></Field><Field label="Popis"><textarea value={String(node.data.description || '')} onChange={e=>onUpdate({description:e.target.value})} className="input min-h-28"/></Field><Field label="Datum"><input type="date" value={String(node.data.date || '')} onChange={e=>onUpdate({date:e.target.value})} className="input"/></Field><div className="rounded-2xl bg-[#F7F7F7] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-[#FF6B00]"/>AI souhrn</div><p className="text-sm leading-6 text-[#777]">AI vrstva je v MVP připravená jako UI. V další iteraci ji lze napojit na skutečné AI API.</p></div><button onClick={onDelete} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E7E7E7] px-4 py-3 text-sm font-semibold text-[#555] hover:bg-[#F7F7F7]"><Trash2 size={16}/>Odstranit prvek</button></div>
    <style>{`.input{width:100%;border:1px solid #E7E7E7;border-radius:12px;padding:12px 14px;outline:none;background:white}.input:focus{border-color:#FF6B00;box-shadow:0 0 0 4px #fff0e5}`}</style>
  </aside>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#777]">{label}</span>{children}</label>
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: ()=>void }) {
  return <div className="fixed inset-0 z-50 grid place-items-end bg-black/25 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-5" onMouseDown={onClose}><div className="w-full max-w-lg rounded-t-[24px] bg-white p-5 shadow-2xl sm:rounded-[24px] sm:p-6" onMouseDown={e=>e.stopPropagation()}><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7F7F7]"><X size={18}/></button></div>{children}</div></div>
}
