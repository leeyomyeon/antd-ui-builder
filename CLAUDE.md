# Antd UI Builder - 토이프로젝트

## 프로젝트 목표
Antd 컴포넌트를 드래그앤드롭으로 배치하면 JSX 코드를 자동 생성해주는 로컬 UI 빌더

## 기술 스택
- React 18 + Vite
- antd 5.x
- react-grid-layout (캔버스 드래그앤드롭)
- prismjs (코드 하이라이팅)

## 실행
npm install
npm run dev

## 주요 기능
1. **컴포넌트 팔레트** - antd 컴포넌트 드래그앤드롭 배치
2. **커스텀 테이블** - 행/열 설정, 셀 병합(Union-Find), 셀 내부 컴포넌트 배치
3. **컨테이너** - 중첩 컴포넌트 배치
4. **오버레이** - Alert, Spin, Modal, Drawer on/off 토글 (Canvas 영역 안에서만 렌더링)
5. **Layout Builder** - 행×열 그리드 설계, 셀 병합, 행 높이/열 너비 드래그 조절, 템플릿 저장
6. **Code Preview** - JSX 코드 자동 생성 + syntax highlight, 너비 조절 가능

## 파일 구조
src/
  components/
    Canvas.jsx           # 메인 캔버스 (react-grid-layout)
    CanvasItem.jsx       # 캔버스 아이템 (일반/컨테이너/테이블)
    NestedCanvas.jsx     # 컨테이너 내부 중첩 캔버스
    NestedCanvasItem.jsx # 중첩 캔버스 아이템
    LayoutCanvas.jsx     # 레이아웃 템플릿 렌더링 영역
    ComponentPalette.jsx # 좌측 컴포넌트 팔레트
    CodePreview.jsx      # 우측 코드 프리뷰 (Code/Overlay 탭)
    OverlayLayer.jsx     # 오버레이 렌더링 (Canvas 안에서만)
  pages/
    LayoutBuilder.jsx    # 레이아웃 편집 페이지
  utils/
    componentConfig.js   # 팔레트 컴포넌트 정의
    overlayConfig.js     # 오버레이 컴포넌트 정의
    codeGenerator.js     # 배치 상태 → JSX 코드 변환
    mergeUtils.js        # Union-Find 셀 병합 로직
    layoutStore.js       # 레이아웃 템플릿 상태 관리

## 주요 설계 결정
- 셀 병합: Union-Find 알고리즘, 직사각형만 허용
- 병합 모드: items 상태에 mergeMode 저장 → GridLayout isDraggable 제어
- 오버레이: antd portal 문제로 Modal/Drawer/Spin 직접 구현
- 레이아웃: 행×열 숫자 + merges 객체로 관리 (mergeUtils 재활용)
- Col 너비: 퍼센트 기반으로 헤더/colgroup 동일한 값 사용