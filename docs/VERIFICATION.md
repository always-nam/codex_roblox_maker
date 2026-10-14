# 검증 기록

2026-10-14 (한국 시간), 클라우드 `/workspace/codex_roblox_maker`, Node 24.19.0, 시스템 Chromium과 Playwright Core 1.64.0.

- `npm ci --cache /tmp/playcraft-npm-cache`: 잠금파일 설치 성공
- `npm run check`: 3개 JavaScript 파일 문법 검사 통과
- `npm test`: 12개 테스트 실행·통과, 실패/스킵 0
- `npm run test:browser`: 14개 검사 실행·통과
- 앱은 클라우드 내부 포트 3000에서 시작하고 실제 HTTP 요청으로 예시 및 프롬프트 생성 검증

브라우저에서 확인한 항목: 미연결 표시, 빈 입력 차단, 설정 반영, 복사 내용 일치, Markdown/텍스트 다운로드 내용 일치, 복사 대안, 서로 다른 3개 예시와 12항목, 원문 보존, 전체 기획 내보내기, AI 미연결 오류, 입력 보존/복원, 보관 열기/삭제, 중복 실행 방지, 취소, 오류/재시도, 360px 모바일 입력 및 결과 화면의 가로 넘침 없음, JavaScript 오류 없음.

오류/지연 브라우저 응답과 AI 제공자 응답은 모의했다. HTTP 서버의 타임아웃과 클라이언트 취소 전파는 실제 네트워크 요청으로 확인했다. 모의 AI 성공은 실제 AI 호출 검증이 아니다.

스크린샷은 테스트 중의 예시 입력/보관 결과이며 공개 배포 화면이 아니다. `screenshots/desktop.png`, `mobile.png`, `mobile-result.png`.

미검증: 실제 API 키/모델의 AI 호출, 실제 모바일 하드웨어, Roblox Studio에서의 게임 구현·실행, Docker 빌드, 공개 호스팅. 예시 수치·규칙은 설계 제안이며 Roblox 공식 흥행 기준이 아니다. 공식 OpenAI Responses/Structured Outputs 문서를 확인했으나 모든 Roblox 공식 정책을 재검증하지 않았다.

클라우드 설정 초안에 설치 스크립트와 시작 지침을 저장했다. 저장은 스크립트 실행이나 환경 게시를 의미하지 않는다. 공개 호스팅과 클라우드 환경 게시도 별개다.

## GitHub Pages 추가 검증

- `npm run build:pages`: 비밀/서버 파일을 제외한 dist 생성 성공
- `npm run test:pages`: 프로젝트 하위 경로에서 서버 API 없이 8개 브라우저 검사 통과
- 실제 GitHub Pages는 현재 비공개 저장소·요금제 제한으로 미배포
- GitHub API에서 저장소 읽기·쓰기·관리 권한 메타데이터 확인; Pages API는 통합 권한의 HTTP 403을 반환함. 저장소 관리 권한 메타데이터가 모든 API 접근을 보장하지 않음

## Android 프롬프트 메이커 추가

2026-10-14, 대상은 Google Play Android용 프롬프트 작성 도구이며 게임 자체 제작은 외부 AI에서 수행한다.

- 모바일 자산 빌드/Capacitor 동기화 성공
- Node/HTTP 테스트 12개 통과
- 모바일 UI 브라우저 검사: 역할 문구·AI 호출 버튼 없음·복사/파일 내보내기 네이티브 브리지 계약(모의)·보관 복원·12개 예시 항목·360px 가로 넘침 없음·API 요청 없음·JavaScript 오류 없음 확인
- store/assets 화면 미리보기는 웹 렌더링 결과이며 실제 Android 스크린샷이 아님
- 실제 휴대폰 설치·네이티브 클립보드/공유·WebView·회전/뒤로 가기·접근성 검사는 미실행
- Google Play 계정/결제/업로드/심사/정식 등록 및 남대표님 소유 업로드 서명키 생성은 미실행
- Android 최종 빌드/검사 결과는 빌드 완료 후 추가 기록

Android 빌드 완료 결과:

- 최신 앱 자산/아이콘 변경 후 필요한 타깃을 다시 빌드: `:app:assembleDebug`, `:app:bundleRelease`, `:app:lintDebug` 성공
- 앱 lint: 오류 0, 경고 31 (도구/의존성 버전, 백업 규칙 권고, 아이콘/미사용 자원 등). 의존성의 기존 baseline이 일부 upstream 항목을 필터링함; 모든 의존성 경고가 없다고 주장하지 않음
- 디버그 APK의 v2 서명 검증 성공, 앱 ID/1.0.0/API24~36 확인
- APK 내부의 최신 native UI·프롬프트·개인정보 안내·네이티브 JS 자산 확인, .env/키스토어 파일 없음
- 병합 Android Manifest에 INTERNET 권한 없음, 자동 백업 비활성화. 내보내기 공유는 사용자 실행
- AAB는 미서명 확인. Play 제출용으로 사용하려면 본인 업로드키 서명 필요
- 실제 Android 기기/에뮬레이터에서는 실행하지 않았으므로 설치·WebView·네이티브 플러그인 동작은 미검증
