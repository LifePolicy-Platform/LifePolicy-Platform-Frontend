

export interface User {
    USERNAME: string
    DISPLAY_NAME: string
    ROLES: string
    ENABLED: boolean
}

export interface RegisterPayload {
    USERNAME: string
    PASSWORD: string
    DISPLAY_NAME: string
}

export interface UpdatePayload {
    PASSWORD: string
    DISPLAY_NAME: string
    ENABLED: boolean
    ROLE: string
}

export async function fetchUsers(): Promise<User[]> {
    const response = await api.get('/api/v1/auth/users')
    return response.data.DATA || []
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
    await api.post('/api/v1/auth/register', payload)
}

export async function updateUser(username: string, payload: RegisterPayload): Promise<void> {
    await api.put(`/api/v1/auth/user/${username}`, payload)
}

export async function deleteUser(username: string): Promise<void> {
    await api.delete(`/api/v1/auth/user/${username}`)
}