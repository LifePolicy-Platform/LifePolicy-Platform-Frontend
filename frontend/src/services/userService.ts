import http from '@/api/http'

export interface User {
    USERNAME: string
    DISPLAY_NAME: string
    ROLE_CODE: string
    STATUS: string
}

export interface RegisterPayload {
    USERNAME: string
    PASSWORD: string
    DISPLAY_NAME: string
}

export interface UpdatePayload {
    PASSWORD: string
    DISPLAY_NAME: string
    STATUS: string
    ROLE: string
}

export async function fetchUsers(): Promise<User[]> {
    const response = await http.get('/api/v1/auth/users')
    return response.data.DATA || []
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
    await http.post('/api/v1/auth/register', payload)
}

export async function updateUser(username: string, payload: UpdatePayload): Promise<void> {
    await http.put(`/api/v1/auth/user/${username}`, payload)
}

export async function deleteUser(username: string): Promise<void> {
    await http.delete(`/api/v1/auth/user/${username}`)
}
