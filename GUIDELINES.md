# Diretrizes do Projeto — Garden Tabs

> Este documento serve como guia técnico e arquitetural para o desenvolvimento contínuo do **Garden Tabs** em qualquer estação de trabalho.

---

## 1. Visão & Princípios Fundamentais

1. **Agilidade de Rascunho:** A maioria dos softwares de partitura (Guitar Pro, Sibelius, MuseScore) é pesada, demora para abrir e exige múltiplos passos burocráticos. O Garden Tabs prioriza a rapidez: abrir o navegador ou app móvel e digitar o riff em menos de 10 segundos.
2. **100% Client-Side:** Todas as transcrições e playbacks ocorrem em memória na máquina local. Seus riffs originais não trafegam na nuvem.
3. **Padrão ASCII e Standard Notation:** Manter compatibilidade universal tanto com a visualização clássica de tablaturas em texto quanto com exportação para PDF.

---

## 2. Estrutura de Pastas e Módulos

```text
src/
├── core/
│   └── tab-engine.ts       # Cálculos de afinação, conversão Fret ➔ MIDI ➔ Hz e sintetizador
├── types/
│   └── index.ts            # Tipagens de Track, Measure, Column e afinações
├── components/
│   └── FretboardView.tsx   # Componente interativo de braço de guitarra
├── App.tsx                 # Grade de tablatura, playback loop e exportação
└── index.css               # Tailwind v4 e estilos de impressão
```

---

## 3. Próximos Passos Recomendados no Roadmap

1. **Parser de Tablatura em Texto (ASCII ➔ Grade):**
   - Permitir colar um bloco de tablatura de texto da internet para que o app popule automaticamente os compassos e colunas da grade.
2. **Afinações Customizáveis:**
   - Drop D (`D A D G B E`), DADGAD, Meio Tom Abaixo (`Eb Ab Db Gb Bb Eb`) e Baixo de 4/5 cordas.
3. **Exportação MIDI (.mid):**
   - Serializar a tablatura para arquivo MIDI polifônico para importação em DAWs.
