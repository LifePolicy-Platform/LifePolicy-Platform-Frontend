import type { Product, ProductCategory } from '../types/search'

/** 圖片佔位，template 可用 <img :src="product.image" alt="" /> */
export const PRODUCT_IMAGE_PLACEHOLDER = 'https://picsum.photos/300/200'

export const PRODUCT_Category_LABEL: Record<ProductCategory, string> = {
  threeCPd: '3C產品',
  homeAppliances: '家電',
  food: '食品',
  book: '書店',
  life: '生活',
}

/** 分類 key 列表（由標籤表自動產生，供篩選按鈕 v-for 使用） */
export const CATEGORY_LIST = Object.keys(PRODUCT_Category_LABEL) as ProductCategory[]

export const MOCK_PRODUCTS: Product[] = [
  // 3C產品 × 3
  {
    id: 'threeCPd-1',
    pdName: '無線藍牙耳機',
    pdCategory: 'threeCPd',
    pdDesc: '主動降噪、30 小時續航，支援多裝置切換。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 2990,
  },
  {
    id: 'threeCPd-2',
    pdName: '機械式鍵盤',
    pdCategory: 'threeCPd',
    pdDesc: '青軸手感、RGB 背光，適合打字與遊戲。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 3580,
  },
  {
    id: 'threeCPd-3',
    pdName: '27 吋螢幕',
    pdCategory: 'threeCPd',
    pdDesc: '2K 解析度、75Hz 更新率，護眼低藍光。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 6990,
  },

  // 家電 × 3
  {
    id: 'homeAppliances-1',
    pdName: '變頻冷氣',
    pdCategory: 'homeAppliances',
    pdDesc: '一級能效、靜音運轉，適合 4 坪空間。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 28900,
  },
  {
    id: 'homeAppliances-2',
    pdName: '空氣清淨機',
    pdCategory: 'homeAppliances',
    pdDesc: 'HEPA 濾網、PM2.5 偵測，適合臥室使用。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 8990,
  },
  {
    id: 'homeAppliances-3',
    pdName: '電子鍋',
    pdCategory: 'homeAppliances',
    pdDesc: '6 人份容量、24 小時預約，附不沾內鍋。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 2490,
  },

  // 食品 × 3
  {
    id: 'food-1',
    pdName: '綜合堅果禮盒',
    pdCategory: 'food',
    pdDesc: '無調味烘焙、獨立小包裝，共 12 包。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 680,
  },
  {
    id: 'food-2',
    pdName: '即溶咖啡組',
    pdCategory: 'food',
    pdDesc: '阿拉比卡豆、即溶條裝 30 入，中度烘焙。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 450,
  },
  {
    id: 'food-3',
    pdName: '手工餅乾禮盒',
    pdCategory: 'food',
    pdDesc: '奶油與巧克力口味混合，附精美提盒。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 520,
  },

  // 書店 × 3
  {
    id: 'book-1',
    pdName: 'Vue 3 入門',
    pdCategory: 'book',
    pdDesc: '從基礎語法到元件化開發，附練習範例。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 580,
  },
  {
    id: 'book-2',
    pdName: 'TypeScript 實戰',
    pdCategory: 'book',
    pdDesc: '型別系統與泛型應用，適合有 JS 基礎的讀者。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 650,
  },
  {
    id: 'book-3',
    pdName: '前端面試指南',
    pdCategory: 'book',
    pdDesc: '常見題型整理與答題思路，含 Vue 章節。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 720,
  },

  // 生活 × 3
  {
    id: 'life-1',
    pdName: '香氛蠟燭',
    pdCategory: 'life',
    pdDesc: '大豆蠟、燃燒約 40 小時，淡雅木質調。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 890,
  },
  {
    id: 'life-2',
    pdName: '收納整理箱',
    pdCategory: 'life',
    pdDesc: '可堆疊設計、附蓋防塵，容量 45 公升。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 399,
  },
  {
    id: 'life-3',
    pdName: '保溫杯',
    pdCategory: 'life',
    pdDesc: '316 不鏽鋼、保冷保熱 12 小時，500ml。',
    image: PRODUCT_IMAGE_PLACEHOLDER,
    pdPrice: 1280,
  },
]
