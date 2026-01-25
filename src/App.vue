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
  --bg: #f7f7f8;
  --text: #111111;
  --surface: #ffffff;
  --border: #e2e2e7;
  --border-strong: #d0d0d6;
  --muted: #666666;
  --hover: #f0f0f3;
  --btn-primary-bg: #111111;
  --btn-primary-hover: #2a2a2a;
  --btn-primary-text: #ffffff;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

body.theme-light,
body.theme-light main,
body.theme-light header,
body.theme-light section,
body.theme-light article,
body.theme-light aside,
body.theme-light .page,
body.theme-light [class$='-page'],
body.theme-light [class*='page-'],
body.theme-light [class*='section'],
body.theme-light [class*='card'],
body.theme-light [class*='panel'],
body.theme-light [class*='wrapper'] {
  background: #ffffff !important;
  color: #111111 !important;
  border-color: #e2e2e7 !important;
}

body.theme-light .form-section,
body.theme-light .info-card,
body.theme-light .checkout-card,
body.theme-light .cart-item,
body.theme-light .selected-product-info,
body.theme-light .detail-content,
body.theme-light [class*='card'] {
  background: #ffffff;
  color: #111111;
  border-color: #e2e2e7;
}

body.theme-light input,
body.theme-light textarea,
body.theme-light select {
  background: #ffffff;
  color: #111111;
  border-color: #d0d0d6;
}

body.theme-light h1,
body.theme-light h2,
body.theme-light h3,
body.theme-light h4,
body.theme-light h5,
body.theme-light h6,
body.theme-light p,
body.theme-light span,
body.theme-light label,
body.theme-light li,
body.theme-light a {
  color: #111111;
}

body.theme-light .section-reason,
body.theme-light .form-hint,
body.theme-light .muted,
body.theme-light [class*='muted'] {
  color: #666666 !important;
}

body.theme-light *:not(img):not(svg):not(video):not(canvas):not(.status-badge):not(.badge) {
  background-color: #ffffff !important;
  color: #111111 !important;
  border-color: #e2e2e7 !important;
}

#app {
  min-height: 100vh;
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
