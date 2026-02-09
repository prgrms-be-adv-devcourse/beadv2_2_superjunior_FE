<template>
  <div id="app">
    <SiteHeader />
    <router-view />
  </div>
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue'
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  width: 100%;
}  
 
:root {
  --bg: #0a0a0a;
  --text: #ffffff;
  --surface: #1a1a1a;  
  --border: #2a2a2a;
  --border-strong: #3a3a3a;
  --muted: #999999;
  --hover: #2a2a2a;
  --btn-primary-bg: #ffffff;
  --btn-primary-hover: #f0f0f0;
  --btn-primary-text: #0a0a0a;
}

body.theme-light {
  --bg: #f0f2f5;
  --text: #111111;
  --surface: #ffffff;
  --border: #e0e0e0;
  --border-strong: #d0d0d0;
  --muted: #666666;
  --hover: #f5f5f5;
  --btn-primary-bg: #111111;
  --btn-primary-hover: #2a2a2a;
  --btn-primary-text: #ffffff;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}


#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface);
}

::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border);
}
</style>
