'use client'

const modules = [
  { id: 'chengyu', name: '成语天空', desc: '成语学习工具', icon: '📖', path: '/chengyu' },
  { id: 'humor', name: '梗王争霸', desc: '幽默答题游戏', icon: '😂', path: 'https://phumorh5vc.vercel.app' },
  { id: 'japanese', name: '日语学习', desc: '日语速通', icon: '🇯🇵', path: 'https://phiraganavc.vercel.app' },
  { id: 'flashcard', name: '闪记', desc: 'AI笔记整理', icon: '📝', path: '/flashcard' },
]

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '20px',
      overflowX: 'hidden'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '600px', 
        margin: '0 auto', 
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#fff', fontSize: '2em', marginBottom: '10px' }}>Shinefore</h1>
        <p style={{ color: '#fff', marginBottom: '20px', fontSize: '14px' }}>工具集合</p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '12px',
          width: '100%'
        }}>
          {modules.map(m => (
            <a 
              key={m.id}
              href={m.path}
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 10px',
                background: '#fff',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#333',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: '1.5em', marginBottom: '8px' }}>{m.icon}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{m.name}</span>
              <span style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{m.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}