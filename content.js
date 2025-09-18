// 콘텐츠 스크립트 - 웹페이지에 주입되어 실행되는 스크립트

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('콘텐츠 스크립트가 로드되었습니다.');
    
    // 노션 페이지인지 확인
    if (isNotionPage()) {
        console.log('노션 페이지가 감지되었습니다.');
        setupNotionDdayFeatures();
    }
    
    // 페이지에 확장 프로그램 표시 추가
    addExtensionIndicator();
    
    // 키보드 단축키 설정
    setupKeyboardShortcuts();
});

// 노션 페이지인지 확인
function isNotionPage() {
    return window.location.hostname.includes('notion.so') || 
           window.location.hostname.includes('notion.site');
}

// 노션 페이지에서 D-Day 기능 설정
function setupNotionDdayFeatures() {
    // 노션 페이지에 D-Day 위젯 추가
    addNotionDdayWidget();
    
    // 노션 페이지의 날짜 요소들에 D-Day 표시 추가
    addDdayToNotionDates();
    
    // 노션 페이지 스크롤 시 D-Day 업데이트
    setupNotionScrollListener();
}

// 노션 페이지에 D-Day 위젯 추가
function addNotionDdayWidget() {
    // 기존 위젯이 있다면 제거
    const existingWidget = document.getElementById('notion-dday-widget');
    if (existingWidget) {
        existingWidget.remove();
    }
    
    // D-Day 위젯 생성
    const widget = document.createElement('div');
    widget.id = 'notion-dday-widget';
    widget.innerHTML = `
        <div class="notion-dday-container">
            <div class="notion-dday-header">
                <h3>📅 D-Day 계산기</h3>
                <button id="toggleDdayWidget" class="toggle-btn">−</button>
            </div>
            <div class="notion-dday-content">
                <div class="dday-input-section">
                    <input type="text" id="notionDdayName" placeholder="이벤트명 입력">
                    <input type="date" id="notionDdayDate">
                    <button id="notionCalculateDday" class="calculate-btn">계산</button>
                </div>
                <div id="notionDdayResult" class="dday-result-display"></div>
                <div class="dday-list-section">
                    <h4>저장된 D-Day</h4>
                    <div id="notionDdayList" class="dday-items-list"></div>
                </div>
            </div>
        </div>
    `;
    
    // 스타일 적용
    widget.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: white;
        border: 2px solid #e1e5e9;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
    `;
    
    // CSS 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .notion-dday-container {
            padding: 16px;
        }
        
        .notion-dday-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .notion-dday-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #37352f;
        }
        
        .toggle-btn {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #787774;
            padding: 4px;
            border-radius: 4px;
        }
        
        .toggle-btn:hover {
            background: #f1f1ef;
        }
        
        .dday-input-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }
        
        .dday-input-section input {
            padding: 8px 12px;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .dday-input-section input:focus {
            outline: none;
            border-color: #2383e2;
            box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.1);
        }
        
        .calculate-btn {
            background: #2383e2;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .calculate-btn:hover {
            background: #1a6bb8;
        }
        
        .dday-result-display {
            margin-bottom: 16px;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
        }
        
        .dday-result-success {
            background: #e8f5e8;
            color: #2e7d32;
            border: 1px solid #4caf50;
        }
        
        .dday-result-today {
            background: #fff3e0;
            color: #f57c00;
            border: 1px solid #ff9800;
        }
        
        .dday-result-past {
            background: #f5f5f5;
            color: #757575;
            border: 1px solid #9e9e9e;
        }
        
        .dday-list-section h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #37352f;
        }
        
        .dday-items-list {
            max-height: 150px;
            overflow-y: auto;
        }
        
        .dday-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin-bottom: 4px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #2383e2;
        }
        
        .dday-item-future {
            border-left-color: #4caf50;
        }
        
        .dday-item-today {
            border-left-color: #ff9800;
        }
        
        .dday-item-past {
            border-left-color: #9e9e9e;
        }
        
        .dday-item-content {
            flex: 1;
        }
        
        .dday-item-name {
            font-weight: 500;
            font-size: 13px;
            color: #37352f;
        }
        
        .dday-item-date {
            font-size: 12px;
            color: #787774;
        }
        
        .dday-item-status {
            font-size: 12px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.8);
        }
        
        .dday-item-future .dday-item-status {
            color: #4caf50;
        }
        
        .dday-item-today .dday-item-status {
            color: #ff9800;
        }
        
        .dday-item-past .dday-item-status {
            color: #9e9e9e;
        }
        
        .delete-dday-btn {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
        }
        
        .delete-dday-btn:hover {
            background: #cc0000;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(widget);
    
    // 이벤트 리스너 설정
    setupNotionDdayEventListeners();
}

// 노션 D-Day 이벤트 리스너 설정
function setupNotionDdayEventListeners() {
    const calculateBtn = document.getElementById('notionCalculateDday');
    const toggleBtn = document.getElementById('toggleDdayWidget');
    const content = document.querySelector('.notion-dday-content');
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateNotionDday);
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggleBtn.textContent = '−';
            } else {
                content.style.display = 'none';
                toggleBtn.textContent = '+';
            }
        });
    }
    
    // 노션 D-Day 목록 불러오기
    loadNotionDdayList();
}

// 노션에서 D-Day 계산
function calculateNotionDday() {
    const name = document.getElementById('notionDdayName').value.trim();
    const date = document.getElementById('notionDdayDate').value;
    
    if (!name || !date) {
        document.getElementById('notionDdayResult').innerHTML = 
            '<div class="dday-result-past">이벤트명과 날짜를 입력해주세요.</div>';
        return;
    }
    
    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let resultHtml = '';
    let resultClass = '';
    
    if (diffDays > 0) {
        resultClass = 'dday-result-success';
        resultHtml = `
            <div class="${resultClass}">
                <div style="font-size: 18px; margin-bottom: 4px;">D-${diffDays}</div>
                <div>${name}까지 ${diffDays}일 남았습니다!</div>
            </div>
        `;
    } else if (diffDays === 0) {
        resultClass = 'dday-result-today';
        resultHtml = `
            <div class="${resultClass}">
                <div style="font-size: 18px; margin-bottom: 4px;">D-Day!</div>
                <div>${name}이 오늘입니다!</div>
            </div>
        `;
    } else {
        resultClass = 'dday-result-past';
        resultHtml = `
            <div class="${resultClass}">
                <div style="font-size: 18px; margin-bottom: 4px;">D+${Math.abs(diffDays)}</div>
                <div>${name}이 ${Math.abs(diffDays)}일 전에 지났습니다.</div>
            </div>
        `;
    }
    
    document.getElementById('notionDdayResult').innerHTML = resultHtml;
    
    // D-Day 저장
    saveNotionDdayItem(name, date, diffDays);
}

// 노션 D-Day 아이템 저장
function saveNotionDdayItem(name, date, daysLeft) {
    chrome.storage.local.get(['ddayList'], function(result) {
        const ddayItems = result.ddayList || [];
        const newItem = {
            id: Date.now(),
            name: name,
            date: date,
            time: '23:59',
            daysLeft: daysLeft,
            createdAt: new Date().toISOString()
        };
        
        ddayItems.unshift(newItem);
        
        // 최대 10개까지만 저장
        if (ddayItems.length > 10) {
            ddayItems.splice(10);
        }
        
        chrome.storage.local.set({ ddayList: ddayItems }, function() {
            loadNotionDdayList();
        });
    });
}

// 노션 D-Day 목록 불러오기
function loadNotionDdayList() {
    chrome.storage.local.get(['ddayList'], function(result) {
        const ddayItems = result.ddayList || [];
        const listElement = document.getElementById('notionDdayList');
        
        if (!listElement) return;
        
        if (ddayItems.length === 0) {
            listElement.innerHTML = '<div style="text-align: center; color: #787774; font-style: italic;">저장된 D-Day가 없습니다.</div>';
            return;
        }
        
        let listHtml = '';
        ddayItems.forEach(item => {
            const targetDate = new Date(`${item.date}T${item.time}`);
            const now = new Date();
            const diffTime = targetDate - now;
            const currentDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let statusClass = '';
            let statusText = '';
            
            if (currentDaysLeft > 0) {
                statusClass = 'dday-item-future';
                statusText = `D-${currentDaysLeft}`;
            } else if (currentDaysLeft === 0) {
                statusClass = 'dday-item-today';
                statusText = 'D-Day!';
            } else {
                statusClass = 'dday-item-past';
                statusText = `D+${Math.abs(currentDaysLeft)}`;
            }
            
            listHtml += `
                <div class="dday-item ${statusClass}">
                    <div class="dday-item-content">
                        <div class="dday-item-name">${item.name}</div>
                        <div class="dday-item-date">${targetDate.toLocaleDateString('ko-KR')}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="dday-item-status">${statusText}</span>
                        <button class="delete-dday-btn" onclick="deleteNotionDdayItem(${item.id})">×</button>
                    </div>
                </div>
            `;
        });
        
        listElement.innerHTML = listHtml;
    });
}

// 노션 D-Day 아이템 삭제
function deleteNotionDdayItem(id) {
    chrome.storage.local.get(['ddayList'], function(result) {
        const ddayItems = result.ddayList || [];
        const filteredItems = ddayItems.filter(item => item.id !== id);
        
        chrome.storage.local.set({ ddayList: filteredItems }, function() {
            loadNotionDdayList();
        });
    });
}

// 전역 함수로 등록
window.deleteNotionDdayItem = deleteNotionDdayItem;

// 노션 페이지의 날짜 요소들에 D-Day 표시 추가
function addDdayToNotionDates() {
    // 노션 페이지에서 날짜 관련 요소들을 찾아서 D-Day 표시 추가
    const dateElements = document.querySelectorAll('[data-block-id], .notion-page-content');
    
    // 노션 페이지의 날짜 블록들을 찾아서 D-Day 정보 추가
    // 이 부분은 노션의 DOM 구조에 따라 조정이 필요할 수 있습니다
    console.log('노션 페이지의 날짜 요소들에 D-Day 표시를 추가합니다.');
}

// 노션 페이지 스크롤 리스너 설정
function setupNotionScrollListener() {
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            // 스크롤 시 D-Day 목록 업데이트
            loadNotionDdayList();
        }, 100);
    });
}

// 확장 프로그램 표시기 추가
function addExtensionIndicator() {
    // 이미 표시기가 있다면 제거
    const existingIndicator = document.getElementById('my-extension-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // 표시기 생성
    const indicator = document.createElement('div');
    indicator.id = 'my-extension-indicator';
    indicator.innerHTML = '🔧 My Extension Active';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    // 클릭 이벤트
    indicator.addEventListener('click', function() {
        // 팝업 열기 (실제로는 확장 프로그램 팝업을 열 수 없으므로 알림으로 대체)
        chrome.runtime.sendMessage({
            action: 'sendNotification',
            message: '확장 프로그램이 활성화되어 있습니다!'
        });
    });
    
    // 호버 효과
    indicator.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });
    
    indicator.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    });
    
    document.body.appendChild(indicator);
    
    // 3초 후 자동 숨김
    setTimeout(() => {
        indicator.style.opacity = '0.7';
    }, 3000);
}

// 키보드 단축키 설정
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl + Shift + E: 확장 프로그램 기능 활성화
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            toggleExtensionFeatures();
        }
        
        // Ctrl + Shift + S: 선택된 텍스트 검색
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            searchSelectedText();
        }
    });
}

// 확장 프로그램 기능 토글
function toggleExtensionFeatures() {
    const indicator = document.getElementById('my-extension-indicator');
    if (indicator) {
        const isVisible = indicator.style.display !== 'none';
        indicator.style.display = isVisible ? 'none' : 'block';
        
        chrome.runtime.sendMessage({
            action: 'sendNotification',
            message: isVisible ? '확장 프로그램 기능이 비활성화되었습니다.' : '확장 프로그램 기능이 활성화되었습니다.'
        });
    }
}

// 선택된 텍스트 검색
function searchSelectedText() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
        // 검색 결과를 페이지에 표시
        showSearchResult(selectedText);
        
        // 백그라운드 스크립트에 검색 기록 저장 요청
        chrome.runtime.sendMessage({
            action: 'saveSearchHistory',
            searchTerm: selectedText
        });
    } else {
        chrome.runtime.sendMessage({
            action: 'sendNotification',
            message: '검색할 텍스트를 선택해주세요.'
        });
    }
}

// 검색 결과 표시
function showSearchResult(searchTerm) {
    // 기존 검색 결과 제거
    const existingResult = document.getElementById('my-extension-search-result');
    if (existingResult) {
        existingResult.remove();
    }
    
    // 검색 결과 생성
    const resultDiv = document.createElement('div');
    resultDiv.id = 'my-extension-search-result';
    resultDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            max-width: 400px;
            text-align: center;
        ">
            <h3 style="color: #667eea; margin-bottom: 15px;">검색 결과</h3>
            <p style="margin-bottom: 15px;"><strong>검색어:</strong> "${searchTerm}"</p>
            <p style="color: #666; margin-bottom: 20px;">검색이 완료되었습니다.</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            ">닫기</button>
        </div>
    `;
    
    document.body.appendChild(resultDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (resultDiv.parentElement) {
            resultDiv.remove();
        }
    }, 5000);
}

// 메시지 리스너 (백그라운드 스크립트와 통신)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
        case 'searchWord':
            if (request.text) {
                showSearchResult(request.text);
            }
            sendResponse({ success: true });
            break;
            
        case 'highlightText':
            highlightText(request.text);
            sendResponse({ success: true });
            break;
            
        case 'getPageInfo':
            sendResponse({
                title: document.title,
                url: window.location.href,
                selectedText: window.getSelection().toString()
            });
            break;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// 텍스트 하이라이트 기능
function highlightText(text) {
    if (!text) return;
    
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.textContent.includes(text)) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const parent = textNode.parentElement;
        const content = textNode.textContent;
        const highlightedContent = content.replace(
            new RegExp(text, 'gi'),
            `<mark style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px;">$&</mark>`
        );
        
        if (highlightedContent !== content) {
            parent.innerHTML = parent.innerHTML.replace(content, highlightedContent);
        }
    });
}

// 페이지 스크롤 이벤트 (확장 프로그램 표시기 위치 조정)
window.addEventListener('scroll', function() {
    const indicator = document.getElementById('my-extension-indicator');
    if (indicator) {
        // 스크롤 시 표시기를 상단에 고정
        indicator.style.position = 'fixed';
        indicator.style.top = '10px';
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    const indicator = document.getElementById('my-extension-indicator');
    const searchResult = document.getElementById('my-extension-search-result');
    
    if (indicator) indicator.remove();
    if (searchResult) searchResult.remove();
});
