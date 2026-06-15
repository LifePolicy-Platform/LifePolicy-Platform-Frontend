import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {Quasar, Dialog, Notify, ClosePopup, QBanner, QBtn, QCard, QCardSection, QCheckbox, QDate, QIcon,
  QImg, QInput, QPopupProxy, QRadio, QSelect, QSeparator, QTime,} from 'quasar'
import quasarLang from 'quasar/lang/zh-TW'
import router from './router/index.ts'
import './style.css'
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
  },
  components: {
    QBanner, QBtn, QCard, QCardSection, QCheckbox, QDate, QIcon, QImg, QInput, QPopupProxy, QRadio,
    QSelect, QSeparator, QTime, },
  directives: {
    ClosePopup,
  },
  lang: quasarLang,
})

app.mount('#app')
