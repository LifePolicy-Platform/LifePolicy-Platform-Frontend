<script setup lang="ts">
import { ref } from 'vue'
import type { ShowList } from '../types/todoList'

const showLists = ref<ShowList[]>([])
const textbox = ref('')

function removeTodo(id: string) {
    showLists.value = showLists.value.filter((item) => item.id !== id)
        .map((item, index) => ({
            ...item,
            id: String(index + 1),
        }))
}


function addTodo() {
    const text = textbox.value.trim()

    if (!text) {
        alert('請輸入內容')
        return
    }

    showLists.value.push({
        id: String(showLists.value.length + 1),
        text,
        isDone: false,
    })

    textbox.value = ''
}
</script>

<template>
    <section class="todo-page">
        <article class="todo-card">
            <h2 class="todo-title">待辦清單</h2>

            <div class="todo-table">
                <div class="todo-row todo-row--head">
                    <span class="todo-cell todo-cell--id">項次</span>
                    <span class="todo-cell todo-cell--check">已完成</span>
                    <span class="todo-cell todo-cell--text">待辦事項</span>
                    <span class="todo-cell todo-cell--delete">刪除</span>
                </div>

                <ul v-if="showLists.length" class="todo-list">
                    <li v-for="showList in showLists" :key="showList.id" class="todo-row">
                        <span class="todo-cell todo-cell--id">{{ showList.id }}</span>
                        <span class="todo-cell todo-cell--check">
                            <input v-model="showList.isDone" type="checkbox" />
                        </span>
                        <span class="todo-cell todo-cell--text" :class="{ 'todo-cell--done': showList.isDone }">
                            {{ showList.text }}
                        </span>
                        <span class="todo-cell todo-cell--delete">
                            <button type="button" class="todo-delete" aria-label="刪除" @click="removeTodo(showList.id)">
                                <img src="/src/assets/close.png" alt="" width="20" height="20" />
                            </button>
                        </span>
                    </li>
                </ul>

                <p v-else class="todo-empty">尚無待辦，請在下方新增。</p>
            </div>

            <form class="todo-form" @submit.prevent="addTodo">
                <input v-model="textbox" type="text" placeholder="新增待辦事項" />
                <button type="submit" class="todo-submit">新增</button>
            </form>
        </article>
    </section>
</template>

<style scoped>
.todo-page {
    max-width: 720px;
}

.todo-card {
    background: #ffffff;
    border: 1px solid var(--line, #e5e7eb);
    border-radius: var(--radius-xl, 16px);
    padding: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.todo-title {
    margin: 0 0 20px;
    font-size: 1.35rem;
    color: var(--text, #1d2b2a);
}

.todo-table {
    margin-bottom: 20px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
}

.todo-row {
    display: grid;
    grid-template-columns: 56px 72px 1fr 56px;
    align-items: stretch;
    gap: 0;
}

.todo-row--head {
    font-size: 0.85rem;
    font-weight: 700;
    color: #6b7280;
    background: #f9fafb;
}

.todo-row--head .todo-cell {
    justify-content: center;
}

.todo-row--head .todo-cell--text {
    justify-content: flex-start;
}

.todo-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.todo-cell {
    display: flex;
    align-items: center;
    padding: 12px 10px;
    border: 1px solid #d1d5db;
    margin: -1px 0 0 -1px;
    min-height: 48px;
}

.todo-row>.todo-cell:first-child {
    margin-left: 0;
}

.todo-row--head>.todo-cell {
    margin-top: 0;
}

.todo-cell--id {
    justify-content: center;
    font-weight: 600;
    color: #6b7280;
}

.todo-cell--check {
    justify-content: center;
}

.todo-cell--check input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin: 0;
    cursor: pointer;
}

.todo-cell--text {
    justify-content: flex-start;
    word-break: break-word;
}

.todo-cell--delete {
    justify-content: center;
}

.todo-cell--done {
    text-decoration: line-through;
    color: #9ca3af;
}

.todo-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
}

.todo-delete:hover {
    background: #fee2e2;
}

.todo-empty {
    margin: 0;
    padding: 24px 8px;
    text-align: center;
    color: #9ca3af;
    font-size: 0.95rem;
    border-top: 1px solid #d1d5db;
}

.todo-form {
    display: flex;
    gap: 12px;
    padding-top: 8px;
    border-top: 1px solid #eee;
}

.todo-form input {
    flex: 1;
    padding: 10px 12px;
    font-size: 1rem;
    border: 1px solid #9ca3af;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.todo-form input:focus {
    outline: none;
    border-color: var(--accent, #0f766e);
    box-shadow: 0 2px 10px rgba(15, 118, 110, 0.15);
}

.todo-submit {
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    background: var(--accent, #0f766e);
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.todo-submit:hover {
    background: var(--accent-strong, #115e59);
}

@media (max-width: 520px) {
    .todo-row {
        grid-template-columns: 40px 56px 1fr 48px;
        font-size: 0.9rem;
    }

    .todo-form {
        flex-direction: column;
    }
}
</style>
