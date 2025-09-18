// 백그라운드 스크립트 - 확장 프로그램의 백그라운드에서 실행되는 서비스 워커

// 확장 프로그램 설치 시 실행
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('확장 프로그램이 설치되었습니다.');
    
    // 초기 설정값 저장
    chrome.storage.local.set({
        settings: {
            autoNotify: false,
            notifyInterval: 5
        },
        searchHistory: []
    });
    
    // 컨텍스트 메뉴 생성
    chrome.contextMenus.create({
        id: 'searchWord',
        title: '단어 검색',
        contexts: ['selection']
    });
    
    chrome.contextMenus.create({
        id: 'sendNotification',
        title: '알림 보내기',
        contexts: ['page']
    });
});

// 컨텍스트 메뉴 클릭 이벤트
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'searchWord') {
        // 선택된 텍스트로 검색
        const searchText = info.selectionText;
        if (searchText) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'searchWord',
                text: searchText
            });
        }
    } else if (info.menuItemId === 'sendNotification') {
        // 알림 보내기
        sendNotification('컨텍스트 메뉴에서 알림이 전송되었습니다!');
    }
});

// 탭 업데이트 이벤트 (웹사이트 방문 시 자동 알림)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        // 설정 확인
        chrome.storage.local.get(['settings'], function(result) {
            const settings = result.settings || {};
            
            if (settings.autoNotify) {
                // 특정 웹사이트에서만 알림 (예: 구글, 네이버 등)
                const targetSites = ['google.com', 'naver.com', 'youtube.com'];
                const isTargetSite = targetSites.some(site => tab.url.includes(site));
                
                if (isTargetSite) {
                    setTimeout(() => {
                        sendNotification(`${tab.title} 페이지를 방문했습니다!`);
                    }, 2000); // 2초 후 알림
                }
            }
        });
    }
});

// 알림 보내기 함수
function sendNotification(message) {
    // data URL로 간단한 아이콘 대체 (48x48 PNG)
    const iconDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAIElEQVRoge3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAwK8Gg9gAATs9m+IAAAAASUVORK5CYII=';
    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconDataUrl,
        title: 'My Extension',
        message: message || '알림이 전송되었습니다!'
    });
}

// 메시지 리스너 (다른 스크립트와 통신)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
        case 'sendNotification':
            sendNotification(request.message);
            sendResponse({ success: true });
            break;
            
        case 'getSettings':
            chrome.storage.local.get(['settings'], function(result) {
                sendResponse(result.settings || {});
            });
            return true; // 비동기 응답을 위해 true 반환
            
        case 'saveSettings':
            chrome.storage.local.set({ settings: request.settings }, function() {
                sendResponse({ success: true });
            });
            return true;
            
        case 'getSearchHistory':
            chrome.storage.local.get(['searchHistory'], function(result) {
                sendResponse(result.searchHistory || []);
            });
            return true;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// 알림 클릭 이벤트
chrome.notifications.onClicked.addListener(function(notificationId) {
    console.log('알림이 클릭되었습니다:', notificationId);
    
    // 현재 활성 탭으로 포커스
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { active: true });
        }
    });
});

// 주기적 알림 (설정에 따라)
function setupPeriodicNotification() {
    chrome.storage.local.get(['settings'], function(result) {
        const settings = result.settings || {};
        
        if (settings.autoNotify && settings.notifyInterval) {
            const interval = settings.notifyInterval * 60 * 1000; // 분을 밀리초로 변환
            
            setInterval(() => {
                sendNotification('주기적 알림입니다!');
            }, interval);
        }
    });
}

// 확장 프로그램 시작 시 주기적 알림 설정
setupPeriodicNotification();

// 스토리지 변경 감지
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.settings) {
        console.log('설정이 변경되었습니다:', changes.settings.newValue);
        
        // 설정 변경 시 주기적 알림 재설정
        setupPeriodicNotification();
    }
});
