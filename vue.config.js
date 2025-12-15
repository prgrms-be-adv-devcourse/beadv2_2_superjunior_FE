const { defineConfig } = require('@vue/cli-service')

// 환경 변수에서 API URL 가져오기, 없으면 기본값 사용
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000';

module.exports = defineConfig({
  devServer: {
    host: '0.0.0.0',  // 모든 네트워크 인터페이스에서 접근 가능
    port: 3000,  // 프론트엔드 포트 명시
    proxy: {
      '/api': {
        target: API_BASE_URL,  // 환경 변수 사용
        changeOrigin: true,
        logLevel: 'debug',  // ← 프록시 로그 활성화
        // pathRewrite 없음 = /api가 그대로 전달됨
        cookieDomainRewrite: '',  // 쿠키 도메인 재작성
        secure: false,  // HTTPS가 아닌 경우 false
        onProxyRes: function (proxyRes, req, res) {
          // 모든 응답 헤더 로그
          console.log('프록시 응답 상태:', proxyRes.statusCode);
          console.log('프록시 응답 헤더:', proxyRes.headers);
          
          // 쿠키 헤더 확인 및 Path 수정
          const setCookieHeaders = proxyRes.headers['set-cookie'];
          if (setCookieHeaders) {
            console.log('✅ 원본 쿠키:', setCookieHeaders);
            // Path=/api 또는 Path=/api/xxx를 Path=/로 변경
            proxyRes.headers['set-cookie'] = setCookieHeaders.map(cookie => {
              // Path=/api로 시작하는 모든 경우를 Path=/로 변경
              const modified = cookie.replace(/Path=\/api(\/[^;]*)?/gi, 'Path=/');
              console.log('쿠키 수정:', cookie, '→', modified);
              return modified;
            });
            console.log('✅ 수정된 쿠키:', proxyRes.headers['set-cookie']);
          } else {
            console.warn('⚠️ 프록시: Set-Cookie 헤더가 없습니다!');
          }
        }
      },
      '/swagger-ui.html': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/v3/api-docs': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
  transpileDependencies: true
})