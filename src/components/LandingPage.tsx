import React from 'react';
import { Layers, ArrowRight, Sparkles, Image as ImageIcon, Download, Cpu, Grid, Zap, Command, Box, Workflow, CheckCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: () => void;
}

const staggeredContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.8 } }
};

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden selection:bg-[#CBFF00] selection:text-black">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-[#CBFF00]" />
          <span className="text-xl font-serif italic font-light tracking-wide">SeriesGen</span>
        </div>
        <div>
          <button 
            onClick={onStart}
            className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-black bg-[#CBFF00] px-6 py-2.5 hover:brightness-110 transition-all font-bold group"
          >
            Launch Interface
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-12 md:pt-32 md:pb-24 max-w-6xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          variants={staggeredContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 bg-[#CBFF00]/5 border border-[#CBFF00]/20 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-[#CBFF00]" />
            <span className="text-[10px] uppercase tracking-widest text-[#CBFF00]">System: Alpha-Core v2</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif italic font-light mb-6 leading-tight">
            Infinite Iterations. <br className="hidden md:block"/> Unyielding Consistency.
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-white/60 max-w-2xl text-lg md:text-xl font-light leading-relaxed mb-12">
            Transform a single prompt into a mathematically precise sequence of character poses, icons, or visual concepts. Engineered for concept artists, game developers, and visionary creators.
          </motion.p>

          <motion.button 
            variants={fadeUp}
            onClick={onStart}
            className="bg-[#CBFF00] text-black font-black px-10 py-5 uppercase tracking-[0.2em] text-sm hover:brightness-110 hover:scale-105 transition-all flex items-center gap-3 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initialize Generator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 w-full max-w-5xl aspect-video bg-[#0c0c0c] border border-white/10 flex flex-col relative overflow-hidden shadow-[0_0_100px_-20px_rgba(203,255,0,0.15)]"
        >
           <div className="h-8 border-b border-white/10 flex items-center px-4 gap-2 shrink-0 bg-[#080808]">
             <div className="w-2 h-2 rounded-full bg-white/20"></div>
             <div className="w-2 h-2 rounded-full bg-white/20"></div>
             <div className="w-2 h-2 rounded-full bg-white/20"></div>
             <div className="ml-auto flex gap-4 text-[8px] uppercase tracking-widest text-white/30 font-mono">
               <span>SYS_ACTIVE</span>
               <span className="text-[#CBFF00]">LATENCY: 12ms</span>
             </div>
           </div>
           
           <div className="flex-1 flex p-4 gap-4">
             {/* Mock Sidebar */}
             <div className="w-1/4 h-full border border-white/10 bg-white/5 p-4 flex flex-col relative overflow-hidden">
               <motion.div 
                 animate={{ opacity: [0.3, 0.6, 0.3] }} 
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-full h-4 bg-[#CBFF00]/20 mb-4 rounded-sm"
               />
               <div className="w-2/3 h-4 bg-white/10 mb-8 rounded-sm"></div>
               <div className="w-full h-24 bg-white/5 mb-4 rounded-sm border border-[#CBFF00]/30 border-dashed flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CBFF00]/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  <span className="font-mono text-[8px] text-[#CBFF00]/60 uppercase p-4 text-center">"A cybernetic hacker panda in neon streetwear, dynamic poses..."</span>
               </div>
               <div className="space-y-2 mt-4">
                 <div className="w-full h-2 bg-white/10 rounded-sm"></div>
                 <div className="w-4/5 h-2 bg-white/10 rounded-sm"></div>
                 <div className="w-5/6 h-2 bg-white/10 rounded-sm"></div>
               </div>
               <div className="mt-auto w-full h-8 bg-[#CBFF00]/20 rounded-sm flex items-center justify-center">
                 <span className="text-[6px] font-mono uppercase text-[#CBFF00] tracking-widest">Generating Grid...</span>
               </div>
             </div>
             
             {/* Mock Grid */}
             <div className="flex-1 h-full border border-white/10 bg-black p-4 grid grid-cols-3 gap-2 overflow-hidden relative">
               {/* Background scanning line effect */}
               <motion.div 
                 animate={{ top: ['-10%', '110%'] }}
                 transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                 className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#CBFF00]/5 to-transparent pointer-events-none z-10"
               />
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="border border-white/10 bg-white/5 flex flex-col transition-all hover:border-[#CBFF00]/50 relative group bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHElEQVR42mP8//8/A7HwMTIywvjEaBQOqPDBAABf0Qn1JbZ3YAAAAABJRU5ErkJggg==')]">
                   <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                     {/* Pseudo-image placeholders with delayed opacity */}
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: [0, 0.1, 0.4, 0.8] }}
                       transition={{ duration: 2, delay: 1 + (i * 0.2), repeat: Infinity, repeatType: "reverse" }}
                       className="absolute inset-[10%] border border-[#CBFF00]/20 rounded-md bg-[#CBFF00]/5"
                     />
                   </div>
                   <div className="h-6 border-t border-white/10 px-2 flex items-center justify-between bg-black z-20">
                     <span className="text-[5px] sm:text-[6px] font-mono uppercase text-[#CBFF00]/70 tracking-widest">POSE_{i+1}</span>
                     <Zap className="w-2 h-2 text-[#CBFF00]/40" />
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Gradient Overlay for Hero */}
           <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent pointer-events-none z-20"></div>
        </motion.div>
      </section>

      {/* System Metrics */}
      <section className="py-12 border-t border-white/10 bg-[#060606] overflow-hidden">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale">
            <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest"><Command className="w-5 h-5" /> Meta-Sys</div>
            <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest"><Box className="w-5 h-5" /> Nexus</div>
            <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest"><Workflow className="w-5 h-5" /> Synth-Corp</div>
            <div className="flex items-center gap-3 font-serif italic text-lg opacity-80">Ouroboros</div>
          </div>
        </div>
      </section>

      {/* Workflow / Pipeline */}
      <section className="py-24 bg-[#080808] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif italic mb-4 tracking-tight">The Generation Pipeline</h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Protocol 04 // Sequential Synthesis</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-12">
              {[
                { step: "01", title: "Character Anchoring", desc: "Define your core subject. The Alpha-Core generates a persistent blueprint that locks structural elements." },
                { step: "02", title: "Action Extraction", desc: "Specify variations like 'running', 'jumping', or 'attacking'. Our NLP layer translates these into precise spatial commands." },
                { step: "03", title: "Matrix Rendering", desc: "A singular high-density grid is rendered, ensuring the latent space does not drift between separate generations." },
                { step: "04", title: "Asset Splitting", desc: "The matrix is intelligently sliced into distinct, usable assets ready for direct export into your engine." }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="text-xl font-mono text-white/20 group-hover:text-[#CBFF00] transition-colors">{item.step}</div>
                  <div>
                    <h3 className="text-lg font-serif italic mb-2 text-white/90">{item.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-4 aspect-square flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWMHptMzkuNSAwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                 className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-[#CBFF00]/10 to-transparent blur-3xl rounded-full pointer-events-none"
              />
              
              <div className="relative z-10 w-full h-full flex flex-col gap-4">
                <div className="h-1/3 w-full border border-white/10 hover:border-[#CBFF00]/50 bg-black/50 backdrop-blur flex flex-col items-center justify-center transition-colors">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#CBFF00]/70 mb-2">Subject_Anchor</span>
                  <div className="w-16 h-16 border border-white/10 rounded-sm bg-white/5 mx-auto"></div>
                </div>
                <div className="flex-1 w-full flex gap-4 h-full">
                  <div className="w-1/2 h-full border border-white/10 hover:border-[#CBFF00]/50 bg-black/50 backdrop-blur flex flex-col items-center justify-center transition-colors">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Extract_01</span>
                    <div className="w-full flex-1 border border-white/5 rounded-sm bg-white/5 mx-4 mb-4"></div>
                  </div>
                  <div className="w-1/2 h-full border border-white/10 hover:border-[#CBFF00]/50 bg-black/50 backdrop-blur flex flex-col items-center justify-center transition-colors">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Extract_02</span>
                    <div className="w-full flex-1 border border-white/5 rounded-sm bg-white/5 mx-4 mb-4"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Features Stream */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/10 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWMHptMzkuNSAwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif italic mb-4 tracking-tight"> Engineered for Scale</h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Architecture Overview // Modules</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: "Semantic Locking",
                desc: "Our engine anchors initial traits and style concepts into a global seed, ensuring that characters don't mutate across varying poses."
              },
              {
                icon: Grid,
                title: "Grid Synthesis",
                desc: "Instead of fighting prompt variation, we generate comprehensive sprite sheets and intelligently auto-crop them into distinct assets."
              },
              {
                icon: Download,
                title: "Asset Pipelines",
                desc: "Export single frames or compressed ZIP packages with logical semantic naming, directly injectable into your design workflows."
              }
            ].map((Feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group border border-white/10 bg-black/50 p-8 hover:border-[#CBFF00]/30 transition-all hover:bg-white/[0.02]"
              >
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white/40 group-hover:text-[#CBFF00] group-hover:border-[#CBFF00]/30 transition-all group-hover:scale-110">
                  <Feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif italic mb-3 group-hover:text-[#CBFF00] transition-colors">{Feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  {Feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#080808] border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(203,255,0,0.03)_0%,transparent_50%)] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif italic mb-4 tracking-tight"> Compute Credits</h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Billing // Cost-efficient Architecture</p>
            <div className="mt-6 inline-flex border border-[#CBFF00]/30 bg-[#CBFF00]/5 px-4 py-2 text-xs font-mono text-[#CBFF00]/80">
              <span className="opacity-60 mr-2">SYS_NOTE:</span> 1 Credit = 1 Full Matrix Generation (up to 6 poses)
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Starter Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border border-white/10 bg-white/[0.02] p-8 hover:border-white/20 transition-all flex flex-col h-full"
            >
              <div className="mb-8">
                <h3 className="text-xl font-mono uppercase tracking-widest mb-2 text-white/80">Initiate</h3>
                <div className="text-4xl font-serif italic mb-4">$0 <span className="text-sm font-sans font-light text-white/40 not-italic">/ forever</span></div>
                <p className="text-sm text-white/40 leading-relaxed font-light">For hobbyists testing the Alpha-Core engine capability.</p>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3 text-sm text-[#CBFF00] font-bold">
                  <Cpu className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>5 Free Credits (One-Time)</span>
                </div>
                {["Standard Resolution (1x)", "Basic Action Slices", "Community Support", "$1.00 per additional credit"].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-[#CBFF00]/50 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={onStart}
                className="w-full py-4 border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Start Free
              </button>
            </motion.div>

            {/* Pro Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border border-[#CBFF00]/50 bg-[#CBFF00]/[0.02] p-8 relative flex flex-col h-full transform md:-translate-y-4 shadow-[0_0_40px_-15px_rgba(203,255,0,0.2)]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#CBFF00] text-black text-[10px] uppercase font-bold tracking-widest py-1 px-3">
                Creator Choice
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-mono uppercase tracking-widest mb-2 text-[#CBFF00]">Architect</h3>
                <div className="text-4xl font-serif italic mb-4">$29 <span className="text-sm font-sans font-light text-white/40 not-italic">/ month</span></div>
                <p className="text-sm text-white/40 leading-relaxed font-light">Sufficient compute resources for independent creators.</p>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3 text-sm text-[#CBFF00] font-bold">
                  <Cpu className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>50 Compute Credits / mo</span>
                </div>
                {["$0.80 per additional credit", "2x Upscaling Pipeline", "Commercial Usage Rights", "Fast Rendering Queue"].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/90">
                    <Check className="w-4 h-4 text-[#CBFF00] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={onStart}
                className="w-full py-4 bg-[#CBFF00] text-black hover:brightness-110 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Upgrade Protocol
              </button>
            </motion.div>

            {/* Studio Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border border-white/10 bg-white/[0.02] p-8 hover:border-white/20 transition-all flex flex-col h-full"
            >
              <div className="mb-8">
                <h3 className="text-xl font-mono uppercase tracking-widest mb-2 text-white/80">Syndicate</h3>
                <div className="text-4xl font-serif italic mb-4">$99 <span className="text-sm font-sans font-light text-white/40 not-italic">/ month</span></div>
                <p className="text-sm text-white/40 leading-relaxed font-light">Massive generation bandwidth for studios and agencies.</p>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3 text-sm text-[#CBFF00] font-bold">
                  <Cpu className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>200 Compute Credits / mo</span>
                </div>
                {["$0.60 per additional credit", "4x Max Upscaling", "Custom Style Anchors", "API Access Key"].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-[#CBFF00] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={onStart}
                className="w-full py-4 border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Deploy Engine
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-8 text-center relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#CBFF00]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif italic mb-8">Ready to compile?</h2>
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-12 py-6 bg-transparent border-2 border-[#CBFF00] text-[#CBFF00] font-bold text-sm uppercase tracking-[0.2em] hover:bg-[#CBFF00] hover:text-black transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">Initiate Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></span>
          </button>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-[10px] uppercase tracking-widest text-white/40 font-mono">
            <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#CBFF00]" /> No credit card required</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#CBFF00]" /> Export in standard formats</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#CBFF00]" /> Commercial usage rights</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-24 border-t border-white/10 flex flex-col md:flex-row items-center justify-between px-8 text-[10px] uppercase tracking-widest text-white/20 bg-[#080808]">
        <div>SeriesGen © 2026 // System Online</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="hover:text-white transition-colors cursor-pointer">Protocol</span>
          <span className="hover:text-white transition-colors cursor-pointer">Telemetry</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBFF00] inline-block shadow-[0_0_8px_#CBFF00]"></span>
            Engine by AI Studio
          </span>
        </div>
      </footer>
    </div>
  );
}

