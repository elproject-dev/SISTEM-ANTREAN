import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

# Insert the scale logic
hook_logic = """  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevCalledRef = useRef<string | undefined>(undefined);

  // --- UI Scaling Logic ---
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const windowRatio = window.innerWidth / window.innerHeight;
      const targetRatio = 16 / 9;
      if (windowRatio < targetRatio) {
        setScale(window.innerWidth / 1920);
      } else {
        setScale(window.innerHeight / 1080);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // -------------------------"""

content = content.replace("""  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevCalledRef = useRef<string | undefined>(undefined);""", hook_logic)

# Replace the wrapper div
old_wrapper = """  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans select-none">
      <div 
        className="relative w-full aspect-video max-h-screen max-w-[calc(100vh*16/9)] bg-cover bg-center bg-no-repeat bg-slate-900 flex flex-col overflow-hidden shadow-2xl"
        style={{ backgroundImage: 'url(/bg_tv.png)' }}
      >"""

new_wrapper = """  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans select-none">
      <div 
        className="relative bg-cover bg-center bg-no-repeat bg-slate-900 flex flex-col overflow-hidden shadow-2xl shrink-0"
        style={{ 
          width: '1920px', 
          height: '1080px', 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
          backgroundImage: 'url(/bg_tv.png)' 
        }}
      >"""

content = content.replace(old_wrapper, new_wrapper)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Scaling logic applied successfully.")
