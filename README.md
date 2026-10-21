# 🎸 Garden Tabs

> **Lightweight Web Guitar Tablature & Score Editor.**
> Editor minimalista de partituras e tablaturas para violão, guitarra e baixo: edição direta em grade interativa, braço de escala (fretboard) para visualização harmônica, motor de playback sintetizado via Web Audio API e exportação para ASCII e PDF.

Parte da **Garden Suite** — ferramentas de código aberto de nível Senior/Staff, 100% gratuitas, offline-first e orientadas a compositores independentes.

---

## ✨ Recursos

- 🎼 **Grade Interativa de Tablatura (6 Cordas)**: Clique e digite casas diretamente na grade com divisão rítmica por compasso.
- 🔊 **Playback Sintetizado (Web Audio API)**: Escute os riffs compostos em tempo real com controle de BPM e cursor rítmico.
- 🎸 **Braço de Guitarra Interativo (Fretboard)**: Toque cordas e casas de 0 a 15 para testar digitações e memorizar desenhos de escala.
- 📋 **Exportador ASCII Nativo**: Copie tablaturas limpas formatadas em texto puro para colar em chats, cifras ou fóruns.
- 🖨️ **Exportação PDF / Impressão**: Layout limpo preparado com `@media print` para imprimir folhas de partitura legíveis.
- 📱 **PWA & APK Android Nativo**: Empacotado via Capacitor (`@capacitor/android`) para compor riffs no sofá ou no ensaio da banda.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS v4 + Lucide Icons
- **Audio Core**: Web Audio API (Plucked string synthesis with dynamic lowpass filtering)
- **Mobile Engine**: Capacitor 8 (Android)
- **Testes & CI**: Vitest + GitHub Actions

---

## 🚀 Como Executar

### 1. Requisitos
- Node.js 20+
- npm 10+

### 2. Instalação e Desenvolvimento Web
```bash
git clone https://github.com/FelipeGardenghiDev/garden-tabs.git
cd garden-tabs
npm install
npm run dev
```

### 3. Testes Unitários
```bash
npm test
```

### 4. Build para Produção
```bash
npm run build
```

### 5. Executar no Android (APK / Emulador)
```bash
npm run mobile:sync
npm run mobile:open # Abre o projeto no Android Studio
```

---

## 📜 Licença

MIT License © 2026 Felipe Gardenghi. Feito para guitarristas, baixistas e compositores.
