/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  Camera, 
  Focus, 
  Aperture, 
  Zap, 
  Maximize2, 
  Settings, 
  Info, 
  ChevronRight,
  Monitor,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const FlashIntro = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] bg-white pointer-events-none flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Zap className="w-24 h-24 text-black fill-black" />
      </motion.div>
    </motion.div>
  );
};

const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
      {/* Drifting Aperture Blades - Reduced count for performance */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`aperture-${i}`}
          initial={{ 
            x: (i * 30 + 10) + "%", 
            y: (i * 20 + 20) + "%",
            rotate: 0,
            opacity: 0 
          }}
          animate={{ 
            x: [(i * 30 + 10) + "%", (i * 30 + 40) + "%"],
            y: [(i * 20 + 20) + "%", (i * 20 + 50) + "%"],
            rotate: [0, 360],
            opacity: [0, 0.05, 0]
          }}
          transition={{ 
            duration: 25 + i * 5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute will-change-transform"
        >
          <Aperture className="w-32 h-32 text-white" strokeWidth={0.5} />
        </motion.div>
      ))}

      {/* Drifting Focus Reticles - Reduced count */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`focus-${i}`}
          initial={{ 
            x: (i * 25 + 5) + "%", 
            y: (i * 15 + 10) + "%",
            opacity: 0 
          }}
          animate={{ 
            x: [(i * 25 + 5) + "%", (i * 25 + 25) + "%"],
            y: [(i * 15 + 10) + "%", (i * 15 + 30) + "%"],
            opacity: [0, 0.1, 0]
          }}
          transition={{ 
            duration: 20 + i * 4, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute will-change-transform"
        >
          <Focus className="w-12 h-12 text-accent" strokeWidth={1} />
        </motion.div>
      ))}

      {/* Technical Data Strings */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`data-${i}`}
          initial={{ 
            x: i % 2 === 0 ? "-10%" : "110%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{ 
            x: i % 2 === 0 ? "110%" : "-10%",
            opacity: [0, 0.03, 0]
          }}
          transition={{ 
            duration: 30 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute font-mono text-[10px] text-white tracking-[0.5em] whitespace-nowrap"
        >
          ISO_100 // 1/4000S // F1.4 // 35MM // RAW_UNCOMPRESSED // AF_LOCKED
        </motion.div>
      ))}
    </div>
  );
};

const TechLabel = ({ label, value, className }: { label: string, value: string, className?: string }) => (
  <div className={cn("font-mono text-[10px] uppercase tracking-widest flex flex-col gap-1", className)}>
    <span className="text-white/40">{label}</span>
    <span className="text-white/90 font-medium">{value}</span>
  </div>
);

const HUD = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-4">
      {/* Top Bar - Floating Glass Pane */}
      <div className="mx-auto w-full max-w-[1800px] px-4 md:px-6 py-2 glass rounded-full border-white/10 pointer-events-auto">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-4 md:gap-8 items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[8px] md:text-[9px] font-bold tracking-widest whitespace-nowrap">VIEWFINDER_ON</span>
            </div>
            <div className="hidden sm:flex gap-4 md:gap-8 items-center">
              <TechLabel label="Shutter" value="1/4000s" />
              <TechLabel label="Aperture" value="f/1.2" />
              <TechLabel label="ISO" value="100" />
            </div>
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
            <div className="hidden md:block font-mono text-[8px] text-right opacity-30 leading-tight">
              POS_X: {coords.x.toString().padStart(4, '0')}
              <br />
              POS_Y: {coords.y.toString().padStart(4, '0')}
            </div>
            <span className="font-mono text-[8px] md:text-[9px] opacity-50">{time}</span>
            <div className="flex gap-2 items-center">
              <span className="hidden xs:inline font-mono text-[8px] opacity-50 uppercase tracking-tighter">Batt</span>
              <div className="w-5 md:w-6 h-2 md:h-2.5 border border-white/20 p-0.5 rounded-[1px]">
                <motion.div 
                  className="h-full bg-white/80" 
                  animate={{ width: ["100%", "95%", "100%"] }} 
                  transition={{ duration: 10, repeat: Infinity }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rule of Thirds Grid */}
      <div className="absolute inset-0 flex pointer-events-none opacity-10 -z-10">
        <div className="w-1/3 h-full border-r border-white/50" />
        <div className="w-1/3 h-full border-r border-white/50" />
        <div className="absolute inset-0 flex flex-col">
          <div className="h-1/3 w-full border-b border-white/50" />
          <div className="h-1/3 w-full border-b border-white/50" />
        </div>
      </div>

      {/* Focus Brackets */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-accent/40 rounded-full" />
      </div>

      {/* Bottom Bar - Floating Glass Pane */}
      <div className="mx-auto w-full max-w-[1800px] px-4 md:px-6 py-2 glass rounded-full border-white/10 pointer-events-auto">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-4 md:gap-6 items-center">
            <div className="flex gap-2 md:gap-3">
              <button className="p-1 md:p-1.5 border border-white/5 rounded-full hover:bg-white/5 transition-colors">
                <Settings className="w-2.5 md:w-3 h-2.5 md:h-3" />
              </button>
              <button className="p-1 md:p-1.5 border border-white/5 rounded-full hover:bg-white/5 transition-colors">
                <Info className="w-2.5 md:w-3 h-2.5 md:h-3" />
              </button>
            </div>
            <div className="hidden sm:block font-mono text-[8px] opacity-30 tracking-tighter leading-tight">
              SD_CARD_A: 124_RAW_REMAINING
              <br />
              COLOR_PROFILE: PRO_LOG_V3
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex flex-col items-end">
              <div className="font-mono text-[7px] md:text-[8px] tracking-widest text-white/30 mb-0.5 uppercase">Exposure_Locked</div>
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={cn("w-0.5 h-1.5 md:h-2", i < 5 ? "bg-accent/60" : "bg-white/10")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CameraStage = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);

  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const springRotate = useSpring(rotate, { stiffness: 100, damping: 30 });

  return (
    <section className="relative h-[120vh] w-full flex flex-col items-center">
      <div className="sticky top-0 h-screen w-full flex items-start justify-center overflow-hidden pt-12 md:pt-20">
        {/* Atmospheric Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_50%_0%,rgba(255,78,0,0.1)_0%,transparent_70%)]" />
        </div>

        <motion.div 
          style={{ scale: springScale, rotate: springRotate, y, opacity }}
          className="relative z-10 flex flex-col items-center w-full max-w-7xl px-6"
        >
          {/* About Section (Left on Desktop, Below on Mobile) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="xl:absolute xl:left-10 xl:top-1/2 xl:-translate-y-1/2 flex flex-col gap-4 md:gap-6 max-w-sm z-20 order-2 xl:order-none mt-12 xl:mt-0 px-4 xl:px-0"
          >
            <div className="flex items-center gap-3 text-accent">
              <div className="w-6 h-px bg-accent" />
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase">About_Lumina</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-serif italic leading-tight">Crafting the narrative of light and shadow.</h2>
            <div className="space-y-4 text-white/40 font-sans text-xs leading-relaxed border-l border-white/10 pl-6">
              <p>We are a collective of visual storytellers dedicated to the pursuit of optical perfection.</p>
            </div>
          </motion.div>

          {/* Swinging Camera Container */}
          <div className="relative group perspective-1000 order-1 xl:order-none">
            <div className="absolute -inset-32 bg-accent/15 blur-[140px] rounded-full group-hover:bg-accent/20 transition-colors duration-1000" />
            
            <motion.div
              animate={{ 
                rotate: [-5, 5, -5],
                rotateY: [-10, 10, -10],
                y: [0, 10, 0]
              }}
              transition={{ 
                duration: 12, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ transformOrigin: "center -100vh" }}
              className="relative z-20 will-change-transform"
            >
              <img 
                src="/hanging%20camera.png" 
                alt="Lumina Rangefinder"
                className="w-[240px] sm:w-[320px] md:w-[420px] lg:w-[480px] h-auto drop-shadow-[0_60px_100px_rgba(0,0,0,0.8)] transition-all duration-1000 ease-in-out"
                referrerPolicy="no-referrer"
              />
              
              {/* Technical Lens Reflection Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.1)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </motion.div>
            
            {/* Floating Tech Annotations */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="absolute -right-10 md:-right-32 top-1/4 border-l border-white/10 pl-4 py-2 hidden xl:block"
            >
              <div className="font-mono text-[9px] text-white/40 mb-1 tracking-widest">LENS_MOUNT</div>
              <div className="text-sm md:text-lg font-serif italic tracking-tight">E-Mount System</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="absolute -left-10 md:-left-32 bottom-1/4 border-r border-white/10 pr-4 py-2 text-right hidden xl:block"
            >
              <div className="font-mono text-[9px] text-white/40 mb-1 tracking-widest">SENSOR_TECH</div>
              <div className="text-sm md:text-lg font-serif italic tracking-tight">Exmor RS CMOS</div>
            </motion.div>
          </div>

          {/* Technical Specs Section (Right on Desktop, Below on Mobile) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="xl:absolute xl:right-10 xl:top-1/2 xl:-translate-y-1/2 flex flex-col gap-6 md:gap-8 max-w-sm z-20 text-left xl:text-right order-3 xl:order-none mt-8 xl:mt-0 px-4 xl:px-0"
          >
            <div className="flex items-center gap-3 text-accent xl:justify-end">
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase">Optic_Specs</span>
              <div className="w-6 h-px bg-accent" />
            </div>
            <div className="space-y-4 md:space-y-6">
              <div>
                <div className="font-mono text-[8px] text-white/30 tracking-widest uppercase mb-1">Resolution_Output</div>
                <div className="text-2xl md:text-4xl font-serif italic leading-tight">9504 × 6336 px</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.h1 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0.15, 0]) }}
            className="text-[25vw] font-serif italic tracking-tighter text-white select-none whitespace-nowrap"
          >
            Lumina
          </motion.h1>
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-white/0 via-white/30 to-white/0"
        />
        <span className="font-mono text-[9px] tracking-[0.4em] opacity-30">SCROLL_TO_VIEW</span>
      </div>
    </section>
  );
};

const Gallery = () => {
  const { scrollYProgress } = useScroll();
  
  const images = [
    { url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=800", title: "Alpine Peak", meta: "1/2000s f/4.0 ISO 200", size: "large", parallax: -50 },
    { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800", title: "Mist Valley", meta: "1/500s f/2.8 ISO 400", size: "small", parallax: 80 },
    { url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800", title: "Azure Lake", meta: "1/1000s f/5.6 ISO 100", size: "small", parallax: -30 },
    { url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800", title: "Golden Hour", meta: "1/250s f/1.8 ISO 800", size: "large", parallax: 120 },
    { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", title: "Deep Forest", meta: "1/60s f/8.0 ISO 1600", size: "small", parallax: -60 },
    { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800", title: "Open Field", meta: "1/4000s f/2.0 ISO 50", size: "medium", parallax: 40 },
  ];

  return (
    <section className="py-48 px-6 max-w-[1800px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 md:mb-32 gap-8 px-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-accent mb-4">
            <div className="w-8 h-px bg-accent" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Selected_Works</span>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif italic tracking-tighter leading-none">The Art of Light</h2>
          <p className="mt-8 text-white/50 font-sans text-lg md:text-xl max-w-md leading-relaxed">
            Exploring the intersection of technical precision and emotional resonance through the lens of the Lumina X1.
          </p>
        </div>
        <div className="text-left md:text-right font-mono text-[10px] opacity-30 border-l border-white/10 pl-8">
          CATALOGUE_2026
          <br />
          VOL_01 // SERIES_A
          <br />
          <span className="text-accent opacity-100">SCROLL_TO_DISCOVER</span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-y-32 gap-x-12">
        {images.map((img, i) => {
          const yOffset = useTransform(scrollYProgress, [0, 1], [0, img.parallax]);
          
          return (
            <motion.div 
              key={i}
              style={{ y: yOffset }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-10%" }}
              className={cn(
                "group relative",
                img.size === "large" ? "md:col-span-8" : img.size === "medium" ? "md:col-span-6" : "md:col-span-4",
                i % 3 === 0 ? "md:ml-0" : i % 3 === 1 ? "md:ml-12" : "md:ml-24",
                i % 2 !== 0 ? "md:-mt-20" : "md:mt-20"
              )}
            >
              <div className="relative overflow-hidden bg-white/5 border border-white/10">
                {/* Technical Overlay */}
                <div className="absolute top-4 left-4 z-20 font-mono text-[8px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  REF_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                  <br />
                  COORD: {Math.floor(Math.random() * 90)}°N {Math.floor(Math.random() * 180)}°W
                </div>
                
                <motion.div 
                  className="aspect-[4/5] md:aspect-auto md:h-[600px] w-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img 
                    src={img.url} 
                    alt={img.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="mt-8 flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-px bg-accent" />
                    <span className="font-mono text-[8px] text-accent tracking-widest">CAPTURED_DATA</span>
                  </div>
                  <h3 className="text-4xl font-serif italic tracking-tight">{img.title}</h3>
                  <p className="font-mono text-[10px] opacity-40 mt-3 tracking-[0.2em]">{img.meta}</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-all duration-500 cursor-pointer">
                    <Info className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section className="pt-12 pb-24 md:pb-48 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
        <div className="relative">
          <div className="absolute -left-6 md:-left-12 -top-6 md:-top-12 text-[8rem] md:text-[16rem] font-serif italic text-white/[0.03] select-none pointer-events-none">
            01
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif italic tracking-tighter leading-[0.85] relative z-10">
            The Vision <br />
            <span className="text-accent">Behind the Lens</span>
          </h2>
        </div>
        <div className="space-y-8 md:space-y-12">
          <div className="flex items-center gap-3 text-accent">
            <div className="w-8 h-px bg-accent" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Our_Philosophy</span>
          </div>
          <p className="text-xl md:text-3xl font-serif italic text-white/80 leading-snug">
            Lumina Optics was founded on a singular principle: that technical perfection is merely the baseline for true artistic expression.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-8 md:pt-12 border-t border-white/10">
            <div className="space-y-4">
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">The_Mission</span>
              <p className="text-sm text-white/50 leading-relaxed font-sans">
                To engineer tools that disappear in the hands of the creator, leaving only the pure connection between eye and subject.
              </p>
            </div>
            <div className="space-y-4">
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">The_Legacy</span>
              <p className="text-sm text-white/50 leading-relaxed font-sans">
                Decades of optical research distilled into a single, uncompromising instrument for the modern era.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SpecsSection = () => {
  const specs = [
    { icon: <Cpu />, label: "PROCESSOR", value: "LUMINA_X1" },
    { icon: <Monitor />, label: "RESOLUTION", value: "61.0_MP" },
    { icon: <Activity />, label: "DYNAMIC_RANGE", value: "15_STOPS" },
    { icon: <Focus />, label: "AF_POINTS", value: "759_PHASE" },
  ];

  return (
    <section className="py-32 bg-white/5 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        {specs.map((spec, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center text-accent">
              {React.cloneElement(spec.icon as React.ReactElement, { size: 20 })}
            </div>
            <div>
              <div className="font-mono text-[10px] opacity-40 mb-1">{spec.label}</div>
              <div className="text-2xl font-bold tracking-tighter">{spec.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section className="pt-48 pb-0 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
        <div>
          <div className="flex items-center gap-3 text-accent mb-6">
            <div className="w-8 h-px bg-accent" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Connect_With_Us</span>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif italic tracking-tighter leading-none mb-8 md:mb-12">Start a Dialogue</h2>
          <p className="text-white/50 font-sans text-base md:text-lg max-w-md leading-relaxed mb-8 md:mb-12">
            Whether you're looking to commission a series or discuss technical specifications, our studio is open for collaboration.
          </p>
          
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">Direct_Line</span>
              <a href="tel:+1234567890" className="text-xl md:text-2xl font-serif italic hover:text-accent transition-colors">+1 (234) 567-890</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">Electronic_Mail</span>
              <a href="mailto:studio@lumina-optics.com" className="text-xl md:text-2xl font-serif italic hover:text-accent transition-colors">studio@lumina-optics.com</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative group border border-white/5">
            {/* Real Map Embed */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.733248043701!2d-118.2437!3d34.0522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c63425379d17%3A0x3557953fefcb0bb5!2sLos%20Angeles%20Arts%20District!5e0!3m2!1sen!2sus!4v1708470000000!5m2!1sen!2sus"
              className="absolute inset-0 w-full h-full grayscale invert opacity-40 contrast-125"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            {/* Technical UI Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[8px] tracking-widest text-accent">GPS_SIGNAL_LOCKED</span>
                </div>
                <div className="font-mono text-[8px] text-white/40 text-right">
                  SAT_LINK: ACTIVE
                  <br />
                  LAT: 34.0522
                  <br />
                  LON: -118.2437
                </div>
              </div>
              
              {/* Target Reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent" />
              </div>

              <div className="flex justify-between items-end">
                <div className="font-mono text-[8px] text-white/20">
                  MAP_RENDER_V4.2
                </div>
                <div className="w-12 h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent" 
                    animate={{ x: ["-100%", "100%"] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">Physical_Studio</span>
              <address className="not-italic text-sm text-white/60 leading-relaxed">
                824 Precision Way<br />
                Arts District, Suite 402<br />
                Los Angeles, CA 90013
              </address>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">Operating_Hours</span>
              <div className="text-sm text-white/60 leading-relaxed">
                MON — FRI<br />
                09:00 — 18:00 PST
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className="relative min-h-screen bg-black text-white font-sans selection:bg-accent selection:text-black overflow-x-hidden">
      <AnimatePresence>
        {!isLoaded && <FlashIntro onComplete={() => setIsLoaded(true)} />}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 tech-grid opacity-20 pointer-events-none" />
      <BackgroundElements />
      
      {/* Moving Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* HUD Overlay */}
      <HUD />

      {/* Content */}
      <div className={cn("transition-opacity duration-1000", isLoaded ? "opacity-100" : "opacity-0")}>
        <CameraStage />
        <AboutSection />
        <SpecsSection />
        <Gallery />
        <ContactSection />
        
        {/* Footer */}
        <footer className="pt-0 pb-20 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded">
                <Camera className="text-black w-6 h-6" />
              </div>
              <span className="font-bold tracking-tighter text-xl">ISO-9000</span>
            </div>
            <div className="flex gap-12 font-mono text-[10px] opacity-40">
              <a href="#" className="hover:text-accent transition-colors">TWITTER</a>
              <a href="#" className="hover:text-accent transition-colors">INSTAGRAM</a>
              <a href="#" className="hover:text-accent transition-colors">BEHANCE</a>
            </div>
            <div className="text-right font-mono text-[10px] opacity-40">
              © 2026 LUMINA_OPTICS
              <br />
              ALL_RIGHTS_RESERVED
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
