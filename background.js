chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: 'OFF'
    });
});

const linkedinURL = 'https://www.linkedin.com/';

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(linkedinURL)) {
        const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: nextState
        });

        if (nextState === 'ON') {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const newImageSrc = 'https://w7.pngwing.com/pngs/897/929/png-transparent-phineas-flynn-perry-the-platypus-ferb-fletcher-candace-flynn-dr-heinz-doofenshmirtz-others-hat-cartoon-unlimited-thumbnail.png';
                    function changeImageSrc(img) {
                        if (img.className.includes('EntityPhoto-circle-') || img.className.includes('profile-') || img.className.includes('-person')) {
                            img.dataset.originalSrc = img.src;
                            img.src = newImageSrc;
                        }
                    }
                    document.querySelectorAll('img').forEach(changeImageSrc);
                    // DOM Observer: Helps to update the new images inserted in the DOM when we sroll the web page
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            mutation.addedNodes.forEach((node) => {
                                if (node.tagName === 'IMG' && (node.className.includes('EntityPhoto-circle-') || img.className.includes('profile-') || img.className.includes('-person')) ) {
                                    changeImageSrc(node);
                                } else if (node.nodeType === 1) {
                                    node.querySelectorAll('img').forEach(changeImageSrc);
                                }
                            });
                        });
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                    window.imageObserver = observer;  // Store the observer to be able to disconnect it later
                }
            });
        } else if (nextState === 'OFF') {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    document.querySelectorAll('img').forEach(img => {
                        if ((img.className.includes('EntityPhoto-circle-') || img.className.includes('profile-') || img.className.includes('-person')) && img.dataset.originalSrc) {
                            img.src = img.dataset.originalSrc;
                            delete img.dataset.originalSrc;
                        }
                    });
                    if (window.imageObserver) {
                        window.imageObserver.disconnect();
                        delete window.imageObserver;
                    }
                }
            });
        }
    }
});
