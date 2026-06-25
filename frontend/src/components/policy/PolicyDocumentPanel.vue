<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { downloadPolicyFile } from '@/api/policyApplication'
import { hasUploadedFile } from '@/utils/file'

const props = withDefaults(
  defineProps<{
    file01Name?: string
    file01Path?: string
    file02Name?: string
    file02Path?: string
    file01Label?: string
    file02Label?: string
  }>(),
  {
    file01Label: '身分證明',
    file02Label: '要保書',
  },
)

const $q = useQuasar()
const downloadingKey = ref<string | null>(null)

const hasAnyFile = computed(
  () => hasUploadedFile(props.file01Path) || hasUploadedFile(props.file02Path),
)

const documents = computed(() => [
  {
    key: 'file01',
    label: props.file01Label,
    name: props.file01Name,
    path: props.file01Path,
  },
  {
    key: 'file02',
    label: props.file02Label,
    name: props.file02Name,
    path: props.file02Path,
  },
])

async function handleDownload(doc: { key: string; name?: string; path?: string }) {
  if (!hasUploadedFile(doc.path) || downloadingKey.value) return

  downloadingKey.value = doc.key
  try {
    await downloadPolicyFile(doc.path, doc.name)
  } catch {
    $q.notify({
      type: 'negative',
      message: '下載失敗，請稍後再試',
      position: 'top',
    })
  } finally {
    downloadingKey.value = null
  }
}
</script>

<template>
  <div class="policy-doc-panel">
    <div v-if="!hasAnyFile" class="text-grey-6 text-caption">
      暫無附帶電子文件
    </div>
    <div v-else class="row q-col-gutter-sm">
      <div v-for="doc in documents" :key="doc.key" class="col-12 col-md-6">
        <div class="policy-doc-panel__item">
          <div class="policy-doc-panel__meta">
            <q-chip
              dense
              size="sm"
              :color="hasUploadedFile(doc.path) ? 'positive' : 'grey-5'"
              text-color="white"
            >
              {{ hasUploadedFile(doc.path) ? '已上傳' : '未上傳' }}
            </q-chip>
            <span class="policy-doc-panel__label">{{ doc.label }}</span>
            <span v-if="doc.name" class="policy-doc-panel__name text-grey-7">{{ doc.name }}</span>
          </div>
          <q-btn
            v-if="hasUploadedFile(doc.path)"
            flat
            dense
            color="primary"
            icon="download"
            label="下載"
            no-caps
            :loading="downloadingKey === doc.key"
            :disable="Boolean(downloadingKey && downloadingKey !== doc.key)"
            @click="handleDownload(doc)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.policy-doc-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
}

.policy-doc-panel__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.policy-doc-panel__label {
  font-weight: 600;
}

.policy-doc-panel__name {
  font-size: 0.75rem;
  word-break: break-all;
}
</style>
