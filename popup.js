// DOM 요소들
const notifyBtn = document.getElementById('notifyBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const searchSubmit = document.getElementById('searchSubmit');
const searchResult = document.getElementById('searchResult');
const autoNotify = document.getElementById('autoNotify');
const notifyInterval = document.getElementById('notifyInterval');

// D-Day 관련 DOM 요소들
const ddayName = document.getElementById('ddayName');
const ddayDate = document.getElementById('ddayDate');
const ddayTime = document.getElementById('ddayTime');
const calculateDday = document.getElementById('calculateDday');
const ddayResult = document.getElementById('ddayResult');
const ddayList = document.getElementById('ddayList');

// 확장 프로그램 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    loadDdayList();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 알림 버튼 클릭
    notifyBtn.addEventListener('click', sendNotification);
    
    // 검색 버튼 클릭
    searchBtn.addEventListener('click', performSearch);
    searchSubmit.addEventListener('click', performSearch);
    
    // 엔터키로 검색
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 설정 변경 시 저장
    autoNotify.addEventListener('change', saveSettings);
    notifyInterval.addEventListener('change', saveSettings);
    
    // D-Day 계산 버튼 클릭
    calculateDday.addEventListener('click', calculateDdayFunction);
}

// 알림 보내기 기능
function sendNotification() {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'My Extension',
            message: '알림이 전송되었습니다!'
        });
    } else {
        alert('알림이 전송되었습니다!');
    }
}

// 단어 검색 기능
function performSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        searchResult.innerHTML = '<p class="error">검색어를 입력해주세요.</p>';
        return;
    }
    
    // 검색 결과 표시 (예시)
    searchResult.innerHTML = `
        <div class="result-item">
            <h4>검색어: "${searchTerm}"</h4>
            <p>검색 결과를 찾았습니다.</p>
            <p>실제 검색 기능은 백엔드 API와 연동하여 구현할 수 있습니다.</p>
        </div>
    `;
    
    // 검색 기록 저장
    saveSearchHistory(searchTerm);
}

// 검색 기록 저장
function saveSearchHistory(searchTerm) {
    chrome.storage.local.get(['searchHistory'], function(result) {
        const history = result.searchHistory || [];
        history.unshift({
            term: searchTerm,
            timestamp: new Date().toISOString()
        });
        
        // 최대 10개까지만 저장
        if (history.length > 10) {
            history.splice(10);
        }
        
        chrome.storage.local.set({ searchHistory: history });
    });
}

// 설정 저장
function saveSettings() {
    const settings = {
        autoNotify: autoNotify.checked,
        notifyInterval: parseInt(notifyInterval.value)
    };
    
    chrome.storage.local.set({ settings: settings }, function() {
        console.log('설정이 저장되었습니다.');
    });
}

// 설정 불러오기
function loadSettings() {
    chrome.storage.local.get(['settings'], function(result) {
        const settings = result.settings || {};
        
        if (settings.autoNotify !== undefined) {
            autoNotify.checked = settings.autoNotify;
        }
        
        if (settings.notifyInterval) {
            notifyInterval.value = settings.notifyInterval;
        }
    });
}

// 현재 탭 정보 가져오기
function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}

// 웹사이트 방문 시 자동 알림 (백그라운드에서 실행)
function setupAutoNotification() {
    chrome.storage.local.get(['settings'], function(result) {
        const settings = result.settings || {};
        
        if (settings.autoNotify) {
            const interval = (settings.notifyInterval || 5) * 60 * 1000; // 분을 밀리초로 변환
            
            setInterval(() => {
                sendNotification();
            }, interval);
        }
    });
}

// 확장 프로그램 설치 시 초기화
chrome.runtime.onInstalled.addListener(function() {
    console.log('확장 프로그램이 설치되었습니다.');
    setupAutoNotification();
});

// D-Day 계산 기능
function calculateDdayFunction() {
    const name = ddayName.value.trim();
    const date = ddayDate.value;
    const time = ddayTime.value;
    
    if (!name || !date) {
        ddayResult.innerHTML = '<p class="error">이벤트명과 날짜를 입력해주세요.</p>';
        return;
    }
    
    const targetDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffTime = targetDateTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let resultHtml = '';
    if (diffDays > 0) {
        resultHtml = `
            <div class="dday-success">
                <h4>D-${diffDays}</h4>
                <p><strong>${name}</strong>까지 ${diffDays}일 남았습니다!</p>
                <p>목표일: ${targetDateTime.toLocaleDateString('ko-KR')} ${targetDateTime.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
            </div>
        `;
    } else if (diffDays === 0) {
        resultHtml = `
            <div class="dday-today">
                <h4>D-Day!</h4>
                <p><strong>${name}</strong>이 오늘입니다!</p>
            </div>
        `;
    } else {
        resultHtml = `
            <div class="dday-past">
                <h4>D+${Math.abs(diffDays)}</h4>
                <p><strong>${name}</strong>이 ${Math.abs(diffDays)}일 전에 지났습니다.</p>
            </div>
        `;
    }
    
    ddayResult.innerHTML = resultHtml;
    
    // D-Day 저장
    saveDdayItem(name, date, time, diffDays);
}

// D-Day 아이템 저장
function saveDdayItem(name, date, time, daysLeft) {
    chrome.storage.local.get(['ddayList'], function(result) {
        const ddayItems = result.ddayList || [];
        const newItem = {
            id: Date.now(),
            name: name,
            date: date,
            time: time,
            daysLeft: daysLeft,
            createdAt: new Date().toISOString()
        };
        
        ddayItems.unshift(newItem);
        
        // 최대 10개까지만 저장
        if (ddayItems.length > 10) {
            ddayItems.splice(10);
        }
        
        chrome.storage.local.set({ ddayList: ddayItems }, function() {
            loadDdayList();
        });
    });
}

// D-Day 목록 불러오기
function loadDdayList() {
    chrome.storage.local.get(['ddayList'], function(result) {
        const ddayItems = result.ddayList || [];
        
        if (ddayItems.length === 0) {
            ddayList.innerHTML = '<p class="no-items">저장된 D-Day가 없습니다.</p>';
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
                        <h5>${item.name}</h5>
                        <p class="dday-date">${targetDate.toLocaleDateString('ko-KR')} ${targetDate.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                        <span class="dday-status">${statusText}</span>
                    </div>
                    <button class="delete-btn" onclick="deleteDdayItem(${item.id})">×</button>
                </div>
            `;
        });
        
        ddayList.innerHTML = listHtml;
    });
}

// D-Day 아이템 삭제
function deleteDdayItem(id) {
    chrome.storage.local.get(['ddayList'], function(result) {
        const ddayItems = result.ddayList || [];
        const filteredItems = ddayItems.filter(item => item.id !== id);
        
        chrome.storage.local.set({ ddayList: filteredItems }, function() {
            loadDdayList();
        });
    });
}

// 전역 함수로 등록 (HTML에서 호출하기 위해)
window.deleteDdayItem = deleteDdayItem;

// 메시지 리스너 (다른 스크립트와 통신)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'search') {
        performSearch();
    } else if (request.action === 'notify') {
        sendNotification();
    } else if (request.action === 'getDdayList') {
        chrome.storage.local.get(['ddayList'], function(result) {
            sendResponse(result.ddayList || []);
        });
        return true;
    }
    
    sendResponse({ success: true });
});
