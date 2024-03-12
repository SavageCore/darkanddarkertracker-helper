let lastPage = '';
let menuAdded = false;
const profiles = localStorage.getItem('profiles') || '{}';

const localStore = localStorage.setItem;

localStorage.setItem = function (key, value) {
    const event = new Event('localUpdated');
    // @ts-ignore TS2339
    event.key = key;
    // @ts-ignore TS2339
    event.value = value;

    document.dispatchEvent(event);
    localStore.apply(this, [key, value]);
};


// Add css to ensure everything under .ant-menu is not selectable
const style = document.createElement('style');
style.innerHTML = '.ant-menu * { user-select: none; }';
document.head.appendChild(style);

const questTracker = async () => {
    const download = (data: string) => {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questData.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    const waitForElm = (selector: string) => {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // Add export button
    // Container: <div class="ant-col ant-col-18 css-6bq67f"><button type="button" role="switch" aria-checked="true" class="ant-switch button-margin css-6bq67f ant-switch-checked"><div class="ant-switch-handle"></div><span class="ant-switch-inner"><span class="ant-switch-inner-checked">Available Only</span><span class="ant-switch-inner-unchecked">Show All</span></span></button><button type="button" class="ant-btn css-6bq67f ant-btn-default button-margin"><span>Clear filters</span></button><button type="button" class="ant-btn css-6bq67f ant-btn-default button-margin"><span>Clear filters and sorters</span></button><button type="button" class="ant-btn css-6bq67f ant-btn-default button-margin"><span>Expand All</span></button><button type="button" class="ant-btn css-6bq67f ant-btn-default button-margin"><span>Collapse All</span></button></div>
    // Button: <button type="button" class="ant-btn css-6bq67f ant-btn-default button-margin"><span>Collapse All</span></button>
    const container = await waitForElm('.ant-col.ant-col-18.css-6bq67f') as HTMLElement;
    const exportButton: HTMLButtonElement = document.createElement('button');
    exportButton.type = 'button';
    exportButton.className = 'ant-btn css-6bq67f ant-btn-default button-margin';
    exportButton.innerHTML = '<span>Export</span>';
    exportButton.addEventListener('click', () => {
        // Take json from local storage "questData" and download it as a file
        const data = localStorage.getItem('questData');
        if (data) {
            download(data);
        }
    });

    container.appendChild(exportButton);

    // Add import button
    const importButton: HTMLButtonElement = document.createElement('button');
    importButton.type = 'button';
    importButton.className = 'ant-btn css-6bq67f ant-btn-default button-margin';
    importButton.innerHTML = '<span>Import</span>';
    importButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = () => {
            if (input.files) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const data = reader.result as string;
                    localStorage.setItem('questData', data);
                }
                reader.readAsText(file);
            }
        }
        input.click();
    });

    container.appendChild(importButton);

    // Add clear button
    const clearButton: HTMLButtonElement = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'ant-btn css-6bq67f ant-btn-default button-margin';
    clearButton.innerHTML = '<span>Clear</span>';
    clearButton.addEventListener('click', () => {
        localStorage.removeItem('questData');
        // Also clear current profile data
        const currentProfile = localStorage.getItem('currentProfile');
        if (currentProfile) {
            const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
            profiles[currentProfile].questData = {};
            localStorage.setItem('profiles', JSON.stringify(profiles));
        }

        // Reload page
        location.reload();
    });

    container.appendChild(clearButton);
}

const addProfiles = (submenu: HTMLUListElement) => {
    // For each profile, add a submenu item
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');

    Object.keys(profiles).forEach(profileName => {
        // Prevent adding the same profile multiple times
        if (submenu.querySelector(`[data-profile-id="${profileName}"]`)) {
            return;
        }

        const submenuItem: HTMLLIElement = document.createElement('li');
        submenuItem.role = 'menuitem';
        submenuItem.tabIndex = -1;
        // submenuItem.dataset.menuId = 'rc-menu-uuid-22873-1-7';
        submenuItem.dataset.profileId = profileName;
        submenuItem.className = 'ant-menu-item ant-menu-item-only-child';
        submenuItem.style.paddingLeft = '48px';

        const submenuItemContent: HTMLSpanElement = document.createElement('span');
        submenuItemContent.className = 'ant-menu-title-content';

        const profileNameSpan: HTMLSpanElement = document.createElement('span');
        profileNameSpan.innerHTML = profileName;

        submenuItemContent.appendChild(profileNameSpan);
        submenuItem.appendChild(submenuItemContent);
        submenu.appendChild(submenuItem);

        profileNameSpan.addEventListener('click', event => {
            event.preventDefault();
            localStorage.setItem('currentProfile', profileName);

            // Load quest data
            const profile = profiles[profileName];
            localStorage.setItem('questData', JSON.stringify(profile.questData));

            // Reload page
            location.reload();
        });

        // Add delete icon
        const deleteButton: HTMLSpanElement = document.createElement('span');
        deleteButton.role = 'img';
        deleteButton.setAttribute('aria-label', 'delete');
        deleteButton.className = 'anticon anticon-delete ant-menu-item-icon';
        // padding-left: 24px;
        deleteButton.style.paddingLeft = '0.25rem';

        const deleteButtonSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        deleteButtonSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        deleteButtonSvg.setAttribute('width', '1em');
        deleteButtonSvg.setAttribute('height', '1em');
        deleteButtonSvg.setAttribute('viewBox', '0 0 1024 1024');
        deleteButtonSvg.setAttribute('fill', 'rgb(95, 5, 5)');

        const deleteButtonPath: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        deleteButtonPath.setAttribute('d', 'M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32m-200 0H360v-72h304z');

        // Append path to SVG
        deleteButtonSvg.appendChild(deleteButtonPath);

        // Append SVG to span
        deleteButton.appendChild(deleteButtonSvg);

        // Add event listener for delete button
        deleteButton.addEventListener('click', event => {
            event.stopPropagation();
            if (confirm(`Are you sure you want to delete profile "${profileName}"?`)) {
                const newProfiles = JSON.parse(localStorage.getItem('profiles') || '{}');
                delete newProfiles[profileName];
                localStorage.setItem('profiles', JSON.stringify(newProfiles));
                submenu.removeChild(submenuItem);

                // If the deleted profile is the current profile, clear the current profile
                const currentProfile = localStorage.getItem('currentProfile');
                if (currentProfile === profileName) {
                    localStorage.removeItem('currentProfile');
                    localStorage.removeItem('questData');
                    location.reload();
                }
            }
        });

        // Append delete button to submenu item content
        submenuItemContent.appendChild(deleteButton);
        submenu.appendChild(submenuItem);
    });
};


const addSubMenu = (menu: HTMLElement) => {
    const submenu: HTMLUListElement = document.createElement('ul');
    submenu.className = 'ant-menu ant-menu-sub ant-menu-inline ant-menu-hidden';
    submenu.role = 'menu';
    // submenu.id = 'rc-menu-uuid-22873-1-sub1-popup';
    submenu.dataset.menuList = 'true';

    const submenuItem: HTMLLIElement = document.createElement('li');
    submenuItem.role = 'menuitem';
    submenuItem.tabIndex = -1;
    // submenuItem.dataset.menuId = 'rc-menu-uuid-22873-1-7';
    submenuItem.className = 'ant-menu-item ant-menu-item-only-child';
    submenuItem.style.paddingLeft = '48px';

    const submenuItemContent: HTMLSpanElement = document.createElement('span');
    submenuItemContent.className = 'ant-menu-title-content';

    const submenuItemLink: HTMLAnchorElement = document.createElement('a');
    // submenuItemLink.href = '#';
    submenuItemLink.innerHTML = 'Create Profile';
    submenuItemLink.id = 'createProfile';

    submenuItemContent.appendChild(submenuItemLink);
    submenuItem.appendChild(submenuItemContent);

    // Add + icon to submenu item
    // <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8"/><path fill="currentColor" d="M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8Z"/></svg>
    const subMenuItemIcon: HTMLSpanElement = document.createElement('span');
    subMenuItemIcon.role = 'img';
    subMenuItemIcon.setAttribute('aria-label', 'compass');
    subMenuItemIcon.className = 'anticon anticon-compass ant-menu-item-icon';
    subMenuItemIcon.style.paddingLeft = '0.25rem';

    const subMenuItemIconSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    subMenuItemIconSvg.setAttribute('viewBox', '64 64 896 896');
    subMenuItemIconSvg.setAttribute('focusable', 'false');
    subMenuItemIconSvg.setAttribute('data-icon', 'compass');
    subMenuItemIconSvg.setAttribute('width', '1em');
    subMenuItemIconSvg.setAttribute('height', '1em');
    subMenuItemIconSvg.setAttribute('fill', 'currentColor');
    subMenuItemIconSvg.setAttribute('aria-hidden', 'true');

    const subMenuItemIconPath: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    subMenuItemIconPath.setAttribute('d', 'M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8');
    const subMenuItemIconPath2: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    subMenuItemIconPath2.setAttribute('d', 'M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8Z');

    subMenuItemIconSvg.appendChild(subMenuItemIconPath);
    subMenuItemIconSvg.appendChild(subMenuItemIconPath2);

    subMenuItemIcon.appendChild(subMenuItemIconSvg);
    submenuItemContent.appendChild(subMenuItemIcon);

    submenu.appendChild(submenuItem);
    menu.appendChild(submenu);

    addProfiles(submenu);

    // Add event listener to show submenu
    menu.addEventListener('click', () => {
        submenu.classList.toggle('ant-menu-hidden');
    });

    // Add event listener to create profile
    submenuItemLink.addEventListener('click', () => {
        const profileName = prompt('Enter profile name');
        if (profileName) {

            const newProfiles = JSON.parse(profiles);
            newProfiles[profileName] = {};

            // Copy current quest data to new profile
            const questData = localStorage.getItem('questData') || '{}';
            const newProfile = newProfiles[profileName];
            newProfile.questData = JSON.parse(questData);
            localStorage.setItem('profiles', JSON.stringify(newProfiles));

            addProfiles(submenu);

            // Re-show submenu
            submenu.classList.toggle('ant-menu-hidden');
        }
    });
};

const addMenu = () => {
    const menu = document.querySelector('.ant-menu') as HTMLElement;
    if (!menu) {
        return;
    }

    const menuItem: HTMLLIElement = document.createElement('li');
    menuItem.className = 'ant-menu-submenu ant-menu-submenu-inline';
    menuItem.role = 'none';

    const menuItemContent: HTMLDivElement = document.createElement('div');
    menuItemContent.className = 'ant-menu-submenu-title';
    menuItemContent.role = 'menuitem';
    menuItemContent.tabIndex = -1;
    menuItemContent.setAttribute('aria-expanded', 'false');
    menuItemContent.setAttribute('aria-haspopup', 'true');
    menuItemContent.style.paddingLeft = '24px';
    menuItemContent.setAttribute('aria-controls', 'rc-menu-uuid-88531-1-sub3-popup');

    // Add icon
    const menuItemIcon: HTMLSpanElement = document.createElement('span');
    menuItemIcon.role = 'img';
    menuItemIcon.setAttribute('aria-label', 'compass');
    menuItemIcon.className = 'anticon anticon-compass ant-menu-item-icon';

    const menuItemIconSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    menuItemIconSvg.setAttribute('viewBox', '64 64 896 896');
    menuItemIconSvg.setAttribute('focusable', 'false');
    menuItemIconSvg.setAttribute('data-icon', 'compass');
    menuItemIconSvg.setAttribute('width', '1em');
    menuItemIconSvg.setAttribute('height', '1em');
    menuItemIconSvg.setAttribute('fill', 'currentColor');
    menuItemIconSvg.setAttribute('aria-hidden', 'true');

    const menuItemIconPath: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    menuItemIconPath.setAttribute('d', 'M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32m-40 728H184V184h656zM492 400h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8m0 144h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8m0 144h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8M340 368a40 40 0 1 0 80 0a40 40 0 1 0-80 0m0 144a40 40 0 1 0 80 0a40 40 0 1 0-80 0m0 144a40 40 0 1 0 80 0a40 40 0 1 0-80 0');

    menuItemIconSvg.appendChild(menuItemIconPath);
    menuItemIcon.appendChild(menuItemIconSvg);

    const menuItemTitle: HTMLSpanElement = document.createElement('span');
    menuItemTitle.className = 'ant-menu-title-content';
    menuItemTitle.innerHTML = 'Profiles';

    const menuItemArrow: HTMLElement = document.createElement('i');
    menuItemArrow.className = 'ant-menu-submenu-arrow';

    menuItemContent.appendChild(menuItemIcon);
    menuItemContent.appendChild(menuItemTitle);
    menuItemContent.appendChild(menuItemArrow);

    menuItem.appendChild(menuItemContent);
    menu.appendChild(menuItem);

    addSubMenu(menuItem);

    menuAdded = true;
}

// Track the current page via MutationObserver
const trackPage = () => {
    const observer = new MutationObserver(() => {
        if (lastPage === location.pathname) {
            return;
        }

        if (!menuAdded) {
            addMenu();
        }

        if (location.pathname === '/questtracker') {
            questTracker();
        }

        lastPage = location.pathname;
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

const trackQuestData = () => {
    const localStoreHandler = function (event: any) {
        if (event.key === 'questData') {
            // Update current profile's quest data
            const currentProfile = localStorage.getItem('currentProfile');
            if (!currentProfile) {
                return;
            }

            const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
            const profile = profiles[currentProfile];
            if (!profile) {
                return;
            }

            profile.questData = JSON.parse(event.value);
            localStorage.setItem('profiles', JSON.stringify(profiles));
        }
    };

    document.addEventListener("localUpdated", localStoreHandler, false);
}

trackPage();

trackQuestData();