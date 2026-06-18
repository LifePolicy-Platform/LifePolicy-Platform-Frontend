import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {Quasar, Dialog, Notify, ClosePopup, QBanner, QBar, QBtn, QCard, QCardActions, QCardSection, QCheckbox, QChip, QDate, QDialog, QIcon,
  QImg, QInput, QItem, QItemLabel, QItemSection, QList, QPopupProxy, QRadio, QSelect, QSeparator, QSpace, QSpinner, QTab, QTable, QTabPanel, QTabPanels, QTabs, QTd, QTime, QToggle,} from 'quasar'
import quasarLang from 'quasar/lang/zh-TW'
import router from './router/index.ts'
import './style.css'
import './assets/dashboard.css'
import './assets/page-design.css'
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
    QBanner, QBar, QBtn, QCard, QCardActions, QCardSection, QCheckbox, QChip, QDate, QDialog, QIcon, QImg, QInput, QItem, QItemLabel, QItemSection, QList, QPopupProxy, QRadio,
    QSelect, QSeparator, QSpace, QSpinner, QTab, QTable, QTabPanel, QTabPanels, QTabs, QTd, QTime, QToggle,
  },
  directives: {
    ClosePopup,
  },
  lang: quasarLang,
})

app.mount('#app')
