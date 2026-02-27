import * as settings from '../settings.js';
import { showToast } from '../components/toastNotification.js';

const userProfileStateStorageKey = "eolvisUserState";
const projectStateStorageKey = "eolvisProjectState";
const componentsStateStorageKey = "eolvisComponentState";
const pendingMutationStorageKey = "eolvisPendingMutation";

/**
 * Save the in-flight mutation to localStorage so it can be retried
 * after re-authentication. Only saves mutating requests (POST/PUT/DELETE).
 */
const savePendingMutation = (url, options) => {
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' || method === 'HEAD') return;

    try {
        const pending = {
            url,
            method,
            headers: options.headers,
            body: options.body || null,
            timestamp: Date.now()
        };
        localStorage.setItem(pendingMutationStorageKey, JSON.stringify(pending));
    } catch (e) {
        console.warn('Could not save pending mutation to localStorage:', e);
    }
};

/**
 * Redirect to re-authenticate. Saves the pending mutation (if any)
 * so it can be replayed after login.
 */
const redirectToLogin = (url = null, options = null) => {
    if (url && options) {
        savePendingMutation(url, options);
    }
    sessionStorage.clear();
    window.location.href = '/';
    return new Promise(() => {});
};

/**
 * Wrapper around fetch() that detects 401 (expired session) responses
 * and redirects the user to re-authenticate automatically.
 * Also catches network errors (TypeError: Failed to fetch) which occur
 * when an expired session causes a CORS-blocked redirect to the login page.
 * For mutating requests, the pending change is saved to localStorage before
 * redirecting so it can be replayed after re-authentication.
 */
const fetchWithAuth = async (url, options = {}) => {
    // Include X-Requested-With header for CSRF protection on all requests.
    options.headers = {
        'X-Requested-With': 'fetchWithAuth',
        ...options.headers
    };

    let response;
    try {
        response = await fetch(url, options);
    } catch (error) {
        // Network errors (e.g. CORS-blocked redirect to login page on expired session)
        // surface as TypeError: Failed to fetch. Treat as session expiry.
        if (error instanceof TypeError) {
            console.warn('Network error (likely expired session) — redirecting to login.', error);
            return redirectToLogin(url, options);
        }
        throw error;
    }

    if (response.status === 401) {
        console.warn('Session expired or unauthorized — redirecting to login.');
        return redirectToLogin(url, options);
    }

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response;
};

/**
 * Replay a pending mutation that was saved before an auth redirect.
 * Called once on page load after re-authentication. If the mutation
 * is older than 5 minutes it is discarded as stale.
 * Returns a Promise that resolves with { replayed: true/false }.
 */
const replayPendingMutation = async (callback) => {
    const raw = localStorage.getItem(pendingMutationStorageKey);
    if (!raw) return { replayed: false };

    localStorage.removeItem(pendingMutationStorageKey);

    let pending;
    try {
        pending = JSON.parse(raw);
    } catch {
        return { replayed: false };
    }

    // Discard mutations older than 5 minutes
    const MAX_AGE_MS = 5 * 60 * 1000;
    if (Date.now() - pending.timestamp > MAX_AGE_MS) {
        console.warn('Pending mutation expired, discarding.');
        showToast('Your previous change could not be saved (session timed out too long ago). Please try again.', 'warning');
        return { replayed: false };
    }

    try {
        console.info('Replaying pending mutation:', pending.method, pending.url);
        showToast('Re-submitting your previous change...', 'info');

        const replayOptions = {
            method: pending.method,
            headers: pending.headers || {}
        };
        if (pending.body) {
            replayOptions.body = pending.body;
        }

        await fetchWithAuth(pending.url, replayOptions);
        showToast('Your change was saved successfully after re-authentication.', 'success');

        // Refresh data to reflect the replayed mutation
        if (callback) {
            requestDataFromServer(callback);
        }

        return { replayed: true };
    } catch (error) {
        console.error('Failed to replay pending mutation:', error);
        showToast(`Your previous change could not be saved: ${error.message}. Please try again.`, 'error');
        return { replayed: false };
    }
};

const requestUserProfile = (callback) => {
    fetchWithAuth(`api/user/profile`)
        .then(response => response.json())
        .then(data => {
            saveUserProfileState(data);
            callback();
        })
        .catch(error => {
            const msg = `Error retrieving the user profile from the server: ${error}`;
            console.error(msg);
            showToast(msg, 'error');
        });
}

const saveUserProfileState = (data) => {
    try {
        sessionStorage.setItem(userProfileStateStorageKey, JSON.stringify(data));    
    } catch (error) {
        const msg = `Error saving user profile to store \r\n\r\n${error}`;
        console.error(msg);
    }
}

const userProfileStateExists = () => {
    return ((sessionStorage.getItem(userProfileStateStorageKey) === null) ? false : true);
}

const getUserProfileState = () => {
    if (!userProfileStateExists()) {
        showToast('Error: cannot retrieve user profile.', 'error');
        return JSON.parse('[]');
    }
    else {
        return JSON.parse(sessionStorage.getItem(userProfileStateStorageKey));
    }
}


const requestDataFromServer = (callback) => {
    fetchWithAuth(`api/projects/${settings.defaultProject}`)
        .then(response => response.json())
        .then(data => {
            saveProjectState(data);
        })
        .then(() => {
            fetchWithAuth(`api/projects/${settings.defaultProject}/components`)
                .then(response => response.json())
                .then(data => {
                    saveComponentState(data);
                    callback();
                })
        })
        .catch(error => {
            const msg = `Error retrieving the data from the server: ${error}`;
            console.error(msg);
            showToast(msg, 'error');
        });
}

const saveProjectState = (data) => {
    try {
        sessionStorage.setItem(projectStateStorageKey, JSON.stringify(data));
    } catch (error) {
        const msg = `Error saving project state to store: ${error}`;
        console.error(msg);
        showToast(msg, 'error');
    }
}

const projectStateExists = () => {
    return ((sessionStorage.getItem(projectStateStorageKey) === null) ? false : true);
}

const saveComponentState = (data) => {
    try {
        sessionStorage.setItem(componentsStateStorageKey, JSON.stringify(data));    
    } catch (error) {
        const msg = `Error saving data to store: ${error}`;
        console.error(msg);
        showToast(msg, 'error');
    }
}

const componentStateExists = () => {
    return ((sessionStorage.getItem(componentsStateStorageKey) === null) ? false : true);
}

const getProjectState = () => {
    if (!projectStateExists()) {
        showToast('Data lost. Please reload the app.', 'error');
        return JSON.parse('[]');
    }
    else {
        return JSON.parse(sessionStorage.getItem(projectStateStorageKey));
    }
}

const getComponentState = () => {
    if (!componentStateExists()) {
        showToast('Data lost. Please reload the app.', 'error');
        return JSON.parse('[]');
    }
    else {
        var project = getProjectState();
        var components = JSON.parse(sessionStorage.getItem(componentsStateStorageKey));        
        return {
            "projectName": project.projectName,
            "projectKey": project.projectKey,
            "components": components
        };
    }
}

const addItem = (item, callback) => {
    fetchWithAuth(`api/projects/${settings.defaultProject}/components`, 
        { method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([item])
        }
    )  
        .then(() => {
            requestDataFromServer(callback);
        })
        .catch(error => {
            const msg = `Error adding the item to the server: ${error}`;
            console.error(msg);
            showToast(msg, 'error');
        });
}

const updateItem = (item, callback) => {
    fetchWithAuth(`api/projects/${settings.defaultProject}/components/${item.id}`, 
        { method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        }
    )
        .then(() => {
            requestDataFromServer(callback);
        })
        .catch(error => {
            const msg = `Error updating the item on the server: ${error}`;
            console.error(msg);
            showToast(msg, 'error');
        });
}

const deleteItem = (id, callback) => {
    fetchWithAuth(`api/projects/${settings.defaultProject}/components/${id}`, 
        { method: 'DELETE' }
    )
        .then(() => {
            requestDataFromServer(callback);
        })
        .catch(error => {
            const msg = `Error deleting the item from the server: ${error}`;
            console.error(msg);
            showToast(msg, 'error');
        });
}

export {
    requestUserProfile,
    getUserProfileState,
    requestDataFromServer,
    getComponentState,
    addItem,
    updateItem,
    deleteItem,
    replayPendingMutation
}; 