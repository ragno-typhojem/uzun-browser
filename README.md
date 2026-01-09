# 🌐 Uzun Browser

Basit, Hızlı ve hafif bir web tarayıcısı. Electron tabanlı, temel tarama özellikleri ile geliştirilmiştir.
Ecosia Arama Motorunu Kullanarak Dünyaya Ağaç Ekme Amacını ve Sosyal Sorumlulukları Destekler💙


## 📋 Gereksinimler

- **Windows** 7+
- **Disk Alanı** ~200MB

## 🚀 Kurulum

### 1. Depoyu Klonla

```bash
git clone https://github.com/ragno-typhojem/uzun-browser.git
cd uzun-browser
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Geliştirme Modunda Çalıştır

```bash
npm start
```

## 🔨 Build

### Windows Installer Oluştur

```bash
npm run build:win
```

**Çıktı:** `dist/Uzun Browser Setup 1.0.0.exe`

## 📁 Proje Yapısı

```
uzun-browser/
├── main.js              # Electron ana işlem
├── preload.js           # Preload script
├── index.html           # Ana HTML
├── style.css            # Stil dosyası
├── script.js            # JavaScript
├── package.json         # Konfigürasyon
└── build/
    └── icon.ico         # Uygulama ikon
```

## 🎮 Kullanım

### Kısayollar

| Kısayol | İşlem |
|---------|-------|
| `F12` | DevTools aç/kapat |
| `Ctrl+T` | Yeni tab |
| `Ctrl+W` | Tab kapat |

### Yer İşaretleri

- **Ekle:** Sağ tıkla → "Yer İşaretine Ekle"
- **Yönet:** Sidebar → "Yer İşaretleri"

### Geçmiş

- **Görüntüle:** Sidebar → "Geçmiş"
- **Temizle:** "Geçmişi Temizle" butonu

### İndirmeler

- **Görüntüle:** Sidebar → "İndirmeler"
- **Klasörde Aç:** Sağ tıkla → "Klasörde Aç"

## 💾 Veri Depolama

Veriler şurada saklanır:
```
%APPDATA%\Uzun Browser\data\
```

## 🐛 Sorun Giderme

### Test Açma

```bash
npm install
npm start
```

### DevTools açılmıyor

`F12` tuşuna basın.

### Build hatası

```bash
rm -r dist
npm run build:win
```

## 📝 Lisans

AGPL-3.0 license

---

**Versiyon:** Eperken
