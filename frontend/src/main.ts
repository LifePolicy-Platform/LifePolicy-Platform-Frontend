import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  Quasar, Dialog, Notify, ClosePopup,
  QBanner, QBtn, QCard, QCardSection, QCheckbox, QChip, QDate, QIcon,
  QImg, QInput, QItem, QItemLabel, QItemSection, QList, QPopupProxy, QRadio,
  QSelect, QSeparator, QTab, QTable, QPagination, QTabPanel, QTabPanels, QTabs, QTd, QTime, QTr,
} from 'quasar'
import quasarLang from 'quasar/lang/zh-TW'
import router from './router/index.ts'
import './style.css'
import './assets/dashboard.css'
import App from './App.vue'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Dialog, Notify },
  config: {
    notify: {
      badgeStyle: 'display: none',
    },
    brand: {
      primary: '#48bb78',
    },
  },
  components: {
    QBanner, QBtn, QCard, QCardSection, QCheckbox, QChip, QDate, QIcon, QImg, QInput,
    QItem, QItemLabel, QItemSection, QList, QPopupProxy, QRadio,
    QSelect, QSeparator, QTab, QTable, QPagination, QTabPanel, QTabPanels, QTabs, QTd, QTime, QTr,
  },
  directives: {
    ClosePopup,
  },
  lang: quasarLang,
})

app.mount('#app')
