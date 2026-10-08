import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import KeyboardBackground from './components/KeyboardBackground';
import Navbar from './components/Navbar';
import ChapterSelect from './components/ChapterSelect';
import Numbers from './components/Numbers';
import About from './components/About';
import Experience from './components/Experience';
import Work from './components/Work';
import Skills from './components/Skills';
import OffTheClock from './components/OffTheClock';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SongDeck from './components/SongDeck';
import Showreel, { type ReelControls } from './reel/Showreel';
import { createKbDriver } from './reel/kbDriver';

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

export default function App() {
  const kb = useRef(createKbDriver());
  const reel = useRef<ReelControls | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((m) => (m === msg ? null : m)), 2600);
  }, []);

  const toggleBeans = useCallback(() => {
    const d = kb.current;
    d.beans = !d.beans;
    say(d.beans ? '☕ mode: the keys are coffee beans now' : '☕ mode off: back to keycaps');
  }, [say]);

  useEffect(() => {
    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const key = e.key.toLowerCase();
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        toggleBeans();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleBeans]);

  const explore = () => document.getElementById('numbers')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <KeyboardBackground driver={kb} />
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <Showreel kb={kb} controls={reel} onExplore={explore} />
      <main className="relative z-10">
        <Numbers />
        <About />
        <Experience />
        <Work />
        <Skills />
        <OffTheClock />
        <Achievements />
        <Contact />
      </main>
      <Footer />
      <SongDeck />
      <ChapterSelect open={paletteOpen} onClose={() => setPaletteOpen(false)} reel={reel} onBeans={toggleBeans} />
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full border border-crema/15 bg-espresso px-5 py-2.5 font-mono text-sm text-crema shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
