let isRefreshing = false;
let refreshPromise = null;

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

async function refreshToken() {
    const response = await fetch('https://api.vickz.ru/refresh', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getRefreshToken()}`
        },
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.new_access_token);
    return data.new_access_token;
}

async function apiRequest({
    url,
    method = 'GET',
    params = {},
    body = null,
    auth = false,
    retry = true
}) {
    // Параметры в строку
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const headers = {
        'Content-Type': 'application/json',
    };

    if (auth) {
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response = await fetch(fullUrl, options);

    // Если токен истёк и это авторизованный запрос
    if (response.status === 401 && auth && retry) {
        console.log(123)
        try {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken();
            }

            const newAccessToken = await refreshPromise;
            isRefreshing = false;

            headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Повторяем запрос
            const retryOptions = {
                ...options,
                headers
            };

            response = await fetch(fullUrl, retryOptions);
        } catch (error) {
            localStorage.clear()
            window.location.href = '/#/login';
            throw error;
        }
    }

    return response;
}

export default apiRequest;