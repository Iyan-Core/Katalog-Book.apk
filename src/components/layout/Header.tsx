export default function Header() {
  return (
    <header style={{ 
      padding: '1rem', 
      background: '#1e293b', 
      color: 'white', 
      textAlign: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <h1 style={{ fontSize: '1.5rem', margin: 0 }}>📖 Katalog Aparfume</h1>
    </header>
  );
}
