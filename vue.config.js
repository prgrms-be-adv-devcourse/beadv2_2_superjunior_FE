const { defineConfig } = require("@vue/cli-service");

// 환경 변수에서 API URL 가져오기, 없으면 기본값 사용
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:8000";

module.exports = defineConfig({
  devServer: {
    host: "0.0.0.0", // 모든 네트워크 인터페이스에서 접근 가능
    port: 8080, // 프론트엔드 포트 명시
    proxy: {
      "/api": {
        target: API_BASE_URL, // 환경 변수 사용
        changeOrigin: true,
        logLevel: "debug", // ← 프록시 로그 활성화
        // pathRewrite 없음 = /api가 그대로 전달됨
        cookieDomainRewrite: "", // 쿠키 도메인 재작성
        secure: false, // HTTPS가 아닌 경우 false
      },
      "/swagger-ui.html": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/swagger-ui": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/v3/api-docs": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
  transpileDependencies: true,
});
